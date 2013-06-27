var redis = require('./redis_db.js');
var mongo = require('./mongo_db.js');
module.exports = function(cb){
  return cb({
    'mongo': mongo,
    'redis': redis
  });
}
