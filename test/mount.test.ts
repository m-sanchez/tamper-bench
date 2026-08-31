import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { mountBench } from '../src/mount.ts';
import type { Report } from '../src/bench.ts';

interface Draft {
  count: number;
}

const verify = (d: Draft): Report => ({
  checkpoints: [
    d.count === 1
      ? { label: 'count', status: 'pass' }
      : { label: 'count', status: 'warn', detail: `claimed ${d.count}, counted 1` }
  ],
  outcome: d.count === 1 ? 'clean' : 'caught'
});

function setup() {
  const window = new Window();
  const container = window.document.createElement('div') as unknown as HTMLElement;
  window.document.body.appendChild(container as unknown as Parameters<typeof window.document.body.appendChild>[0]);
  const mounted = mountBench(
    container,
    {
      baseline: { count: 1 },
      verify,
      tampers: [{ id: 'forge', label: 'forge the count', apply: () => ({ count: 9 }) }]
    },
    { title: 'try to trick it' }
  );
  return { window, container, mounted };
}

test('mount renders title, chips, editor, and the baseline state', () => {
  const { container } = setup();
  assert.equal(container.querySelector('.tb-title')?.textContent, 'try to trick it');
  assert.equal(container.querySelectorAll('.tb-chip').length, 2); // tamper + reset
  assert.match(container.querySelector('.tb-status')?.textContent ?? '', /baseline draft/);
  assert.match(container.querySelector<HTMLTextAreaElement>('.tb-editor')!.value, /"count": 1/);
});

test('clicking a chip applies the tamper; run renders the catch', () => {
  const { container } = setup();
  container.querySelector<HTMLButtonElement>('[data-tamper="forge"]')!.click();
  assert.match(container.querySelector('.tb-status')?.textContent ?? '', /applied: forge/);
  container.querySelector<HTMLButtonElement>('.tb-run')!.click();
  assert.match(container.querySelector('.tb-outcome')?.textContent ?? '', /caught/);
  assert.equal(container.querySelectorAll('.tb-checkpoint.tb-warn').length, 1);
});

test('reset returns the page to the clean baseline', () => {
  const { container } = setup();
  container.querySelector<HTMLButtonElement>('[data-tamper="forge"]')!.click();
  container.querySelector<HTMLButtonElement>('.tb-chip-reset')!.click();
  assert.match(container.querySelector('.tb-status')?.textContent ?? '', /baseline draft/);
});

test('unparseable hand edits refuse to run, with a message, not a crash', () => {
  const { container } = setup();
  container.querySelector<HTMLTextAreaElement>('.tb-editor')!.value = '{not json';
  container.querySelector<HTMLButtonElement>('.tb-run')!.click();
  assert.match(container.querySelector('.tb-status')?.textContent ?? '', /not valid JSON/);
  assert.equal(container.querySelector('.tb-outcome')?.textContent, '');
});
