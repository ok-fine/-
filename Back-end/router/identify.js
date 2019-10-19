const express = require('express');
const mysql = require('mysql');
const fs = require('fs');     //文件重命名
const pathLib = require('path'); //解析文件路径

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

    router.get('/', function(req, res){
        var student_no = req.query.student_no;
        var student_name = req.query.student_name;
        var card_herf = req.query.card_herf;

                //插入
        db.query(`INSERT INTO student_user(student_no, student_name, card_herf) VALUES('${student_no}', '${student_name}', '${card_herf}')`, function(err, data){
            if(err){
                return db.rollback(function() {
                  throw err;
                });
                responseDate.code = 1;
                responseDate.message = '数据库1错误';
                res.json(responseDate);
            }else{
                responseDate.num = 0;
                responseDate.message = '插入数据1成功';
                responseDate.data = data;
                res.json(responseDate);


                //插入学生表
                // db.query(`INSERT INTO user_info(student_no, student_name) VALUES('${student_no}', '${student_name}');`,function(err,data){
                //     if(err){
                //         responseDate.code = 1;
                //         responseDate.message = '数据库2错误';
                //         res.json(responseDate);
                //     }else{
                //         responseDate.num = 0;
                //         responseDate.message = '插入数据2成功';
                //         responseDate.data = data;
                //         res.json(responseDate);
                //     }
                // });
            }
        });
    });

    return router;
}


