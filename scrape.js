var _ = require('underscore')
, needle = require('needle')
, fs = require('fs')
, redis = require('redis').createClient()
, depth_endpoint = 'http://data.mtgox.com/api/2/BTCUSD/MONEY/DEPTH/FETCH';

var stamp_iterator = function(x){ return x.stamp };
var stamp_iterator_inv = function(x) { return -x.stamp };

needle.get(depth_endpoint, function(error, response, body){

  if (!body.data){ throw new Error('No data from Mt.Gox :-(')}

  // latest ask & bid
  var latest_ask = _.max (body.data.asks, stamp_iterator);
  var latest_bid = _.max (body.data.bids, stamp_iterator); 

  // recent first, old last
  var asks = _.sortBy(body.data.asks, stamp_iterator_inv);
  var bids = _.sortBy(body.data.bids, stamp_iterator_inv);
  
  var multi = redis.multi();

  asks.forEach(function(ask){
    multi.sadd('asks', ask.stamp);
    multi.hmset('ask:'+ask.stamp, ask);
  });

  bids.forEach(function(bid){
    multi.sadd('bids', bid.stamp);
    multi.hmset('bid:'+bid.stamp, bid);
  });

  multi.exec(function(){
    console.log(new Date(), 'wrote', bids.length, 'bids', asks.length, 'asks');
    process.exit();
  });

});
