const express = require('express');

module.exports = function(){
    var router = express.Router();

    router.use('/dialog', require('./dialog.js')());
    router.use('/index', require('./index.js')());
    router.use('/item_info', require('./item_info.js')());
    router.use('/sell', require('./sell.js')());
    router.use('/user_info', require('./user_info.js')());
    router.use('/order_info', require('./order_info.js')());
    router.use('/buy', require('./buy.js')());
    router.use('/artificial', require('./artificial.js')());

    return router;
}