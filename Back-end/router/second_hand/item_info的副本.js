const express = require('express');
const mysql = require('mysql');

var db = mysql.createPool({
    host: '132.232.81.249',
    user: 'wjy',
    password: 'wjy666',
    database: 'hutao'
});

var responseData;
var item_no = '1';
var student_no = '2';

item_info = {
    item_no:'hutao',
    student_no:'hutao',
    title:'hutao',
    description:'hutao',
    price:'hutao',
    publish_time:'hutao',
    status:'hutao'
}

module.exports = function(){
    var router = express.Router();

    router.use('/', function(req, res, next){

        responseData = {
            code: 0,
            message: '',
        }

        next();
    });

    //加载商品详情页面
    router.get('/', function(req, res){
        var item_no = req.query.item_no;

        db.query(`SELECT * FROM item_info WHERE item_no = '${item_no}'`,function(err,data){
            if(err){
                console.log(err);
                responseData.code = 1;
                responseData.message = '数据库1错误';
                res.json(responseData);
            }else{
                // console.log(data[0]);
                responseData.code = 0;
                responseData.message = '成功';
                responseData.data = data;
                console.log(responseData.data);

                responseData.images = {
                    swiperImg:['http://localhost:8080/images/1.jpg','http://localhost:8080/images/2.jpg'],
                    item_info
                }

                //留言加载
                db.query(`SELECT * FROM item_mes WHERE item_no=${item_no}`,function(err, data){
                    // console.log('get message');
                    if(err){
                        console.log(err);
                        responseData.code = 1;
                        responseData.message = '数据库2错误';
                        res.json(responseData);
                    }else{
                        // console.log(item_info);
                        responseData.code = 0;
                        responseData.message = '成功';
                        responseData.item_mes = data;

                        if( typeof data[0] == 'undefined'){
                            console.log("没有留言");
                        }

                        res.json(responseData);
                        // res.render('item.ejs',{item_info, item_mes});
                    }
                });
            }
        });

    });

    //http://localhost:8080/home/trade/item_info/col?student_no=2&item_no=0000000000000001
    router.get('/col', function(req, res){
        var student_no = req.query.student_no;
        var item_no = req.query.item_no;

        console.log('into');
        db.query(`SELECT * FROM user_collect WHERE student_no=${student_no} AND item_no=${item_no}`, (err, data) =>{
            // console.log('select');
            if(err){
                console.error(err);
                responseData.code = 1;
                responseData.message = '数据库1错误';
                res.json(responseData);
            }else{

                if(data == ""){
                    //没有就收藏
                    db.query(`INSERT INTO user_collect VALUES(${student_no}, ${item_no})`, (err, data) =>{
                        // console.log('insert');
                        if(err){
                            console.error(err);
                            responseData.code = 1;
                            responseData.message = '数据库2错误';
                            res.json(responseData);
                        }else{
                            console.log('收藏成功');
                            responseData.code = 0;
                            responseData.message = '收藏成功';
                        }
                    });
                }else{
                    //有就删掉收藏
                    db.query(`DELETE FROM user_collect WHERE student_no=${student_no} AND item_no=${item_no}`, (err, data) =>{
                        // console.log('collect');
                        if(err){
                            console.error(err);
                            responseData.code = 1;
                            responseData.message = '数据库3错误';
                            res.json(responseData);
                        }else{
                            console.log('取消收藏');
                            responseData.code = 0;
                            responseData.message = '取消收藏';
                        }
                    });
                }
            }
        });
    });

    router.get('/', (req, res) =>{
        switch(req.query.act){
            //给商品留言
            case 'mes':
                db.query(`SELECT * FROM item_info WHERE item_no = '${item_no}'`,function(err,data){
                    if(err){
                        responseData.code = 1;
                        responseData.message = '数据库1错误';
                        res.json(responseData);
                    }else{
                        // console.log(data[0]);
                        responseData.code = 0;
                        responseData.message = '成功';
                        item_info = {
                            item_no: data[0].item_no,
                            student_no: data[0].student_no,
                            title:data[0].title,
                            description:data[0].description,
                            price:data[0].price,
                            publish_time:data[0].publish_time,
                            status:data[0].status
                        }

                        responseData.data = {
                            swiperImg:['http://localhost:8080/images/1.jpg','http://localhost:8080/images/2.jpg'],
                            item_info
                        }

                        db.query(`SELECT * FROM item_mes WHERE item_no=${item_no}`,function(err,data){
                            // console.log('get message');
                            if(err){
                                console.log(err);
                                responseData.code = 1;
                                responseData.message = '数据库2错误';
                                res.json(responseData);
                            }else{
                                // console.log(item_info);
                                responseData.code = 0;
                                responseData.message = '成功';

                                if( typeof data[0] == 'undefined'){
                                    item_mes = "没有留言";
                                }else{
                                    item_mes = data;
                                }
                                // console.log(item_mes);
                                res.render('item.ejs',{item_info, item_mes, mes:'可'});
                            }
                        });
                    }
                });
                break;

            //点击收藏，取消收藏
            case 'col':
                // console.log('into');
                db.query(`SELECT * FROM user_collect WHERE student_no=${student_no} AND item_no=${item_no}`, (err, data) =>{
                    // console.log('select');
                    if(err){
                        console.error(err);
                        responseData.code = 1;
                        responseData.message = '数据库1错误';
                        res.json(responseData);
                    }else{

                        if(data == ""){
                            //没有就收藏
                            db.query(`INSERT INTO user_collect VALUES(${student_no}, ${item_no})`, (err, data) =>{
                                // console.log('insert');
                                if(err){
                                    console.error(err);
                                    responseData.code = 1;
                                    responseData.message = '数据库2错误';
                                    res.json(responseData);
                                }else{
                                    console.log('收藏成功');
                                }
                            });
                        }else{
                            //有就删掉收藏
                            db.query(`DELETE FROM user_collect WHERE student_no=${student_no} AND item_no=${item_no}`, (err, data) =>{
                                // console.log('collect');
                                if(err){
                                    console.error(err);
                                    responseData.code = 1;
                                    responseData.message = '数据库3错误';
                                    res.json(responseData);
                                }else{
                                    console.log('取消收藏');
                                }
                            });
                        }
                    }
                });
                break;

            //删除留言
            case 'del':
                db.query(`DELETE FROM item_mes WHERE student_no='${req.query.student_no}' AND item_no='${req.query.item_no}' AND mes_time='${req.query.mes_time}'`, (err, data) =>{
                    // console.log('collect');
                    if(err){
                        console.error(err);
                        responseData.code = 1;
                        responseData.message = '数据库del错误';
                        res.json(responseData);
                    }else{
                        res.redirect('/home/trade/item_info');
                    }
                });
                break;
        }
    });

    //留言
    router.use('/mes',function(req,res){
        var content = req.query.message;
        var item_no = req.query.item_no;
        var parent_no = '';
        var time = Date.now()
        console.log(time);

        db.query(`INSERT INTO item_mes VALUES('${item_no}', '${parent_no}', '${student_no}', '${content}', '${time}')`, (err, data) =>{
            if(err){
                console.log(err);
                responseData.code = 1;
                responseData.message = '数据库mes错误';
                res.json(responseData);
            }else{
                res.redirect('/home/trade/item_info');
            }
        });


    });

    return router;
  }