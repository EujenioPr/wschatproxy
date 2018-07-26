const connection = require('../db/dbconnect');
const Repository = require('./Repository');
const User = require('../models/user');

class UserRepository extends Repository {
    constructor() {
        super();
        this.model = User;
    }
    find(cb) {
        User.find().limit(100).exec((err, data) => {
            cb(err, data);
        });
    }
    createUser(user, cb) {
        User.create({
            name: user.name,
            nickname: user.nickname,
            lastSeen: user.lastSeen,
            status: user.status
        }, (err, data) => {
            if(!err)
                console.log('User created!');
                
            cb(err, data);
        });
    }

    updateUser(user, cb) {
        User.updateOne({ nickname: user.nickname }, { $set: { lastSeen: user.lastSeen, status: user.status } }, (err, data) => {
            cb(err, data);
        });
    }
}

module.exports = new UserRepository();