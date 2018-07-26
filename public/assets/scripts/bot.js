const socket = io('http://127.0.0.1:8080');

function handleByBot(message) {
    if(message.senderNickname === 'bot') {
        return;
    }
    if(!message.body.includes('@bot')) {
        return;
    }

    const messageObject = {
        name: 'Bot',
        senderNickname: 'bot',
        body: `Command accepted! ${proxy[message.body]}`
    }

    setTimeout(() => {
        socket.emit('sendMessage', messageObject);
    }, 1000);
}

socket.on('chatHistory', function(data) {

    if(data.error){
        return;
    }
    if(data.messages.length < 1) {
        return;
    }
    if(data.messages[0].senderNickname === 'bot') {
        return;
    }

    handleByBot(data.messages[0]);
});

String.prototype.capitalize = function(char = 0) {
    return this.charAt(char).toUpperCase() + this.slice(char + 1);
}

const randomNumberInRange = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
}

function messageRecognize(target, prop) {
    const msg = prop.toLowerCase();
    
    if (msg.includes('what is the weather')) {
        return handleWeather(target, msg);
    } else if (msg.includes('convert')) {
        return handleConvert(target, msg);
    } else if (msg.includes('save note')) {
        return saveNoteHandler(target, prop);
    } else if (msg.includes('show note')) {
        return showNoteHandler(target, prop);
    } else if (msg.includes(' #@)₴?$0')) {
        return handleAdvice(target, msg);
    } else if (msg.includes('show quote')) {
        return handleQuote(target, msg);
    } else {
        return handleBadMessage(target);
    }
}

const handleWeather = (target, msg) => {
    const cities = ['Lviv', 'Bangladesh', 'Mogadishu'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    let city = cities.filter((city) => {
        if(msg.includes(city.toLowerCase())) {
            return city;
        }
    })[0].toLowerCase();

    let day;
    if(msg.includes('today')) {
        day = 'today';
    } else {
        day = days.filter(day => {
            if(msg.includes(day.toLowerCase())) {
                return day;
            }
        })[0].toLowerCase();
    }

    if(city === undefined || day === undefined) {
        handleBadMessage(target);
        return;
    }

    return `The weather ${day === 'today' ? day : 'on ' + day.capitalize()} in ${city.capitalize()} is ${target.weather[city][day]}`;
}

const handleConvert = (target, msg) => {
    const currencies = ['dollar', 'euro', 'hryvnia'];
    const convertValue = msg.replace(/[^0-9]/g,'');
    let [ convertFrom, convertTo ] = currencies.filter((curr) => {
        if(msg.includes(curr)) {
            return curr;
        }
    });

    if(convertValue === undefined || convertFrom === undefined || convertTo === undefined) {
        handleBadMessage(target);
        return;
    }

    if(msg.indexOf(convertFrom) > msg.indexOf(convertTo)) {
        [ convertFrom, convertTo ] = [ convertTo, convertFrom ];
    }
    
    const rates = {
        dollar: 1,
        hryvnia: 26,
        euro: 0.88
    };

    let convertedValue = Math.round(convertValue * rates[convertTo] / rates[convertFrom]);
    const output = `Converted value is gonna be ${convertedValue} ${convertTo}s.`;
    return output;
}

const saveNoteHandler = (target, msg) => {
    const title = msg.split('"')[1];
    const body = msg.split('"')[3];

    if(title == undefined || body == undefined) {
        return target;
    }
    target.notes.push({ title, body });
    return true;
}

const showNoteHandler = (target, msg) => {
    let title = msg.split('"')[1];
    
    if(title === undefined) {
        return;
    }

    let note = target.notes.filter((note) => {
        if(note.title.toLowerCase() === title.toLowerCase()) {
            return note;
        }
    })[0];

    return `title: ${note.title}, body: ${note.body}`;
}

const handleAdvice = (target, msg) => {
    let max = target.advices.length - 1;
    let randomNum = randomNumberInRange(0, max);

    return target.advices[randomNum];
}

const handleQuote = (target, msg) => {
    let max = target.advices.length - 1;
    let randomNum = randomNumberInRange(0, max);

    return target.quotes[randomNum];
}

const handleBadMessage = (target) => {
    let max = target.errorMessages.length - 1;
    let randomNum = randomNumberInRange(0, max);

    return target.errorMessages[randomNum];
}

const target = {
    weather: {
        lviv: {
            today: '15C',
            monday: '16C',
            tuesday: '15.5C',
            wednesday: '18C',
            thursday: '20C',
            friday: '18.9C',
            saturday: '18C',
            sunday: '20C'
        },
        bangladesh: {
            today: '26C',
            monday: '21C',
            tuesday: '22.5C',
            wednesday: '18C',
            thursday: '21C',
            friday: '29.9C',
            saturday: '28C',
            sunday: '28C'
        },
        mogadishu: {
            today: '31C',
            monday: '32C',
            tuesday: '25.5C',
            wednesday: '28C',
            thursday: '28C',
            friday: '28.9C',
            saturday: '28C',
            sunday: '33C'
        }
    },
    notes: [],
    advices: [
        "Try to get rest.",
        "Try not to think ... at all.",
        "Think about zebras! Or maybe about giraffes!",
        "Don't swim in water inhabited by large aligators.",
        "Hanging yourself could be painful, so be ready for it.",
        "Eating too much wont help ya!"
    ],
    quotes: [
        `“Be yourself; everyone else is already taken.” ― Oscar Wilde`,
        `“I have not failed. I've just found 10,000 ways that won't work.” ― Thomas A. Edison`,
        `“I like nonsense, it wakes up the brain cells. Fantasy is a necessary ingredient in living.” ― Dr. Seuss`,
        `“If you can't explain it to a six year old, you don't understand it yourself.” ― Albert Einstein`,
        `“I'm not upset that you lied to me, I'm upset that from now on I can't believe you.” ― Friedrich Nietzsche`
    ],
    errorMessages: [
        `Ooooh, buddy. I don't understand whatcha sayin'!`,
        `Maybe, you should reformat your message. Make it more clear to understand.`,
        `Sorry, i don't know what to say.`
    ]
}

const handler = {
    get: (target, prop) => {
        return messageRecognize(target, prop);
    }
}

let proxy = new Proxy(target, handler);