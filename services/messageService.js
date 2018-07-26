const MessageRepository = require('../repositories/MessageRepository');

module.exports = {
    getMessages: (cb) => {
        MessageRepository.find((err, data) => {
            cb(err, data);
        });
    },
    createMessage: (msg, cb) => {
        MessageRepository.createMessage(msg, (err, data) => {
            cb(err, data);
        });
    }
}