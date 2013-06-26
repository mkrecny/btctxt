var _ = require('underscore')
, needle = require('needle')
, _ = require('underscore')
, MongoClient = require('mongodb').MongoClient
, format = require('util').format
, fs = require('fs')
, redis = require('redis').createClient()
, data_endpoint = 'http://data.mtgox.com/api/2/BTCUSD/MONEY/DEPTH/FETCH'
, expected_writes = 4
, completed_writes = 0;

var maybe_end = function(){
  completed_writes+=1;
  if (completed_writes == expected_writes) {
    console.log('completed');
    process.exit();
  }
}

var write_to_mongo = function(data, coll, existing_set){
  if (existing_set) {
    data = _.filter(data, function(d){ return !_.contains(existing_set, d.stamp); });
    data.forEach(function(d){
      d._id = d.stamp;
    });
  }
  console.log(data.length, coll, 'additions');
  MongoClient.connect('mongodb://127.0.0.1:27017/btctxt', function(err, db){
    var collection = db.collection(coll);
    collection.insert(data, {safe:true, multi:true},  function(err, docs){
      maybe_end();
    });
  });
}

var write_to_redis = function(data, key){
  var multi = redis.multi();
  data.forEach(function(d){
    multi.zadd(key, d.stamp, d.stamp);
  });
  multi.exec(maybe_end);
}

needle.get(data_endpoint, function(error, response, body){
  body = typeof body === 'string' ? JSON.parse(body) : body;
  if (!body.data){ console.error('no data'); process.exit();}
  redis.zrange('asks', 0, -1, function(e, asks){
    redis.zrange('bids', 0, -1, function(e, bids){
      console.log('existing ask', asks.length, 'existing bid', bids.length);
      write_to_redis(body.data.asks, 'asks');
      write_to_redis(body.data.bids, 'bids');
      write_to_mongo(body.data.asks, 'asks', asks);
      write_to_mongo(body.data.bids, 'bids', bids);
    });
  });
});
