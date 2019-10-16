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

    // router.post('/login',function(req,res,next){
    //     if(req.body){
    //         return res.send('404');
    //     }
    //     var body = req.body;
    //     var name = body.student_name;
    //     var id = body.student_no;
    //     console.log(id);
    //     console.log(name);
    //     res.end();
    // });

    router.use('/', function(req, res, next){

        responseDate = {
            code: 0,
            message: '',
        }

        next();
    });

    router.get('/login', function(req, res){
        var student_no = req.query.student_no;
        var student_name = req.query.student_name;
        var card_herf = req.query.card_herf;


        db.query(`INSERT INTO student_user(student_no, student_name, card_herf) VALUES('${student_no}', '${student_name}', '${card_herf}')`, function(err, data){
            if(err){
                responseDate.code = 1;
                responseDate.message = '数据库错误';
                res.json(responseDate);
            }else{
                responseDate.num = 0;
                responseDate.message = '插入数据成功';
                responseDate.data = data;
                res.json(responseDate);
            }
        });
    });

    return router;
}