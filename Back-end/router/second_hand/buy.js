const express = require('express');
const mysql = require('mysql');
const async = require('async');
const db = require('../../model/query');

var responseData;

module.exports = function(){
    var router = express.Router();

    router.use('/', function(req, res, next){

        responseData = {
            code: '0000',
            message: '',
        }

        next();
    });

    //http://localhost:8080/home/trade/buy/confirmation?item_no=0000000000000001
    //确认收货
    router.use('/confirmation', async function(req, res){
        var item_no = req.query.item_no;

        var sql = 'UPDATE item_info SET status=\'已卖出\' WHERE item_no=?';
        var values = [item_no];
        await db.query(sql, values).then(function (data) {
            console.log(data.Error);
            console.log(data.affectedRows);

            if(data.Error == undefined){
                responseData.code = '0064';
                responseData.message = '确认收货成功';

                // console.log(responseData);
                res.json(responseData);

            }else{
                responseData.code = '0000';
                responseData.message = '数据库错误';

                // console.log(responseData);
                res.json(responseData);

            }
        });
    })

    //取消订单
    router.use('/cancel', async function(req, res){
        var item_no = req.query.item_no;
        var order_no = req.query.order_no;

        //删除订单表
        var sql1 = 'DELETE FROM order_info WHERE order_no=?';
        var values1 = [order_no];
        await db.query(sql1, values1);

        //修改商品信息
        var sql2 = 'UPDATE item_info SET status=\'已发布\' WHERE item_no=?';
        var values2 = [item_no];
        await db.query(sql2, values2);

        responseData.code = '0065';
        responseData.message = '取消订单成功';

        // console.log(responseData);
        res.json(responseData);

    });

    //localhost:8080/home/trade/buy/delete?order_no=30&student_no=2
    //删除订单,要双方都删了，订单信息才会被删除,然后放在finished_order里面
    router.use('/delete', async function(req, res){
        var order_no = req.query.order_no;
        var student_no = req.query.student_no;

        //判断删除的执行者是卖家还是买家
        var data = '';
        var sql1 = 'SELECT seller_no, buyer_no, for_buyer, for_seller\
                    FROM order_info WHERE order_no=?'
        var values1 = [order_no];
        data = await db.query(sql1, values1);

        if(student_no == data[0].seller_no){
            var sql2 = 'UPDATE order_info SET for_seller=\'0\' WHERE order_no=?';
            var values2 = [order_no];
            await db.query(sql2, values2);

            //删除订单，将其放入finished_order中
            if(data[0].for_buyer == '0'){
                var sql3 = 'INSERT INTO finished_order \
                            SELECT order_no, item_no, seller_no, \
                            buyer_no, address_no, exchange_time, price\
                            FROM order_info WHERE order_no = ?';
                var values3 = [order_no];
                await db.query(sql3, values3);

                var sql4 = 'DELETE FROM order_info WHERE order_no=?';
                var values4 = [order_no];
                await db.query(sql4, values4);
            }

            responseData.code = '0066';
            responseData.message = '卖家删除订单成功';

            // console.log(responseData);
            res.json(responseData);

        }else if(student_no == data[0].buyer_no){
            var sql2 = 'UPDATE order_info SET for_buyer=\'0\' WHERE order_no=?';
            var values2 = [order_no];
            await db.query(sql2, values2);

            //删除订单，将其放入finished_order中
            if(data[0].for_seller == '0'){
                var sql3 = 'INSERT INTO finished_order \
                            SELECT order_no, item_no, seller_no, \
                            buyer_no, address_no, exchange_time, price\
                            FROM order_info WHERE order_no = ?';
                var values3 = [order_no];
                await db.query(sql3, values3);

                var sql4 = 'DELETE FROM order_info WHERE order_no=?';
                var values4 = [order_no];
                await db.query(sql4, values4);
            }

            responseData.code = '0067';
            responseData.message = '买家删除订单成功';

            console.log(responseData);
            res.json(responseData);

        }else{

            responseData.code = '0069';
            responseData.message = '您没有操作订单权限';

            console.log(responseData);
            res.json(responseData);

        }
    });

    //付款
    router.use('pay', async function(req, res){
        console.log("pay");
        var item_no = req.query.item_no;

        var sql = 'UPDATE item_info SET status=\'待收货\' WHERE item_no=?';
        var values = [item_no];
        await db.querys(sql, values);

        responseData.code = '0068';
        responseData.message = '商品付款成功';

        // console.log(responseData);
        res.json(responseData);

    });

    //生成订单
    //localhost:8080/home/trade/buy/place_order?item_no=0000000000000002&address_no=0000000000000001&student_no=3&exchange_time=2019-11-9 12:12:12
    router.get('/place_order', async function(req, res){
        var item_no = req.query.item_no;
        var address_no = req.query.address_no;
        var buyer_no = req.query.student_no;
        var exchange_time = req.query.exchange_time;
        var price = req.query.price;
        var seller_no = '';
        var data = '';

        //确认是否已经被别人拍下
        var sql = 'SELECT status FROM item_info WHERE item_no=?';
        var values = [item_no];
        data = await db.query(sql, values);
        console.log(data[0].status);

        if(data.length == 0){
            responseData.code = '0080';
            responseData.message = '该商品不存在';

            // console.log(responseData);
            res.json(responseData);

        }
        else if(data[0].status == '已发布'){
            //更改商品状态
            var sql1 = 'UPDATE item_info SET status=\'待付款\' WHERE item_no=?';
            var values1 = [item_no];
            data = await db.query(sql1, values1);
            console.log(data.changedRows);

            // //获取卖家编号
            var sql2 = 'SELECT student_no FROM item_info WHERE item_no=?';
            var values2 = [item_no];
            data = await db.query(sql2, values2);
            seller_no = data[0].student_no;

            //生成订单信息
            var sql3 = 'INSERT INTO order_info(item_no, seller_no, buyer_no, exchange_time, address_no, price) VALUES(?, ?, ?, ?, ?, ?)';
            var values3 = [item_no, seller_no, buyer_no, exchange_time, address_no, price];
            await db.query(sql3, values3);

            //返回订单编号
            var sql4 = 'SELECT order_no FROM order_info WHERE item_no=? AND exchange_time=?';
            var values4 = [item_no, exchange_time];
            responseData.data = await db.query(sql4, values4);

            responseData.code = '0070';
            responseData.message = '生成订单信息成功';

            console.log(responseData);
            res.json(responseData);
        }else{
            responseData.code = '0071';
            responseData.message = '该商品已下架';

            // console.log(responseData);
            res.json(responseData);

        }

    });

    return router;
  }