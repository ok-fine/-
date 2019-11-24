const pathLib = require('path'); //解析文件路径
const fs = require('fs');
const mysql = require('mysql');
const AipFaceCLient = require('baidu-aip-sdk').face;

var db = mysql.createPool({
    host: '132.232.81.249',
    user: 'wjy',
    password: 'wjy666',
    database: 'hutao'
});

//连接百度SDK -- 人脸识别 - zzy
var APP_ID = '17478132';
var API_KEY = 'mGsQxjZ2luPYGLMdgFQFyNcY';
var SECRET_KEY = '7YyB64Evh8ZbOtcY67EkCiHn3WG9PyA5';

var client = new AipFaceCLient(APP_ID, API_KEY, SECRET_KEY);

//返回的数据结果
var responseData = {
    code: 0,
    message: '',
}

module.exports={

    check_face: function(res, is_exit, card_href, face_href, portraut_href, student_no, student_name, user_name){

        client.faceverify([{
            image: new Buffer(fs.readFileSync(face_href)).toString('base64'),
            image_type: 'BASE64'
        }]).then(function (result) {
            console.log('<faceverify>: ' + JSON.stringify(result));
            if(result.result.face_liveness > 0.8){
                client.match([{
                    image: new Buffer(fs.readFileSync(face_href)).toString('base64'),
                    image_type: 'BASE64',
                },{
                    image: new Buffer(fs.readFileSync(card_href)).toString('base64'),
                    image_type: 'BASE64'
                }]).then(function (result) {
                    console.log('<match>: ' + JSON.stringify(result));
                    if(result.result.score > 75){
                        //验证成功,删除照片
                        fs.unlinkSync(face_href);
                        
                        //is_exi:0-不存在，1-已存在
                        if(is_exit == 1){
                            responseData.num = 0;
                            responseData.message = '人脸验证成功';
                            console.log(responseData);
                            res.json(responseData);
                            return responseData;
                        }else{
                            db.query(`INSERT INTO student_user(student_no, student_name, card_href) VALUES('${student_no}', '${student_name}', '${card_href}')`, function(err, data){
                                if(err){
                                    console.log(err);
                                    responseData.code = 1;
                                    responseData.message = '数据库错误(插入student_user)';

                                    console.log(responseData);
                                    res.json(responseData);
                                    return responseData;
                                }else{
                                    db.query(`INSERT INTO user_info(student_no, user_name, portraut_href) VALUES('${student_no}', '${user_name}', '${portraut_href}')`, function(err, data){
                                        if(err){
                                            console.log(err);
                                            responseData.code = 1;
                                            responseData.message = '数据库错误（插入user_info）';
                                        }else{
                                            responseData.num = 0;
                                            responseData.message = '插入数据成功';
                                            responseData.data = data;
                                        }

                                        console.log(responseData);
                                        res.json(responseData);
                                        return responseData;
                                    });
                                }
                            });
                        }
                    }else{
                        responseData.code = 4;
                        responseData.message = '验证不成功，请重新验证';

                        console.log(responseData);
                        res.json(responseData);
                        return responseData;
                    }
                });
            }else{
                responseData.code = 3;
                responseData.message = '请到光线充足地拍摄';

                console.log(responseData);
                res.json(responseData);
                return responseData;
            }
        });
    }

};


