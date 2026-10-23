/** Appearance state, transactional preview and semantic contrast, without a browser. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {KEY,DEFAULTS,validateAppearance,resolveAppearance,createAppearanceStore}=require('../src/client/state/appearance.cjs');
const {installAppearance}=require('../src/client/theme/appearance.cjs');
const {PRESETS,presetTokens}=require('../src/client/theme/presets.cjs');
const TOKENS=require('../src/client/theme/tokens.cjs');
const data=new Map(),listeners=new Set();let denyRead=false,denyWrite=false,writes=0;
globalThis.window={localStorage:{getItem(key){assert.equal(key,KEY);if(denyRead)throw Error('denied');return data.get(key)??null},setItem(key,value){assert.equal(key,KEY);if(denyWrite)throw Object.assign(Error('full'),{name:'QuotaExceededError'});writes++;data.set(key,value)}},addEventListener:(type,fn)=>{assert.equal(type,'storage');listeners.add(fn)},removeEventListener:(type,fn)=>listeners.delete(fn)};
const store=createAppearanceStore();assert.equal(store.get(),DEFAULTS);assert.equal(writes,0);
for(const patch of [{layout:'wide'},{palette:'external'},{focus:'true'},{illustrations:1},{decoration:null}])assert.equal(validateAppearance({...DEFAULTS,...patch}),null);
const token={},second={};const jade={...DEFAULTS,palette:'jade',layout:'compact'};
let notifications=0;const off=store.subscribe(()=>notifications++);
assert.equal(store.preview(jade,token).ok,true);assert.equal(store.get().palette,'jade');assert.equal(store.getSaved(),DEFAULTS);assert.equal(writes,0);
assert.equal(store.preview(DEFAULTS,second).error,'busy');store.cancel(second);assert.equal(store.get().palette,'jade');
store.cancel(token);assert.equal(store.get(),DEFAULTS);
store.preview(jade,token);denyWrite=true;assert.equal(store.save(jade,null,token).error,'quota');assert.equal(store.get().palette,'jade');assert.equal(store.getSaved(),DEFAULTS);assert.equal(data.has(KEY),false);denyWrite=false;
assert.equal(store.save(jade,null,token).ok,true);assert.equal(store.getSaved().palette,'jade');assert.equal(writes,1);assert.deepEqual(createAppearanceStore().get(),jade);
const raw=data.get(KEY);store.preview({...jade,palette:'ink'},token);
const external=JSON.stringify({version:1,...DEFAULTS,decoration:'none'});data.set(KEY,external);for(const fn of listeners)fn({key:KEY});
assert.equal(store.get().palette,'ink','external updates do not overwrite the active preview');
assert.equal(store.save({...jade,palette:'ink'},raw,token).error,'conflict');assert.equal(data.get(KEY),external);
store.cancel(token);assert.equal(store.get().decoration,'none');
for(const invalid of ['{broken',JSON.stringify({version:2,...DEFAULTS}),JSON.stringify({version:1,...DEFAULTS,focus:'true'}),'x'.repeat(5000)]){
 data.set(KEY,invalid);store.retry();assert.equal(store.getStatus().kind,'corrupt');store.preview(jade,token);assert.equal(store.save(jade,invalid,token).error,'corrupt');assert.equal(data.get(KEY),invalid);store.cancel(token);
}
denyRead=true;assert.equal(store.retry().kind,'unavailable');assert.equal(store.save(DEFAULTS,null,token).error,'unavailable');denyRead=false;
data.delete(KEY);for(const fn of listeners)fn({key:null});assert.equal(store.get(),DEFAULTS);
const chosen={...DEFAULTS,focus:true,layout:'full',decoration:'full',illustrations:true,easterEggs:true};assert.deepEqual(resolveAppearance(chosen),{...chosen,layout:'compact',decoration:'none',illustrations:false,easterEggs:false});assert.equal(chosen.illustrations,true);assert.equal(resolveAppearance({...chosen,focus:false}).illustrations,true);
// Real lifecycle bridge: attributes, optional palette and listeners are released.
const attrs=new Map([['data-caishen-focus','prior']]);globalThis.document={body:{getAttribute:k=>attrs.get(k)??null,setAttribute:(k,v)=>attrs.set(k,v),removeAttribute:k=>attrs.delete(k)}};
let mounted=0,released=0;const ctx={theme:{overrideTokens(layer,tokens){assert.equal(layer,'dsh-theme-caishen:appearance');assert.ok(tokens['--dsw-alias-link']);mounted++;return()=>released++}}};
const dispose=installAppearance(ctx,store);assert.equal(attrs.get('data-caishen-layout'),'auto');assert.equal(mounted,0);
store.preview(jade,token);assert.equal(mounted,1);assert.equal(attrs.get('data-caishen-palette'),'jade');store.preview({...jade,focus:true},token);assert.equal(mounted,1,'layout changes do not remount palette');assert.equal(attrs.get('data-caishen-eggs'),'off');store.cancel(token);assert.equal(released,1);assert.equal(attrs.get('data-caishen-palette'),'classic');dispose();assert.deepEqual([...attrs],[['data-caishen-focus','prior']]);off();assert.equal(listeners.size,0);assert.ok(notifications>0);
// Representative normal text, link, error, selected and disabled colors in both modes.
function lum(hex){const v=hex.replace('#','').match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2]}
function contrast(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
for(const name of Object.keys(PRESETS)){
 const tokens={...TOKENS,...(name==='classic'?{}:presetTokens(name))};
 for(const mode of ['light','dark']){
  const background=tokens['--dsw-alias-bg-layer-2'][mode];
  for(const key of ['--dsw-alias-label-primary','--dsw-alias-label-secondary','--dsw-alias-link','--dsw-alias-state-error-primary'])assert.ok(contrast(tokens[key][mode],background)>=4.5,`${name}/${mode}/${key} contrast`);
  assert.ok(contrast(tokens['--dsw-alias-label-primary-foreground'][mode],tokens['--dsw-alias-button-primary-fill'][mode])>=4.5,`${name}/${mode}/host primary button contrast`);
 }
}
console.log('ok — appearance: preview rollback, persistence, quota/read/corrupt/conflict protection, focus restoration of choices, bridge cleanup and representative light/dark contrast');
