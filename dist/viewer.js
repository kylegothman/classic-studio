import * as THREE from 'three';
import {Brush,Evaluator,SUBTRACTION} from 'three-bvh-csg';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {SSAOPass} from 'three/addons/postprocessing/SSAOPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {SMAAPass} from 'three/addons/postprocessing/SMAAPass.js';
import {toCreasedNormals} from 'three/addons/utils/BufferGeometryUtils.js';
import {hasBT,hasQi,hasTaptic,batteryCapacity} from './data.js';
import {appearance,surfaceSpec} from './catalog.js';

// The source plate is the dimensional reference. Tangencies of its projected
// outline give a radius at each corner; the largest planar triangle gives the
// face plane (the button's raised face is deliberately not the reference).
export function measureFaceplate(geometry){
 geometry.computeBoundingBox();const bounds=geometry.boundingBox.clone(),size=bounds.getSize(new THREE.Vector3()),p=geometry.attributes.position;
 const corners=[];for(const sx of [-1,1])for(const sy of [-1,1]){let tangent=-Infinity;for(let i=0;i<p.count;i++)if(Math.abs(p.getX(i)-(sx<0?bounds.min.x:bounds.max.x))<.00001)tangent=Math.max(tangent,sy*p.getY(i));corners.push((sy<0?-bounds.min.y:bounds.max.y)-tangent);}
 const flat=geometry.index?geometry.toNonIndexed():geometry,q=flat.attributes.position;let largest=0,faceZ=0;
 for(let i=0;i<q.count;i+=3){const a=new THREE.Vector3().fromBufferAttribute(q,i),b=new THREE.Vector3().fromBufferAttribute(q,i+1),c=new THREE.Vector3().fromBufferAttribute(q,i+2),n=b.clone().sub(a).cross(c.clone().sub(a)),area=n.length();if(n.z/area>.99999&&area>largest){largest=area;faceZ=(a.z+b.z+c.z)/3;}}
 if(flat!==geometry)flat.dispose();const radius=corners.reduce((a,b)=>a+b,0)/4;
 if(!Number.isFinite(radius)||radius<=0||Math.max(...corners)-Math.min(...corners)>.003)throw new Error('Front plate outline needs a new shell adapter.');
 return {width:size.x,height:size.y,radius,cornerRadii:corners,faceZ,bounds};
}

// Weld only for smooth bevel normals, then give every coplanar face triangle
// an exact axial normal. Long screen-to-corner triangles cannot pull a highlight
// across the face. The source bevel and screen/wheel openings remain intact.
export function finishPlateNormals(geometry){
 const g=toCreasedNormals(geometry,Math.PI/3),p=g.attributes.position,n=g.attributes.normal;
 for(let i=0;i<p.count;i+=3){const a=new THREE.Vector3().fromBufferAttribute(p,i),b=new THREE.Vector3().fromBufferAttribute(p,i+1),c=new THREE.Vector3().fromBufferAttribute(p,i+2),v=b.sub(a).cross(c.sub(a)).normalize();if(Math.abs(v.z)>.99999)for(let j=0;j<3;j++)n.setXYZ(i+j,0,0,Math.sign(v.z));}
 return g;
}

function rounded(w,h,r){
 const s=new THREE.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.absarc(w/2-r,-h/2+r,r,-Math.PI/2,0);s.lineTo(w/2,h/2-r);s.absarc(w/2-r,h/2-r,r,0,Math.PI/2);s.lineTo(-w/2+r,h/2);s.absarc(-w/2+r,h/2-r,r,Math.PI/2,Math.PI);s.lineTo(-w/2,-h/2+r);s.absarc(-w/2+r,-h/2+r,r,Math.PI,Math.PI*1.5);s.closePath();return s;
}

export function buildShellCache(plate){
 const started=performance.now(),wall=.02,bevel=.06,segments=12,width=plate.width+.02,height=plate.height+.02,radius=plate.radius+.01;
 const evaluator=new Evaluator();evaluator.useGroups=false;
 const brush=g=>{const b=new Brush(g);b.updateMatrixWorld();return b;};
 const subtract=(a,g)=>{const b=brush(g),result=evaluator.evaluate(a,b,SUBTRACTION);g.dispose();return result;};
 const extrude=(w,h,r,depth,b)=>finishPlateNormals(new THREE.ExtrudeGeometry(rounded(w-2*b,h-2*b,r-b),{depth:depth-2*b,bevelEnabled:true,bevelSize:b,bevelThickness:b,bevelSegments:segments,curveSegments:16,steps:1}));
 // The cavity trims the front roll at the wall thickness. Account for that
 // trim so the finished shell, not the uncut extrusion, is .39 / .52 deep.
 let tip=0;for(let i=1;i<=segments;i++){const a=(i-1)/segments*Math.PI/2,b=i/segments*Math.PI/2,x0=bevel*Math.sin(a),x1=bevel*Math.sin(b),x=bevel-wall;if(x>=x0&&x<=x1)tip=THREE.MathUtils.lerp(bevel*Math.cos(a),bevel*Math.cos(b),(x-x0)/(x1-x0));}
 const trim=bevel-tip,frontZ=plate.faceZ-.002,variants=new Map();
 for(const body of ['thin','thick']){
  const depth=body==='thin'?.39:.52,rearZ=frontZ-depth,rawDepth=depth+trim;
  const outer=extrude(width,height,radius,rawDepth,bevel);outer.translate(0,0,rearZ+bevel);
  const inner=extrude(width-2*wall,height-2*wall,radius-wall,rawDepth+.3,bevel-wall);inner.translate(0,0,rearZ+wall+bevel-wall);
  const outerBrush=brush(outer),hollow=subtract(outerBrush,inner);outer.dispose();
  const centerZ=(rearZ+frontZ)/2;
  for(const layout of ['original','usbc','moon']){
   let result=hollow;
   const cut=g=>{const previous=result;result=subtract(result,g);if(previous!==hollow)previous.geometry.dispose();};
   const slot=(w,h,x,top=false)=>{const g=new THREE.ExtrudeGeometry(rounded(w,h,Math.min(h/2,.04)),{depth:.20,bevelEnabled:false,curveSegments:12});g.rotateX(Math.PI/2);g.translate(x,(top?height/2:-height/2)+.10,centerZ);cut(g);};
   if(layout!=='usbc')slot(.83,.10,0);if(layout!=='original')slot(.35,.125,layout==='moon'?.8:0);
   const jack=new THREE.CylinderGeometry(.07,.07,.20,40);jack.translate(.78,height/2,centerZ);cut(jack);slot(.35,.06,-.68,true);
   const geometry=result.geometry;geometry.computeBoundingBox();geometry.computeBoundingSphere();
   variants.set(body+':'+layout,{geometry,depth,rearZ,frontZ,centerZ,width,height,radius,wall});
  }
  hollow.geometry.dispose();
 }
 return {variants,buildMs:Math.round(performance.now()-started),plate:{width:plate.width,height:plate.height,radius:plate.radius,cornerRadii:plate.cornerRadii,faceZ:plate.faceZ},wall};
}

// Model adapter: bake every mesh's matrixWorld into its geometry before editing.
// This supplied GLB has X width, Y height and +Z facing forward after its parent
// transforms. A replacement model should be normalized to this convention here.
export async function createViewer(host,initial){
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(36,1,.1,80);camera.position.set(4,1.8,8);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(max-width: 700px)').matches?1.25:1.5));renderer.setSize(host.clientWidth,host.clientHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;host.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','Interactive 3D iPod. Drag to rotate and scroll to zoom.');renderer.domElement.tabIndex=0;
 const pmrem=new THREE.PMREMGenerator(renderer);pmrem.compileEquirectangularShader();const hdr=await new RGBELoader().loadAsync(window.IPOD_HDR_DATA||'./assets/studio_small_09_1k.hdr');const environment=pmrem.fromEquirectangular(hdr);scene.environment=environment.texture;scene.environmentIntensity=.75;scene.environmentRotation.y=.55;hdr.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xffffff,0x6e7789,.75));const key=new THREE.DirectionalLight(0xffffff,2);key.position.set(-3,6,7);scene.add(key);const edge=new THREE.DirectionalLight(0xcadfff,1.5);edge.position.set(4,2,-4);scene.add(edge);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=5;controls.maxDistance=14;controls.minPolarAngle=.22;controls.maxPolarAngle=Math.PI-.22;controls.target.set(0,0,0);
 let flight=null,lastInteraction=performance.now(),interacting=false;const touch=()=>{lastInteraction=performance.now();controls.autoRotate=false;};controls.addEventListener('start',()=>{flight=null;interacting=true;touch();});controls.addEventListener('end',()=>{interacting=false;touch();});document.addEventListener('pointerdown',touch);host.addEventListener('wheel',touch,{passive:true});controls.autoRotateSpeed=.45;
 const product=new THREE.Group();scene.add(product);const front=new THREE.Group(),rear=new THREE.Group(),inside=new THREE.Group();product.add(front,rear,inside);
 let gltf;try{gltf=await new GLTFLoader().loadAsync(window.IPOD_MODEL_DATA||'./assets/ipod_classic.glb');}catch(err){renderer.dispose();host.replaceChildren();throw err;}
 gltf.scene.updateMatrixWorld(true);const origin=new THREE.Box3().setFromObject(gltf.scene).getCenter(new THREE.Vector3());const parts={};
 // Planar UVs keep all multicolor parts vertical in canonical world space.
 function verticalUV(g){g.computeBoundingBox();const b=g.boundingBox,p=g.attributes.position,uv=[];for(let i=0;i<p.count;i++)uv.push((p.getX(i)-b.min.x)/Math.max(.001,b.max.x-b.min.x),(p.getY(i)-b.min.y)/Math.max(.001,b.max.y-b.min.y));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));}
 gltf.scene.traverse(node=>{if(!node.isMesh||!['Material.006','Screen','Wheel'].includes(node.material.name))return;let geometry=node.geometry.clone().applyMatrix4(node.matrixWorld);geometry.translate(-origin.x,-origin.y,-origin.z);const name=node.material.name;
  if(name==='Material.006')geometry=finishPlateNormals(geometry);
  let mat=new THREE.MeshPhysicalMaterial({color:0xaaaaaa,roughness:.25,metalness:.5});
  // The author's faceplate material also contains the raised center button.
  // Split its triangles by radius so button color really is independent.
  if(name==='Material.006'){
   const flat=geometry.index?geometry.toNonIndexed():geometry;const p=flat.attributes.position;const a=[],b=[];for(let i=0;i<p.count;i+=3){let button=true;for(let j=0;j<3;j++)if(Math.hypot(p.getX(i+j)+.002,p.getY(i+j)+.872)>.4)button=false;(button?b:a).push(i,i+1,i+2);}
   const split=indices=>{const g=new THREE.BufferGeometry();for(const key of Object.keys(flat.attributes)){const attr=flat.attributes[key];const values=[];for(const i of indices)for(let j=0;j<attr.itemSize;j++)values.push(attr.array[i*attr.itemSize+j]);g.setAttribute(key,new THREE.Float32BufferAttribute(values,attr.itemSize));}return g;};
   geometry=split(a);const buttonGeometry=split(b);verticalUV(buttonGeometry);const button=new THREE.Mesh(buttonGeometry,new THREE.MeshPhysicalMaterial({roughness:.35}));front.add(button);parts.button=button;
  }
  if(name==='Material.006')verticalUV(geometry);
  if(name==='Screen'){const p=geometry.attributes.position;const uv=[];for(let i=0;i<p.count;i++)uv.push((p.getX(i)+1.028)/2.06,(p.getY(i)-.318)/1.54);geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));mat=new THREE.MeshPhysicalMaterial({roughness:.3,metalness:0,emissive:0xffffff,color:0x000000,emissiveIntensity:1,toneMapped:false,envMapIntensity:0});}
  if(name==='Wheel')mat=new THREE.MeshPhysicalMaterial({roughness:.5,metalness:0});
  const mesh=new THREE.Mesh(geometry,mat);mesh.name=name;parts[name]=mesh;front.add(mesh);
 });
 function texture(draw,w=512,h=512){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
 const surface=(color,rough=.5,metal=.1)=>new THREE.MeshPhysicalMaterial({color,roughness:rough,metalness:metal});
 function box(w,h,d,color,x,y,z,group=inside){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),surface(color));m.position.set(x,y,z);group.add(m);return m;}
 function label(parent,text,w,h,z,color='#ffffff',background='#234b3a'){const map=texture((c,cw,ch)=>{c.fillStyle=background;c.fillRect(0,0,cw,ch);c.fillStyle=color;c.textAlign='center';c.textBaseline='middle';c.font='600 44px Arial';c.fillText(text,cw/2,ch/2);},512,128);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshPhysicalMaterial({map,transparent:false,roughness:1,emissive:0xffffff,emissiveMap:map,emissiveIntensity:.3}));m.position.z=z;parent.add(m);return m;}
 const logic=box(2.14,3.65,.045,'#204b39',0,0,-.145);label(logic,'A1238 · LOGIC',1.2,.18,.026);const flash=new THREE.Group();inside.add(flash);flash.position.set(0,1.05,-.015);const pcb=box(2.16,1.82,.07,'#2d8059',0,0,0,flash);const flabel=label(flash,'iFlash QUAD',1.40,.23,.12);flabel.position.y=-.77;
 const sockets=[];for(let i=0;i<4;i++){const card=box(.34,.58,.06,'#202428',-.64+i*.425,-.14,.067,flash);const stripe=box(.27,.1,.01,'#caab54',0,-.22,.04,new THREE.Group());card.add(stripe);sockets.push(card);}
 const battery=new THREE.Group();inside.add(battery);battery.position.set(0,-.79,-.01);const cell=box(1.48,1.60,.13,'#d1d2d0',0,0,0,battery);const tape=box(1.50,.17,.135,'#dbb650',0,.71,0,battery);const battLabel=label(battery,'2000 mAh',1.20,.28,.072,'#343a3e','#d1d2d0');
 const bt=box(.64,.40,.065,'#25628c',-.65,-1.57,.04);label(bt,'BT',.36,.17,.035,'#ffffff','#25628c');
 const taptic=box(.65,.20,.10,'#60656b',.61,-1.64,.04);label(taptic,'TAPTIC',.5,.10,.055,'#fff','#60656b');
 const airtag=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,.09,40),surface('#deded7',.28,.7));airtag.rotation.x=Math.PI/2;airtag.position.set(.61,-1.14,.085);inside.add(airtag);
 const qi=new THREE.Mesh(new THREE.TorusGeometry(.72,.028,8,64),surface('#bb7946',.3,.6));qi.position.set(0,-.15,-.09);inside.add(qi);
 // A single hollow steel mesh replaces all three legacy back pieces. CSG
 // runs once; body and connector changes swap cached geometry without scaling.
 const shellCache=buildShellCache(measureFaceplate(parts['Material.006'].geometry));
 for(const variant of shellCache.variants.values())verticalUV(variant.geometry);
 const shell=new THREE.Mesh(shellCache.variants.get('thin:original').geometry,surface('#aaa',.2,1));shell.name='Procedural back shell';rear.add(shell);let activeShell;
 const bottomEdge=new THREE.Group(),topEdge=new THREE.Group();rear.add(bottomEdge,topEdge);
 function edgePlane(shape,mat,parent,y=0,top=false){const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape,20),mat);mesh.rotation.x=top?-Math.PI/2:Math.PI/2;mesh.position.y=y;parent.add(mesh);return mesh;}
 function port(w,h,x){const g=new THREE.Group();g.position.x=x;bottomEdge.add(g);const ring=rounded(w-.003,h-.003,Math.min(h/2-.002,.038));ring.holes.push(new THREE.Path(rounded(w-.028,h-.025,Math.min((h-.025)/2,.03)).getPoints(20)));const lip=edgePlane(ring,new THREE.MeshPhysicalMaterial({metalness:.3,roughness:.3,side:THREE.DoubleSide}),g,.001);
 const cavity=box(w-.008,.014,h-.008,'#07090c',0,.05,0,g);cavity.material.roughness=.95;cavity.material.metalness=0;const tongue=box(w*.65,.014,.025,'#667078',0,.026,0,g);return {group:g,lip,w,h};}
 const dock=port(.83,.10,0),usb=port(.35,.125,0);
 const headphoneRing=new THREE.Shape();headphoneRing.absarc(0,0,.069,0,Math.PI*2);const headphoneHole=new THREE.Path();headphoneHole.absarc(0,0,.053,0,Math.PI*2,true);headphoneRing.holes.push(headphoneHole);
 const jack=edgePlane(headphoneRing,surface('#171b20',.4,0),topEdge,-.001,true);jack.material.side=THREE.DoubleSide;jack.position.x=.78;
 const jackInterior=new THREE.Mesh(new THREE.CylinderGeometry(.052,.052,.014,32),surface('#07090c',.9,0));jackInterior.position.set(.78,-.045,0);topEdge.add(jackInterior);
 const holdWell=box(.343,.012,.054,'#07090c',-.68,-.038,0,topEdge);
 const hold=box(.325,.012,.045,'#fff',-.68,-.012,0,topEdge),holdSlider=box(.12,.018,.044,'#fff',-.74,-.001,0,topEdge);
 const engraving=new THREE.Mesh(new THREE.PlaneGeometry(1.85,2.9),new THREE.MeshPhysicalMaterial({transparent:true,depthWrite:false,roughness:.8,metalness:.1}));engraving.rotation.y=Math.PI;engraving.position.set(0,0,-.201);rear.add(engraving);
 const glass=new THREE.Mesh(new THREE.PlaneGeometry(2.055,1.535),new THREE.MeshPhysicalMaterial({color:'#fff',roughness:.035,metalness:0,transmission:0,thickness:.008,ior:1.46,clearcoat:1,clearcoatRoughness:.04,envMapIntensity:.3,transparent:true,opacity:.055,depthWrite:false}));glass.position.set(.002,1.088,.158);front.add(glass);
 // Canvas textures deliberately approximate Atomic patterns. Seeded noise is
 // deterministic, so a saved link reproduces the same appearance every time.
 function fillPart(c,w,h,part){const colors=part.colors;const paint=colors.length>1?c.createLinearGradient(0,0,0,h):colors[0];if(colors.length>1)colors.forEach((v,i)=>paint.addColorStop(i/(colors.length-1),v));c.fillStyle=paint;c.fillRect(0,0,w,h);if(part.family==='atomic'&&colors.length>1){let seed=[...part.id].reduce((a,x)=>a+x.charCodeAt(0),19);const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};for(let i=0;i<320;i++){c.globalAlpha=.05+rand()*.15;c.fillStyle=colors[Math.floor(rand()*colors.length)];c.beginPath();c.ellipse(rand()*w,rand()*h,2+rand()*45,1+rand()*18,rand()*Math.PI,0,Math.PI*2);c.fill();}c.globalAlpha=1;}}
 const luminance=hex=>{const rgb=hex.slice(1).match(/../g).map(n=>parseInt(n,16));return (rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722)/255;};
 function applyPart(mesh,part,xray=false,keepMap=false){const spec=surfaceSpec(part),alpha=xray?.12:1;material(mesh,part.colors.length>1||keepMap?'#ffffff':part.hex,spec.roughness,spec.metalness,alpha);const m=mesh.material;const transmission=part.clear&&!xray?.9:0,iridescence=/rainbow|polychrome|iridescent/i.test(part.id+' '+part.family)?.75:0,anisotropy=/brushed/i.test(part.id+' '+part.name)?.6:0;if(!!m.transmission!==!!transmission||!!m.iridescence!==!!iridescence||!!m.anisotropy!==!!anisotropy)m.needsUpdate=true;m.transmission=transmission;m.thickness=part.clear?.025:0;m.ior=1.35;m.attenuationColor.set(part.hex);m.attenuationDistance=1.5;m.iridescence=iridescence;m.iridescenceThicknessRange=[100,400];m.anisotropy=anisotropy;m.anisotropyRotation=Math.PI/2;m.clearcoat=part.material==='metal'&&part.family!=='chrome'&&part.family!=='matte'?.3:spec.clearcoat;m.clearcoatRoughness=.2;m.emissive.set(part.glow?part.hex:'#000000');m.emissiveIntensity=part.glow?.22:0;mesh.renderOrder=xray?4:0;if(!keepMap&&mesh.userData.catalogId!==part.id){mesh.userData.catalogId=part.id;replaceMap(mesh,part.colors.length>1?texture((c,w,h)=>fillPart(c,w,h,part)):null);}}

 let state=initial,lastWheel='',lastScreen='',lastEngraving='',lastBattery='',lastFlash='';const targets=new Map();
 const material=(mesh,color,rough,metal,alpha=1)=>{targets.set(mesh,{color:new THREE.Color(color),roughness:rough,metalness:metal,opacity:alpha});mesh.material.transparent=alpha<1;mesh.material.depthWrite=alpha===1;mesh.material.side=alpha<1?THREE.DoubleSide:THREE.FrontSide;};
 const replaceMap=(m,map)=>{m.material.map?.dispose();m.material.map=map;if(m.material.emissiveMap)m.material.emissiveMap=map;if(m.name==='Screen'){m.material.emissiveMap=map;m.material.roughness=.85;}m.material.needsUpdate=true;};
 function update(s){touch();host.dataset.pose='';state=s;const frontPart=appearance(s,'front'),wheelPart=appearance(s,'wheel'),buttonPart=appearance(s,'button'),backPart=appearance(s,'finish'),bezelPart=appearance(s,'bezel'),holdPart=appearance(s,'hold');
  applyPart(parts['Material.006'],frontPart,s.xray);applyPart(parts.button,buttonPart,s.xray);applyPart(shell,backPart,s.xray);applyPart(dock.lip,bezelPart,s.xray);applyPart(usb.lip,bezelPart,s.xray);applyPart(jack,holdPart,s.xray);applyPart(hold,holdPart,s.xray);applyPart(holdSlider,{...holdPart,id:holdPart.id+'-slider',hex:holdPart.id.includes('u2')?'#c8102e':holdPart.hex,colors:[holdPart.id.includes('u2')?'#c8102e':holdPart.hex]},s.xray);
  activeShell=shellCache.variants.get(s.body+':'+(s.connectivity==='original'?'original':s.connectivity==='moon'?'moon':'usbc'));shell.geometry=activeShell.geometry;bottomEdge.position.set(0,-activeShell.height/2,activeShell.centerZ);topEdge.position.set(0,activeShell.height/2,activeShell.centerZ);engraving.position.z=activeShell.rearZ-.003;
  dock.group.visible=s.connectivity==='original'||s.connectivity==='moon';usb.group.visible=s.connectivity!=='original';usb.group.position.x=s.connectivity==='moon'?.80:0;glass.visible=!s.xray;

  const wkey=s.wheel+s.button;if(wkey!==lastWheel){lastWheel=wkey;replaceMap(parts.Wheel,texture((c,w,h)=>{fillPart(c,w,h,wheelPart);c.save();c.beginPath();c.arc(w/2,h/2,w*.175,0,Math.PI*2);c.clip();fillPart(c,w,h,buttonPart);c.restore();c.fillStyle=luminance(wheelPart.hex)<.48?'#eeeff1':'#404750';c.textAlign='center';c.textBaseline='middle';c.font='500 32px Arial';c.fillText('MENU',256,66);c.font='bold 37px Arial';c.fillText('◀◀',67,256);c.fillText('▶▶',443,256);c.fillText('▶Ⅱ',256,442);}));}applyPart(parts.Wheel,wheelPart,s.xray,true);
  const skey=s.firmware+s.capacity+s.storage+s.screen;if(skey!==lastScreen){lastScreen=skey;replaceMap(parts.Screen,texture((c,w,h)=>{const rb=s.firmware==='rockbox';c.fillStyle=rb?'#131b27':'#f5f7ee';c.fillRect(0,0,w,h);c.fillStyle=rb?'#2e4865':'#c7d1d6';c.fillRect(0,0,w,44);c.fillStyle=rb?'#e8eef7':'#1e282a';c.font='600 25px Arial';c.fillText(rb?'Rockbox':'iPod',18,31);c.strokeStyle=rb?'#c6dce8':'#445755';c.lineWidth=3;c.strokeRect(459,13,33,17);c.fillStyle='#4e7967';c.fillRect(462,16,26,11);c.fillStyle=rb?'#76aee2':'#2d7fbe';c.fillRect(0,54,w,54);c.fillStyle='#fff';c.font='600 30px Arial';c.fillText(rb?'Files':'Music',20,91);c.fillText('›',474,91);c.fillStyle=rb?'#d1dcea':'#333b3e';c.font='28px Arial';const items=rb?['Database','Now Playing','Settings','Playlists']:['Videos','Photos','Podcasts','Settings'];items.forEach((x,i)=>{c.fillText(x,20,145+i*53);c.fillText('›',474,145+i*53);});c.font='19px Arial';c.fillStyle=rb?'#91a9c2':'#687176';c.fillText(s.storage==='hdd'?'80 GB':(s.capacity>=1024?s.capacity/1024+' TB':s.capacity+' GB'),20,366);},512,384));}parts.Screen.material.transparent=s.xray;parts.Screen.material.opacity=s.xray?.15:1;parts.Screen.material.depthWrite=!s.xray;
  const bk=s.connectivity==='moon'?'KIT BATTERY':s.battery==='stock'?'650 mAh':batteryCapacity(s)+' mAh';if(bk!==lastBattery){lastBattery=bk;replaceMap(battLabel,texture((c,w,h)=>{c.fillStyle='#d1d2d0';c.fillRect(0,0,w,h);c.fillStyle='#303538';c.font='600 46px Arial';c.textAlign='center';c.fillText(bk,w/2,78);},512,128));}
  battery.scale.set(s.battery==='stock'&&s.connectivity!=='moon'?.65:1,s.battery==='stock'&&s.connectivity!=='moon'?.65:1,['3000','3800'].includes(s.battery)&&s.connectivity!=='moon'?1.3:1);
  flash.visible=true;pcb.material.color.set(s.storage==='hdd'?'#b5bbc0':s.storage==='sata'?'#264758':'#2d8059');sockets.forEach((x,i)=>x.visible=s.storage==='quad'||(i===1&&s.storage!=='hdd'));if(s.storage!==lastFlash){lastFlash=s.storage;replaceMap(flabel,texture((c,w,h)=>{c.fillStyle=s.storage==='hdd'?'#b5bbc0':'#24583e';c.fillRect(0,0,w,h);c.fillStyle=s.storage==='hdd'?'#30383f':'#fff';c.font='bold 44px Arial';c.textAlign='center';c.fillText(s.storage==='hdd'?'80GB HDD':'iFlash '+s.storage.toUpperCase(),w/2,80);},512,128));}
  bt.visible=hasBT(s);taptic.visible=hasTaptic(s);airtag.visible=s.airtag==='on';qi.visible=hasQi(s);
  const engravingKey=[s.engraving,s.finish,s.engravingStyle,s.capacityMark].join('|');if(engravingKey!==lastEngraving){lastEngraving=engravingKey;replaceMap(engraving,texture((c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle=luminance(backPart.hex)<.5?'#e8e9eb':'#353b42';c.textAlign='center';c.textBaseline='middle';
   // Simple Apple mark and typeset labels approximate factory engraving. Blank
   // removes all factory marks; custom free text is always an independent extra.
   if(s.engravingStyle!=='blank'){c.save();c.translate(w/2,175);c.beginPath();c.ellipse(-22,5,48,61,-.12,0,Math.PI*2);c.ellipse(23,5,48,61,.12,0,Math.PI*2);c.fill();c.globalCompositeOperation='destination-out';c.beginPath();c.arc(69,-15,23,0,Math.PI*2);c.fill();c.globalCompositeOperation='source-over';c.beginPath();c.ellipse(12,-76,13,28,.7,0,Math.PI*2);c.fill();c.restore();}
   if(['universal','capacity','u2'].includes(s.engravingStyle)){c.font='500 48px Arial';c.fillText('iPod',w/2,340);}
   if(s.engravingStyle==='universal'){c.font='22px Arial';c.fillText('Designed by Apple in California',w/2,650);c.fillText('Model A1238',w/2,683);}
   if(s.engravingStyle==='u2'){c.font='700 80px Arial';c.fillText('U2',w/2,525);c.font='22px Arial';c.fillText('SPECIAL EDITION',w/2,590);}
   if(s.engravingStyle==='capacity'){c.font='500 58px Arial';c.fillText(s.capacityMark,w/2,625,450);}
   c.font='500 30px Arial';const lines=s.engraving.match(/.{1,30}(\s|$)|.{1,30}/g)||[];lines.slice(0,3).forEach((line,i)=>c.fillText(line,w/2,780+i*43));},640,1024));}engraving.visible=s.engravingStyle!=='blank'||!!s.engraving;

 }
 function angle(view,animate=true){host.dataset.pose='';touch();controls.autoRotate=false;const pos={front:[0,0,8],back:[0,0,-8],three:[4,1.8,8],exploded:[6,2,10]}[view];if(animate)flight=new THREE.Vector3(...pos);else camera.position.set(...pos);}
 // A baked radial alpha shadow avoids a second shadow-map render per frame.
 const shadowMap=texture((c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,5,w/2,h/2,w/2);g.addColorStop(0,'rgba(17,24,31,.22)');g.addColorStop(.4,'rgba(17,24,31,.10)');g.addColorStop(1,'rgba(17,24,31,0)');c.fillStyle=g;c.fillRect(0,0,w,h);},128,128);
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(4.6,2.8),new THREE.MeshPhysicalMaterial({map:shadowMap,color:'#101820',transparent:true,opacity:.35,depthWrite:false,roughness:1,metalness:0}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-2.12;scene.add(shadow);
 const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,samples:Math.min(4,renderer.capabilities.maxSamples)});
 const composer=new EffectComposer(renderer,target);composer.addPass(new RenderPass(scene,camera));const ao=new SSAOPass(scene,camera,1,1,12);ao.kernelRadius=.13;ao.minDistance=.0003;ao.maxDistance=.012;ao.copyMaterial.opacity=.2;composer.addPass(ao);
 // Selective bloom: all non-screen meshes become opaque black occluders for
 // this pass. Bright chrome and white plastic never enter the bloom signal.
 const bloomComposer=new EffectComposer(renderer);bloomComposer.renderToScreen=false;bloomComposer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.12,.25,.55);bloomComposer.addPass(bloom);
 const combine=new ShaderPass({uniforms:{tDiffuse:{value:null},bloomTexture:{value:null}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform sampler2D tDiffuse;uniform sampler2D bloomTexture;varying vec2 vUv;void main(){vec4 base=texture2D(tDiffuse,vUv);vec3 glow=texture2D(bloomTexture,vUv).rgb;gl_FragColor=vec4(base.rgb+glow,base.a);}'});composer.addPass(combine);composer.addPass(new OutputPass());const smaa=new SMAAPass();composer.addPass(smaa);
 const dark=new THREE.MeshPhysicalMaterial({color:0x000000,metalness:0,roughness:1,envMapIntensity:0});const savedMaterials=new Map();
 function renderFrame(){const environment=scene.environment;scene.environment=null;scene.traverse(m=>{if(!m.isMesh||m===parts.Screen)return;savedMaterials.set(m,m.material);m.material=dark;});const oldGlass=glass.visible;glass.visible=false;const intensity=parts.Screen.material.emissiveIntensity;parts.Screen.material.emissiveIntensity=1;bloomComposer.render();parts.Screen.material.emissiveIntensity=intensity;glass.visible=oldGlass;savedMaterials.forEach((mat,m)=>m.material=mat);savedMaterials.clear();scene.environment=environment;combine.uniforms.bloomTexture.value=bloom.renderTargetsHorizontal[0].texture;ao.enabled=!state.xray&&!appearance(state,'front').clear;composer.render();}
 let qualityScale=1;const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);composer.setPixelRatio(renderer.getPixelRatio()*qualityScale);composer.setSize(w,h);ao.setSize(Math.ceil(w*renderer.getPixelRatio()*qualityScale*.65),Math.ceil(h*renderer.getPixelRatio()*qualityScale*.65));bloomComposer.setPixelRatio(.6);bloomComposer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};const ro=new ResizeObserver(resize);ro.observe(host);resize();
 renderer.domElement.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();touch();flight=null;const a=e.key==='ArrowLeft'?.15:e.key==='ArrowRight'?-.15:0;camera.position.applyAxisAngle(new THREE.Vector3(0,1,0),a);if(e.key==='ArrowUp')camera.position.y+=.3;if(e.key==='ArrowDown')camera.position.y-=.3;}});
 let alive=true,lastTime=performance.now(),sampleStart=lastTime,frames=0,fps=0,slowWindows=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function metrics(){return {fps,qualityScale,pixelRatio:renderer.getPixelRatio(),width:host.clientWidth,height:host.clientHeight,msaa:target.samples,hdri:'Studio Small 09 · 1K',bodyDepth:activeShell.depth,shellTriangles:shell.geometry.attributes.position.count/3,shellCacheMs:shellCache.buildMs,shellVariants:shellCache.variants.size,plate:shellCache.plate,wall:shellCache.wall,portCenter:+bottomEdge.position.z.toFixed(4),portY:+bottomEdge.position.y.toFixed(4),topCenter:+topEdge.position.z.toFixed(4),portNormal:[0,-1,0],ports:[dock,usb].filter(p=>p.group.visible).map(p=>({kind:p===dock?'30-pin':'USB-C',width:p.w,height:p.h,center:[p.group.position.x,bottomEdge.position.y,bottomEdge.position.z],normal:[0,-1,0],rearOffset:rear.position.z})),camera:camera.position.toArray().map(v=>+v.toFixed(3)),idle:controls.autoRotate,ao:ao.enabled};}
 function frame(){if(!alive)return;requestAnimationFrame(frame);const time=performance.now(),dt=Math.min((time-lastTime)/1000,.1);lastTime=time;if(document.hidden){sampleStart=time;frames=0;return;}const lerp=reduced.matches?1:1-Math.exp(-8*dt);if(flight){const now=new THREE.Spherical().setFromVector3(camera.position),to=new THREE.Spherical().setFromVector3(flight);now.radius=THREE.MathUtils.lerp(now.radius,to.radius,lerp);now.phi=THREE.MathUtils.lerp(now.phi,to.phi,lerp);now.theta+=Math.atan2(Math.sin(to.theta-now.theta),Math.cos(to.theta-now.theta))*lerp;camera.position.setFromSpherical(now);if(camera.position.distanceTo(flight)<.015)flight=null;}
 const explode=state.view==='exploded';front.position.z=THREE.MathUtils.lerp(front.position.z,explode?1.35:0,lerp);rear.position.z=THREE.MathUtils.lerp(rear.position.z,explode?-1.2:0,lerp);inside.position.z=THREE.MathUtils.lerp(inside.position.z,explode?.25:0,lerp);
 for(const [m,t]of targets){m.material.color.lerp(t.color,lerp);for(const k of ['roughness','metalness','opacity'])m.material[k]=THREE.MathUtils.lerp(m.material[k],t[k],lerp);}controls.autoRotate=!reduced.matches&&!interacting&&!flight&&!explode&&time-lastInteraction>7000;controls.update(dt);renderFrame();frames++;if(!flight&&Math.abs(front.position.z-(explode?1.35:0))<.001&&Math.abs(rear.position.z-(explode?-1.2:0))<.001){host.dataset.pose=state.view+':'+state.body+':'+state.connectivity;host.dataset.renderMetrics=JSON.stringify(metrics());}
 if(time-sampleStart>2000){fps=Math.round(frames*1000/(time-sampleStart));host.dataset.renderMetrics=JSON.stringify(metrics());frames=0;sampleStart=time;if(fps<28)slowWindows++;else slowWindows=0;if(slowWindows>=3&&qualityScale>.65){qualityScale=Math.max(.65,qualityScale-.15);slowWindows=0;resize();}}
 }
 update(initial);angle(initial.view,false);frame();return {update,angle,metrics,dispose(){alive=false;ro.disconnect();controls.dispose();document.removeEventListener('pointerdown',touch);composer.dispose();bloomComposer.dispose();ao.dispose();bloom.dispose();smaa.dispose();dark.dispose();renderer.dispose();environment.dispose();for(const v of shellCache.variants.values())v.geometry.dispose();scene.traverse(x=>{x.geometry?.dispose();x.material?.map?.dispose();x.material?.dispose();});}};
}
