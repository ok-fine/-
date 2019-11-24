const db = require('./query');
const async = require('async');

module.exports={

    //加载留言，返回数组行留言对象
    load: async function (item_no){
        var message = {
            data: {}
        };
        var result;
        var values = [];

        var sql = 'SELECT * FROM message WHERE parent_no is null AND item_no=?';      //获取主留言
        values = [item_no];
        result = await db.query(sql, values);
        message.data = result;

        sql = 'SELECT * FROM message WHERE parent_no=? AND item_no=?';                //获取子留言
        for(let i = 0; i < message.data.length; i++){
            values = [message.data[i].mes_no, item_no];
            result = await db.query(sql, values);
            message.data[i].child = result;                                             //添加子留言
        }

        return message;
    }

}