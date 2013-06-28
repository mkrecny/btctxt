var net = require('net');
var data = '';
var dbs = require('../lib/dbs.js');

console.log('connecting to mongo');
dbs(function(dbs){

  console.log('connecting to trades DB');
  dbs.mongo('trades', function(e, trades){

    var format_trade = function(trade){
      if (!trade.length) return false;
      try {
        trade = JSON.parse(trade);
        var now = new Date().getTime();
        var lag = (now/1000)-(trade.timestamp/1);
        trade.lag = Math.round(lag);
        trade.exchange = trade.symbol.substr(0, trade.symbol.length-3);
        trade.currency = trade.symbol.substr(-3);
        log_trade(trade);
      } catch(e){
        console.log('--could not json parse trade--');
      }
    }

    var log_trade = function(trade){
      trades.insert(trade, function(err, docs){
        if (!err && docs){
          console.log(trade);
        }
      });
    };

    console.log('connecting to bitcoincharts');
    var conn = net.createConnection({port:27007,host:'bitcoincharts.com'}, function(){
      console.log('connected to bitcoincharts');
    });

    conn.on("data", function(data){
      data = data.toString('utf8').split('\r\n');
      data.forEach(format_trade);
    });   

  });

});


