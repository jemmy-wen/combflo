import json,re,html
from pathlib import Path
root=Path(__file__).resolve().parents[1]
records=json.loads((root/'image-generation-log.json').read_text())
files={r['id']:r['file'] for r in records};types={r['id']:r.get('type','') for r in records}
files['RC-01']='craftsman-approved.png'
for target,source in {'C-13':'R-11','Q-02':'S-05','I-07':'I-10','I-09':'H-05','R-01':'RC-01','R-02':'RC-02','R-03':'RC-03','R-04':'RC-04'}.items():
 if source in files:files[target]=files[source]
groups={};group=''
for line in (root/'illustration-list.md').read_text().splitlines():
 if line.startswith('### '):group=line[4:]
 m=re.match(r'\| ([A-Z]+-\d+) \| ([^|]+) \|',line)
 if m:groups.setdefault(group,[]).append((m[1],m[2].strip()))
p=root/'dist/illustrations.html';old=p.read_text();style=re.search(r'<style>(.*?)</style>',old,re.S)[1]
style+=' .silhouette img{filter:brightness(0);opacity:.8}nav{display:flex;flex-wrap:wrap;gap:12px;margin:25px 0}nav a{font-size:13px;text-decoration:underline}section{scroll-margin-top:20px}'
parts=[f'<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CombFlo｜完整素材圖鑑</title><link rel="stylesheet" href="site.css"><style>{style}</style><main><header><div><p>COMBFLO / ILLUSTRATION REVIEW</p><h1>同一間工廠，同一套像素語言。</h1><p>76 個素材位置；包含角色共用剪影與 4 組共用小物。背景保留核准版本。</p></div><a href="index.html">回到網站</a></header>']
parts.append('<nav>'+''.join(f'<a href="#g{i}">{html.escape(g)}</a>' for i,g in enumerate(groups))+'</nav>')
for i,(g,items) in enumerate(groups.items()):
 parts.append(f'<section id="g{i}"><h2>{html.escape(g)}</h2><div class="gallery">')
 for id,name in items:
  file=files.get(id)
  if not file:continue
  cls='silhouette' if id in ['R-01','R-02','R-03','R-04'] else ''
  person=id.startswith('RC-') or types.get(id) in ('person','people','office')
  parts.append(f'<figure class="{cls}"><div class="art" style="height:{300 if person else 205}px"><img class="{"character-sticker" if person else ""}" src="assets/{file}" alt="{html.escape(name)}" loading="lazy"></div><figcaption><small>{id}</small><strong>{html.escape(name)}</strong></figcaption></figure>')
 parts.append('</div></section>')
parts.append('<div class="note">使用內建 imagegen；提示詞與參考圖記錄於 image-generation-log.json。選配走路動畫未製作。</div></main></html>')
p.write_text(''.join(parts))
print('Gallery slots:',sum(len(v) for v in groups.values()),'Ready:',len(files))
