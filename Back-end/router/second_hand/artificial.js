const express = require('express');
const bodyparser = require('body-parser');
const pathLib = require('path');
const fs = require('fs');
const formidable = require('formidable');
const async = require('async');
const db = require('../../model/query');
const request = require('request');

var responseData;

module.exports = function(){
    var router = express.Router();
    var fileDir = pathLib.join(__dirname,'../../images/artificial');
    var session_key;
    var openid;

    router.use('/', function(req, res, next){

        responseData = {
            code: '0000',
            message: '',
        }

        next();
    });

    //实现人工验证
    router.post('/', function(req, res){
    	console.log('artificial');
        var APP_URL = 'https://api.weixin.qq.com/sns/jscode2session';
        var APP_ID = 'wx782ad455ff9b7900';   //小程序的app id ，在公众开发者后台可以看到
        var APP_SECRET = '966fe60310de43d1c3cf10c06d738f35';  //程序的app secrect，在公众开发者后台可以看到

	    var form = new formidable.IncomingForm();
	    form.uploadDir = fileDir;
	    form.keepExtensions = true;
	    form.parse(req, async function(err, fields, files){
	        //判断是人脸还是学生证 1-学生证， 2-人脸
	        var count = fields['count'];
	        var student_no = fields['student_no'];

	        if(count == 1){
	        	var student_name = fields['student_name'];
			    var user_name = fields['user_name'];
			    var portrait_href = fields['portrait_href'];

			    var wechat_code = fields['code'];

			    console.log(count);
			    console.log(wechat_code);

	        	//获得session_key
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

		                var sql = 'SELECT student_no FROM artificial_check WHERE openid = ?';
		    			var values = [openid];
		    			responseData.data = await db.query(sql, values);

		    			if(responseData.data.length != 0){
		    				responseData.code = '0004';
		                    responseData.message = '用户已存在';
		                    res.json(responseData);
		    			}else{
		    				var sql1 = 'INSERT INTO artificial_check(student_no, student_name, user_name, portrait_href, session_key, openid) \
			        						VALUES(?, ?, ?, ?, ?, ?)';
		        			var values1 = [student_no, student_name, user_name, portrait_href, session_key, openid];
		        			await db.query(sql1, values1);

		        			//存图片
		        			var card_href = pathLib.parse(files.f1.path).dir + '\/' + student_no + '_1.JPG';
					        console.log('card_href' + card_href);
				        	fs.rename(files.f1.path, card_href, async function(err){
				                if(err){
				                    responseData.code = '0005';
				                    responseData.message = '用户学生证图片上传失败';
				                    res.json(responseData);
				                    throw err;
				                }
				                else{
				                    //插入需要验证的学生信息
				        			var sql = 'UPDATE artificial_check SET card_href = ? WHERE student_no = ?';
				        			var values = [card_href, student_no];
				        			await db.query(sql, values);

				        			responseData.code = '0006';
				                    responseData.message = '用户信息上传成功';
				                    console.log(responseData);

				                    // res.json(responseData);
				                }
				            });

				            // responseData.code = '0003';
		                    // responseData.message = '登陆成功';
		                    res.json(responseData);
		    			}
		            });
		        }
	        }else{
				var face_href = pathLib.parse(files.f1.path).dir + '\/' + student_no + '_2.JPG';
				console.log('face_href' + face_href);
	        	fs.rename(files.f1.path, face_href, async function(err){
	                if(err){
	                    responseData.code = '0005';
	                    responseData.message = '用户人脸上传失败';
	                    res.json(responseData);
	                    throw err;
	                }
	                else{

						var sql = 'UPDATE artificial_check SET face_href = ? WHERE student_no = ?';
	        			var values = [face_href, student_no];
	        			await db.query(sql, values);

	                    responseData.code = '0006';
	                    responseData.message = '用户人脸上传成功';
	                    console.log(responseData);

	                    res.json(responseData);
	                }
	            });
	        }
	    });
    });

    router.post('/log', async function(req, res){
    	console.log('log');
    	var userName = req.body.userName;
    	var password = req.body.password;

    	var sql = 'SELECT password FROM system_admin WHERE admin_name = ?';
    	var values = [userName];
    	responseData.data = await db.query(sql, values);

    	if(responseData.data.length != 0){
    		if(password == responseData.data[0]){
    			responseData.code = '0000';
    			responseData.message = '登陆成功';
    			res.json(responseData);
    		}else{
    			responseData.code = '0001';
    			responseData.message = '登陆密码错误';
    			res.json(responseData);
    		}
    	}
    	responseData.code = '0002';
		responseData.message = '用户不存在';
		res.json(responseData);
    });

    router.get('/get', async function(req, res){
    	var sql = 'SELECT * FROM artificial_check';
	    var values = [];
	    responseData.data = await db.query(sql, values);

	    responseData.code = '00090';
	    responseData.message = '获取人工审核信息成功';
		console.log(responseData);
	    res.json(responseData);
    });

    router.get('/pass', async function(req, res){
    	var student_no = req.query.student_no;

    	var sql = 'SELECT * FROM artificial_check WHERE student_no = ?';
	    var values = [student_no];
	    responseData.data = await db.query(sql, values);
	    console.log(responseData.data[0]);

	    if(responseData.data.length != 0){
	    	var sql = 'INSERT INTO student_user VALUES(?, ?, ?, ?, ?)';
		    var values = [responseData.data[0].student_no, responseData.data[0].student_name, responseData.data[0].card_href, responseData.data[0].session_key, responseData.data[0].openid];
		    await db.query(sql, values);

		    var sql1 = 'INSERT INTO user_info(student_no, user_name, portrait_href) VALUES(?, ? ,?)';
		    var values1 = [student_no, responseData.data[0].user_name, responseData.data[0].portrait_href];
		    await db.query(sql1, values1);
		    
		    var sql2 = 'DELETE FROM artificial_check WHERE student_no = ?';
		    var values2 = [student_no];
		    responseData.data = await db.query(sql2, values2);

		    responseData.code = '00090';
		    responseData.message = '创建用户成功';
			console.log(responseData);
		    res.json(responseData);
	    }else{
	    	responseData.code = '00092';
		    responseData.message = '用户不存在';
			console.log(responseData);
		    res.json(responseData);
	    }
    });

    router.get('/refuse', async function(req, res){
    	var student_no = req.query.student_no;

    	var sql = 'DELETE FROM artificial_check WHERE student_no = ?';
	    var values = [student_no];
	    responseData.data = await db.query(sql, values);

	    responseData.code = '00090';
	    responseData.message = '人工审核失败';
		console.log(responseData);
	    res.json(responseData);
    });

    return router;
}