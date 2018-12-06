var userToSkillConnector = require('./routes/userToSkillConnector');
var skills = require('./routes/fetchSkills');
var users = require('./routes/fetchUsers');
var skillGroups = require('./routes/fetchSkillGroups');
var utils = require('./utils');

var Promise = require('bluebird');

async function userToSkill(){
  return Promise.props({
    userToSkillConnectors: userToSkillConnector.fetch().then(utils.groupEntitiesByField('userId')),
  });
}

async function userToSkills(){
  const userToSkill = await userToSkillConnector.fetch();
  const userToSkills = userToSkill.reduce((map, connector) => {
    map[connector.userId] = map[connector.userId] ? map[connector.userId] : [];
    map[connector.userId].push(connector);
    return map;
  }, []);
  return userToSkills;
}

async function skillGroupNameToId(){
  const skillGroupList = await skillGroups.fetch();
  return skillGroupList.reduce((map, skillGroup) => {
    map[skillGroup.name] = map[skillGroup.name] ? map[skillGroup.name] : [];
    map[skillGroup.name] = skillGroup._id;
    return map;
  }, []);
}

async function skillGroupIds(){
  const skillGroupList = await skillGroups.fetch();
  return skillGroupList.map(skillGroup => skillGroup._id);
}

async function skillGroupNames(){
  const skillGroupList = await skillGroups.fetch();
  return skillGroupList.map(skillGroup => skillGroup.name);
}

async function fetchSkillGroups(){
  return Promise.props({
    groups: skillGroups.fetch().then(utils.mapEntitiesByField('_id')),
  });
}

async function skillIdsToSkillGroup(){
  const [skillList, skillGroupList] = await Promise.all([skills.fetch(), skillGroups.fetch()]);
  const skillsToSkillGroup = skillList
    .filter(skill => !!skill.skillGroupId)
    .reduce((map, skill) => {
      const skillGroupFound = skillGroupList.find(group => group._id === skill.skillGroupId);
      if(skillGroupFound != undefined){
        map[skillGroupFound._id] = map[skillGroupFound._id] ? map[skillGroupFound._id] : [];
        map[skillGroupFound._id].push(skill._id);
      }
      return map;
    }, []);
  return skillsToSkillGroup;
}

async function skillIdToSkillGroupId(){
  const [skillList, skillGroupList] = await Promise.all([skills.fetch(), skillGroups.fetch()]);
  const skillIdToSkillGroup = skillList
    .filter(skill => !!skill.skillGroupId)
    .reduce((map, skill) => {
      const skillGroupFound = skillGroupList.find(group => group._id === skill.skillGroupId);
      if(skillGroupFound != undefined){
        map[skill._id] = map[skill._id] ? map[skill._id] : [];
        map[skill._id] = skillGroupFound._id;
      }
      return map;
    }, []);
  return skillIdToSkillGroup;
}

async function userToSkillGroupSkill(){
  const [userToSkillConnectors, skillList, userList, skillGroupList] = await Promise.all([userToSkillConnector.fetch(), skills.fetch(), users.fetch(), skillGroups.fetch()]);
  const userToSkillGroups = userToSkillConnectors.reduce((map, connector) => {
    const groupId = skillList.find(skill => skill._id === connector.skillId).skillGroupId;
    if(groupId && skillGroupList.find(group => group._id === groupId)){
      const skillLevel = {groupId: groupId, level: connector.level};
      map[connector.userId] = map[connector.userId] ? map[connector.userId] : [];
      map[connector.userId].push(skillLevel);
    }
    return map;
  }, []);
  const userSkillGroupSkill = userList.reduce((map, user) => {
    if(userToSkillGroups[user._id]){
      map[user._id] = userToSkillGroups[user._id].reduce((map, skillGroupLevel) => {
        map[skillGroupLevel.groupId] = map[skillGroupLevel.groupId] ? map[skillGroupLevel.groupId] : Object.assign({}, {level: 0, nbrSkills: 0});
        map[skillGroupLevel.groupId].level += skillGroupLevel.level;
        map[skillGroupLevel.groupId].nbrSkills++;
        return map;
      }, []);
    };
    return map;
  }, []);
  const avarageSkillGroup = userList.reduce((map, user) => {
    if(userToSkillGroups[user._id]){
      map = skillGroupList.reduce((map, skillGroup) => {
        if(map[user._id][skillGroup._id]){
          map[user._id][skillGroup._id].level = map[user._id][skillGroup._id].level/map[user._id][skillGroup._id].nbrSkills;
          return map;
        };
        return map;
      }, userSkillGroupSkill);
    };
    return map;
  }, []);
  return avarageSkillGroup;
}

async function totalUserSkillLevels(){
  const [avarageSkillGroupLevels, userList, skillGroupList] = await Promise.all([userToSkillGroupSkill(), users.fetch(), skillGroups.fetch()]);
  const totalUserSkillLevel = userList.reduce((map, user) => {
    if(avarageSkillGroupLevels[user._id]){
      map = skillGroupList.reduce((map, skillGroup) => {
        if(avarageSkillGroupLevels[user._id][skillGroup._id]){
          map[user._id] = map[user._id] ? map[user._id] : Object.assign({}, {totalSkill: 0, nbrSkillGroups: 0});
          map[user._id].totalSkill += avarageSkillGroupLevels[user._id][skillGroup._id].level;
          map[user._id].nbrSkillGroups++;
          return map;
        };
        return map;
      }, map);
    };
    return map;
  }, []);
  return totalUserSkillLevel;
}

async function skillGroupLevelOfTotalSkill(){
  const [avarageSkillGroupLevels, totalUserSkillLevel, userList, skillGroupList] = await Promise.all([userToSkillGroupSkill(), totalUserSkillLevels(), users.fetch(), skillGroups.fetch()]);
  const skillGroupLevelOfTotal = userList.reduce((map, user) => {
    if(avarageSkillGroupLevels[user._id]){
      map[user._id] = skillGroupList.reduce((map, skillGroup) => {
        if(avarageSkillGroupLevels[user._id][skillGroup._id]){
          map[skillGroup._id] = map[skillGroup._id] ? map[skillGroup._id] : Object.assign({}, {skillGroupLevel: 0});
          map[skillGroup._id].skillGroupLevel = avarageSkillGroupLevels[user._id][skillGroup._id].level/totalUserSkillLevel[user._id].totalSkill;
          return map;
        };
        return map;
      }, []);
    };
    return map;
  }, []);
  return skillGroupLevelOfTotal
}

async function userToSkillGroupLevels(){
  const [avarageSkillGroupLevels, skillGroupLevelsOfTotal, totalUserSkillLevel, userList, skillGroupList] = await Promise.all([userToSkillGroupSkill(), skillGroupLevelOfTotalSkill(), totalUserSkillLevels(), users.fetch(), skillGroups.fetch()]);
  const userToSkillGroupList = skillGroupList.reduce((map, skillGroup) => {
    
    return map;
  }, []);
  return userToSkillGroupList;
}

s();

function setTensorModel(){
  const model = tf.sequential({
    layers: [
      tf.layers.dense({
        units: 6,
        inputShape: [6],
        activation: 'LeakyReLU',
        kernelInitializer: 'varianceScaling',
        useBias: true
      }),
      
      tf.layers.dense({
        units: 3,
        activation: 'softmax',
        kernelInitializer: 'varianceScaling',
        useBias: false
      })
    ]
  });
}

async function trainSkillGroupTensor(){

    const skills = userToSkillConnector.fetch();
  
    // Learning rate 0.1
    const optimize = tf.train.sgd(0.1);
  
    model.compile({
     loss: 'meanSquaredError',
     optimizer: optimize
    });
  
    const xs = tf.tensor([[2, 3, 0, 0, 3, 1], [0, 1, 3, 2, 2, 2],
      [3, 4, 1, 2, 3, 1], [1, 1, 3, 3, 1, 0], [2, 1, 3, 1, 4, 2],
      [0, 2, 0, 3, 2, 3], [3, 4, 2, 1, 2, 2], [2, 0, 0, 3, 3, 4],
      [1, 0, 4, 2, 2, 1], [5, 2, 2, 3, 1, 0], [2, 3, 0, 0, 3, 1], [0, 1, 3, 2, 2, 2],
      [3, 4, 1, 2, 3, 1], [1, 1, 3, 3, 1, 0], [2, 1, 3, 1, 4, 2],
      [0, 2, 0, 3, 2, 3], [3, 4, 2, 1, 2, 2], [2, 0, 0, 3, 3, 4],
      [1, 0, 4, 2, 2, 1], [5, 2, 2, 3, 1, 0], [2, 3, 0, 0, 3, 1], [0, 1, 3, 2, 2, 2],
      [3, 4, 1, 2, 3, 1], [1, 1, 3, 3, 1, 0], [2, 1, 3, 1, 4, 2],
      [0, 2, 0, 3, 2, 3], [3, 4, 2, 1, 2, 2], [2, 0, 0, 3, 3, 4],
      [1, 0, 4, 2, 2, 1], [5, 2, 2, 3, 1, 0], [2, 3, 0, 0, 3, 1], [0, 1, 3, 2, 2, 2],
      [3, 4, 1, 2, 3, 1], [1, 1, 3, 3, 1, 0], [2, 1, 3, 1, 4, 2],
      [0, 2, 0, 3, 2, 3], [3, 4, 2, 1, 2, 2], [2, 0, 0, 3, 3, 4],
      [1, 0, 4, 2, 2, 1], [5, 2, 2, 3, 1, 0], [2, 3, 0, 0, 3, 1], [0, 1, 3, 2, 2, 2],
      [3, 4, 1, 2, 3, 1], [1, 1, 3, 3, 1, 0], [2, 1, 3, 1, 4, 2],
      [0, 2, 0, 3, 2, 3], [3, 4, 2, 1, 2, 2], [2, 0, 0, 3, 3, 4],
      [1, 0, 4, 2, 2, 1], [5, 2, 2, 3, 1, 0]]);
    
    const ys = tf.tensor([[0.05, 0.8, 0.15], [0.75, 0.1, 0.15], [0.1, 0.7, 0.2], [0.3, 0.2, 0.5], [0.6, 0.3, 0.1], [0.65, 0.25, 0.1], [0.1, 0.6, 0.3], [0.6, 0.3, 0.1], [0.7, 0.05, 0.25], [0.1, 0.3, 0.6], [0.05, 0.8, 0.15], [0.75, 0.1, 0.15], [0.1, 0.7, 0.2], [0.3, 0.2, 0.5], [0.6, 0.3, 0.1], [0.65, 0.25, 0.1], [0.1, 0.6, 0.3], [0.6, 0.3, 0.1], [0.7, 0.05, 0.25], [0.1, 0.3, 0.6],[0.05, 0.8, 0.15], [0.75, 0.1, 0.15], [0.1, 0.7, 0.2], [0.3, 0.2, 0.5], [0.6, 0.3, 0.1], [0.65, 0.25, 0.1], [0.1, 0.6, 0.3], [0.6, 0.3, 0.1], [0.7, 0.05, 0.25], [0.1, 0.3, 0.6],[0.05, 0.8, 0.15], [0.75, 0.1, 0.15], [0.1, 0.7, 0.2], [0.3, 0.2, 0.5], [0.6, 0.3, 0.1], [0.65, 0.25, 0.1], [0.1, 0.6, 0.3], [0.6, 0.3, 0.1], [0.7, 0.05, 0.25], [0.1, 0.3, 0.6],[0.05, 0.8, 0.15], [0.75, 0.1, 0.15], [0.1, 0.7, 0.2], [0.3, 0.2, 0.5], [0.6, 0.3, 0.1], [0.65, 0.25, 0.1], [0.1, 0.6, 0.3], [0.6, 0.3, 0.1], [0.7, 0.05, 0.25], [0.1, 0.3, 0.6]]);
  
    await model.fit(xs, ys, {epochs: 500});
  
   }

function predictSkillGroup(){
    const javascriptLevel = document.getElementById("javascriptLevel").value;
    const HTMLLevel = document.getElementById("HTMLLevel").value;
    const cLevel = document.getElementById("cLevel").value;
    const azureLevel = document.getElementById("azureLevel").value;
    const javaLevel = document.getElementById("javaLevel").value;
    const asLevel = document.getElementById("asLevel").value;
  
    const predictionTensor = model.predict(tf.tensor([javascriptLevel, HTMLLevel, cLevel, azureLevel, javaLevel, asLevel], [1, 6]));
    const tensorData = predictionTensor.dataSync();
  
    document.getElementById('output_skillgroup_field').innerText =
    'Webb ' + Math.round(tensorData[0] * 100) + '% \n' +
    '.net ' + Math.round(tensorData[1] * 100) + '% \n' +
    'Android ' + Math.round(tensorData[2] * 100) + '%';
}