const fs = require('fs');
const respondentDataRaw = JSON.parse(fs.readFileSync('./src/data/respondentData.json', 'utf8'));
const respondentProfilesRaw = JSON.parse(fs.readFileSync('./src/data/respondentProfile.json', 'utf8'));

// Handle different possible structures
const respondentData = Array.isArray(respondentDataRaw) ? respondentDataRaw : 
                      respondentDataRaw.data ? respondentDataRaw.data : 
                      Object.values(respondentDataRaw);
                      
const respondentProfiles = Array.isArray(respondentProfilesRaw) ? respondentProfilesRaw : 
                          respondentProfilesRaw.data ? respondentProfilesRaw.data : 
                          Object.values(respondentProfilesRaw);

console.log('Data type:', typeof respondentDataRaw, Array.isArray(respondentDataRaw) ? 'array' : 'object');
console.log('Total respondents:', respondentData.length);

console.log('\n=== DIGITAL NEWS SUBSCRIBER ANALYSIS ===');
const dnsStats = { reader: [], streaming: [] };
const nonDnsStats = { reader: [], streaming: [] };

respondentData.forEach((r, i) => {
  const profile = respondentProfiles[i];
  if (!profile) return;
  const stats = profile.Digital_News_Subscriber === 1 ? dnsStats : nonDnsStats;
  if (r.base?.reader !== undefined) stats.reader.push(r.base.reader);
  if (r.base?.streaming !== undefined) stats.streaming.push(r.base.streaming);
});

['reader', 'streaming'].forEach(product => {
  if (dnsStats[product].length > 0 && nonDnsStats[product].length > 0) {
    const dnsAvg = dnsStats[product].reduce((a,b) => a+b, 0) / dnsStats[product].length;
    const nonAvg = nonDnsStats[product].reduce((a,b) => a+b, 0) / nonDnsStats[product].length;
    console.log(`${product}: DNS=${dnsAvg.toFixed(3)}, Non=${nonAvg.toFixed(3)}, Diff=${(dnsAvg - nonAvg).toFixed(3)}`);
  }
});

console.log('\n=== CNN USAGE PATTERNS ===');
const cnnGroups = { regular: [], occasional: [], rarely: [], never: [] };
respondentData.forEach((r, i) => {
  const p = respondentProfiles[i];
  if (!p) return;
  const util = r.base?.reader || 0;
  if (p.Regularly_Access_CNN === 1) cnnGroups.regular.push(util);
  else if (p.Occasionally_Access_CNN === 1) cnnGroups.occasional.push(util);
  else if (p.Rarely_Access_CNN === 1) cnnGroups.rarely.push(util);
  else cnnGroups.never.push(util);
});

Object.entries(cnnGroups).forEach(([k,v]) => {
  if (v.length > 0) {
    const avg = v.reduce((a,b)=>a+b,0)/v.length;
    console.log(`${k}: avg=${avg.toFixed(3)}, n=${v.length}`);
  }
});
