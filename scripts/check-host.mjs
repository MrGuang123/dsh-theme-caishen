/** Opt-in contract audit against an installed host; never reads its profile. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,readdir} from 'node:fs/promises';
import {readAsar} from './lib/asar.mjs';
const require=createRequire(import.meta.url),{SLOTS}=require('../src/client/adapter/host.cjs');
const archive=process.argv[2];if(!archive)throw Error('Usage: node scripts/check-host.mjs /path/to/app.asar');
const root='dsh/node_modules/@deepseek-ai/';
const names=['dsh-client-ui-conversation','dsh-client-ui-session','dsh-client-ui-workspace','dsh-client-ui-sidebar','dsh-client-ui-settings-shell','dsh-client-ui-settings-general','dsh-client-ui-settings-account','dsh-client-ui-settings','dsh-client-ui-layout','dsh-client-shortcuts','dsh-client-ui-theme'];
const code=Object.fromEntries(await Promise.all(names.map(async name=>[name,await readAsar(archive,root+name+'/lib/client.js')])));
const info=JSON.parse(await readAsar(archive,'dsh/package.json'));
const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
assert.equal(info.version,pkg.engines.dsh,'host version is outside the declared tested target');
const joined=Object.values(code).join('\n');for(const [slot]of SLOTS)assert.ok(joined.includes('"'+slot+'"'),'missing slot '+slot);
for(const [name,patterns]of Object.entries({
 'dsh-client-ui-conversation':[/useInput\(\(s\) => s\)/,/draftRev/,/captureInsertion/,/insertAsyncText/,/data-composer-input/,/data-conversation-region/],
 'dsh-client-ui-workspace':[/hooks: \{ workspaces: workspaces.list \}/,/\.items/,/sessionIds\.includes\(sessionId\)/],
 'dsh-client-ui-session':[/hooks: \["session"\]/,/props: \["sessionId"\]/],
 'dsh-client-shortcuts':[/register\(command\)/,/command\.resolve\(context\)/],
 'dsh-client-ui-theme':[/overrideTokens/]
}))for(const pattern of patterns)assert.match(code[name],pattern,name+' contract');
const css=await readFile(new URL('../src/client/styles/host-adapter.css',import.meta.url),'utf8');
const fragments=[...css.matchAll(/\[class\*="([^"]+)"\]/g)].map(x=>x[1]);for(const fragment of new Set(fragments))assert.ok(joined.includes(fragment),'host class fragment absent: '+fragment);
for(const file of await readdir(new URL('../src/client/styles/',import.meta.url))){if(!file.endsWith('.css')||file==='host-adapter.css')continue;assert.ok(!(await readFile(new URL('../src/client/styles/'+file,import.meta.url),'utf8')).includes('[class*='),'host class adaptation escaped its owner: '+file)}
console.log('ok — installed DSH '+info.version+': '+SLOTS.length+' slots, workspace membership, input revision, shortcuts, theme tokens and '+new Set(fragments).size+' host class fragments');
