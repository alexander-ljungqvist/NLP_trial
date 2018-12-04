const request = require('request-promise');
const urlKUSH = 'http://localhost:9090/user';
const connect = require('./connectKUSH');

async function fetch(){
    const options = connect.connectKUSH(urlKUSH);

    const skillGroups = await request(options)
    .then(response => {
        return JSON.parse(response);
    })
    .catch(err => {
        console.log(err); // Crawling failed...
    });
    
    return skillGroups;
}

module.exports = {
    fetch
};