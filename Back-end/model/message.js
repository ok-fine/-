const pathLib = require('path'); //解析文件路径
const fs = require('fs');
const AipOcrClient = require("baidu-aip-sdk").ocr;

module.exports={

    //加载留言，返回数组行留言对象
    load: function (data){
        var messages = [];
        var temp = [];

        for(let i = 0; i < data.length; i++){
            var parent_node = data[i].parent_no;

            if(data[i].pushed == undefined){
                if(parent_node != null){
                    temp.push(data[i]);                                             //push第一个子节点
                    data[i].pushed = 1;

                    for(let j = i + 1; j < data.length; j++){
                        if(data[j].mes_no == parent_node){
                            temp[temp.length - 1].reply_name = data[j].user_name;   //json对象增加回复对象名
                            if(data[j].parent_no != null){
                                parent_node = data[j].parent_no;
                                temp.push(data[j]);
                                data[j].pushed = 1;
                            }else{
                                data[j].child = temp;                               //将根节点对象增加child,child根据发布时间排序
                                temp = [];
                                break;
                            }
                        }
                    }
                }else{
                    messages.push(data[i]);                                         //将根节点push入结果
                }
            }
        }

        return messages;
    }

}