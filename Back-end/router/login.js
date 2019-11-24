const express = require('express');
const mysql = require('mysql');
const fs = require('fs');     //文件重命名
const pathLib = require('path');
const formidable = require('formidable');
const check = require('../model/check_card');
const request = require('request');
const async = require('async');
const db = require('../model/query');

var db2 = mysql.createPool({
    host: '132.232.81.249',
    user: 'wjy',
    password: 'wjy666',
    database: 'hutao'
});

var responseData;

module.exports = function(){
    var router = express.Router();
    var fileDir = pathLib.join(__dirname,'../images/student_card');
    var session_key;
    var openid;
    var session_no;

    console.log(fileDir);

    router.use('/', function(req, res, next){

        responseData = {
            code: '',
            message: ''
        }

        next();
    });

    //验证微信号是否已经绑定学号并成功验证
    router.get('/', function(req, res){
        var wechat_code = req.query.code;
        var APP_URL = 'https://api.weixin.qq.com/sns/jscode2session';
        var APP_ID = 'wxff0708c2fb00de45';   //小程序的app id ，在公众开发者后台可以看到
        var APP_SECRET = 'ef4b7faf887d28fd5165998e9ffc5739';  //程序的app secrect，在公众开发者后台可以看到
        if(!!wechat_code)
        {
            request(`${APP_URL}?appid=${APP_ID}&secret=${APP_SECRET}&js_code=${wechat_code}&grant_type=authorization_code`, async function(error, response, body){
                console.log('statusCode:', response && response.statusCode);
                console.log(body);

                keys = JSON.parse(body);
                session_key = keys.session_key;
                openid = keys.openid;
                
                // res.end(body);
                console.log('session_key:' + keys.session_key);
                console.log('openid:' + openid);

                var sql1 = 'SELECT student_no FROM student_user WHERE openid=?';
                var values1 = [openid];
                responseData.data = await db.query(sql1, values1);

                if(responseData.data.length == 0){
                    console.log("data.length=0");
                    var sql2 = 'INSERT INTO temp_session(session_key,openid) VALUES(?, ?)';
                    var values2 = [session_key, openid];
                    await db.query(sql2, values2);

                    var sql3 = 'SELECT session_no FROM temp_session WHERE openid=?';
                    var values3 = [openid];
                    var data = await db.query(sql3, values3);
        		    responseData.data = data[0].session_no;
        		    responseData.code = '0002';
                    responseData.message = '用户不存在';
                    
                    res.json(responseData);
                }else{
                        responseData.code = '0003';
                        responseData.message = '登陆成功';
                        res.json(responseData);
                }
            })
        }
    });

    //登陆验证
    router.post('/', function(req, res){
        var form = new formidable.IncomingForm();
        form.uploadDir = fileDir;
        form.keepExtensions = true;
        form.parse(req, function(err, fields, files){
            // console.log(files);
            // var student_no = fields['student_no'];
            var student_name = fields['student_name'];
            var student_no = fields['student_no'];
            var check_name = '姓名:' + student_name;
            var check_no = '学号:' + student_no;

            //先存储为临时照片，命名为学号
            var card_href = pathLib.parse(files.card_href.path).dir + '\/' + fields['student_no'] + '_1.JPG';
            //检查用户是否存在
            db2.query(`SELECT * FROM student_user WHERE student_no='${student_no}'`, function(err, data){
                if(data.length != 0){
                    fs.rename(files.card_href.path, card_href, function(err){
                        if(err){
                            responseData.code = '0005';
                            responseData.message = '用户学生证图片上传失败';
                            res.json(responseData);
                            throw err;
                        }
                        else{
                            responseData.code = '0006';
                            responseData.message = '用户学生证图片上传成功';
                            console.log(responseData);
                            check.check_card(res, check_no, check_name, card_href);
                        }
                    })
                    responseData.code = '0004';
                    responseData.message = '用户已存在,请使用已绑定的微信号登陆';
                    res.json(responseData);
                }else{
                    //用户不存在就重命名名存储改学生证照片为“学号_1.JPG”
                    card_href = pathLib.parse(files.card_href.path).dir + '\/' +  fields['student_no'] + '_1.JPG';
                    //重命名,并上传学生证照片检测学号和姓名等信息
                    fs.rename(files.card_href.path, card_href, function(err){
                        if(err){
                            responseData.code = '0005';
                            responseData.message = '用户学生证图片上传失败';
                            res.json(responseData);
                            throw err;
                        }
                        else{
                            responseData.code = '0006';
                            responseData.message = '用户学生证图片上传成功';
                            console.log(responseData);
                            //异步处理图像识别
                            check.check_card(res, check_no, check_name, card_href);
                            // res.json(responseData);
                        }
                    })
                }
            });
        });

    });

    return router;
}


