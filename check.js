const data = require('./src/data/respondentUtilities.json');
const profiles = require('./src/data/respondentProfile.json');

let regular = [], never = [], occasional = [], rarely = [];

// Match by respondent ID
profiles.forEach(p => {
  const util = data[p.Respondent_ID];
  if (!util || !util.base) return;
  
  if (p.Regularly_Access_CNN === 1) {
    regular.push(util.base.reader);
  } else if (p.Occasionally_Access_CNN === 1) {
    occasional.push(util.base.reader);
  } else if (p.Rarely_Access_CNN === 1) {
    rarely.push(util.base.reader);
  } else {
    never.push(util.base.reader);
  }
});

console.log('CNN Usage vs Base Reader Utility:');
console.log('Regular CNN users:', regular.length, 'avg:', (regular.reduce((a,b)=>a+b,0)/regular.length).toFixed(4));
console.log('Occasional users:', occasional.length, 'avg:', (occasional.reduce((a,b)=>a+b,0)/occasional.length).toFixed(4));
console.log('Rarely users:', rarely.length, 'avg:', (rarely.reduce((a,b)=>a+b,0)/rarely.length).toFixed(4));
console.log('Never users:', never.length, 'avg:', (never.reduce((a,b)=>a+b,0)/never.length).toFixed(4));

// Check range
const all = [...regular, ...occasional, ...rarely, ...never];
console.log('\nRange: Min=', Math.min(...all).toFixed(4), 'Max=', Math.max(...all).toFixed(4));
