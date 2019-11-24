const express = require('express');
const mysql = require('mysql');
const async = require('async');
const db = require('../../model/query');

var responseData;

module.exports = function(){
    var router = express.Router();
    // db.connect();

    router.use('/', function(req, res, next){

        responseData = {
            code: '',
            message: ''
        }

        next();
    });

    //http://localhost:8080/home/trade/index?key=&price=1&campus=全部校区&credit=2&start=5
    router.get('/', async function(req, res){
       // console.log('进入筛选'); 
        var pagenum = 8;
        var key = req.query.key;
        var price = req.query.price;
        var campus = req.query.campus;
        var credit = req.query.credit;
        var start = eval(req.query.start);
        var end = start + eval(pagenum);
        // var end = eval(start + pagenum);
        // console.log(end);

        var values = [];
        var sql = 'SELECT * FROM published_item WHERE title LIKE \'%' + key + '%\' ';

        if(campus != "全部校区"){
            sql += 'AND campus=?';
            values.push(campus);
        }

        console.log('price:' + price);
        console.log('credit:' + credit);

        if(price != '0' || credit != '0'){
            sql += 'ORDER BY ';
        }

        //price排序：0-无所谓，1-价格高/降序，2-价格低/升序
        if(price == '1'){
            sql += 'price DESC ';
        }else if(price == '2'){
            sql += 'price ';
        }

        if(price != '0' && credit != '0'){
            sql += ', ';
        }

        //信誉值排序：0-无所谓，1-价格高/降序，2-价格低/升序
        if(credit == '1'){
            sql += 'seller_credit DESC ';
        }else if(credit == '2'){
            sql += 'seller_credit ';
        }

        sql += 'LIMIT ?, ?';
        values.push(start, end);

        console.log(sql);
        console.log(values);
        responseData.data = await db.query(sql, values);

        if(responseData.data.length == 0){
            responseData.code = '0014';
            responseData.message = '暂无任何商品信息';
            res.json(responseData);
        }else{
            //加载商品图片
            for(var j = 0 ; j < responseData.data.length; j++){
                var img_count = responseData.data[j].img_count;
                var images =  new Array(img_count);

                for(var i = 1 ; i <= img_count ; i++){
                    images[i-1] = 'http://132.232.81.249:81/images/item/'+ responseData.data[j].seller_no + '/' + responseData.data[j].item_no + '_' + i + '.JPG';
                }
                responseData.data[j].images = {
                    swiperImg: images
                }
            }

            responseData.code = '0015';
            responseData.message = '加载商品信息成功';
            res.json(responseData);
        }
    });




    return router;
    
}

