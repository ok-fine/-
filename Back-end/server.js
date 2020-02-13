var responseData;
const express = require('express');
const bodyParser = require('body-parser');
const static = require('express-static');
const consolidate=require('consolidate');
const multer = require('multer');
const fs = require('fs');     //文件重命名
const pathLib = require('path'); //解析文件路径
const db = require('./model/query');

var server = express();
// server.listen(8089);
server.listen(8089, function listening() {
    console.log('try');
});

server.use(bodyParser.urlencoded({}));

// var objMuter = multer({dest:'./upload/'});
// server.use(objMuter.any());

server.use(express.static('view'));
server.use(express.static('images'));

server.engine('html', consolidate.ejs);
server.set('views', 'view');
server.set('view engine', 'html');

server.get('/try', function (req, res) {
    var h = "1 2 3 4 5 6";
    var a = h.split(" ");
    console.log(a[0]);
})

server.get('/tt', function (req, res) {
    console.log("try");
})

//登陆验证
server.use('/login', require('./router/login.js')());
server.use('/identity', require('./router/identity.js')());
server.use('/home', require('./router/homepage.js')());
server.use('/information', require('./router/information.js')());



//---------websocket-------------------------------------------------//

const http=require('http');
const ws = require('ws');
var mysql = require('mysql');

var wsserver=http.createServer(function (req, res) {
    res.end("This is a WebSockets wsserver!");
});
var url = require('url');

//验证函数
function ClientVerify(info) {
    var ret = false;//拒绝
    //url参数
    var params = url.parse(info.req.url, true).query;
    //console.log(groupid);
    //groupid=params['groupid']
    return true;
}

var wss = new ws.Server( { server: wsserver, verifyClient: ClientVerify } );

let sockets = {};
wss.on('connection', async function connection(ws, req) {
    console.log('链接成功！' + req.url);
    console.log('ws' + ws);

    let id = req.url.slice(5);//截几位字符串根据自己实际获得的url来看
    sockets[id] = ws;
    ws.send(id + '已连接');

    //console.log(ws);
    //查询历史聊天记录 广播给连接的客户端
    var sql = 'SELECT * FROM chat WHERE groupid=1';
    var values = [];
    console.log('sql语句',sql);
    await db.query(sql, values).then(function(data) {
        console.log('sql操作返回：', data);
        if(data!=null){
            ws.send(JSON.stringify(data));
        }
    });

    //监听客户端发送得消息
    ws.on('message', function incoming(data) {
        console.log('来自客户端得message:',data);

        //保存客户端发送得消息到数据库
        var sql = "INSERT INTO chat(msg) VALUES(?)";
        var values = [data];
        db.query(sql, values).then(function(data) {
            console.log('sql操作返回：',data);//res.insertId
        });

        var sendData = JSON.stringify([{msg:data}])

        // /**
        //  * 把消息发送到所有的客户端
        //  * wss.clients获取所有链接的客户端
        //  */
        wss.clients.forEach(function each(client) {
            console.log(client.url);
            console.log('sendData' + sendData);
            client.send(sendData);
        });
    });

    wss.notice = function notice(id, data, ws) {
        // 向指定id发送
        try {
            ws.send('正在发送...');
            var notice = JSON.stringify({
                type: 'notice',
                data: data
            })
            var target = sockets[id]
            if (target) {
                target.send('收到一条新消息')
                target.send(notice)
            } else {
                ws.send('目标信道已关闭')
            }
        } catch (err) {
            console.log(err)
        }
    }


});
wsserver.listen(8088, function listening() {
    console.log('服务器启动成功！');
});

                                                         
