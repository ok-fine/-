const express = require('express');
const async = require('async');
const db = require('../../../model/query');

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

    //展示地址
    router.get('/', async function(req, res){
        var student_no = req.query.student_no;
        
        var values = [student_no];
        var sql = 'SELECT * FROM user_address WHERE student_no=?  ORDER BY address_no';
        var result = await db.query(sql, values);

        responseData.data = result;
        responseData.code = '0055';
        responseData.message = '获取用户地址信息成功';
        res.json(responseData);
    });

    //添加地址
    router.get('/add', async function(req, res){
         var address_no = req.query.address_no;
        var student_no = req.query.student_no;
        var campus = req.query.campus;
        var dormitory = req.query.dormitory;
        var address = req.query.address;
        var user_name = req.query.user_name;
        var telephone = req.query.telephone;
        var de_address = req.query.de_address;

        var values = [address_no, student_no, campus, dormitory, address, user_name, telephone, de_address];
        var sql = 'INSERT INTO user_address VALUES(?, ?, ?, ?, ?, ?, ?, ?)'; 
        var result = await db.query(sql, values);

        responseData.data = result;
        responseData.code = '0057';
        responseData.message = '用户添加地址信息成功';
        res.json(responseData);
    });

    //修改地址
    router.get('/edit', async function(req, res){
        var address_no = req.query.address_no;
        var student_no = req.query.student_no;
        var campus = req.query.campus;
        var dormitory = req.query.dormitory;
        var address = req.query.address;
        var user_name = req.query.user_name;
        var telephone = req.query.telephone;
        var de_address = req.query.de_address;

        var values = [campus, dormitory, address, user_name, telephone, de_address, student_no, address_no];
        var sql = 'UPDATE user_address SET campus=?, dormitory=?, address=?, user_name=?, telephone=?, de_address=?\
                    WHERE student_no=? AND address_no=?';
        var result = await db.query(sql, values);

        responseData.data = result;
        responseData.code = '0056';
        responseData.message = '用户修改地址信息成功';

        if(de_address == 'true'){
            var sql1 = 'UPDATE user_address SET de_address=\'false\' WHERE student_no=? AND address_no<>?';
            var values1 = [student_no, address_no];
            result = await db.query(sql1, values1)

            responseData.data = result;
            responseData.code = '0078';
            responseData.message = '用户修改默认地址成功';
        }

        res.json(responseData);
    });

    //删除地址
    router.get('/delete', async function(req, res){
        var student_no = req.query.student_no;
        var address_no = req.query.address_no;

        var values = [student_no, address_no];
        var sql = 'DELETE FROM user_address WHERE student_no=? AND address_no=?';

        var result = await db.query(sql, values)
        responseData.data = result;
        responseData.code = '0058';
        responseData.message = '用户删除地址信息成功';
        res.json(responseData);
    });

    return router;

};