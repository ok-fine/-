const express = require('express');
const mysql = require('mysql');
const async = require('async');
const message = require('../../model/message');
const db = require('../../model/query');

var responseData;
var responseData1;
// var item_no = '0000000000000003';
// var student_no = '2';


module.exports = function(){
    var router = express.Router();

    router.use('/', function(req, res, next){

        responseData = {
            code: '',
            message: '',
        }

        next();
    });

    //http://localhost:8080/home/trade/item_info?item_no=000000000000008&status=已发布&is_mes=1&student_no=1
    //加载商品详情页面
    //修改时只需要不加载留言即可
    router.get('/', async function(req, res){
        var item_no = req.query.item_no;
        var student_no = req.query.student_no;
        // var status = req.query.status;//商品状态,是否卖出
        var is_mes = req.query.is_mes;//是否需要返回留言 1-是，0-否
        console.log(item_no);
        // console.log(student_no);

        //判断用户是否收藏该商品
        var sql4 = 'SELECT * FROM user_collect WHERE item_no=? AND student_no=?';
        var values4 = [item_no, student_no];
        var result = await db.query(sql4, values4);
        if(result.length == 0){
            responseData.collect = '0';
        }else{
            responseData.collect = '1';
        }

        //获取商品信息
        var sql = 'SELECT * FROM item_info WHERE item_no=?';
        var values=[item_no];
        responseData.data = await db.query(sql, values);
        console.log(responseData.data);

        if(responseData.data.length == 0){
            responseData.code = '0016';
            responseData.message = '没有找到该商品';
            res.json(responseData);

        }else if(responseData.data[0].status == '编辑中'){
            responseData.code = '0017';
            responseData.message = '该商品正在编辑中';
            res.json(responseData);

        }else{

            //获取卖家信息
            var sql1 = "SELECT user_name, credit, portrait_href FROM user_info WHERE student_no=?";
            var values1 = [responseData.data[0].student_no];
            responseData.seller = await db.query(sql1, values1);

            //加载商品图片
            var images =  new Array(responseData.data[0].img_count);
            await new Promise(function(resolve, reject){
                for(var i = 1 ; i <= responseData.data[0].img_count ; i++){
                    images[i-1] = 'http://132.232.81.249:81/images/item/'+ responseData.data[0].student_no + '/' + responseData.data[0].item_no + '_' + i + '.JPG';
                }
                responseData.images = {
                    swiperImg: images
                }
                resolve('图片加载成功');
            });

            //加载商品标签
            var sql2 = "SELECT * FROM item_tag WHERE item_no=?";
            var values2 = [item_no];
            responseData.tag = await db.query(sql2, values2);

            //加载留言
            if(is_mes == 1){
                responseData.messages = await message.load(item_no);
            }

            responseData.code = '0018';
            responseData.message = '商品详情加载成功';

            console.log(responseData);
            res.json(responseData);
        }
    });


    ////http://localhost:8080/home/trade/item_info/operate?student_no=2&item_no=0000000000000001
    //请求是否能删除留言
    router.get('/operate', function(req, res){
        var student_no = req.query.student_no;
        var mes_no = req.query.mes_no;

        var sql = 'SELECT * FROM item_mes WHERE mes_no=? AND student_no=?';
        var values = [mes_no, student_no]
        db.query(sql, values).then(function(result){
            console.log(result);
            if(result.length == 0){
                responseData.code = '0020';
                responseData.message = '留言不可删除';
            }else{
                responseData.code = '0019';
                responseData.message = '留言可删除';
            }

            console.log(responseData);
            res.json(responseData);
        });
    });

    ////http://localhost:8080/home/trade/item_info/del_mes?mes_no=0000000000000007
    //删除留言
    router.get('/del_mes', async function(req, res){
        var mes_no = req.query.mes_no;

        var sql = 'DELETE FROM item_mes WHERE mes_no=?';
        var values = [mes_no];
        console.log(mes_no);

        await db.query(sql, values).then(function(data){
            console.log(data);
            responseData.code = '0021';
            responseData.message = '删除留言成功';
            console.log(responseData);
            res.json(responseData);
        });

    });


    //增加留言，如果mes_no是空的话，就代表是直接给商品留言，否则就是回复的别人的留言
    router.post('/mes', async function(req, res){
        var item_no = req.body.item_no;
        var parent_no = req.body.mes_no; 
        var student_no = req.body.student_no;
        var content = req.body.content;
        var publish_time = req.body.publish_time;
        var reply_name = req.body.reply_name;

        console.log('jinru留言');
        var sql = 'INSERT INTO item_mes(item_no, parent_no, reply_name, student_no, content, publish_time) VALUES(?, ?, ?, ?, ?, ?)';
        var values = [item_no, parent_no, reply_name, student_no, content, publish_time];
        await db.query(sql, values);

        var sql1 = 'SELECT mes_no FROM item_mes WHERE item_no=? AND student_no=? AND publish_time=?';
        var values1 = [item_no, student_no, publish_time];
        responseData.data = await db.query(sql1, values1);
        responseData.code = '0022';
        responseData.message = '留言成功';

        console.log(responseData);
        res.json(responseData);

    });

    //http://localhost:8080/home/trade/item_info/col?student_no=2&item_no=0000000000000001
    //收藏
    router.get('/col', async function(req, res){
        var student_no = req.query.student_no;
        var item_no = req.query.item_no;

        //检测是否收藏该商品
        var sql1 = 'SELECT * FROM user_collect WHERE student_no=? AND item_no=?';
        var values1 = [student_no, item_no];
        responseData.data = await db.query(sql1, values1);

        //没有就收藏
        var sql2 = '';
        var values2 = [student_no, item_no];
        responseData.message = await new Promise(function(resolve, reject){
            if(responseData.data.length == 0){
                sql2 = 'INSERT INTO user_collect VALUES(?, ?)';
                responseData.code = '0023';
                resolve('收藏成功');
            }else{
                sql2 = 'DELETE FROM user_collect WHERE student_no=? AND item_no=?';
                responseData.code = '0024';
                resolve('取消收藏');
            }
        });

        //执行收藏的数据库语句
        await db.query(sql2, values2);

        console.log(responseData);
        res.json(responseData);

    });

    return router;
  }