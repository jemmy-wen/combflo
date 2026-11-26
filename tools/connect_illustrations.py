import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
records=json.loads((ROOT/'image-generation-log.json').read_text())
files={r['id']:r['file'] for r in records}
types={r['id']:r.get('type','prop') for r in records}
files['RC-01']='craftsman-approved.png'
for target,source in {'C-13':'R-11','Q-02':'S-05','I-07':'I-10','I-09':'H-05'}.items():
 if source in files:files[target]=files[source]
# Silhouettes share the exact character alpha; CSS supplies the hidden color.
files['R-01']='craftsman-approved.png'
for i in range(2,5):
 if f'RC-0{i}' in files:files[f'R-0{i}']=files[f'RC-0{i}']
# Site pages load web-sized copies (tools/make_web_assets.py); review pages keep the originals.
WEB_PAGES={'index.html','check.html'}
for path in DIST.glob('*.html'):
 text=path.read_text()
 pre='assets/web/' if path.name in WEB_PAGES else 'assets/'
 for slot,file in files.items():
  pattern=r'(<(?:div|span)\b[^>]*data-slot="'+re.escape(slot)+r'"[^>]*>)(.*?)(</(?:div|span)>)'
  def inject(m):
   if '<img' in m[2]:
    return m[1]+re.sub(r'(<img\b[^>]*src=")[^"]*(")',lambda im:im[1]+pre+file+im[2],m[2],count=1)+m[3]
   css=' class="character-sticker"' if types.get(slot) in ('person','people','office') else ''
   return m[1]+f'<img{css} src="{pre}{file}" alt="" loading="'+('eager' if slot.startswith('H-') else 'lazy')+'">'+m[2]+m[3]
  text=re.sub(pattern,inject,text,flags=re.S)
 if path.name=='components.html':
  text=text.replace('本次先製作師傅形象，其餘三位會在方向確認後延伸；可切換檢視文案與配色。','四位角色立繪已接入，可切換檢視人物、文案與配色。')
 path.write_text(text)
p=DIST/'check.js';s=p.read_text()
icons={k:'assets/web/'+v for k,v in files.items() if k.startswith('I-')}
block='/* illustration-files:start */\n  const ILLUSTRATION_FILES = '+json.dumps(icons,ensure_ascii=False)+';\n  /* illustration-files:end */'
if '/* illustration-files:start */' in s:
 s=re.sub(r'/\* illustration-files:start \*/.*?/\* illustration-files:end \*/',lambda _:block,s,flags=re.S)
else:
 s=s.replace('  const N = QUESTIONS.length;','  const N = QUESTIONS.length;\n  '+block)
for i in range(2,5):
 id=f'RC-0{i}'
 if id in files:
  s=s.replace(f"slot: '{id}',",f"img: 'assets/web/{files[id]}', slot: '{id}',") if f"img: 'assets/web/{files[id]}'" not in s else s
p.write_text(s)
p=DIST/'app.js';s=p.read_text()
for i,name in enumerate(['傳產師傅','辦公室人員','傳產老闆','二代接班人']):
 file='craftsman-approved.png' if i==0 else files.get(f'RC-0{i+1}')
 if file and f"person:'{name}',img:" not in s:s=s.replace(f"person:'{name}'",f"person:'{name}',img:'assets/{file}'")
start=s.find('if(index===0){const img=');end=s.find('\ndocument.querySelectorAll',start)
if start!=-1 and end!=-1:
 s=s[:start]+"const img=document.createElement('img');img.src=p.img;img.alt=p.role+'：'+p.person;img.className='character-sticker';portrait.append(img);}"+s[end:]
p.write_text(s)
# Keep the inventory up to date without changing item specifications.
p=ROOT/'illustration-list.md';s=p.read_text()
for id,file in files.items():
 if id.startswith('R-0'):status=f'CSS 剪影，共用 `dist/assets/{file}`'
 else:status=f'已生成並接入 `dist/assets/{file}`'
 lines=s.splitlines()
 for i,line in enumerate(lines):
  if line.startswith('| '+id+' |') and '已生成並接入' not in line and 'CSS 剪影' not in line:lines[i]=line.rstrip()[:-1].rstrip()+'；'+status+' |'
 s='\n'.join(lines)+'\n'
p.write_text(s)
print('Connected '+', '.join(files))
# refresh the web-sized copies the site loads
import runpy;runpy.run_path(str(ROOT/'tools'/'make_web_assets.py'),run_name='__main__')
