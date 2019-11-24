const express = require('express');
const mysql = require('mysql');
const async = require('async');
const db = require('../../model/query');

var responseData;

module.exports = function(){
    var router = express.Router();
    // db.connect();

    router.use('/', function(req, res, next){

        responseData = {
            code: '',
            message: '',
        }

        next();
    });

    //http://localhost:8080/home/trade/order_info?order_no=0000000000000039
    //进入订单详情，需要删除或取消订单的话在buy接口里面
    router.get('/', async function(req, res){
        // var item_no = req.query.item_no;
        console.log('jinru ');
        var order_no = req.query.order_no;

        //获取订单详情
        var sql = 'SELECT buyer_no, seller_no, address_no, item_no, exchange_time, seller_name, buyer_name, item_title, item_price, item_campus,\
                   buyer_portrait, seller_portrait FROM orders WHERE order_no=?';
        var values = [order_no];
        var data = await db.query(sql, values);
        responseData.item = data;
        console.log(data);

        var seller_no = data[0].seller_no
        var item_no = data[0].item_no

        //获取商品详情
        var student_no = data[0].buyer_no;
        var address_no = data[0].address_no;
        var sql1 = 'SELECT campus, dormitory, address, telephone FROM user_address WHERE student_no=? AND address_no=?';
        var values1 = [student_no, address_no];
        data = await db.query(sql1, values1);
        responseData.address = data;

        //获取商品第一张图片
        responseData.image ='http://132.232.81.249:81/images/item/'+ seller_no + '/' + item_no + '_1.JPG';

        responseData.code = '0059';
        responseData.message = '获取当前订单详情信息成功';

        res.json(responseData);
    });

    //编辑订单，只更改价格
    router.get('/edit', async function(req, res){
        var order_no = req.query.order_no;
        var item_no = req.query.item_no;
        var price = req.query.price;


        var sql = 'UPDATE item_info SET price = ? WHERE item_no=?';
        var values = [price, item_no];
        await db.query(sql, values);

        responseData.code = '0062';
        responseData.message = '更改当前订单金额成功';
        res.json(responseData);
    });

    //查看订单的评论
    router.get('/get_comment', async function(req, res){
        var order_no = req.query.order_no;
        var values = [order_no];
        var result;

        var sql = 'SELECT comment, publish_username, publish_time, publish_portrait, status \
                    FROM comment WHERE order_no=?';
        result = await db.query(sql, values);
        if(result.length == 0){
            responseData.code = '0060';
            responseData.message = '当前订单没有评论';
        }else{
            responseData.code = '0061';
            responseData.message = '获取当前订单评论信息成功';
            responseData.data = result;
        }
        res.json(responseData);
    });

    //添加订单评论
    router.get('/comment', async function(req, res){
        var order_no = req.query.order_no;
        var comment = req.query.comment;
        var publish_no = req.query.publish_no;
        var publish_time = req.query.publish_time;
        var status = req.query.status;
        var bepublished_no = req.query.bepublished_no;

        var sql = 'INSERT INTO user_comment VALUES(0, ?, ?, ?, ?, ?, ?)';
        var values = [order_no, comment, publish_no, publish_time, status, bepublished_no];
        await db.query(sql, values);

        responseData.code = '0063';
        responseData.message = '用户对当前订单评论成功';
        res.json(responseData);
    });

    return router;
    
}