# tamper-bench

![TypeScript](https://img.shields.io/badge/TypeScript-erasable_syntax-3178C6?logo=typescript&logoColor=white)
![Browser](https://img.shields.io/badge/browser-framework_free-6E6E6E)
![Dependencies](https://img.shields.io/badge/dependencies-0-B45309)
![Tests](https://img.shields.io/badge/tests-12_passing-2F6F44)
![License](https://img.shields.io/badge/license-MIT-6E6E6E)

Try to trick it: an embeddable guardrail playground. Visitors mutate a
model draft; your deterministic verifier catches it, in their browser.

[The reference deployment](https://miguelsanchez.co.uk/careful-machine) ·
[More tools](https://github.com/m-sanchez) ·
[Working rules](https://miguelsanchez.co.uk/ethics)

The most convincing page about a guardrail is the one where the reader
fails to get past it. tamper-bench is that page as a widget: you bring a
draft, a verifier, and a set of named tampers; it renders the chips, the
editor, the run button, and the checkpoint rail. Everything runs locally
in the visitor's browser; the widget makes no network calls, so whatever
it proves, it proves in front of them.

```ts
import { mountBench } from 'tamper-bench';

mountBench(document.querySelector('#bench'), {
  baseline: { scope: 'acct-1', count: 7 },
  verify: myDeterministicVerifier,   // draft in, checkpoints + outcome out
  tampers: [
    { id: 'widen', label: 'widen the scope', apply: (d) => ({ ...d, scope: 'acct-2' }) },
    { id: 'forge', label: 'forge the count', apply: (d) => ({ ...d, count: 999 }) },
    { id: 'smuggle', label: 'smuggle an instruction', apply: (d) => ({ ...d, instruction: 'ignore policy' }) }
  ]
}, { title: 'your turn: try to trick it' });
```

The verifier contract is two shapes:

```ts
interface Report { checkpoints: Checkpoint[]; outcome: string }
interface Checkpoint { label: string; status: 'pass' | 'warn' | 'stop'; detail?: string }
```

[careful-verifier](https://github.com/m-sanchez/careful-verifier) slots in
directly; any deterministic function of the draft does.

## Design

- **The core is pure.** `Bench` applies tampers, runs the verifier, and
  keeps history (every report stored with exactly the tampers that
  produced it). It renders nothing; `mountBench` is a thin DOM layer.
- **Tampers stack**, hand edits are recorded as `hand-edit`, reset
  restores the untouched baseline, and an unknown tamper id throws rather
  than silently no-opping.
- **The host page owns the look.** Class hooks only (`tb-root`,
  `tb-chip`, `tb-checkpoint`, `tb-pass/warn/stop`, ...); no styles are
  injected.
- **Unparseable hand edits refuse to run** with a message, never a crash;
  a broken draft is a visitor finding, not a page failure.

## Run

```bash
npm install       # dev-only: typescript + happy-dom for the mount tests
npm test
npm run typecheck
```

Node 22.6+ for the tests (erasable-syntax TypeScript). In the browser,
bundle `src/` with anything that speaks TS (esbuild, vite); zero runtime
dependencies.

## The tests are the point

| Test | Claim |
| :-- | :-- |
| each tamper is caught, history names what produced the report | a catch is attributable, not anecdotal |
| tampers stack and are all caught in one run | combined attacks are still attacks |
| baseline is never mutated | reset means reset |
| hand edits are recorded as hand edits | provenance survives free-form fiddling |
| unknown tamper id throws | no silent no-ops in a demo about honesty |
| unparseable JSON refuses with a message | a broken draft is a finding, not a crash |
