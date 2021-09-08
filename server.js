const express = require('express')
const app = express()
const cors = require('cors')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./user')

//將 express 放進 http 中開啟 Server 的 3000 port ，正確開啟後會在 console 中印出訊息
const server = require('http').Server(app)
    .listen(5000, () => { console.log('open server!') })

//將啟動的 Server 送給 socket.io 處理
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
})

const router = require('./router');
app.use(router);
app.use(cors());

/*上方為此寫法的簡寫：
  const socket = require('socket.io')
  const io = socket(server)
*/

//監聽 Server 連線後的所有事件，並捕捉事件 socket 執行
io.on('connection', socket => {
    //經過連線後在 console 中印出訊息
    console.log('success connect!')
    //監聽透過 connection 傳進來的事件
    socket.on('join', async ({ name, room }, callback) => {
        try {
            const { error, user } = await addUser({ id: socket.id, name, room });
            console.log(user)
            if (error) {
                return callback(error)
            }

            if (user) {
                socket.join(user.room)
                socket.emit('WelcomeMessage', { user: 'admin', text: user.name + ' ,welcome to ' + user.room })
                socket.broadcast.to(user.room).emit('Notify', { user: 'admin', text: user.name + ' has joined!!' })
                io.to(user.room).emit('RoomData', { room: user.room, users: getUsersInRoom(user.room) })
                // io.to(user.room).emit("a new user has joined the room");
                callback()
            }

        } catch (e) { console.log(e) }

        //回傳 message 給發送訊息的 Client
        console.log(name, room)
        // socket.emit('join', message)
    })


    socket.on('sendMessage', async (message, callback) => {
        try {
            const user = await getUser(socket.id);
            console.log(user)
            io.to(user.room).emit('message', { user: user.name, message });
            callback();
        } catch (e) { console.log(e) }
    })
    // /*回傳給所有連結著的 client*/
    // socket.on('getMessageAll', message => {
    //     io.sockets.emit('getMessageAll', message)
    // })

    // /*回傳給除了發送者外所有連結著的 client*/
    // socket.on('getMessageLess', message => {
    //     socket.broadcast.emit('getMessageLess', message)
    // })



    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('Notify', { user: 'admin', text: user.name + ' has left!!' })
        }

    })
})