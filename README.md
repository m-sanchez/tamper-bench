# tamper-bench

![TypeScript](https://img.shields.io/badge/TypeScript-erasable_syntax-3178C6?logo=typescript&logoColor=white)
![Browser](https://img.shields.io/badge/browser-framework_free-6E6E6E)
![Node](https://img.shields.io/badge/node-%3E%3D22.18-5FA04E?logo=nodedotjs&logoColor=white)
![Dependencies](https://img.shields.io/badge/runtime_dependencies-0-B45309)
[![CI](https://github.com/m-sanchez/tamper-bench/actions/workflows/test.yml/badge.svg)](https://github.com/m-sanchez/tamper-bench/actions/workflows/test.yml)
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
- **Unparseable hand edits refuse to run** with a message, never a crash,
  and **a throwing verifier is contained** as a stop checkpoint: the widget
  invites hostile drafts, so a crash is a finding, not a dead page.
- **Buttons are type="button"** and the widget carries aria labels, so it
  embeds inside a host form without submitting it.

## Install

```bash
npm install github:m-sanchez/tamper-bench#v1.1.0
```

Not yet on npm; the pinned git tag is the supported install and CI proves
the packed tarball imports cleanly. The install builds plain ESM into
`dist/`, so any bundler (or a `<script type="module">` after copying
`dist/`) can serve it; zero runtime dependencies.

## Develop

```bash
npm ci            # dev-only: typescript + happy-dom for the mount tests
npm test
npm run typecheck
```

Node 22.18+ (erasable-syntax TypeScript; node runs the sources directly).

## The tests are the point

| Test | Claim |
| :-- | :-- |
| each tamper is caught, history names what produced the report | a catch is attributable, not anecdotal |
| tampers stack and are all caught in one run | combined attacks are still attacks |
| baseline is never mutated | reset means reset |
| hand edits are recorded as hand edits | provenance survives free-form fiddling |
| unknown tamper id throws | no silent no-ops in a demo about honesty |
| unparseable JSON refuses with a message | a broken draft is a finding, not a crash |
| a throwing verifier becomes a stop checkpoint | the crash the widget invites cannot kill the widget |
| every button is type="button" | a host form never submits on a chip click |
| key-order-only edits are not hand edits | provenance does not depend on JSON serialization |
