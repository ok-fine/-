const express = require('express');
const async = require('async');
const db = require('../../model/query');

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

    //显示个人信息
    router.get('/', async function(req, res){
        var student_no = req.query.student_no;

        var values = [student_no];
        var sql = 'SELECT user_name, sex, birthday, major, credit, portrait_href FROM user_info WHERE student_no=?';
        var result = await db.query(sql, values);

        responseData.data = result;
        responseData.code = '0034';
        responseData.message = '获取个人信息成功';
        res.json(responseData);
    });

    //我收藏的
    router.get('/collect', async function(req, res){
        var student_no = req.query.student_no;
        
        var values = [student_no];
        var sql = 'SELECT title, item_no, price, seller_no, seller_name, seller_credit, seller_portrait \
                    FROM collect_item WHERE collector_no=?';
        var result = await db.query(sql, values);

        responseData.data = result;
        if(responseData.data.length == 0){
            responseData.code = '0076';
            responseData.message = '您还没有收藏任何商品';
        }else{
            responseData.code = '0035';
            responseData.message = '获取个人收藏成功';

            //获取商品图片
            var images = '';
            for(var i = 0 ; i < responseData.data.length ; i++){
                images = 'http://132.232.81.249:81/images/item/'+ responseData.data[i].seller_no + '/' + responseData.data[i].item_no + '_1.JPG';
                responseData.data[i].images = {
                    swiperImg: images
                }
            }
        }
        res.json(responseData);
    });

    //我的评论
    router.get('/comment', async function(req, res){
        var student_no = req.query.student_no;
        
        var values = [student_no];
        var sql = 'SELECT comment, order_no, publish_no, publish_username, publish_time, publish_portrait, status \
                    FROM comment WHERE bepublished_no=?';
        var result = await db.query(sql, values)
        responseData.data = result;
        if(responseData.data.length == 0){
            responseData.code = '0077';
            responseData.message = '您还没有获得任何评论';
        }else{
            responseData.code = '0036';
            responseData.message = '获取评论信息成功';
        }
        res.json(responseData);
    })

    //我的订单
    router.use('/order', require('./user_info/order')());

    //我的地址
    router.use('/address', require('./user_info/address')());

    return router;
}