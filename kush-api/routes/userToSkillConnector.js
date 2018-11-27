const request = require('request-promise');
const urlKUSH = 'http://localhost:9090/usertoskillconnector';

async function fetch(){
    const options = {
      har: {
        url: urlKUSH,
        method: 'GET',
        headers: [
          {
            name: '',
            value: ''
          }
        ]
      }
    }

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