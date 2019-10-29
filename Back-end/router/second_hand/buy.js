const express = require('express');
const mysql = require('mysql');
var async = require('async');

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

    //确认收货
    router.use('/confirmation', function(req, res){
        var item_no = req.query.item_no;
        db.query(`UPDATE item_info SET status='已卖出' WHERE item_no='${item_no}'`, function(err, data){
            if(err){
                console.log(err);
                responseData.code = 1;
                responseData.message = '数据库错误';
                res.json(responseDate);
            }else{
                responseData.code = 0;
                responseData.message = '确认收货成功';
                res.json(responseDate);
            }
        });
    })

    //取消订单
    router.use('/cancel', function(req, res){
        var item_no = req.query.item_no;

        //删除订单表

        //修改商品信息
        db.query(`UPDATE item_info SET status='已发布' WHERE item_no='${item_no}'`, function(err, data){
            if(err){
                console.log(err);
                responseData.code = 1;
                responseData.message = '数据库错误';
                res.json(responseDate);
            }else{
                responseData.code = 0;
                responseData.message = '取消订单成功';
                res.json(responseDate);
            }
        });
    });

    //删除订单
    router.use('/delete', function(req, res){
        var item_no = req.query.item_no;

        //删除订单表

        //修改商品信息
        db.query(`UPDATE item_info SET status='已发布' WHERE item_no='${item_no}'`, function(err, data){
            if(err){
                console.log(err);
                responseData.code = 1;
                responseData.message = '数据库错误';
                res.json(responseDate);
            }else{
                responseData.code = 0;
                responseData.message = '取消订单成功';
                res.json(responseDate);
            }
        });
    });

    //付款
    router.use('pay', function(req, res){
        db.query(`UPDATE item_info SET status='待收货' WHERE item_no='${item_no}'`, function(err, data){
            if(err){
                console.log(err);
                responseData.code = 1;
                responseData.message = '数据库错误';
                res.json(responseDate);
            }else{
                responseData.code = 0;
                responseData.message = '商品付款成功';
                res.json(responseDate);
            }
        });
    });

    //生成订单
    router.get('/place_order', function(req, res){
        var item_no = req.query.item_no;
        var address_no = req.query.address_no;
        var buyer_no = req.query.buyer_no;
        var exchange_time = req.query.exchange_time;
        var seller_no = "";

        //生成order订单
        //获取卖家编号
        db.query(`SELECT student_no FROM item_info WHERE item_no='${item_no}' `, function(err, data){
            if(err){
                console.log(err);
                responseData.code = 1;
                responseData.message = '数据库1错误';
                res.json(responseDate);
            }else{
                //创建订单，存入数据库
                seller_no = data[0].student_no;
                db.query(`INSERT INTO order_info(item_no, seller_no, buyer_no, exchange_time, address_no) VALUES('${item_no}', '${seller_no}', '${buyer_no}', '${exchange_time}', '${address_no}')`, function(err, data){
                    if(err){
                        console.log(err);
                        responseData.code = 1;
                        responseData.message = '数据库2错误';
                        res.json(responseData);
                    }else{
                        responseData.code = 0;
                        responseData.message = '订单创建成功';
                        console.log(responseData);

                        //修改商品状态为‘代付款’
                        db.query(`UPDATE item_info SET status='待付款' WHERE item_no='${item_no}'`, function(err, data){
                            if(err){
                                console.log(err);
                                responseData.code = 1;
                                responseData.message = '数据库3错误';
                                res.json(responseData);
                            }else{
                                responseData.code = 0;
                                responseData.message = '订单修改成功';
                                console.log(responseData);
                                res.json(responseData);
                            }
                        });
                    }

                });
            }
        });
    });

    return router;
  }