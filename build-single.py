"""Regenerate the portable HTML from the editable dist/ source files."""
from pathlib import Path
import base64, json, subprocess
root=Path(__file__).resolve().parent
source=root/'dist'
html=(source/'index.html').read_text()
css=(source/'style.css').read_text()
script=subprocess.run(['node', str(root/'tools/bundle-portable.mjs')], cwd=root, check=True, capture_output=True, text=True).stdout
catalog_json=(source/'eoe-color-catalog.json').read_text()
json.loads(catalog_json)
model='data:model/gltf-binary;base64,'+base64.b64encode((source/'assets/ipod_classic.glb').read_bytes()).decode()
hdr='data:application/octet-stream;base64,'+base64.b64encode((source/'assets/studio_small_09_1k.hdr').read_bytes()).decode()
shell='data:model/gltf-binary;base64,'+base64.b64encode((source/'assets/shells.glb').read_bytes()).decode()
html=html.replace('<link rel="stylesheet" href="./style.css">','<style>'+css+'</style>')
html=html.replace('<script type="module" src="./app.js"></script>','<script>globalThis.IPOD_EOE_CATALOG='+catalog_json.replace('</','<\\/')+';window.IPOD_MODEL_DATA="'+model+'";window.IPOD_HDR_DATA="'+hdr+'";window.IPOD_SHELL_DATA="'+shell+'";</script><script type="module">'+script.replace('</script','<\\/script')+'</script>')
(root/'outputs').mkdir(exist_ok=True)
(root/'outputs/classic-studio.html').write_text(html)
print('Generated outputs/classic-studio.html ('+str(len(html.encode()))+' bytes)')
