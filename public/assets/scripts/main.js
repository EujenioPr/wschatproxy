class Chat {
    constructor() {
        this.wrapper = document.getElementById('mainWrapper');
        this.enterScreen = document.getElementById('enterScreen');
        this.pageLoader = document.getElementById('pageLoader');

        this.nameInput = document.getElementById('enterUserName');
        this.nicknameInput = document.getElementById('enterNickName');
        this.esButton = document.getElementById('enterScreenButton');

        this.userSide = document.getElementById('userSide');
        this.bodyChat = document.getElementById('messageWrapper');

        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendMessage');

        this.typingUsersPane = document.getElementById('typingUsers');

        this.goneUser = document.getElementById('goneUser');

        this.infoCrib = document.getElementById('infoCrib');
        this.infoCribText = document.getElementById('infoCribText');

        this.userObj = {
            name: null,
            nickname: null,
            enterChat: false,
            messages: [],
            users: [],
            typingUsers: []
        };

        // this.canScroll = true;

        this.socket = io('http://127.0.0.1:8080');

        this.eventInit();
        this.onPageLoad();

        this.webSocket();

        this.handleUserTyping();

        this.userDisconnected();
    }

    webSocket() {
        this.socket.on('chatHistory', data => {
            // console.log(data);
            if(!data.error) {
                this.userObj.messages = data.messages;
                this.userObj.users = data.users;
                this.userObj.enterChat = true;
                this.enterChat();
                this.insertMessages();
                this.insertUsers();
            } else {
                this.userObj.enterChat = false;
                this.exitChat();
                // console.log(data.errorMsg);
            }
        });
    }

    onPageLoad() {
        this.socket.on('connected', message => {
            console.log(message);
        });

        this.getCookies();
        this.pageLoader.className = 'page-loader shown';    // show loader

        const user = {
            name: this.userObj.name,
            nickname: this.userObj.nickname
        };

        this.socket.emit('userArrived', user);

        this.pageLoader.className = 'page-loader';          // hide loader
    }

    eventInit() {
        this.esButton.addEventListener('click', () => this.handleEsButton());
        this.sendButton.addEventListener('click', () => this.handleMessageSend());

        this.messageInput.addEventListener('keyup', () => {
            if(this.messageInput.value.length > 0) {
                this.socket.emit('userIsTyping', this.userObj.nickname);
            } else {
                this.socket.emit('userStopTyping', this.userObj.nickname);
            }
        });

        document.addEventListener('keydown', (event) => {
            const keyname = event.key;
            if(keyname == 'Enter') {
                this.handleMessageSend();
            }
        });

        // this.bodyChat.addEventListener('scroll', function(e) {
        //     console.log(this.canScroll);
        //     this.canScroll = false;
        // });
    }
    
    async handleEsButton() {
        if(!this.nameInput.value || !this.nicknameInput.value)
            return this.handleError('Please, fill your info to proceed.');

        if(this.nameInput.value.length > 12 || this.nicknameInput.value.length > 12)
            return this.handleError('Name and Nickname shouldn\'t be greated than 12 characters');

        else if(this.nameInput.value.length < 4 || this.nicknameInput.value.length < 4)
            return this.handleError('Name and Nickname must be at least 4 characters long.');

        const user = {
            name: this.nameInput.value,
            nickname: this.nicknameInput.value
        };

        this.userObj.name = user.name;
        this.userObj.nickname = user.nickname;

        this.socket.emit('userArrived', user);

        this.setCookies();
    }

    async handleMessageSend() {
        if(!this.messageInput.value.length)
            return this.handleError('Your message is too short.');

        const message = {
            name: this.userObj.name,
            senderNickname: this.userObj.nickname,
            body: this.messageInput.value
        };

        this.socket.emit('sendMessage', message);

        this.messageInput.value = null;
        this.socket.emit('userStopTyping', this.userObj.nickname);
    }

    handleUserTyping() {
        // this.userObj.typingUsers = [];
        this.socket.on('userIsTyping', (userNickname) => {
            if(userNickname == this.userObj.nickname || this.userObj.typingUsers.includes(userNickname))
                return;

            // console.log('userIsTyping: ', userNickname);
            this.userObj.typingUsers.push(userNickname);
            this.showUserTyping();
        });

        this.socket.on('userStopTyping', (userNickname) => {
            if(userNickname == this.userObj.nickname)
                return;

            // console.log('userStopTyping: ', userNickname);
            let ind = this.userObj.typingUsers.indexOf(userNickname);
            this.userObj.typingUsers.splice(ind, 1);
            this.showUserTyping();
        });

        // console.log('TYPING USERS:', this.userObj.typingUsers);

    }
    showUserTyping() {
        // console.log('ARE TYPING:', this.userObj.typingUsers);
        let users = this.userObj.typingUsers;
        users = users.map((user) => { return '@' + user; });

        users = users.join(', ');

        if(this.userObj.typingUsers.length < 1) {
            this.typingUsersPane.className = 'typing-users';
            return;
        }

        this.typingUsersPane.className = 'typing-users shown';

        if(this.userObj.typingUsers.length > 1) {
            this.typingUsersPane.innerHTML = `
                <strong>${users} are typing...</strong>
            `;
        } else {
            this.typingUsersPane.innerHTML = `
            <strong>${users} is typing...</strong>
        `;
        }
    }

    userDisconnected() {
        this.socket.on('userDisconnect', userNickname => {
            this.goneUser.className = 'gone-user shown';
            this.goneUser.innerHTML = `
                @${userNickname} has been disconnected.
            `;
            setTimeout(() => {
                this.goneUser.className = 'gone-user';
                this.goneUser.innerHTML = '';
            }, 2000);
        });
    }

    enterChat() {
        if(this.userObj.enterChat === false)
            return console.log('error: { oserObj.enterChat: false }');
        
        this.wrapper.className = 'wrapper';
        this.enterScreen.className = 'user-enterscreen-wrapper non-displayed';
    }

    exitChat() {
        if(this.userObj.enterChat === true)
            return console.log('error: { userObj.enterChat: true }');
        
        this.wrapper.className = 'wrapper blured';
        this.enterScreen.className = 'user-enterscreen-wrapper';
    }

    insertMessages() {
        if(!this.userObj.messages || this.userObj.messages.length < 1) {

            this.bodyChat.innerHTML = '<div class="chat-empty">Empty right now :C</div>';

            return console.log('No messages to return!');
        }

        this.bodyChat.innerHTML = '';
        const len = this.userObj.messages.length;
        
        for(let i = 0; i < len; i++) {

            const msgTime = this.userObj.messages[i].time;
            // const parsedTime = new Date(msgTime).getHours() + ':' + new Date(msgTime).getMinutes();
            const parsedTime = new Date(msgTime).toLocaleTimeString();

            let el = document.createElement('li');
            el.className = 'message';
            el.innerHTML = 
                `
                <strong><h2>${this.userObj.messages[i].name}</h2><h3>@${this.userObj.messages[i].senderNickname}</h3></strong>
                <span>${parsedTime}</span>
                <p>${this.userObj.messages[i].body}</p>
            `;

            if(this.userObj.messages[i].senderNickname == this.userObj.nickname)
                el.className = 'message mine-msg';

            if(this.userObj.messages[i].body.includes(this.userObj.nickname))
                el.lastElementChild.innerHTML = this.userObj.messages[i].body.replace('@' + this.userObj.nickname, '<span class="highlight-adver">@'+ this.userObj.nickname +'</span>');
            
            this.bodyChat.insertBefore(el, this.bodyChat.children[0]);


            if(i == (len - 1)) {
                el.style.marginTop = (this.bodyChat.scrollHeight - this.bodyChat.children[len - 1].offsetTop - this.bodyChat.children[len - 1].clientHeight) + 'px';
                // el.style.marginTop = this.bodyChat.children[len - 1].offsetTop + 'px';
                // console.log(this.bodyChat.scrollHeight - this.bodyChat.children[len - 1].offsetTop);
                el.style.border = 'none';
            } else {
                continue;
            }

            this.bodyChat.scrollTop = this.bodyChat.scrollHeight;

            // this.insertUsers();
        }
    }

    insertUsers() {
        if(!this.userObj.users || this.userObj.users.length < 1)
            return console.log('no users in userObj');

        this.userSide.innerHTML = '';

        let allUsers = this.userObj.users.sort((a, b) => {
            return (b.status * 1) > (a.status * 1);
        });

        for(let user of allUsers) {
            let el = document.createElement('li');
            el.className = 'user-aside';

            // let olTime = Date.parse(new Date()) - user.lastSeen;
            let olTime;
            el.innerHTML = `
					<strong>${user.name} <b>(@${user.nickname})</b></strong>
                    <span class="user-status status-online"></span>
            `;

            this.userSide.insertBefore(el, null);

            if(user.status === '1') {
                olTime = Date.parse(new Date()) - user.lastSeen;
                let newStatus = 'Online';
                el.lastElementChild.className = 'user-status status-appeared';
                el.lastElementChild.innerHTML = `<i class="status-circle status-appeared"></i>Just appeared`;
                setTimeout(() => {
                    el.lastElementChild.className = 'user-status status-online';
                    el.lastElementChild.innerHTML = `<i class="status-circle status-online"></i>${newStatus}`;
                }, 60000 - olTime);
            } else if(user.status === '0'){
                olTime = Date.parse(new Date()) - user.lastSeen;
                let newStatus = 'Offline';
                el.lastElementChild.className = 'user-status status-left';
                el.lastElementChild.innerHTML = `<i class="status-circle status-left"></i>Just left`;
                setTimeout(() => {
                    el.lastElementChild.className = 'user-status status-offline';
                    el.lastElementChild.innerHTML = `<i class="status-circle status-offline"></i>${newStatus}`;
                }, 60000 - olTime);
            }

        }
    }

    setCookies() {
        this.deleteAllCookies();
        // console.log(this.userObj);
        document.cookie = `nickname=${this.userObj.nickname}`;
        document.cookie = `username=${this.userObj.name}`;
    }
    
    getCookies() {
        var cookies = document.cookie.split(";");
        var nicknamespace = [];
        var usernamespace = [];
        for(let cook of cookies) {
            if(cook.includes('nickname')) {
                nicknamespace.push(cook);
            } else if (cook.includes('username')){
                usernamespace.push(cook);
            }
        }
        nicknamespace = nicknamespace.join("").split("=");
        usernamespace = usernamespace.join("").split("=");
        let nickname = nicknamespace[1];
        let username = usernamespace[1];
        this.userObj.nickname = nickname;
        this.userObj.name = username;

        // console.log(this.userObj.name, this.userObj.nickname);
    }

    deleteAllCookies() {
        var cookies = document.cookie.split(";");
    
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }
    
    handleError(error) {
        this.infoCrib.style.top = '50px';
        this.infoCribText.innerText = error;
        setTimeout(() => {
            this.infoCrib.style.top = '-200px';
            this.infoCribText.innerText = '';
        }, 3000);
    }
}

var chat = new Chat();