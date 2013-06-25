var _ = require('underscore')
, needle = require('needle')
, MongoClient = require('mongodb').MongoClient
, format = require('util').format
, fs = require('fs')
, redis = require('redis').createClient()
, data_endpoint = 'http://data.mtgox.com/api/2/BTCUSD/MONEY/DEPTH/FETCH'
, expected_writes = 4
, completed_writes = 0;

var maybe_end = function(){
  console.log(arguments);
  completed_writes+=1;
  console.log('completed', completed_writes, 'writes');
  if (completed_writes == expected_writes) {
    console.log('completed');
    process.exit();
  }
}

var write_to_mongo = function(data, coll){
  data.forEach(function(d){
    d._id = d.stamp;
  });
  MongoClient.connect('mongodb://127.0.0.1:27017/btctxt', function(err, db){
    var collection = db.collection(coll);
    collection.update(data, {safe:true, multi:true},  maybe_end)
  });
}

var write_to_redis = function(data, key){
  var multi = redis.multi();
  data.forEach(function(d){
    multi.sadd(key, d.stamp);
    multi.hmset(key+':'+d.stamp, d);
  });
  multi.exec(function(){
    maybe_end();
  });
}

needle.get(data_endpoint, function(error, response, body){
  console.log(Object.keys(body.data), body.data.length);
  if (!body.data){ console.error('no data'); process.exit();}
  write_to_redis(body.data.asks, 'asks');
  write_to_redis(body.data.bids, 'bids');
  write_to_mongo(body.data.asks, 'asks');
  write_to_mongo(body.data.bids, 'bids');
});
