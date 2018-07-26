const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    name: String,
    senderNickname: String,
    body: String,
    time: Number
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;