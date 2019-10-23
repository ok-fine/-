const express = require('express');
const mysql = require('mysql');

var db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
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

    router.get('/show', function(req, res){
        var s_no = req.query.s_no;

        db.query(`SELECT * FROM user_info WHERE student_no='${s_no}'`, function(err, data){
            if(err){
                console.log(err);
                responseDate.code = 1;
                responseDate.message = '网络错误';
                res.json(responseDate);
            }else if(data.length == 0){
                responseDate.code = 6;
                responseDate.message = '没有这个人';
                res.json(responseDate);
            }else{
                responseDate.code = 0;
                responseDate.message = '展示个人信息成功';
                responseDate.data = data;
                res.json(responseDate);
            }
        })
    })

    router.get('/modify', function(req, res){
        var s_no = req.query.s_no;
        var user_name = req.query.user_name;
        var sex = req.query.sex;
        var birthday = req.query.birthday;
        var major = req.query.major;

        db.query(`UPDATE user_info SET user_name='${user_name}', sex='${sex}', birthday='${birthday}', major='${major}' WHERE student_no='${s_no}'`, function(err, data){
            if(err){
                console.log(err);
                responseDate.code = 1;
                responseDate.message = '网络错误';
                res.json(responseDate);
            }else{
                responseDate.code = 0;
                responseDate.message = '修改个人信息成功';
                res.json(responseDate);
            }
        })
    });

    return router;
}