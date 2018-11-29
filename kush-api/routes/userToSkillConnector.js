const request = require('request-promise');
const urlKUSH = 'http://localhost:9090/usertoskillconnector';
const connect = require('./connectKUSH');

async function fetch(){
    const options = connect.connectKUSH(urlKUSH);

    const userSkills = await request(options)
    .then(response => {
        const userToSkillConnector = JSON.parse(response);
        const userToSkill = userToSkillConnector.reduce((map, connector) => {
            map[connector.userId] = map[connector.userId] ? map[connector.userId] : [];
            map[connector.userId].push(connector);
            return map;
        }, {})
        return userToSkill;
    })
    .catch(err => {
        console.log(err); // Crawling failed...
    });
    
    return userSkills;
}

module.exports = {
    fetch
};