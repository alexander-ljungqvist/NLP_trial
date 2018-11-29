const request = require('request-promise');
const urlKUSH = 'http://localhost:9090/skill';
const connect = require('./connectKUSH');

async function fetch(){
    const options = connect.connectKUSH(urlKUSH);

    const skills = await request(options)
    .then(response => {
        return JSON.parse(response);
    })
    .catch(err => {
        console.log(err); // Crawling failed...
    });
    
    return skills;
}

module.exports = {
    fetch
};