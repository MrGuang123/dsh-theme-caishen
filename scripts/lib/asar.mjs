import { open } from 'node:fs/promises';
/** Read a declared app resource without launching the app or inspecting user data. */
export async function readAsar(path, entry) {
 const file=await open(path,'r');
 try {
  const prefix=Buffer.alloc(16);await file.read(prefix,0,16,0);
  const header=Buffer.alloc(prefix.readUInt32LE(12));await file.read(header,0,header.length,16);
  let node=JSON.parse(header.toString());for(const part of entry.split('/'))node=node.files?.[part];
  if(!node||node.files||node.unpacked)throw Error('Missing packed resource: '+entry);
  const buffer=Buffer.alloc(node.size);await file.read(buffer,0,buffer.length,8+prefix.readUInt32LE(4)+Number(node.offset));return buffer.toString('utf8');
 }finally{await file.close()}
}
