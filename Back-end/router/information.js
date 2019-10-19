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

    router.get('/modeInfo', function(req, res){
        var student_no = req.query.student_no;
        var user_name = req.query.user_name;
        var sex = req.query.sex;
        var birthday = req.query.birthday;
        var major = req.query.major;

        db.query(`UPDATE user_info SET user_name = ${user_name}, sex = ${sex}, birthday = ${birthday}, major = ${major} WHERE student_no = '${student_no}';` , function(err, data){
            if(err){
                responseDate.code = 1;
                responseDate.message = '数据库或网络错误';
                res.json(responseDate);
            }else{
                responseDate.num = 0;
                responseDate.message = '修改数据成功';
                responseDate.data = data;
                res.json(responseDate);
            }
        });
    });

    return router;
}