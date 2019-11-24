const express = require('express');
const db = require('../model/query');

var responseData;

module.exports = function(){
    var router = express.Router();

    router.use('/', function(req, res, next){

        responseData = {
            code: '',
            message: ''
        }

        next();
    });

    //检查信息是否完善
    router.get('/', function(req, res){
        var student_no = req.query.student_no;
        // var student_no = 1;//测试

        var sql = 'SELECT * FROM user_info WHERE student_no=?';
        var values = [student_no];
        responseData.data = db.query(sql, values);

        var sum = 0;
        for(var info in responseData.data[0]){
            if(typeof info == 'undefined'){
                sum++;
            }
        }
        
        if(sum > 1){
            responseData.code = '0012';
            responseData.message = '用户信息不完整';
            res.json(responseData);
        }else{
            responseData.code = '0013';
            responseData.message = '欢迎来到湖桃小世界';
            res.json(responseData);
        }

    });

    router.use('/trade', require('./second_hand/router.js')());
    // router.use('/check', require('./check_turnout/router.js')());
    // router.use('/wall', require('./powerful_wall/router.js')());

    return router;
};
