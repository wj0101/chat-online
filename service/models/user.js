var mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true});

var Schema=mongoose.Schema

var userSchema = new Schema({
    avatar: {
        type: String,
        default: ''
    },
    nickname: {
        type: String,
        default: ''
    },
    gender: {
        type: Number,
        enum: [-1, 0, 1],
        default: -1
    },
    openid: {
        type: String,
        default: ''
    },
    session_key: {
        type: String,
        default: ''
    },
    status: {
        type: Number,
        // 0 没有权限限制
        // 1 不可以聊天
        // 2 不可以登录
        enum: [0, 1, 2],
        default: 0
    }
})

module.exports = mongoose.model('User', userSchema)