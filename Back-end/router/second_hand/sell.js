const express = require('express');
const bodyparser = require('body-parser');
const pathLib = require('path');
const fs = require('fs');
const formidable = require('formidable');
const async = require('async');
const db = require('../../model/query');

var responseData;

module.exports = function(){
    var router = express.Router();
    var fileDir = pathLib.join(__dirname,'../../images/item');
    console.log(fileDir);

    router.use('/', function(req,res,next){
        responseData = {
            code: '',
            message: ''
        }
        next();
    });

    //发布商品
    router.post('/', function(req,res){
        var item_no = '0000000000000000';//默认值

        var form = new formidable.IncomingForm();
        form.uploadDir = fileDir;
        form.keepExtensions = true;
        
        form.parse(req, async function(err, fields, files){
            console.log(fields);
            //记录传过来的是第几张图片
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

                //插入商品文字详情
                var sql1 = 'INSERT INTO item_info(student_no, title, description, price, status, publish_time, campus, dormitory, img_count) \
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
                var values1 = [student_no, title, description, price, status, publish_time, campus, dormitory, img_count];
                var data = await db.query(sql1, values1);

                //得到商品的item_no并保存下来
                var sql2 = 'SELECT item_no from item_info WHERE student_no=? AND publish_time=? AND title=?';
                var values2 = [student_no, publish_time, title];
                data = await db.query(sql2, values2);
                item_no = data[0].item_no;
                console.log(responseData.data);

                //插入商品的标签信息
                var sql3 = 'INSERT INTO item_tag VALUES(?, ?, ?)';
                var values3 = [item_no, type, grade];
                data = await db.query(sql3, values3);

                //创建用户文件夹
                var img_path = pathLib.parse(files.f1.path).dir + '\/' +student_no;
                console.log('img_path:' + img_path);
                if (!fs.existsSync(img_path)){  
                    fs.mkdir(img_path,function(err){
                        if(err){
                            responseData.code = '0025';
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
                        responseData.code = '0026';
                        responseData.message = '图片上传失败';
                        res.json(responseData);
                        throw err;
                    }
                })
                responseData.code = '0027';
                responseData.message = '图片' + count + '上传成功';
                responseData.data = item_no;
                console.log(responseData);
                res.json(responseData);
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
                        responseData.code = '0026';
                        responseData.message = '图片上传失败';
                        res.json(responseData);
                        throw err;
                    }
                })
                responseData.code = '0027';
                responseData.message = '图片' + count + '上传成功';
                // res.data = item_no;
                console.log(responseData);
                res.json(responseData);
            }
        });
    });

    //删除商品
    router.get('/delete', async function(req, res){
        var item_no = req.query.item_no;
        var student_no = req.query.student_no;

        //获取图片数量
        var sql = 'SELECT img_count FROM item_info WHERE item_no=?';
        var values = [item_no];
        var count = await db.query(sql, values);
        console.log(count);
        console.log(count[0].img_count);

        //删除商品图片
        for(var i = 1 ; i <= count[0].img_count ; i++){
            var img_path = '/home/ubuntu/hutao/Back-end/images/item/'+ student_no + '/' + item_no + '_' + i + '.JPG';
            console.log(img_path);
            fs.unlinkSync(img_path);
        }

        //删除商品详情
        var sql1 = 'DELETE FROM item_info WHERE item_no=?';
        var values1 = [item_no];
        await db.query(sql1, values1);

        //删除留言
        var sql2 = 'DELETE FROM item_mes WHERE item_no=?';
        var values2 = [item_no];
        await db.query(sql2, values2);

        //删除标签
        var sql3 = 'DELETE FROM item_tag WHERE item_no=?';
        var values3 = [item_no];
        await db.query(sql3, values3);

        //删除收藏
        var sql4 = 'DELETE FROM user_collect WHERE item_no=?';
        var values4 = [item_no];
        await db.query(sql4, values4);

        //不删除订单

        responseData.code = '0028';
        responseData.message = '删除商品信息成功';
        res.json(responseData);
    });

    function deleteFolderFile(path){                                //递归删除文件夹中内容
        if( fs.existsSync(path) ) {
            fs.readdirSync(path).forEach(function(file) {
                var curPath = path + "/" + file;
                if(fs.statSync(curPath).isDirectory()) {
                    deleteFolderFile(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
        }
    };

    //http://localhost:8080/home/trade/sell/if_edit?item_no=0000000000000094&student_no=3
    //发起更改请求
    router.get('/if_edit', async function(req, res){
        var item_no = req.query.item_no;
        var student_no = req.query.student_no;

        //更改商品状态
        var sql1 = 'UPDATE item_info SET status=\'编辑中\' WHERE item_no=?';
        var values = [item_no];
        await db.query(sql1, values);

        //获取商品文字详情
        var sql2 = 'SELECT * FROM item_info WHERE item_no=?';
        responseData.data = await db.query(sql2, values);
        console.log(responseData.data[0]);

        //加载商品图片
        var images =  new Array(responseData.data[0].img_count);
        await new Promise(function(resolve, reject){
            for(var i = 1 ; i <= responseData.data[0].img_count ; i++){
                images[i-1] = 'http://132.232.81.249:81/images/item/'+ student_no + '/' + responseData.data[0].item_no + '_' + i + '.JPG';
            }
            responseData.images = {
                swiperImg: images
            }
            resolve('图片加载成功');
        });

        //加载商品标签
        var sql3 = 'SELECT * FROM item_tag WHERE item_no=?';
        responseData.tag = await db.query(sql3, values);

        responseData.code = '0018';
        responseData.message = '商品详情加载成功';
        res.json(responseData);

    });

    //不编辑了直接返回
    router.use('/edit_exit', async function(req, res){
        console.log('edit_exit');
        var item_no = req.query.item_no;

        var sql = 'UPDATE item_info SET status = \'已发布\' WHERE item_no = ?';
        var values = [item_no];
        responseData.data = await db.query(sql, values);

        responseData.code = '0079';
        responseData.message = '修改商品状态成功';
        res.json(responseData);
    });


    //更改商品信息,
    //item_info,item_tag,图片
    router.use('/edit_info', async function(req, res){
        var item_no = req.body.item_no;
        var student_no = req.body.student_no;
        // var count = req.body.count;
        var title = req.body.title;
        var description = req.body.description;
        var price = req.body.price;
        var publish_time = req.body.publish_time;
        var status = req.body.status;
        var campus = req.body.campus;
        var dormitory = req.body.dormitory;
        var type = req.body.type;
        var grade = req.body.grade;
        var img_count = req.body.img_count;//表示更改后的图片总数
        var hold = req.body.img_hold;      //存放没被删除的图片路径
        var del = req.body.img_del;    //存放被删除的图片路径

        // console.log(hold);
        // console.log(del);
        // 的到路径数组
        if(hold == 'undefined'){
            var img_hold = [];
        }else{
            var img_hold = hold.split(" "); 
        }

        if(del == 'undefined'){
            var img_del = [];
        }else{
            var img_del = del.split(" ");
        }

        console.log(item_no);
        console.log('img_hold:' + img_hold[0]);
        console.log('img_del:' + img_del);
        console.log('img_del.length:' + img_del.length);

        //更新数据
        var sql1 = 'UPDATE item_info SET title=?, description=?, price=?, status=?, publish_time=?, campus=?, dormitory=?, img_count=? WHERE item_no=?';
        var values1 = [title, description, price, status, publish_time, campus, dormitory, img_count, item_no];
        await db.query(sql1, values1);

        //更新商品的标签信息
        var sql2 = 'UPDATE item_tag SET type=?, grade=? WHERE item_no=?';
        var values2 = [type, grade, item_no];
        data = await db.query(sql2, values2);

        //图片修改 
        //删除商品图片
        for(var i = 0 ; i < img_del.length ; i++){
            var path = img_del[i].substr(img_del[i].length - 23, 23);
            var del_path = '/home/ubuntu/hutao/Back-end/images/item/'+ student_no + path;
            console.log("del_path" + del_path);
            fs.unlinkSync(del_path);
        }

        //更改剩余图片编号
        for(var i = 1 ; i <= img_hold.length ; i++){
            var path = img_hold[i - 1].substr(img_hold[i - 1].length - 23, 23);
            var old_img_path = '/home/ubuntu/hutao/Back-end/images/item/'+ student_no +  path;
            // console.log("old_img_path:" + old_img_path);
            var new_img_path = '/home/ubuntu/hutao/Back-end/images/item/'+ student_no + '\/' + item_no + '_' + i + '.JPG';
            //路径不一样时才需要重命名
            if(new_img_path != old_img_path){
                fs.rename(old_img_path, new_img_path, function(err){
                    if(err){
                        console.log(err);
                        responseData.code = '0030';
                        responseData.message = '图片重命名失败';
                        res.json(responseData);
                        throw err;
                    }
                });
            }
        }

        responseData.code = '0029';
        responseData.message = '更改商品文字信息成功';
        res.json(responseData);
    });

    //更改图片信息
    router.post('/edit_pic', async function(req, res){
        var form = new formidable.IncomingForm();
        form.uploadDir = fileDir;
        form.keepExtensions = true;
        
        form.parse(req, async function(err, fields, files){
            var item_no = fields['item_no'];
            var student_no = fields['student_no'];
            var count = fields['count'];

            console.log('item_no' + item_no);
            console.log('count:' + count);

            //创建用户文件夹
            var img_path = pathLib.parse(files.f1.path).dir + '\/' +student_no;
            console.log('img_path:' + img_path);
            if (!fs.existsSync(img_path)){  
                fs.mkdir(img_path,function(err){
                    if(err){
                        responseData.code = '0031';
                        responseData.message = '创建用户文件夹失败';
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
                    responseData.code = '0032';
                    responseData.message = '图片上传失败';
                    res.json(responseData);
                    throw err;
                }
            })
            responseData.code = '0033';
            responseData.message = '图片' + count + '上传成功';
            responseData.data = item_no;
            console.log(responseData);
            res.json(responseData);
        });
    });


    return router;
}