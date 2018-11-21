const { NerManager } = require('node-nlp');

const manager = new NerManager({ threshold: 0.8 });
const Bluebird = require('Bluebird');
const fetch = require('node-fetch');
global.Headers = fetch.Headers;
fetch.Promise = Bluebird;

let base64 = require('base-64');
let url = 'https://stardust-staging.softhouselabs.com/api/commission/296';
let username = 'XXXXXX';
let password = 'XXXXXX';
let headers = new Headers();

//headers.append('Content-Type', 'text/json');
headers.append('Authorization', 'Basic' + base64.encode(username + ":" + password));

fetch(url,{ method: 'GET', headers: headers})
    .then(res => res)
    .then(json => console.log(json));

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
