const express = require('express');
const bodyParser = require('body-parser');
const static = require('express-static');
const multer = require('multer');
const fs = require('fs');     //文件重命名
const pathLib = require('path'); //解析文件路径

var server = express();
server.listen(8080);

server.use(bodyParser.urlencoded({}));

// var objMuter = multer({dest:'./upload/'});
// server.use(objMuter.any());

server.use(express.static('view'));

//登陆验证
server.use('/login', require('./router/identify.js')());
server.use('/info', require('./router/information.js')());