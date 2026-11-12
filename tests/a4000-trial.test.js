const {test}=require('node:test');
const assert=require('node:assert/strict');
const {buildApplication}=require('../assets/a4000-trial.js');
const input=()=>({email:'trial@example.com',name:'Example & Co',purpose:'CUDA development',details:'Evaluate a small inference workload & memory use.',schedule:'UTC+9',consent:true});
test('trial application is a dedicated free trial email, not paid rent or backup',()=>{
 const result=buildApplication(input());const mail=new URL(result.mailto);
 assert.equal(mail.pathname,'help@elliongpu.com');assert.match(mail.searchParams.get('subject'),/NVIDIA RTX A4000/);
 assert.equal(mail.searchParams.get('body'),result.body);
 assert.match(result.body,/Product ID: elgrim-gfx-a4000/);
 assert.match(result.body,/Type: Free 10-hour GPU trial application/);
 assert.match(result.body,/Customer must send this email/);
 assert.doesNotMatch(result.body,/Monthly Price:|Backup Plan:|199 USD/);
});
test('trial application requires valid email, workload, details and explicit consent',()=>{
 for(const patch of [{email:'invalid'},{purpose:'made-up'},{details:'short'},{consent:false},{details:'x'.repeat(1501)},{name:'x\nBcc: y@example.com'}]){
  assert.throws(()=>buildApplication({...input(),...patch}));
 }
});
test('draft encoding preserves special characters and optional fields are allowed',()=>{
 const details='Test model with <input> & Unicode 데이터.';
 const result=buildApplication({...input(),name:'',schedule:'',details});
 assert.match(result.body,/Name \/ organisation: -/);assert.ok(new URL(result.mailto).searchParams.get('body').includes(details));
});
