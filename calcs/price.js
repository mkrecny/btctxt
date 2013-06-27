var dbs = require('../lib/dbs.js');
module.exports = function(cb){
  dbs(function(dbs){
    dbs.redis.zrevrange('trades', 0, 0, function(e, latest_trade_id){
      latest_trade_id = latest_trade_id[0];
      dbs.mongo('trades', function(e, trades){
        trades.findOne({_id:latest_trade_id}, function(e, res){
          if (e) return cb(e);
          return cb(e, res.price);
        });
      });
    });
  });
};
