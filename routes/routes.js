const userService = require('../services/userService');
const messageService = require('../services/messageService');

module.exports = (app) => {
    app.post('/api/session', (req, res, next) => {
        if(req.session && req.session.user) {
            userService.getUser(req.session.user, (err, data) => {
                if(!err) {
                    messageService.getMessages((err, data) => {
                        if(!err) {
                            var dataObj = {
                                msgs: data
                            };
                            userService.getUsers((err, data) => {
                                dataObj.users = data;
                                res.json(dataObj);
                            });
                        } else
                            res.send(400, '1');
                    });
                } 
                else
                    res.send(400, '2');
            });
        }
        else
            next();
    });

    app.use((req, res, next) => {
        if(req.body.user && req.body.user.name && req.body.user.nickname) {
            userService.getUser(req.body.user, (err, data) => {
                if(!err && data) {
                    const user = data;
                    messageService.getMessages((err, data) => {
                        if(!err) {
                            var dataObj = {
                                msgs: data
                            };
                            userService.getUsers((err, data) => {
                                dataObj.users = data;
                                req.session.user = JSON.parse(JSON.stringify(user));
                                res.json(dataObj);
                            });
                        } else
                            res.send(400, '3');
                    });
                } 
                else {
                    userService.createUser(req.body.user, (err, data) => {
                        if(!err) {
                            const user = data;
                            messageService.getMessages((err, data) => {
                                if(!err) {
                                    var dataObj = {
                                        msgs: data
                                    };
                                    userService.getUsers((err, data) => {
                                        dataObj.users = data;
                                        req.session.user = JSON.parse(JSON.stringify(user));
                                        res.json(dataObj);
                                    });
                                } else
                                    res.send(400, '4');
                            })
                        }
                        else
                            res.send(400, '5');
                    });
                }
            })
        } 
        else
            next();
    });

    // CREATE MESSAGE & GET LATEST 100 IN RESPONSE

    app.post('/api/msg', (req, res, next) => {
        if(req.session && req.session.user) {
            const msg = {
                name: req.session.user.name,
                senderNickname: req.session.user.nickname,
                body: req.body.msg,
                time: Date.parse(new Date())
            };
            messageService.createMessage(msg, (err, data) => {
                if(!err) {
                    messageService.getMessages((err, data) => {
                        if(!err) {
                            var dataObj = {
                                msgs: data
                            };
                            userService.getUsers((err, data) => {
                                dataObj.users = data;
                                res.json(dataObj);
                            });
                        } else
                            res.send(400, '6');
                    });
                }
                else
                    res.send(400, '7')
            });
        }
        else
            next();
    });

    app.use((req, res, next) => {
        res.send(400, '400');
    });


    // GET ALL MESSAGES (LATEST 100)

    // app.post('/api/getmsg', (req, res, next) => {
    //     if(req.session && req.session.user) {
    //         messageService.getMessages((err, data) => {
    //             if(!err)
    //                 res.json(data);
    //             else
    //                 res.send(400, '9');
    //         });
    //     }
    //     else
    //         next();
    // });

    // app.use((req, res, next) => {
    //     res.send(400, '10');
    // });
}