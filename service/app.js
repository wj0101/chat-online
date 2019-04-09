const express =require('express')
const path = require('path')
const bodyParser = require('body-parser')
const router = require('./routes/router')
const app =express()
const Message = require('./models/messge')
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use('/node_modules/', express.static(path.join(__dirname, './node_modules/')))
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())


app.use(router)

//保存聊天记录
function saveMessage(openid,data){
    Message.find({openid: openid}, (err,ret) => {
        if(err) return console.log(err)
        let obj =  {
            openid: openid,
            avatar: data.avatar,
            nickname: data.nickname,    //昵称
            formType: data.type,         //聊天数据类型
            content: data.content,      //聊天数据内容
            previewImg: data.images     //发送的图片
        }

        if (ret.length > 0){
            Message.findOneAndUpdate({openid: data.openid},{
                $push:{
                    comments:obj
                }
            },{
                'upsert': true
            },function (err) {
                console.log('!!err',err);
            })
        } else {
            new Message({
                openid: openid,
                otherOpenid:data.otherOpenid,
                comments:[obj]
            }).save()
        }
    })
}

var usocket = {},user = [];

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('init',(data)=>{
        if(!(data.openid in usocket)) {
            socket.openid = data.openid;
            usocket[data.openid] = socket;
            user.push(data.nickName);
            socket.emit('login',user);
            socket.broadcast.emit('user joined',data.nickName);
        }
    })

    socket.on('message',(msg)=>{
        if (msg){
            if(msg.openid in usocket) {
                console.log('msg',msg);
                usocket[msg.openid].emit('newmessage', msg);
                saveMessage(msg.openid,msg)
            }
        }
    })

    socket.on("getChatList",(data) =>{    //获取openid并从数据库拉取聊天记录
        Message.find({openid: data.openid},(err,docs) =>{
            if(err){
                console.log(err);
            }else{
                let total = docs[0].comments.length
                let pageNo =Math.ceil( total / data.pageSize)
                let startSize = total - (data.nowPage * data.pageSize)
                let startIndex = startSize > 0 ? startSize : 0
                Message.find({openid: data.openid},{"comments":{$slice:[startIndex,data.pageSize]}})
                    .exec((err,docs) => {
                        socket.emit("getChatListDone",docs);
                        console.log(data.nickName+"  正在调取聊天记录");
                    })
            }
        });
    });

    /*socket.on('disconnect', ()=>{
        //移除
        if(socket.openid in usocket){
            delete(usocket[socket.openid]);
            user.splice(user.indexOf(socket.username), 1);
        }
        console.log(user);
        socket.broadcast.emit('user left',socket.username)
    })*/
});


//404中间件
app.use(function (req,res) {
    res.send('404')
})

//全局错误中间件
app.use(function (err,req,res,next) {
    res.status(500).json({
        code:500,
        msg:err.message
    })
})

server.listen(3000,function () {
    console.log('listening on *:3000');
});

