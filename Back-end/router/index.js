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
    // db.connect();

    router.use('/', function(req, res, next){

        responseDate = {
            code: 0,
            message: '',
        }

        next();
    });

    router.get('/', function(req, res){
       // console.log('进入筛选'); 
        var pagenum = 5;
        var key = req.query.key;
        var price = req.query.price;
        var campus = req.query.campus;

        var start = req.query.start;
        var end = eval(start + pagenum);

        var sql = 'SELECT * FROM item WHERE title LIKE \'%' + key + '%\' ';

        if(campus != "无所谓"){
            sql += 'AND campus=\'' + campus + '\' ';
        }

        if(price == "价格高"){
            //降序
            sql += 'ORDER BY price DESC ';
        }else if(price == "价格低"){
            //升序
            sql += 'ORDER BY price ';
        }

        sql += 'LIMIT ' + start + ',' + end;

        db.query(sql, (err, data) => {
            if(err){
                responseDate.code = 1;
                responseDate.message = '数据库1错误';
                res.json(responseDate);
            }else if(data.length == 0){
                responseDate.code = 2;
                responseDate.message = '未搜索到商品';   
                res.json(responseDate);
            }else{
                responseDate.num = 0;
                responseDate.message = '查看数据2成功';
                responseDate.data = data;
                res.json(responseDate);
            }
        });

    });
    return router;
    
}