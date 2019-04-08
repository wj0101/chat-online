var mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true});

var Schema=mongoose.Schema

var messageSchema = new Schema({
    otherOpenid:String,
    openid:String,
    comments:[{
        openid:String,
        avatar:String,
        nickname: String,    //昵称
        formType:String,         //聊天数据类型
        content:String,      //聊天数据内容
        created_time: {      //发送聊天信息的时间戳
            type: Date,
            default: Date.now
        },
        previewImg:Array     //发送的图片
    }]
})

module.exports = mongoose.model('Message', messageSchema)