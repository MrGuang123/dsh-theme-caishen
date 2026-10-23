import assert from 'node:assert/strict';
import {readAsar} from './asar.mjs';
/** Extract only the shipped React runtime, keeping license notices; never boot host code. */
export async function browserRuntime(archive){
 const root='dsh/node_modules/@deepseek-ai/dsh-web-frontend/dist/';
 const html=await readAsar(archive,root+'index.html');
 const src=html.match(/src="([^"]*\/assets\/index-[^"]+\.js)"/)?.[1] || html.match(/src="([^"]*assets\/index-[^"]+\.js)"/)?.[1];
 assert.ok(src,'host frontend index is absent');
 const code=await readAsar(archive,root+'assets/'+src.split('/').pop());
 const helper=code.match(/function P1\(e,t\)\{.*?return Object\.freeze\(Object\.defineProperty\(e,Symbol\.toStringTag,\{value:"Module"\}\)\)\}/s)?.[0];
 const start=code.indexOf('function qs(e){return e&&e.__esModule'),tail='const vC=qs(z7),yC=P1({__proto__:null,default:vC},[z7]);',end=code.indexOf(tail,start);
 assert.ok(helper&&start>=0&&end>start,'host React runtime contract changed; audit before updating extraction');
 return helper+'\n'+code.slice(start,end+tail.length)+'\nwindow.React=C;window.ReactDOM=yC;';
}
