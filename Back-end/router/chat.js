const express = require('express');
const mysql = require('mysql');

var db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'game123456',
    database: 'hutao'
});

var responseDate;

module.exports = function(){
    var router = express.Router();

    router.use('/', function(req, res, next){

        responseDate = {
            code: 0,
            message: '',
        }

        next();
    });

    return router;
  }