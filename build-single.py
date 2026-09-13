"""Regenerate the portable HTML from the editable dist/ source files."""
from pathlib import Path
import base64, re
root=Path(__file__).resolve().parent
source=root/'dist'
html=(source/'index.html').read_text()
css=(source/'style.css').read_text()
data=re.sub(r'\bexport\s+', '', (source/'data.js').read_text())
viewer=(source/'viewer.js').read_text()
viewer=re.sub(r"import \{COLORS.*?from './data.js';\n",'',viewer)
viewer=viewer.replace('export async function','async function')
app=(source/'app.js').read_text()
app=re.sub(r"^import .*?from './data.js';\n",'',app)
app=app.replace("const {createViewer}=await import('./viewer.js');",'')
model='data:model/gltf-binary;base64,'+base64.b64encode((source/'assets/ipod_classic.glb').read_bytes()).decode()
script='\n// ===== EDITABLE OPTION DATA =====\n'+data+'\n// ===== 3D VIEWER =====\n'+viewer+'\n// ===== APP INTERFACE =====\n'+app
html=html.replace('<link rel="stylesheet" href="./style.css">','<style>'+css+'</style>')
html=html.replace('<script type="module" src="./app.js"></script>','<script>window.IPOD_MODEL_DATA="'+model+'";</script><script type="module">'+script.replace('</script','<\\/script')+'</script>')
(root/'outputs').mkdir(exist_ok=True)
(root/'outputs/classic-studio.html').write_text(html)
print('Generated outputs/classic-studio.html ('+str(len(html.encode()))+' bytes)')
