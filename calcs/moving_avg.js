var dbs = require('../lib/dbs.js');
var gauss = require('gauss');
var _ = require('underscore');

module.exports = function(min, max, cb){
  dbs(function(dbs){
    dbs.mongo('trades', function(e, trades){
      trades.find({_id:{'$gt':min.toString(), '$lt':max.toString()}}).toArray(function(e, res){
        if (e) return cb(e);
        var prices = new gauss.Vector(_.map(res, function(trade){return trade.price/1}));
        prices.mean(function(mean){
          return cb(e, mean);
        });
      });
    });
  });
};
