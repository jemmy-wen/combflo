import { test } from 'node:test';
import assert from 'node:assert/strict';
import { score } from './scoring.ts';

test('老師傅型：紙本＋LINE、沒串接、沒文件、人不在就卡住', () => {
  const r = score({ q2: '3', q3: '3', q4: ['1', '3'], q5: '4', q6: '1', q7: '3' });
  assert.equal(r.type, 'master');
  assert.equal(r.repeat, 3);
  assert.equal(r.reliance, 3);
  assert.equal(r.connect, 1);
});

test('工具收集型：Excel＋LINE＋ERP、靠人複製、流程未定', () => {
  const r = score({ q2: '3', q3: '2', q4: ['2', '3', '4'], q5: '1', q6: '2', q7: '1' });
  assert.equal(r.type, 'collector');
  assert.equal(r.systemNote, true);
});

test('流程明白型：有 SOP、有人接手，但只用紙本與 Excel', () => {
  const r = score({ q2: '2', q3: '1', q4: ['1', '2'], q5: '1', q6: '3', q7: '3' });
  assert.equal(r.type, 'clear');
});

test('蓄勢待發型：流程明確、ERP＋自建系統已自動串接', () => {
  const r = score({ q2: '1', q3: '1', q4: ['2', '4', '5'], q5: '3', q6: '3', q7: '2' });
  assert.equal(r.type, 'ready');
  assert.equal(r.connect, 3);
  assert.equal(r.systemNote, false);
});
