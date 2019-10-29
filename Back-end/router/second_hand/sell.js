const express = require('express');
const mysql = require('mysql');
const bodyparser = require('body-parser');
const pathLib = require('path');
const fs = require('fs');
const formidable = require('formidable');

var db = mysql.createPool({
    host:'132.232.81.249',
    user:'wjy',
    password:'wjy666',
    database:'hutao'
});

var responseData;


module.exports = function(){
    var router = express.Router();
    var fileDir = pathLib.join(__dirname,'../../images/item');
    console.log(fileDir);

    router.use('/', function(req,res,next){
        responseData = {
            code: 0,
            message: ''
        }
        next();
    });

    //发布商品
    router.post('/', function(req,res){
        var item_no = '0000000000000000';//默认值

        var form = new formidable.IncomingForm();
        form.uploadDir =fileDir;
        form.keepExtensions =true;
        
        form.parse(req, function(err, fields, files){
            console.log(fields);
            var count = fields['count'];
            var student_no = fields['student_no'];
            if(count == 1){
                var title = fields['title'];
                var description = fields['description'];
                var price = fields['price'];
                var publish_time = fields['publish_time'];
                var status = '已发布';
                var campus = fields['campus'];
                var dormitory = fields['dormitory'];
                var type = fields['type'];
                var grade = fields['grade'];
                var img_count = fields['img_count'];

                //插入商品信息
                db.query(`INSERT INTO item_info(student_no, title, description, price, status, try, campus, dormitory, img_count) VALUES ('${student_no}', '${title}', '${description}', '${price}', '${status}', '${publish_time}', '${campus}', '${dormitory}, '${img_count}'')`, function(err, data){
                    if(err){
                        console.log(err);
                        responseData.code = 1;
                        responseData.message = '插入失败';
                        res.json(responseData);
                    }else{
                        //获取商品编号，用来命名
                        db.query(`SELECT item_no from item_info WHERE student_no='${student_no}' AND try='${publish_time}' AND title='${title}'`, function(err, data){
                            if(err){
                                console.log(err);
                                responseData.code = 1;
                                responseData.message = '查询失败';
                                res.json(responseData);
                            }else{
                                // console.log(data[0]);
                                item_no = data[0].item_no;
                                console.log('item_no:' + item_no);

                                //插入标签信息
                                db.query(`INSERT INTO item_tag VALUES('${item_no}', '${type}', '${grade}')`,function(err, data){
                                    if(err){
                                        console.log(err);
                                        responseData.code = 1;
                                        responseData.message = '插入失败';
                                        res.json(responseData);
                                    }else{
                                        responseData.code = 0;
                                        responseData.message = '成功';
                                        console.log(responseData);
                                    }
                                });

                                //创建用户文件夹
                                var img_path = pathLib.parse(files.f1.path).dir + '\/' +student_no;
                                console.log('img_path:' + img_path);
                                if (!fs.existsSync(img_path)){  
                                    fs.mkdir(img_path,function(err){
                                        if(err){
                                            responseData.code = 1;
                                            responseData.message = '创建文件夹失败';
                                            console.log(responseData);
                                            res.json(responseData);
                                        }
                                    });
                                }

                                //插入图片
                                //重命名
                                var newName = img_path + '\/' + item_no + '_' + count + '.JPG';
                                //pathLib.parse(files[file].path).ext;   
                                console.log('newName' + newName);
                                fs.rename(files.f1.path, newName, function(err){
                                    if(err){
                                        console.log(err);
                                        responseData.code = 1;
                                        responseData.message = '上传失败';
                                        res.json(responseData);
                                        throw err;
                                    }
                                })
                                responseData.code = 0;
                                responseData.message = '上传成功';
                                res.data = item_no;
                                console.log(responseData);
                                res.json(responseData);
                            }
                        });
                    }
                });
            }else{ 
                //传多张图片
                item_no = fields['item_no'];
                console.log('item_no' + item_no);

                //得到用户文件夹路径
                var img_path = pathLib.parse(files.f1.path).dir + '\/' +student_no;
                console.log('img_path' + img_path);

                //插入图片
                //重命名
                var newName = img_path + '\/' + item_no + '_' + count + '.JPG';
                //pathLib.parse(files[file].path).ext;   
                console.log('newName' + newName);
                fs.rename(files.f1.path, newName, function(err){
                    if(err){
                        responseData.code = 1;
                        responseData.message = '上传失败';
                        res.json(responseData);
                        throw err;
                    }
                })
                responseData.code = 0;
                responseData.message = '上传成功';
                // res.data = item_no;
                console.log(responseData);
                res.json(responseData);
            }
        });
    });

    //删除商品
    router.get('/delete', function(req, res){
        var item_no = req.query.item_no;

        db.query(`DELETE FROM item_info WHERE item_no='${item_no}'`, function(err, data){
            if(err){
                responseData.code = 1;
                responseData.message = '网络或数据库错误';
                res.json(responseData);
            }else{
                responseData.code = 0;
                responseData.message = '删除成功';
                res.json(responseData);
            }
        });
    });

    //编辑商品,将信息传给前端人员
    router.post('/edit', function(req, res){
        var item_no = req.query.item_no;

        db.query(``, function(err, data){
            if(err){
                responseData.code = 1;
                responseData.message = '网络或数据库错误';
                res.json(responseData);
            }else{

            }
        });
    });


    return router;
}