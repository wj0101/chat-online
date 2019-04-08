const express =require('express')
const wechat= require('../config/appid');
const router =express.Router()
const request = require('request');
const User = require('../models/user')
const WXBizDataCrypt = require('../config/WXBizDataCrypt')

//获取openid
router.post('/loginCodeOpenId', function(req,res, next){
    request.get(
        {
            url:`https://api.weixin.qq.com/sns/jscode2session?appid=${wechat.weixin.appID}&secret=${wechat.weixin.appsecret}&js_code=${req.body.code}&grant_type=authorization_code`,
        },(error, response, body) =>{
            if(response.statusCode == 200){
                var data=JSON.parse(body)
                User.find({openid: data.openid}, (err,ret) => {
                    if(err){
                        return res.status(500).json({
                            code:500,
                            msg:err.message
                        })
                    }
                    if (ret.length > 0){
                        User.updateOne({openid: data.openid},{session_key: data.session_key}, err => err)
                        res.status(200).json({
                            code:1,
                            openid:data.openid
                        })
                    } else {
                        new User(data).save()
                        res.status(200).json({
                            code:2,
                            openid:data.openid
                        })
                    }
                })
            }else{
                next(response.statusCode)
            }
        }
    );
});

//解密获取userInfo
router.post('/getWxuserInfo',function (req,res, next) {
    try {
        let obj = req.body
        User.updateOne({openid: obj.openid},{avatar:obj.userInfo.avatarUrl,gender:obj.userInfo.gender,nickname:obj.userInfo.nickName}, err => err)
        User.find({openid: obj.openid}, (err,ret) => {
            let encrypted= obj.encryptedData.replace(/ /g,'+')
            let pc = new WXBizDataCrypt(wechat.weixin.appID, ret[0].session_key)
            let data = pc.decryptData(encrypted, obj.iv)
            res.status(200).json({
                code:3,
                data:data
            })
        })
    }catch (e) {
        next(e)
    }

})

module.exports = router
