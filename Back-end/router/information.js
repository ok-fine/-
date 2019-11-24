const express = require('express');
const async = require('async');
const db = require('../model/query');

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

    router.get('/', async function(req, res){
        var studeng_no = req.query.student_no;

        var sql = 'SELECT user_name, sex, birthday, major, telephone_number, credit, portrait_href \
                    FROM user_info WHERE student_no=?';
        var values = [studeng_no];
        var result = await db.query(sql, values)

        responseData.data = result;
        responseData.code = '0034';
        responseData.message = '获取个人信息成功';
        console.log(responseData);
        res.json(responseData);
    });

    router.get('/modify', async function(req, res){
        var user_name = req.query.user_name;
        var sex = req.query.sex;
        var birthday = req.query.birthday;
        var major = req.query.major;
        var telephone_number = req.query.telephone_number;
        // var portrait_href = req.query.portrait_href;
        var student_no = req.query.student_no;

        var sql = 'UPDATE user_info SET user_name=?, sex=?, birthday=?, major=?, telephone_number=?\
                    WHERE student_no=?';
        var values = [user_name, sex, birthday, major, telephone_number, student_no];
        var result = await db.query(sql, values);
        
        responseData.code = '0075';
        responseData.message = '修改个人信息成功';
        responseData.data = result;
        
        res.json(responseData);
    })

    return router;
}