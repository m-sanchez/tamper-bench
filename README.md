# tamper-bench

**This package is now part of [careful-verifier](https://github.com/m-sanchez/careful-verifier).**

```bash
npm install @m-sanchez/careful-verifier
```

```js
import { mountBench, carefulVerify } from '@m-sanchez/careful-verifier/bench';
```

It lives behind a subpath export so careful-verifier's root entry point keeps
its empty import graph and its node>=18 floor; only the bench is DOM-bound.

This README used to say careful-verifier "slots in directly". It did not.
careful-verifier's checkpoints are `{station, status, detail}` - no `label`,
no `outcome` - so following that sentence rendered the literal text
`undefined` in every row of the rail. The adapter is now internal to the
merged package and covered by an end-to-end test that asserts a real tampered
draft renders `SCOPE: stop` and never `undefined`.

Four honesty bugs were fixed in the move, each red-first:

- clicking a tamper chip **silently destroyed whatever the visitor had typed**
- a verifier returning a malformed report **killed the widget**, the exact
  dead page this README promised could not happen
- drafts containing a `Date` or `Map` were recorded as a `hand-edit` on every
  clean run, destroying the provenance the package exists to demonstrate
- the attempt log was computed and then never rendered

The live bench at [miguelsanchez.co.uk/careful-machine](https://miguelsanchez.co.uk/careful-machine)
now runs the published package rather than a copy of it.

This repository is archived. The history is intact; the code lives on in
careful-verifier.
