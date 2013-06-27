var moving_avg = require('../moving_avg.js');
var period = 1 * 60 * 60 * 1000 * 1000; //1hr in ms
var max = new Date().getTime()*1000;
var min = max-period;
moving_avg(min, max, function(e, moving_avg){
  console.log(moving_avg);
  process.exit();
});
