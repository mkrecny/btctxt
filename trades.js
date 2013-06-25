var _ = require('underscore')
, needle = require('needle')
, fs = require('fs')
, redis = require('redis').createClient()
, trades_endpoint = 'http://data.mtgox.com/api/2/BTCUSD/MONEY/TRADES/FETCH';

var stamp_iterator = function(x){ return x.stamp };
var stamp_iterator_inv = function(x) { return -x.stamp };

needle.get(trades_endpoint, function(error, response, body){

  if (!body.data){ throw new Error('No data from Mt.Gox :-(')}

  var trades = body.data;

  var multi = redis.multi();

  trades.forEach(function(trade){
    multi.sadd('trades', trade.tid);
    multi.hmset('trade:'+trade.tid, trade);
  });

  multi.exec(function(){
    console.log(new Date(), 'wrote', trades.length, 'trades');
    process.exit();
  });

});
