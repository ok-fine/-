const express = require('express');
const mysql = require('mysql');
const fs = require('fs');     //文件重命名
const pathLib = require('path');
const formidable = require('formidable');
const check = require('../model/check_card');

var db = mysql.createPool({
    host: '132.232.81.249',
    user: 'wjy',
    password: 'wjy666',
    database: 'hutao'
});

var responseData;

module.exports = function(){
    var router = express.Router();
    var fileDir = pathLib.join(__dirname,'../images/student_card');
    console.log(fileDir);

    router.use('/', function(req, res, next){

        responseData = {
            code: 0,
            message: '',
        }

        next();
    });

    //验证微信号是否已经绑定学号并成功验证
    router.get('/', function(req, res){
        var wechat_code = req.query.code;


        db.query(`SELECT student_no FROM student_user WHERE wechat_no='${wechat_no}'`, function(err, data){
            if(err){
                responseData.code = 1;
                responseData.message = '数据库或网络错误';
                res.json(responseData);
            }else{
                if(data.length != 0){
                    responseData.code = 1;
                    responseData.message = '用户不存在';
                }else{
                    responseData.code = 0;
                    responseData.message = '登陆成功';
                    responseData.data = data;
                }
                console.log(responseData);
                res.json(responseData);
            }
        });

    });

    //登陆验证，绑定微信号于学号
    router.post('/', function(req, res){
        var form = new formidable.IncomingForm();
        form.uploadDir =fileDir;
        form.keepExtensions =true;
        form.parse(req, function(err, fields, files){
            // console.log(files);
            // var student_no = fields['student_no'];
            var student_name = fields['student_name'];
            var student_no = fields['student_no'];
            var check_name = "姓名:" + student_name;
            var check_no = "学号:" + student_no;

            //先存储为临时照片，命名为学号
            var card_href = pathLib.parse(files.card_href.path).dir + '\/' + fields['student_no'] + '.JPG';
            fs.rename(files.card_href.path, card_href, function(err){
                if(err){
                    responseData.code = 6;
                    responseData.message = '上传失败';
                    res.json(responseData);
                    throw err;
                }
                else{
                    responseData.code = 0;
                    responseData.message = '上传成功';
                    console.log(responseData);
                }
            })

            //检查用户是否存在
            db.query(`SELECT * FROM student_user WHERE student_no='${student_no}'`, function(err, data){
                if(data.length != 0){
                    //用户存在，删除临时照片
                    fs.unlinkSync(card_href);

                    responseData.code = 1;
                    responseData.message = '用户已存在,请使用已绑定的微信号登陆';
                    res.json(responseData);
                }else{
                    //用户不存在就重命名名存储改学生证照片为“学号_1.JPG”
                    card_href = pathLib.parse(files.card_href.path).dir + '\/' +  fields['student_no'] + '_1.JPG';
                    // + pathLib.parse(files.card_href.path).ext; //加原图片的后缀语句
                    // console.log(card_href);

                    //重命名,并上传学生证照片检测学号和姓名等信息
                    fs.rename(files.card_href.path, card_href, function(err){
                        if(err){
                            responseData.code = 6;
                            responseData.message = '上传失败';
                            res.json(responseData);
                            throw err;
                        }
                        else{
                            responseData.code = 0;
                            responseData.message = '上传成功';
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


