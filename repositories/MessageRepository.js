const connection = require('../db/dbconnect');
const Repository = require('./Repository');
const Message = require('../models/message');

class MessageRepository extends Repository {
    constructor() {
        super();
        this.model = Message;
    }
    find(cb) {
        Message.find().sort({time: -1}).limit(100).exec((err, data) => {
            cb(err, data);
        });
    }
    createMessage(msg, cb) {
        Message.create(msg, (err, data) => {
            if(!err)
                console.log('Msg created!');
            cb(err, data);
        });
    }
}

module.exports = new MessageRepository();