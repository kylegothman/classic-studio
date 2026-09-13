"""Regenerate the portable HTML from the editable dist/ source files."""
from pathlib import Path
import base64, re, json
root=Path(__file__).resolve().parent
source=root/'dist'
html=(source/'index.html').read_text()
css=(source/'style.css').read_text()
def module(name):
    text=(source/name).read_text()
    text=re.sub(r"^import .*?from '\./(?:data|catalog)\.js';\n",'',text,flags=re.M)
    return re.sub(r'\bexport\s+', '', text)
catalog=module('catalog.js')
data=module('data.js')
viewer=module('viewer.js')
app=module('app.js').replace("const {createViewer}=await import('./viewer.js');",'')
catalog_json=(source/'eoe-color-catalog.json').read_text()
json.loads(catalog_json)
model='data:model/gltf-binary;base64,'+base64.b64encode((source/'assets/ipod_classic.glb').read_bytes()).decode()
hdr='data:application/octet-stream;base64,'+base64.b64encode((source/'assets/studio_small_09_1k.hdr').read_bytes()).decode()
script='\n// ===== LOADED EOE CATALOG =====\n'+catalog+'\n// ===== EDITABLE OPTION DATA =====\n'+data+'\n// ===== 3D VIEWER =====\n'+viewer+'\n// ===== APP INTERFACE =====\n'+app
html=html.replace('<link rel="stylesheet" href="./style.css">','<style>'+css+'</style>')
html=html.replace('<script type="module" src="./app.js"></script>','<script>globalThis.IPOD_EOE_CATALOG='+catalog_json.replace('</','<\\/')+';window.IPOD_MODEL_DATA="'+model+'";window.IPOD_HDR_DATA="'+hdr+'";</script><script type="module">'+script.replace('</script','<\\/script')+'</script>')
(root/'outputs').mkdir(exist_ok=True)
(root/'outputs/classic-studio.html').write_text(html)
print('Generated outputs/classic-studio.html ('+str(len(html.encode()))+' bytes)')
