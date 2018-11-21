const { NerManager } = require('node-nlp');

const manager = new NerManager({ threshold: 0.8 });
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
