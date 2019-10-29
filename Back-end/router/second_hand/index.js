const express = require('express');
const mysql = require('mysql');
const async = require('async');

var db = mysql.createPool({
    host: '132.232.81.249',
    user: 'wjy',
    password: 'wjy666',
    database: 'hutao'
});

var responseData;

module.exports = function(){
    var router = express.Router();
    // db.connect();

    router.use('/', function(req, res, next){

        responseData = {
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

        var sql = 'SELECT seller_no, seller_name, seller_credit, item_no, title, price, campus FROM published_item WHERE title LIKE \'%' + key + '%\' ';

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

        console.log(sql);
        db.query(sql, (err, data) => {
            if(err){
                console.log(err);
                responseData.code = 1;
                responseData.message = '数据库1错误';
                res.json(responseData);
            }else if(data.length == 0){
                responseData.code = 2;
                responseData.message = '未搜索到商品';   
                res.json(responseData);
            }else{
                responseData.num = 0;
                responseData.message = '查看数据成功';
                responseData.data = data;
                // console.log(data[0]);

                // //返回json中加上用户名信息
                // //此处要处理好异步的情况，等所有的处理完了再返回json
                // for(var i = 0 ; i < data.length ; i++){
                //     var temp_data = data[i];
                //     var temp_no = data[i].student_no;
                //     db.query(`SELECT user_name FROM user_info WHERE student_no='${temp_no}' `, (err, name) => {
                //         // console.log(temp_no + "asd");
                //         if(err){
                //             responseDate.code = 1;
                //             responseDate.message = '数据库1错误';
                //             res.json(responseDate);
                //         }else{
                //             responseDate.num = 0;
                //             responseDate.message = '查看数据2成功';
                //             temp_data.user_name = name[0].user_name;

                //             //返回用户名，适配json，用中间值传
                //             responseDate.data[i] = temp_data;

                //             if(i == data.length - 1){
                //                 console.log(i);
                                res.json(responseData);
                //             }
                //         }
                //     });
                // }
            }
        });

    });




    return router;
    
}

