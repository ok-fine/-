const pathLib = require('path'); //解析文件路径
const fs = require('fs');
const mysql = require('mysql');
const db = require('../model/query');
const async = require('async');
const AipFaceCLient = require('baidu-aip-sdk').face;

var APP_ID = '17478132';
var API_KEY = 'mGsQxjZ2luPYGLMdgFQFyNcY';
var SECRET_KEY = '7YyB64Evh8ZbOtcY67EkCiHn3WG9PyA5';

var client = new AipFaceCLient(APP_ID, API_KEY, SECRET_KEY);

//返回的数据结果
var responseData = {
    code: '',
    message: ''
}

module.exports={

    check_face: function(res, is_exit, card_href, face_href, student_no, student_name, user_name, session_no, portrait_href){

        client.faceverify([{
            image: new Buffer(fs.readFileSync(face_href)).toString('base64'),
            image_type: 'BASE64'
        }]).then(function (result) {
            console.log('<faceverify>: ' + JSON.stringify(result));

            //活体检测
            if(result.result.face_liveness > 0.8){
                client.match([{
                    image: new Buffer(fs.readFileSync(face_href)).toString('base64'),
                    image_type: 'BASE64',
                },{
                    image: new Buffer(fs.readFileSync(card_href)).toString('base64'),
                    image_type: 'BASE64'
                }]).then(async function (result) {
                    console.log('<match>: ' + JSON.stringify(result));

                    //人脸匹配
                    if(result.result.score > 75){
                        //验证成功,删除照片
                        fs.unlinkSync(face_href);
                        
                        //is_exi:0-不存在，1-已存在
                        if(is_exit == 1){
                            responseData.code = '0074';
                            responseData.message = '用户人脸匹配成功';
                            console.log(responseData);
                            var sql1 = 'SELECT session_key,openid FROM temp_session WHERE session_no=?';
                            values1 = [session_no];
                            data = await db.query(sql1, values1);
                            console.log('查找session_key和openid成功');
                            console.log(data[0]);

                            var session_key = data[0].session_key;
                            var openid = data[0].openid;
                            var sql2 = 'UPDATE student_user SET session_key=?,openid=? WHERE student_no=?';
                            values2 = [session_key, openid, student_no];
                            responseData.data = await db.query(sql2, values2);

                            var sql3 = 'DELETE FROM temp_session WHERE session_no=?';
                            values3 = [session_no];
                            responseData.data = await db.query(sql3, values3);
                            responseData.code = '0011';
                            responseData.message = '删除session_key和openid成功';

                            res.json(responseData);
                            return responseData;
                        }else{
                            var sql1 = 'SELECT session_key,openid FROM temp_session WHERE session_no=?';
                            values1 = [session_no];
                            data = await db.query(sql1, values1);

                            var session_key = data[0].session_key;
                            var openid = data[0].openid;
                            var sql2 = 'INSERT INTO student_user(student_no, student_name, card_href, session_key, openid) VALUES(?,?,?,?,?)';
                            values2 = [student_no,student_name,card_href,session_key,openid];
                            responseData.data = await db.query(sql2, values2);
                            console.log('student_user');
                            console.log(responseData.data);

                            var sql4 = 'INSERT INTO user_info(student_no, user_name, portrait_href) VALUES(?,?,?)';
                            values4 = [student_no, user_name, portrait_href];
                            responseData.data = await db.query(sql4, values4);
                            console.log('user_info');
                            console.log(responseData.data);
                            console.log(portrait_href);

                            var sql3 = 'DELETE FROM temp_session WHERE session_no=?';
                            values3 = [session_no];
                            responseData.data = await db.query(sql3, values3);
                            responseData.code = '0011';
                            responseData.message = '删除session_key和openid成功';
                            // console.log(responseData.data);

                            console.log(responseData);
                            res.json(responseData);
                            return responseData;
                        }
                    }else{
                        responseData.code = '0010';
                        responseData.message = '用户人脸匹配失败，请重新验证';

                        console.log(responseData);
                        res.json(responseData);
                        return responseData;
                    }
                });
            }else{
                responseData.code = '0009';
                responseData.message = '请用户活体检测失败,请到光线充足地拍摄';

                console.log(responseData);
                res.json(responseData);
                return responseData;
            }
        });
    }

};


