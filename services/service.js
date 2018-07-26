const userService = require('./userService');
const messageService = require('./messageService');

module.exports = {
    handleChatData: (cb) => {
        messageService.getMessages((err, messages) => {
            if(!err) {
                userService.getUsers((err, users) => {
                    cb(err, { messages, users });
                });
            }
            else
                cb(err);
        });
    }
};