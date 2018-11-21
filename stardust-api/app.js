const { NerManager } = require('node-nlp');

const manager = new NerManager({ threshold: 0.8 });
var rp = require('request-promise');


let url = 'https://stardust-staging.softhouselabs.com/api/commission/296';

rp(url,{ 'auth': {
    'user': 'exjobbare@stardust.se',
    'pass': 'ExjobbareStardust2018',
    'sendImmediately': false
  }})
    .then(function (response) {
        console.log(response);
    })
    .catch(function (err) {
        // Crawling failed...
    });

manager.addNamedEntityText('skill','NodeJS',['en'],['nodejs', 'node']);
manager.addNamedEntityText('skill','Java',['en'],['java']);
manager.addNamedEntityText('skill','Javascript',['en'],['javascript']);
manager.addNamedEntityText('skillGroup','Webb',['en'],['webb']);
manager.findEntities(
  'This project needs someone who can nodejs for webb, and NodeJS is very important. Thats why I like node. YEAH NODE. And it also needs java and javaScript',
  'en',
).then(entities => {
  const skillList = entities.reduce((skills, entity) => {
    skills[entity.option] = entity.entity;
    return skills;
  }, {});
  console.log(skillList);
})
