const express = require('express');
const bodyParser = require('body-parser');
const static = require('express-static');

var server = express();

server.use(bodyParser.urlencoded({}));

server.listen(8080);

server.use(static('view'));

server.post('/',function(req,res){
    console.log('1');
    console.log(req.body);
});

//登陆验证
//server.use('/', require('./router/identify')());