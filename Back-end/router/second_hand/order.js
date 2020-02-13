const express = require('express');
const async = require('async');
const db = require('../../../model/query');

module.exports = function(){
    var router = express.Router();

    router.use('/', function(req, res, next){
        next();
    });

    //已发布的
    router.get('/published', async function(req, res){  //已发布(已发布，待付款, 待收货)
        student_no = req.query.student_no;
        var values = [student_no];

        var responseData = {
            wait_code: 0,                               //待付款
            wait_message: '',
            wait_data: {},

            publish_code: 0,                            //已发布
            publish_message: '',
            publish_data: {}
        }

        var result;

        var sql = 'SELECT order_no, item_no, item_title, item_price, exchange_time,\
                    buyer_name, buyer_no, buyer_portrait, item_campus, seller_no\
                    FROM orders WHERE seller_no=? AND item_status=\'待付款\'';
        
        result = await db.query(sql, values);

        if(result.length == 0){
            responseData.wait_code = '0037';
            responseData.wait_message = '您还没有任何商品待他人付款';
        }else{
            for(let i = 0; i < result.length; i++){
                result[i].img_url = 'http://132.232.81.249:81/images/item/'+ result[i].seller_no + '/' + result[i].item_no + '_1' + '.JPG';
            }
            responseData.wait_code = '0038';
            responseData.wait_message = '获取用户待他人付款商品成功';
            responseData.wait_data = result;
        }


        var sql = 'SELECT item_no, title, price, publish_time, campus, dormitory, seller_no\
                    FROM published_item WHERE seller_no=?';
        
        result = await db.query(sql, values);
        if(result.length == 0){
            responseData.publish_code = '0039';
            responseData.publish_message = '您还没有发布任何商品';
        }else{
            for(let i = 0; i < result.length; i++){
                result[i].img_url = 'http://132.232.81.249:81/images/item/'+ result[i].seller_no + '/' + result[i].item_no + '_1' + '.JPG';
            }
            responseData.publish_code = '0040';
            responseData.publish_message = '获取已发布商品成功';
            responseData.publish_data = result;
        }
        res.json(responseData);
    });

    //已卖出的
    router.get('/sold', async function(req, res){   //已卖出(已卖出，待收货)
        student_no = req.query.student_no;
        var values = [student_no];

        var responseData = {
            wait_code: 0,                            //待收货
            wait_message: '',
            wait_data: {},

            sell_code: 0,                            //已卖出
            sell_message: '',
            sell_data: {}
        }

        var result;

        var sql = 'SELECT order_no, item_no, item_title, item_price, exchange_time,\
                    buyer_name, buyer_no, buyer_portrait, seller_no\
                    FROM orders WHERE seller_no=? AND item_status=\'待收货\'';

        var result = await db.query(sql, values);
        if(result.length == 0){
            responseData.wait_code = '0041';
            responseData.wait_message = '您还没有任何商品待他人收货';
        }else{
            for(let i = 0; i < result.length; i++){
                result[i].img_url = 'http://132.232.81.249:81/images/item/'+ result[i].seller_no + '/' + result[i].item_no + '_1' + '.JPG';
            }
            responseData.wait_code = '0042';
            responseData.wait_message = '获取待他人收货商品成功';
            responseData.wait_data = result;
        }
        
        var sql = 'SELECT order_no, item_no, item_title, item_price, exchange_time,\
                    buyer_name, buyer_no,buyer_portrait, seller_no\
                    FROM orders WHERE seller_no=? AND item_status=\'已卖出\' AND for_seller=\'1\'';
        
        result = await db.query(sql, values);
        if(result.length == 0){
            responseData.sell_code = '0043';
            responseData.sell_message = '您还没有卖出任何商品';
        }else{
            for(let i = 0; i < result.length; i++){
                result[i].img_url = 'http://132.232.81.249:81/images/item/'+ result[i].seller_no + '/' + result[i].item_no + '_1' + '.JPG';
            }
            responseData.sell_code = '0044';
            responseData.sell_message = '获取已卖出商品成功';
            responseData.sell_data = result;

            var buyer_no = [];
            var seller_no = [];
            var order_num = {
                data: []
            };
            order_num.data = result;
            for(let i = 0; i < order_num.data.length; i++){
                buyer_no = [order_num.data[i].buyer_no, order_num.data[i].order_no];      //买家学号
                seller_no = [order_num.data[i].seller_no, order_num.data[i].order_no];    //卖家学号

                var sql1 = 'SELECT comment FROM comment WHERE publish_no=? AND order_no=?';    //查看是否评论
                result = await db.query(sql1, buyer_no);

                if(result.length == 0){
                    responseData.sell_data[i].buyer_status = '买家未评论';
                }else{
                    responseData.sell_data[i].buyer_status = '买家已评论';
                }

                result = await db.query(sql1, seller_no);
                if(result.length == 0){
                    responseData.sell_data[i].seller_status = '卖家未评论';
                }else{
                    responseData.sell_data[i].seller_status = '卖家已评论';
                }

                buyer_no = [];
                seller_no = [];
            }
        }
        
        res.json(responseData);
    });

    //购买
    router.get('/already_have',async function(req, res){    //已购买(已购买，待收货)
        student_no = req.query.student_no;
        var values = [student_no];

        var responseData = {
            wait_code: 0,                            //待付款
            wait_message: '',
            wait_data: {},

            wget_code: 0,                            //待收货
            wget_message: '',
            wget_data: {},

            buy_code: 0,                             //已购买
            buy_message: '',
            buy_data: {}
        }

        var result;

        var sql = 'SELECT order_no, item_no, item_title, item_price, exchange_time,\
                    seller_name, seller_no, seller_portrait, buyer_no\
                    FROM orders WHERE buyer_no=? AND item_status=\'待付款\'';

        result = await db.query(sql, values);
        if(result.length == 0){
            responseData.wait_code = '0045';
            responseData.wait_message = '您还没有任何商品待自己付款';
        }else{
            for(let i = 0; i < result.length; i++){
                result[i].img_url = 'http://132.232.81.249:81/images/item/'+ result[i].buyer_no + '/' + result[i].item_no + '_1' + '.JPG';
            }
            responseData.wait_code = '0046';
            responseData.wait_message = '获取待自己付款商品成功';
            responseData.wait_data = result;
        }

        var sql = 'SELECT order_no, item_no, item_title, item_price, exchange_time,\
                    seller_name, seller_no, seller_portrait, buyer_no\
                    FROM orders WHERE buyer_no=? AND item_status=\'待收货\'';

        result = await db.query(sql, values);
        if(result.length == 0){
            responseData.wget_code = '0047';
            responseData.wget_message = '您还没有任何商品待自己收货';
        }else{
            for(let i = 0; i < result.length; i++){
                result[i].img_url = 'http://132.232.81.249:81/images/item/'+ result[i].buyer_no + '/' + result[i].item_no + '_1' + '.JPG';
            }
            responseData.wget_code = '0048';
            responseData.wget_message = '获取待自己收货商品成功';
            responseData.wget_data = result;
        }
        
        var sql = 'SELECT order_no, item_no, item_title, item_price, exchange_time,\
                    seller_name, seller_no, seller_portrait, buyer_no \
                    FROM orders WHERE buyer_no=? AND item_status=\'已卖出\' AND for_buyer=\'1\'';
        
        result = await db.query(sql, values);
        if(result.length == 0){
            responseData.buy_code = '0049';
            responseData.buy_message = '您还没有购买任何商品';
        }else{
            for(let i = 0; i < result.length; i++){
                result[i].img_url = 'http://132.232.81.249:81/images/item/'+ result[i].buyer_no + '/' + result[i].item_no + '_1' + '.JPG';
            }
            responseData.buy_code = '0050';
            responseData.buy_message = '获取已购买商品成功';
            responseData.buy_data = result;

            var buyer_no = [];
            var seller_no = [];
            var order_num = {
                data: []
            };
            order_num.data = result;
            for(let i = 0; i < order_num.data.length; i++){
                buyer_no = [order_num.data[i].buyer_no, order_num.data[i].order_no];      //买家学号
                seller_no = [order_num.data[i].seller_no, order_num.data[i].order_no];    //卖家学号

                var sql1 = 'SELECT comment FROM comment WHERE publish_no=? AND order_no=?';    //查看是否评论
                result = await db.query(sql1, buyer_no);

                if(result.length == 0){
                    responseData.buy_data[i].buyer_status = '买家未评论';
                }else{
                    responseData.buy_data[i].buyer_status = '买家已评论';
                }

                result = await db.query(sql1, seller_no);
                if(result.length == 0){
                    responseData.buy_data[i].seller_status = '卖家未评论';
                }else{
                    responseData.buy_data[i].seller_status = '卖家已评论';
                }
            }
        }
        
        res.json(responseData);
    });

    return router;

}  