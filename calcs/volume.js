var dbs = require('../lib/dbs.js');

module.exports = function(min, max, cb){
  dbs(function(dbs){
    dbs.redis.zcount('trades', min, max, function(e, volume){
      return cb(e, volume);
    });
  });
};
