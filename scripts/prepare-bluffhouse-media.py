"""Import the existing numbered screenshot pack; external repository is read-only."""
import argparse, hashlib, json, shutil, zipfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
p=argparse.ArgumentParser(); p.add_argument('source',type=Path); a=p.parse_args()
root=Path(__file__).resolve().parents[1]; source=a.source.resolve()
out=root/'public/images/projects/bluffhouse'; out.mkdir(parents=True,exist_ok=True)
temp=root/'.cache/bluffhouse-review/originals'; temp.mkdir(parents=True,exist_ok=True)
manifest=json.loads((source/'screenshots-manifest.json').read_text())
variantsPath=root/'src/content/image-variants.json'; variants=json.loads(variantsPath.read_text())
provenancePath=root/'docs/media/bluffhouse.json'; previous=json.loads(provenancePath.read_text())
# Existing video/captions are untouched. Restore the original poster only if missing.
records=[]; entries=[]
with zipfile.ZipFile(source/'bluffhouse-screenshots.zip') as z:
 for e in manifest['screenshots']:
  filename=e['filename']; assert Path(filename).name==filename
  member=next(n for n in z.namelist() if n==filename or n.endswith('/'+filename))
  data=z.read(member); assert hashlib.sha256(data).hexdigest()==e['sha256']
  (temp/filename).write_bytes(data); (out/filename).write_bytes(data)
  im=Image.open(temp/filename).convert('RGB'); assert im.size==(e['width'],e['height'])
  outputs=[]
  for w in [480,960,1600,1920]:
   if w>im.width: continue
   f=filename.replace('.png',f'-{w}.webp')
   im.resize((w,round(im.height*w/im.width)),Image.Resampling.LANCZOS).save(out/f,quality=90,method=6)
   outputs.append({'src':f'/images/projects/bluffhouse/{f}','width':w})
  src=f'/images/projects/bluffhouse/{filename}'
  variants[src]={'width':im.width,'height':im.height,'variants':outputs}
  records.append({'type':'image','src':src,'width':im.width,'height':im.height,'altOrCaption':e['caption']+' in the recorded Bluff House local demo.','caption':e['caption']})
  entries.append({'source':e['source'],'archive':'demo/bluffhouse-screenshots.zip','archiveFilename':filename,'output':f'public/images/projects/bluffhouse/{filename}','sha256':e['sha256']})
variantsPath.write_text(json.dumps(variants,indent=2)+'\n')
(root/'src/content/bluffhouse-screenshots.json').write_text(json.dumps(records,indent=2)+'\n')
previous['screenshotCollection']=entries; provenancePath.write_text(json.dumps(previous,indent=2)+'\n')
poster=out/'gameplay-poster.webp'
if not poster.exists():
 Image.open(out/'08-blackjack-hands.png').convert('RGB').resize((1280,720),Image.Resampling.LANCZOS).save(poster,quality=90,method=6)
# Contact sheet is an index of existing captures, never a fabricated product image.
sheet=Image.new('RGB',(1920,5*326+70),'#fafaf8'); draw=ImageDraw.Draw(sheet)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',17)
draw.text((20,20),'BLUFF HOUSE / 20 ORIGINAL SCREENSHOTS / 1920 x 1080 EACH',fill='#18181b',font=font)
for i,e in enumerate(manifest['screenshots']):
 x=(i%4)*480; y=70+(i//4)*326
 sheet.paste(Image.open(temp/e['filename']).convert('RGB').resize((472,266),Image.Resampling.LANCZOS),(x+4,y))
 draw.text((x+10,y+274),e['filename'],fill='#18181b',font=font)
sheet.save(root/'docs/media/bluffhouse-contact-sheet.jpg',quality=95)
print('Imported 20 unchanged PNGs and 80 responsive WebPs; video/captions untouched; poster retained or restored if missing.')
