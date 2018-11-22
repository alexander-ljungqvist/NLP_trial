const { NerManager } = require('node-nlp');
const manager = new NerManager({ threshold: 0.8 });

const request = require('request-promise');
const url = 'https://stardust-staging.softhouselabs.com/api/commission/296';

manager.addNamedEntityText('skill','NodeJS',['en'],['nodejs', 'node']);
manager.addNamedEntityText('skill','Java',['en'],['java']);
manager.addNamedEntityText('skill','Javascript',['en'],['javascript']);
manager.addNamedEntityText('skill','GUI',['en'],['gui', 'interface']);
manager.addNamedEntityText('skillGroup','Webb',['en'],['webb']);
manager.addNamedEntityText('skillGroup','Database',['en'],['database']);

async function fetchStardustData(){
  const options = {
      'method': 'GET',
      'url': url,
      'auth': {
        'user': 'exjobbare@stardust.se',
        'pass': 'ExjobbareStardust2018',
      }
  }
  await request(options)
      .then(response => {
          const description = JSON.stringify(JSON.parse(response).briefingDocument);
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

fetchStardustData();