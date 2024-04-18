const axios = require('axios');

function IDontWannaSleepPapa(){
    setInterval(() =>{
        axios.get('https://replace-img.onrender.com/genera-qr/nevergonnagiveyouup')
    }, 1000 * 180)
}

module.exports = {IDontWannaSleepPapa};