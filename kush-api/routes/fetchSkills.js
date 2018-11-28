const request = require('request-promise');
const urlKUSH = 'http://localhost:9090/skill';

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

    const skills = await request(options)
    .then(response => {
        return JSON.parse(response);
    })
    .catch(err => {
        console.log(err); // Crawling failed...
    });
    
    return skills;
}

async function fetching(){
    const skills = await fetch();
    console.log(skills);
}

fetching();

module.exports = {
    fetch
};