const { NerManager } = require('node-nlp');

const manager = new NerManager({ threshold: 0.8 });
manager.addNamedEntityText('skill','nodejs',['en'],['node-js', 'node js']);
manager.findEntities(
  'I saw nodejs eating speghetti in the city',
  'en',
).then(entities => {
  console.log(entities)
})
