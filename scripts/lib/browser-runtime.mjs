import assert from 'node:assert/strict';
import {readAsar} from './asar.mjs';

/** Locate the ESM interop helper (`function name(e,t){…Object.freeze(Object.defineProperty…)`). */
function esmHelper(code){
 const start=code.search(/function [A-Za-z0-9_$]+\(e,t\)\{/);
 for(let at=start;at>=0;at=code.indexOf('function ',at+1)){
  const end=code.indexOf('Symbol.toStringTag,{value:"Module"}))}',at);
  if(end>=0&&end-at<1200)return code.slice(at,end+'Symbol.toStringTag,{value:"Module"}))}'.length);
 }
 return undefined;
}

/** Locate the `__esModule` default-unwrap helper. */
function unwrapHelper(code){
 return code.match(/function [A-Za-z0-9_$]+\(e\)\{return e&&e\.__esModule&&Object\.prototype\.hasOwnProperty\.call\(e,"default"\)\?e\.default:e\}/)?.[0];
}

/** React 18 bundle shape used by the DSH frontend: inline production modules and two interop wrappers. */
function reactRuntime(code){
 const esm=esmHelper(code),unwrap=unwrapHelper(code);
 assert.ok(esm&&unwrap,'host React interop helpers changed; audit before updating extraction');
 const reactLicense=code.indexOf('react.production.min.js');
 const schedulerLicense=code.indexOf('scheduler.production.min.js');
 const domLicense=code.indexOf('react-dom.production.min.js');
 assert.ok(reactLicense>=0&&schedulerLicense>=0&&domLicense>=0,'host React production modules changed; audit before updating extraction');
 const reactStart=code.lastIndexOf('var ',reactLicense);
 const domStart=code.lastIndexOf('var ',schedulerLicense);
 assert.ok(reactStart>=0&&domStart>=0,'host React module starts changed; audit before updating extraction');
 const exportShape=/const ([A-Za-z0-9_$]+)=[A-Za-z0-9_$]+\(([A-Za-z0-9_$]+)\),[A-Za-z0-9_$]+=[A-Za-z0-9_$]+\(\{__proto__:null,default:\1\},\[\2\]\);/;
 const reactEnd=code.slice(reactLicense).match(exportShape);
 const domEnd=code.slice(domLicense).match(exportShape);
 assert.ok(reactEnd&&domEnd,'host React export shape changed; audit before updating extraction');
 const reactEndAt=reactLicense+reactEnd.index+reactEnd[0].length;
 const domEndAt=domLicense+domEnd.index+domEnd[0].length;
 return esm+'\n'+unwrap+'\n'+code.slice(reactStart,reactEndAt)+'\n'+code.slice(domStart,domEndAt)+
  `\nwindow.React=${reactEnd[1]};window.ReactDOM=${domEnd[1]};`;
}

/** Extract only the shipped React runtime, keeping license notices; never boot host code. */
export async function browserRuntime(archive){
 const root='dsh/node_modules/@deepseek-ai/dsh-web-frontend/dist/';
 const html=await readAsar(archive,root+'index.html');
 const src=html.match(/src="([^"]*\/assets\/index-[^"]+\.js)"/)?.[1] || html.match(/src="([^"]*assets\/index-[^"]+\.js)"/)?.[1];
 assert.ok(src,'host frontend index is absent');
 const code=await readAsar(archive,root+'assets/'+src.split('/').pop());
 const helper=code.match(/function P1\(e,t\)\{.*?return Object\.freeze\(Object\.defineProperty\(e,Symbol\.toStringTag,\{value:"Module"\}\)\)\}/s)?.[0];
 const start=code.indexOf('function qs(e){return e&&e.__esModule'),tail='const vC=qs(z7),yC=P1({__proto__:null,default:vC},[z7]);',end=code.indexOf(tail,start);
 if(helper&&start>=0&&end>start)return helper+'\n'+code.slice(start,end+tail.length)+'\nwindow.React=C;window.ReactDOM=yC;';
 return reactRuntime(code);
}
