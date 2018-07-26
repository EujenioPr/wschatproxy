const UserRepository = require('../repositories/UserRepository');

module.exports = {
    getUser: (user, cb) => {
        UserRepository.findOne({ nickname: user.nickname }, (err, data) => {
            cb(err, data);
        });
    },
    createUser: (user, cb) => {
        UserRepository.createUser(user, (err, data) => {
            cb(err, data);
        });
    },
    getUsers: (cb) => {
        UserRepository.find((err, data) => {
            cb(err, data);
        });
    },
    updateUser: (user, cb) => {
        UserRepository.updateUser(user, (err, data) => {
            cb(err, data);
        });
    }
}