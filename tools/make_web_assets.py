"""Build web-sized copies of the illustration PNGs.

dist/assets/*.png      approved originals (never modified; used for generation references and Figma)
dist/assets/web/*.png  what the site loads: long edge = needed pixels x 1.15 headroom (hover zoom),
                       never larger than the original

Needed pixels per file live in tools/web-asset-sizes.json. A file missing from that list is
copied unchanged and reported, so the site never breaks — measure it and add it to the list.

Uses macOS `sips` for resampling. Run: python3 tools/make_web_assets.py
"""
import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'dist' / 'assets'
OUT = SRC / 'web'
HEADROOM = 1.15


def long_edge(path):
    out = subprocess.run(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', str(path)],
                         capture_output=True, text=True, check=True).stdout
    nums = [int(line.split(':')[1]) for line in out.splitlines() if 'pixel' in line]
    return max(nums)


def main():
    manifest = json.loads((ROOT / 'tools' / 'web-asset-sizes.json').read_text())
    sizes, exclude = manifest['sizes'], set(manifest.get('exclude', []))
    OUT.mkdir(exist_ok=True)
    before = after = 0
    unmeasured = []
    for src in sorted(SRC.glob('*.png')):
        dst = OUT / src.name
        if src.name in exclude:
            dst.unlink(missing_ok=True)
            continue
        natural = long_edge(src)
        need = sizes.get(src.name)
        if need is None:
            unmeasured.append(src.name)
            target = natural
        else:
            target = min(natural, round(need * HEADROOM))
        if target >= natural:
            shutil.copyfile(src, dst)
        else:
            subprocess.run(['sips', '-Z', str(target), str(src), '--out', str(dst)],
                           capture_output=True, check=True)
        before += src.stat().st_size
        after += dst.stat().st_size
        print(f'{src.name:30} {natural:5}px -> {min(target, natural):5}px  '
              f'{src.stat().st_size // 1024:5}KB -> {dst.stat().st_size // 1024:5}KB')
    print(f'\ntotal {before / 1e6:.1f}MB -> {after / 1e6:.1f}MB')
    if unmeasured:
        print('copied at full size (add to tools/web-asset-sizes.json):', ', '.join(unmeasured))


if __name__ == '__main__':
    main()
