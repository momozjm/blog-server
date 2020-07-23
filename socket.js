
var app = require('express')();
var http = require('http').createServer(app);
//创建Server

var io = require('socket.io')(http);
//创建socket服务

io.on('connection', (socket) => {
    //io.on  connection   前端连接后自动触发     
    //on接收，emit发送
    console.log('a user connected');
    socket.on('hello', (message) => {
        //前端发送emit("hello",message)则进入此事件
        console.log(message, 111111111);
        socket.join(message.roomName)
        //join是进入房间，消息只发送在message.rommName房间内
        io.to(message.roomName).emit("chaTmessage", { img: "你在这" });
        //发送消息给这个房间，发送到前端监听的chaTmessage事件
    })
});

http.listen(2000, () => {
    //配置socket端口，2000
    console.log('listening on *:2000');
});