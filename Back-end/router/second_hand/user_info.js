const express = require('express');
const mysql = require('mysql');

var db = mysql.createPool({
    host: '132.232.81.249',
    user: 'wjy',
    password: 'wjy666',
    database: 'hutao'
});

var responseData;

module.exports = function(){
    var router = express.Router();

    router.use('/', function(req, res, next){

        responseData = {
            code: 0,
            message: '',
        }

        next();
    });

    router.get('/show', function(req, res){
        var student_no = req.query.student_no;

        db.query(`SELECT * FROM user_info WHERE student_no='${student_no}'`, function(err, data){
            if(err){
                console.log(err);
                responseData.code = 1;
                responseData.message = '网络错误';
                res.json(responseData);
            }else if(data.length == 0){
                responseData.code = 6;
                responseData.message = '没有这个人';
                res.json(responseData);
            }else{
                responseData.code = 0;
                responseData.message = '展示个人信息成功';
                responseData.data = data;
                res.json(responseData);
            }
        })
    })

    router.get('/modify', function(req, res){
        var student_no = req.query.student_no;
        var user_name = req.query.user_name;
        var sex = req.query.sex;
        var birthday = req.query.birthday;
        var major = req.query.major;

        db.query(`UPDATE user_info SET user_name='${user_name}', sex='${sex}', birthday='${birthday}', major='${major}' WHERE student_no='${student_no}'`, function(err, data){
            if(err){
                console.log(err);
                responseData.code = 1;
                responseData.message = '网络错误';
                res.json(responseData);
            }else{
                responseData.code = 0;
                responseData.message = '修改个人信息成功';
                res.json(responseData);
            }
        })
    });

    return router;
}

