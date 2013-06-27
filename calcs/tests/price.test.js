var price = require('../price.js');
price(function(e, price){
  console.log(price);
  process.exit();
});
