var volume = require('../volume.js');
var period = 1 * 60 * 60 * 1000 * 1000; //1hr in ms
var max = new Date().getTime()*1000;
var min = max-period;
volume(min, max, function(e, volume){
  console.log(volume);
  process.exit();
});
