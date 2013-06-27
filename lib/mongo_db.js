var MongoClient = require('mongodb').MongoClient

module.exports = function(coll, cb){
  MongoClient.connect('mongodb://127.0.0.1:27017/btctxt', function(err, db){
    return cb(err, db.collection(coll));
  });
};
