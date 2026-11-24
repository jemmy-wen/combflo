import json,re,shutil,struct
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def install(records):
 log=ROOT/'image-generation-log.json'
 existing=json.loads(log.read_text()) if log.exists() else []
 for row in records:
  dst=ROOT/'dist/assets'/row['file']
  if not dst.exists():shutil.copyfile(row['source'],dst)
  header=dst.read_bytes()[:33]
  assert header[:8]==b'\x89PNG\r\n\x1a\n'
  w,h,depth,color=struct.unpack('>IIBB',header[16:26])
  row['actual_dimensions']=[w,h];row['png_color_type']=color
  if row.get('transparent_background',True):
   assert color in (4,6),f"Missing alpha channel: {dst.name}"
  row['output']='dist/assets/'+row['file']
  if not any(r['id']==row['id'] and r['file']==row['file'] for r in existing):existing.append(row)
 log.write_text(json.dumps(existing,ensure_ascii=False,indent=2)+'\n')
 return existing
if __name__=='__main__':
 import sys
 records=json.loads(sys.stdin.read());install(records)
 print('Saved '+', '.join(r['id'] for r in records))
