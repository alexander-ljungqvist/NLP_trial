const { NerManager } = require('node-nlp');
const skillManager = new NerManager({ threshold: 0.8 });
const skillGroupManager = new NerManager({ threshold: 0.8 });

const request = require('request-promise');
const urlStardust = 'https://stardust-staging.softhouselabs.com/api/commission/296';
const urlKUSH = 'http://localhost:9090/skillGroup';


async function fetchKUSHData(){
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
  
  await request(options)
        .then(response => {
            const description = JSON.parse(response);
            setSkillGroupEntities(description);
            setSkillEntities(description);
        })
        .catch(err => {
            console.log(err); // Crawling failed...
        });  
}

function setSkillGroupEntities(description){
  description.map(skillgroup => skillGroupManager.addNamedEntityText('skillGroup', skillgroup.name,['en'],[skillgroup.name]));
}

function setSkillEntities(description){
  description.map(skillgroup => {
    skillgroup.skills.map(skill => skillManager.addNamedEntityText('skill', skill,['en'],[skill]));
  });
}

async function fetchStardustData(){
  const options = {
      'method': 'GET',
      'url': urlStardust,
      'auth': {
        'user': 'exjobbare@stardust.se',
        'pass': 'ExjobbareStardust2018',
      }
  }
  await request(options)
      .then(response => {
          const description = JSON.parse(response).briefingDocument;
          readDescription(description);
      })
      .catch(err => {
          console.log(err); // Crawling failed...
      });
}

function readDescription(description){
  skillManager.findEntities(
    description,
    'en',
  ).then(entities => {
    const skillList = entities.reduce((skills, entity) => {
      skills[entity.option] = entity.entity;
      return skills;
    }, {});
    console.log(skillList);
  })
  skillGroupManager.findEntities(
    description,
    'en',
  ).then(entities => {
    const skillList = entities.reduce((skills, entity) => {
      skills[entity.option] = entity.entity;
      return skills;
    }, {});
    console.log(skillList);
  })
}

fetchKUSHData();
fetchStardustData();