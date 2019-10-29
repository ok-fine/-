const express = require('express');
const mysql = require('mysql');
const message = require('../../model/message');

var db = mysql.createPool({
    host: '132.232.81.249',
    user: 'wjy',
    password: 'wjy666',
    database: 'hutao'
});

var responseData;
var item_no = '0000000000000003';
// var student_no = '2';


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
        // var item_no = req.query.item_no;
        // var status = req.query.status;//商品状态,是否卖出
        // var is_mes = req.query.is_mes;//是否需要返回留言

        var status = "已发布";//商品状态,是否卖出
        var is_mes = "1"; //是否需要返回留言 1-是，0-否
        var sql = "";
        console.log(item_no);

        if(status == "已发布"){
            sql = "SELECT * FROM published_item WHERE item_no=\'" + item_no + "\'";
        }else{
            sql = "SELECT * FROM sold_item WHERE item_no=\'" + item_no + "\'";
        }

        console.log(sql);

        db.query(sql ,function(err,data){
            if(err){
                console.log(err);
                responseData.code = 1;
                responseData.message = '数据库1错误';
                res.json(responseData);
            }else{
                //判断是否有此商品
                if(data == ""){
                    responseData.code = 0;
                    responseData.message = '未找到该商品';
                    res.json(responseData);

                }else{
                    //加载文字信息
                    responseData.data = data;
                    console.log(data[0].img_count);

                    //返回商品图片
                    var images =  new Array(data[0].img_count);
                    for(var i = 1 ; i <= data[0].img_count ; i++){
                        images[i] = 'http://132.232.81.249:80/home/ubuntu/湖桃/Back-end/images/item/'+ data[0].student_no + '/' + data[0].item_no + '_' + i + '.JPG';
                    }
                    responseData.images = {
                        swiperImg: images
                    }

                    //加载商品标签
                    db.query(`SELECT * FROM item_tag WHERE item_no = '${item_no}'`, function(err, data){
                        if(err){
                            console.log(err);
                            responseData.code = 1;
                            responseData.message = '数据库tag错误';
                            res.json(responseData);
                        }else{
                            responseData.code = 0;
                            responseData.message = '标签信息加载成功';
                            responseData.tags = data;    

                            if(is_mes == 1){
                                //加载留言
                                 db.query(`SELECT * FROM message WHERE item_no = '${item_no}'`, function(err, data){
                                    if(err){
                                        console.log(err);
                                        responseData.code = 1;
                                        responseData.message = '数据库mes错误';
                                        res.json(responseData);
                                    }else{
                                        responseData.code = 0;
                                        responseData.message = '留言加载成功';
                                        responseData.messages = message.load(data);     //留言数据
                                        res.json(responseData);
                                    }
                                });
                            }else{
                                res.json(responseData);
                            }
                        }
                    }); 
                }               
            }
        });

    });

    //请求是否能删除留言
    router.get('/operate', function(req, res){
        var student_no = req.query.student_no;
        var mes_no = req.query.mes_no;

        db.query(`SELECT * FROM item_mes WHERE mes_no='${mes_no} AND student_no='${student_no}'`, function(err, data){
            if(err){
                console.error(err);
                responseData.code = 1;
                responseData.message = '数据库del_mes错误';
                res.json(responseData);
            }else{
                //这个留言不是该用户的，不能删除
                if(data == ""){
                    responseData.code = 0;
                    responseData.message = '不能删除';
                }else{
                    responseData.code = 0;
                    responseData.message = '可以删除';
                }
                console.log(responseData);
                res.json(responseData);
            }
        });
    });


    //删除留言
    router.get('/del_mes', function(req, res){
        var mes_no = req.query.mes_no;

        db.query(`DELETE FROM item_mes WHERE mes_no='${mes_no}'`, function(err, data){
            // console.log('delmes');
            if(err){
                console.error(err);
                responseData.code = 1;
                responseData.message = '数据库del_mes错误';
                res.json(responseData);
            }else{
                responseData.code = 0;
                responseData.message = '删除留言成功';
                res.json(responseData);
            }
        });

    });


    //增加留言，如果mes_no是空的话，就代表是直接给商品留言，否则就是回复的别人的留言
    router.post('/mes', function(req, res){
        var item_no = req.body.item_no;
        var parent_no = req.body.mes_no;
        var student_no = req.body.student_no;
        var content = req.body.content;
        var publish_time = req.body.publish_time;

        db.query(`INSERT INTO item_mes(item_no, parent_no, student_no, content, publish_time) VALUES('${item_no}', '${parent_no}', '${student_no}', '${content}', '${publish_time}')`, function(err, data){
            if(err){
                console.error(err);
                responseData.code = 1;
                responseData.message = '数据库mes错误';
                res.json(responseData);
            }else{
                responseData.code = 0;
                responseData.message = '留言成功';
                res.json(responseData);
            }
        });
    });

    //http://localhost:8080/home/trade/item_info/col?student_no=2&item_no=0000000000000001
    //收藏
    router.get('/col', function(req, res){
        var student_no = req.query.student_no;
        var item_no = req.query.item_no;

        db.query(`SELECT * FROM user_collect WHERE student_no='${student_no}' AND item_no='${item_no}'`, function(err, data){
            console.log(data);
            if(err){
                console.error(err);
                responseData.code = 1;
                responseData.message = '数据库1错误';
                res.json(responseData);
            }else{
                if(data == ""){
                    //没有就收藏
                    db.query(`INSERT INTO user_collect VALUES('${student_no}', '${item_no}')`, function(err, data){
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
                    db.query(`DELETE FROM user_collect WHERE student_no='${student_no}' AND 'item_no=${item_no}'`, function(err, data){
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

    return router;
  }