(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else{root.A4000TrialApplication=api;api.mount(root.document,root.navigator);}})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const recipient='help@elliongpu.com';
  const purposes=['AI inference','AI training / fine-tuning','Rendering / graphics','CUDA development','Other Linux GPU workload'];
  function buildApplication(input){
    const clean=(value,max)=>{if(typeof value!=='string'||value.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value))throw Error('Invalid application');return value.trim();};
    const email=clean(input.email,254),name=clean(input.name||'',120),purpose=clean(input.purpose,80),details=clean(input.details,1500),schedule=clean(input.schedule||'',120);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!purposes.includes(purpose)||details.length<10||input.consent!==true||/[\r\n]/.test(name+schedule))throw Error('Please check the required application fields');
    const subject='[ELLION GPU Trial] NVIDIA RTX A4000 — Free 10-hour trial application';
    const body=[
      'Type: Free 10-hour GPU trial application',
      'Product: NVIDIA RTX A4000 GPU Server',
      'Product ID: elgrim-gfx-a4000',
      'Trial duration requested: 10 continuous hours from the first authenticated connection after approval and setup',
      'Application status: Customer must send this email; operator confirmation required',
      'Payment: Free trial request; not a paid rental or backup order',
      'Email: '+email,'Name / organisation: '+(name||'-'),'Workload: '+purpose,'Preferred date / timezone: '+(schedule||'-'),
      'Trial conditions acknowledged: Yes','Workload details:',details,
      '', 'Please confirm email verification, eligibility, capacity, access and data handling arrangements before preparing this trial.'
    ].join('\n');
    return{subject,body,text:'To: '+recipient+'\nSubject: '+subject+'\n\n'+body,mailto:'mailto:'+recipient+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)};
  }
  function mount(document,navigator){
    const form=document.getElementById('trial-form');if(!form)return;
    const review=document.getElementById('trial-review'),draft=document.getElementById('trialDraft'),status=document.getElementById('trialCopyStatus');
    const invalidate=()=>{review.hidden=true;draft.value='';document.getElementById('trialMailLink').removeAttribute('href');status.textContent='';document.getElementById('trialError').textContent='';};
    form.addEventListener('input',invalidate);form.addEventListener('change',invalidate);
    form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;try{
      const fields=Object.fromEntries(new FormData(form).entries());fields.consent=document.getElementById('trialConsent').checked;
      const application=buildApplication(fields);draft.value=application.text;document.getElementById('trialMailLink').href=application.mailto;review.hidden=false;status.textContent='';document.getElementById('review-title').focus();review.scrollIntoView({behavior:'smooth',block:'start'});
    }catch(error){document.getElementById('trialError').textContent=error.message;review.hidden=true;document.getElementById('trialMailLink').removeAttribute('href');draft.value='';}});
    document.getElementById('trialCopy').addEventListener('click',async()=>{try{if(!draft.value)return;await navigator.clipboard.writeText(draft.value);status.textContent='Copied. Paste this into your email and send it to '+recipient+'.';}catch{draft.focus();draft.select();status.textContent='Select and copy the application above, then send it by email.';}});
  }
  return{buildApplication,mount};
});
