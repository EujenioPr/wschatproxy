const userService = require('../services/userService');
const messageService = require('../services/messageService');
const service = require('../services/service');

module.exports = (io) => {
    io.on('connection', (socket) => {

        var userNickname_;

        socket.join('chatroom');

        io.to('chatroom').emit('connected', 'Your\'re successfully connected!');

        socket.on('userArrived', (user) => {
            console.log('userArrived');
            if(user && user.name && user.nickname) {
                userService.getUser(user, (err, data) => {
                    if(!err && data) {

                        socket.userNickname = user.nickname;
                        console.log('SOCKET NICKNAME', socket.userNickname);

                        userNickname_ = user.nickname;

                        userService.updateUser({ nickname: userNickname_, lastSeen: Date.parse(new Date()), status: '1' }, (err, data) => {
                            if(!err)
                                service.handleChatData((err, data) => {
                                    if(!err)
                                        io.to('chatroom').emit('chatHistory', { error: false, messages: data.messages, users: data.users });
                                    else
                                        console.log('ERROR OCCURED: on userArrived.');
                                });
                            else
                                console.log('ERROR OCURED: on updating user.');
                        })
                    }
                    else {
                        const user_ = {
                            name: user.name,
                            nickname: user.nickname,
                            lastSeen: Date.parse(new Date()),
                            status: '1'
                        };

                        userNickname_ = user.nickname;

                        userService.createUser(user_, (err, data) => {
                           if(!err) {
                                service.handleChatData((err, data) => {
                                    if(!err)
                                        io.to('chatroom').emit('chatHistory', { error: false, messages: data.messages, users: data.users })
                                    else
                                        socket.emit('chatHistory', { error: true, errorMsg: err });
                                });
                            }
                            else
                                socket.emit('chatHistory', { error: true, errorMsg: err });
                        });
                    }
                });
            }
            else
                socket.emit('chatHistory', { error: true, errorMsg: 'No user info provided!' });
        });

        socket.on('sendMessage', (messageObj) => {  // { name: '', senderNickname: '', body: '' }
            if(messageObj && messageObj.name && messageObj.senderNickname && messageObj.body && messageObj.body.length > 0) {
                const msg = {
                    name: messageObj.name,
                    senderNickname: messageObj.senderNickname,
                    body: messageObj.body,
                    time: Date.parse(new Date())
                }
                messageService.createMessage(msg, (err, data) => {
                    if(!err) {
                        service.handleChatData((err, data) => {
                            if(!err)
                                io.to('chatroom').emit('chatHistory', { error: false, messages: data.messages, users: data.users });
                            else
                                socket.emit('chatHistory', { error: true, errorMsg: 'handleChatData error.' });
                        });
                    }
                    else
                        socket.emit('chatHistory', { error: true, errorMsg: 'Couldn\'t create message.' });
                });

            }
        });

        socket.on('userIsTyping', (userNickname) => {
            console.log('ATTENTION SKA: ', userNickname);
            io.to('chatroom').emit('userIsTyping', userNickname);
        });

        socket.on('userStopTyping', (userNickname) => {
            console.log('ATTENTION SKA: ', userNickname);
            io.to('chatroom').emit('userStopTyping', userNickname);
        });

        socket.on('disconnect', function() {
            console.log('SOCKET NICKNAME ON DISCONNECT:', userNickname_);
            console.log(userNickname_, 'has left the room');

            io.to('chatroom').emit('userStopTyping', userNickname_);

            io.to('chatroom').emit('userDisconnect', userNickname_);

            userService.updateUser({ nickname: userNickname_, lastSeen: Date.parse(new Date()), status: '0' }, (err, data) => {
                if(!err)
                    service.handleChatData((err, data) => {
                        if(!err)
                            io.to('chatroom').emit('chatHistory', { error: false, messages: data.messages, users: data.users });
                        else
                            console.log('ERROR OCCURED: on disconnect.');
                    });
                else
                    console.log('ERROR OCURED: on updating user.');
            })
        });
    });
};