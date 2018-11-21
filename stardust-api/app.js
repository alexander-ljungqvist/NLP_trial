const { NerManager } = require('node-nlp');

const manager = new NerManager({ threshold: 0.8 });
var request = require('request');

let url = 'https://stardust-staging.softhouselabs.com/api/commission/296';

  request(url, { 'auth': {
      'user': 'exjobbare@stardust.se',
      'pass': 'ExjobbareStardust2018',
      'sendImmediately': false
    }}, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body)
  }
})

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
