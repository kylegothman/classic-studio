import fs from 'node:fs';import assert from 'node:assert/strict';import * as THREE from 'three';import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
globalThis.IPOD_EOE_CATALOG=JSON.parse(fs.readFileSync(new URL('../dist/eoe-color-catalog.json',import.meta.url)));
const {measureFaceplate,finishPlateNormals,buildShellCache}=await import('../dist/viewer.js');
// Load the actual supplied geometry without browser-only image decoding.
const loader=new GLTFLoader().register(parser=>({name:'geometry-only',loadMaterial:i=>Promise.resolve(new THREE.MeshBasicMaterial({name:parser.json.materials[i].name}))}));
const bytes=fs.readFileSync(new URL('../dist/assets/ipod_classic.glb',import.meta.url));const gltf=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');gltf.scene.updateMatrixWorld(true);const origin=new THREE.Box3().setFromObject(gltf.scene).getCenter(new THREE.Vector3());let plate;
gltf.scene.traverse(n=>{if(n.isMesh&&n.material.name==='Material.006'){plate=n.geometry.clone().applyMatrix4(n.matrixWorld);plate.translate(-origin.x,-origin.y,-origin.z);}});
const dims=measureFaceplate(plate),close=(a,b,why,epsilon=.0003)=>assert(Math.abs(a-b)<epsilon,`${why}: ${a} != ${b}`);
close(dims.width,2.440426,'Measured width');close(dims.height,4.054299,'Measured height');close(dims.radius,.242077,'Measured corner radius');close(dims.faceZ,.158539,'Flat face, independent of raised button');
const fixed=finishPlateNormals(plate),p=fixed.attributes.position,n=fixed.attributes.normal;let checked=0;
for(let i=0;i<p.count;i+=3){const a=new THREE.Vector3().fromBufferAttribute(p,i),b=new THREE.Vector3().fromBufferAttribute(p,i+1),c=new THREE.Vector3().fromBufferAttribute(p,i+2),cross=b.sub(a).cross(c.sub(a));if(cross.length()>.01&&cross.normalize().z>.99999){for(let j=0;j<3;j++){close(n.getX(i+j),0,'Planar normal X',1e-7);close(n.getY(i+j),0,'Planar normal Y',1e-7);close(n.getZ(i+j),1,'Planar normal Z',1e-7);}checked++;}}
assert(checked>5);
const cache=buildShellCache(dims);assert.equal(cache.variants.size,6);
for(const [key,v]of cache.variants){
 const g=v.geometry,b=g.boundingBox;close(b.max.z-b.min.z,v.depth,key+' exact depth');close(b.max.x-b.min.x,dims.width+.02,key+' fine rim width');close(b.max.y-b.min.y,dims.height+.02,key+' fine rim height');close(b.min.z,v.rearZ,key+' rear');
 assert([...g.attributes.position.array,...g.attributes.normal.array].every(Number.isFinite),key+' finite geometry');
 const mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));mesh.updateMatrixWorld();const ray=(pos,dir)=>new THREE.Raycaster(new THREE.Vector3(...pos),new THREE.Vector3(...dir),0,10).intersectObject(mesh);
 const front=ray([0,0,1],[0,0,-1]);assert(front.length>=2,key+' closed back with inner and outer faces');close(front[0].point.z,v.rearZ+.02,key+' hollow cavity');close(front.at(-1).point.z,v.rearZ,key+' wall thickness');
 const bottom=(x,z=v.centerZ)=>ray([x,-v.height/2-.05,z],[0,1,0]).filter(h=>h.distance<.15);
 assert.equal(bottom(key.endsWith('moon')?.8:0).length,0,key+' connector is a through-hole');if(key.endsWith('moon'))assert.equal(bottom(0).length,0,key+' retained dock opening');assert(bottom(-.7).length>=2,key+' continuous bottom wall away from port');
 for(const x of [.78,-.68])assert.equal(ray([x,v.height/2+.05,v.centerZ],[0,-1,0]).filter(h=>h.distance<.15).length,0,key+' top cutout');
 assert(ray([0,v.height/2+.05,v.centerZ],[0,-1,0]).filter(h=>h.distance<.15).length>=2,key+' continuous top');
 // Connector dimensions are unchanged by depth, and no opening reaches the face.
 const width=key.endsWith('usbc')?.35:.83;assert(bottom(width/2+.012).length>=2,key+' connector horizontal boundary');assert(bottom(0,v.centerZ+(key.endsWith('usbc')?.125:.10)/2+.012).length>=2,key+' connector depth boundary');
 console.log(key,Math.round(g.attributes.position.count/3)+' triangles', 'depth '+(b.max.z-b.min.z).toFixed(4));
}
console.log(`PASS: actual GLB outline, ${checked} flat-face triangles, six hollow shells, depth/wall/seam dimensions and real top/bottom apertures (${cache.buildMs} ms startup).`);
