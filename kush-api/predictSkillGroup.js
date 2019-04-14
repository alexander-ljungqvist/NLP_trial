var userToSkillConnector = require('./routes/userToSkillConnector');
var skills = require('./routes/fetchSkills');
var users = require('./routes/fetchUsers');
var skillGroups = require('./routes/fetchSkillGroups');
var utils = require('./utils');

const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

var Promise = require('bluebird');
const featureArray = ["Java", ".Net", "Architecture", "Cloud", "Web", "Lean and Agile", "Mobile"];

async function predict(){
  const model = tf.sequential({
    layers: [
      tf.layers.dense({
        units: featureArray.length,
        inputShape: [featureArray.length],
        activation: 'LeakyReLU',
        kernelInitializer: 'varianceScaling',
        useBias: true
      }),
      
      tf.layers.dense({
        units: featureArray.length,
        activation: 'softmax',
        kernelInitializer: 'varianceScaling',
        useBias: false
      })
    ]
  });

  await fetchKUSHInfo()
    .then(maps => {
      return Promise.props({
        model: trainSkillGroupTensor(model, maps.values.skillGroupList, maps.avarageSkillGroupLevels, maps.userToSkillGroupLevel, maps.values.userList),
        maps: maps
      })
    }).then(maps => {
      console.log(maps.model);
      predictSkillGroup(model, maps.maps.values.skillGroupList, maps.maps.avarageSkillGroupLevels);
    });
}

async function fetchKUSHInfo(){
  return Promise.props({
    userToSkillConnectors: userToSkillConnector.fetch(),
    skillList: skills.fetch(),
    userList: users.fetch(),
    skillGroupList: skillGroups.fetch()
  }).then(values => {
    return Promise.props({
      avarageSkillGroupLevels: avarageUserSkillGroupLevels(values.userToSkillConnectors, values.skillList, values.userList, values.skillGroupList),
      values: values
    }) 
  }).then(res => {
    return Promise.props({
      avarageSkillGroupLevels: res.avarageSkillGroupLevels,
      totalUserSkillLevel: userTotalSkillLevels(res.avarageSkillGroupLevels, res.values.userList, res.values.skillGroupList),
      values: res.values
    });
  }).then(res => {
    return Promise.props({
      avarageSkillGroupLevels: res.avarageSkillGroupLevels,
      skillGroupLevelsOfTotal: skillGroupLevelOfTotalSkill(res.avarageSkillGroupLevels, res.totalUserSkillLevel, res.values.userList, res.values.skillGroupList),
      values: res.values
    });
  }).then(res => {
    return Promise.props({
      avarageSkillGroupLevels: res.avarageSkillGroupLevels,
      userToSkillGroupLevel: userToSkillGroupLevels(res.skillGroupLevelsOfTotal, res.values.userList, res.values.skillGroupList),
      values: res.values
    })
  });
}

async function avarageUserSkillGroupLevels(userToSkillConnectors, skillList, userList, skillGroupList){
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

async function userTotalSkillLevels(avarageSkillGroupLevels, userList, skillGroupList){
  const totalUserSkillLevel = userList.reduce((map, user) => {
    if(avarageSkillGroupLevels[user._id]){
      map = skillGroupList.reduce((map, skillGroup) => {
        if(avarageSkillGroupLevels[user._id][skillGroup._id] && featureArray.includes(skillGroup.name)){
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

async function skillGroupLevelOfTotalSkill(avarageSkillGroupLevels, totalUserSkillLevel, userList, skillGroupList){
  const skillGroupLevelOfTotal = userList.reduce((map, user) => {
    if(avarageSkillGroupLevels[user._id]){
      map[user._id] = skillGroupList.reduce((map, skillGroup) => {
        if(avarageSkillGroupLevels[user._id][skillGroup._id] && featureArray.includes(skillGroup.name)){
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

async function userToSkillGroupLevels(skillGroupLevelsOfTotal, userList, skillGroupList){
  const userToSkillGroupList = userList.reduce((map, user) => {
    if(skillGroupLevelsOfTotal[user._id]){
      map[user._id] = skillGroupList.reduce((map, skillGroup) => {
        map[skillGroup._id] = skillGroupLevelsOfTotal[user._id][skillGroup._id] ? skillGroupLevelsOfTotal[user._id][skillGroup._id] : Object.assign({}, {skillGroupLevel: 0});;
        return map;
      }, []);
    }
    return map;
  }, []);
  return userToSkillGroupList;
}

// Feature array = ["Java", ".Net", "Architecture", "Cloud", "Web", "Lean and Agile", "Mobile"]

async function trainSkillGroupTensor(model, skillGroupList, avarageSkillGroupLevels, userToSkillGroupLevel, userList){
  // Learning rate 0.1
  const optimize = tf.train.sgd(0.1);
  
  model.compile({
    loss: 'meanSquaredError',
    optimizer: optimize
  });
  
  const avarageSkillGroupLevelPerUser = tf.tensor(userList.reduce((map, user) => {
    if(avarageSkillGroupLevels[user._id]){
      map.push(skillGroupList.reduce((map, skillGroup) => {
        if(avarageSkillGroupLevels[user._id][skillGroup._id] && featureArray.includes(skillGroup.name)){
          map.push(avarageSkillGroupLevels[user._id][skillGroup._id].level);
          return map;
        } else if(featureArray.includes(skillGroup.name)) {
          map.push(0);
          return map;
        }
        return map;
      }, []));
    }
    return map;
    }, [])
  );
    
  const skillGroupPercentagePerUser = tf.tensor(userList.reduce((map, user) => {
    if(userToSkillGroupLevel[user._id]){
      map.push(skillGroupList.reduce((map, skillGroup) => {
        if(featureArray.includes(skillGroup.name)){
          map.push(userToSkillGroupLevel[user._id][skillGroup._id].skillGroupLevel);
          return map;
        }
        return map
      }, []));
    }
    return map;
    }, [])
  );
  
  await model.fit(avarageSkillGroupLevelPerUser, skillGroupPercentagePerUser, {epochs: 500});

  //console.log("Model trained");
  return "Model trained";
}

async function predictSkillGroup(model, skillGroupList, avarageUserSkillGroupLevels){
  const groupList = skillGroupList.reduce((map, group) => {
      // 55d427f34fdbb117004eccaf userId
      if(avarageUserSkillGroupLevels["55d427f34fdbb117004eccaf"][group._id] && featureArray.includes(group.name)){
        map.push(avarageUserSkillGroupLevels["55d427f34fdbb117004eccaf"][group._id].level);
        return map;
      } else if(featureArray.includes(group.name)) {
        map.push(0);
        return map;
      }
      return map;
    }, []);
    console.log(groupList);
    //const predictionTensor = model.predict(tf.tensor([0, 2, 3, 0, 0, 0, 0, 1, 0, 4, 0, 0, 0, 0, 0, 2, 3, 0, 0, 0, 0, 1, 0, 4, 0, 0, 0, 0, 3, 0], [1, 30]));
    const predictionTensor = model.predict(tf.tensor(groupList, [1, featureArray.length]));
    const tensorData = predictionTensor.dataSync();
    console.log(tensorData);
}

predict();