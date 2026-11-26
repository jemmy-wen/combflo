"""產生代發 EDM：edm/combflo-edm.html（正式，圖片用絕對網址）與預覽版。"""
import pathlib
root = pathlib.Path(__file__).resolve().parents[2]
tpl = (root / 'tools/edm/edm.template.html').read_text()
common = {
    '{{SITE}}': 'https://ingsist.com/combflo',
    '{{CHECK}}': 'https://ingsist.com/combflo/check.html',
    '{{UTM}}': 'utm_source=edm&amp;utm_medium=email&amp;utm_campaign=combflo_launch',
    '{{UNSUBSCRIBE}}': '{{UNSUBSCRIBE}}',  # 交給代發單位換成他們的退訂連結
}
out = root / 'edm'; out.mkdir(exist_ok=True)
for name, base in [('combflo-edm.html', 'https://ingsist.com/combflo/assets/edm'),
                   ('combflo-edm-preview.html', (root / 'dist/assets/edm').as_uri())]:
    s = tpl
    for k, v in {**common, '{{BASE}}': base}.items():
        s = s.replace(k, v)
    (out / name).write_text(s)
    print(out / name)
