const { NerManager } = require('node-nlp');
const manager = new NerManager({ threshold: 0.8 });

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
  description.map(skillgroup => manager.addNamedEntityText('skillGroup', skillgroup.name,['en'],[skillgroup.name]));
}

function setSkillEntities(description){
  description.map(skillgroup => {
    skillgroup.skills.map(skill => manager.addNamedEntityText('skill', skill,['en'],[skill]));
  });
}

/*manager.addNamedEntityText('skillGroup','Database',['en'],['database']);
manager.addNamedEntityText('skill','NodeJS',['en'],['nodejs', 'node']);
manager.addNamedEntityText('skill','Java',['en'],['java']);
manager.addNamedEntityText('skill','Javascript',['en'],['javascript']);
manager.addNamedEntityText('skill','GUI',['en'],['gui', 'interface']);
manager.addNamedEntityText('skillGroup','Architecture',['en'],['architecture']);
manager.addNamedEntityText('skillGroup','Persistence',['en'],['persistence']);
manager.addNamedEntityText('skillGroup','Big Data',['en'],['big data']);
manager.addNamedEntityText('skillGroup','Cloud',['en'],['cloud']);
manager.addNamedEntityText('skillGroup','Web',['en'],['webb']);
manager.addNamedEntityText('skillGroup','IOT',['en'],['iot', 'IoT']);
manager.addNamedEntityText('skillGroup','Lean and Agile',['en'],['lean and agile']);
manager.addNamedEntityText('skillGroup','Design',['en'],['design']);
manager.addNamedEntityText('skillGroup','Tools',['en'],['tools']);
manager.addNamedEntityText('skillGroup','Security',['en'],['security']);
manager.addNamedEntityText('skillGroup','Web',['en'],['webb']);*/


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
  manager.findEntities(
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