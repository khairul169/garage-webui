# AGENTS.md - garage-webui

How agents (including future LLM agents that work on this repository) build, test, and
change this project. This file describes the repository conventions. It does not describe
the user.

## What this project is

An admin web UI for Garage, a self-hosted S3-compatible object store. Two parts in one
repository:

- `src/` - the React frontend. React 18, TypeScript, Vite, Tailwind with daisyUI,
  `@tanstack/react-query`, `zustand`, `zod`.
- `backend/` - a Go server that serves the built frontend and proxies the Garage admin
  API. Go module `khairul169/garage-webui`.

The build produces one container image (`Dockerfile`). `docker-compose.yml` runs it for
development. `README.md` holds the feature list and the documented configuration. Do not
re-open a decision that `README.md` already records without new user input.

This repository is a fork of `khairul169/garage-webui`, maintained by `suorcd`. Keep the
upstream identity in the module path, the image name, and the license.

## Writing standard

All new and changed prose must follow ASD-STE100 Simplified Technical English. The
standard is Issue 9, released 2025-01-15. The standard is at https://www.asd-ste100.org/.

The standard covers this prose:

- `AGENTS.md`, `README.md`, `misc/`, and any documentation file
- commit messages and pull request descriptions
- code comments, TypeScript doc comments, and Go doc comments
- UI copy, labels, empty states, error messages, and toast text

The standard does not cover names in code:

- identifiers, file paths, JSON keys, HTTP headers, CLI flags, and route paths
- quoted third-party text, license text, and verbatim command output

Rules (a subset of the 53 writing rules):

- Write one instruction in one sentence. Use the active voice.
- Use 20 words or fewer in a procedural sentence. Use 25 words or fewer in a descriptive
  sentence.
- Use 6 sentences or fewer in a paragraph.
- Write the action as a verb. Write "delete the key", not "perform the deletion" of the key.
- Use one word for one thing. A Garage object is an "object" in all files. A cluster node is
  a "node".
- Do not use marketing adjectives, idioms, or phrasal verbs.
- Do not use "simply", "just", or "obviously".
- Use American English spelling.

Do not rename code identifiers to obey these rules. Keep the prose term and the identifier
equal in meaning, so the documents cannot drift from the API.

Do not rewrite unrelated text in a change that has another purpose.

## Repository map

- `src/app/` - the application shell: `app.tsx`, the route table in `router.tsx`, global
  styles, and the daisyUI theme list.
- `src/pages/` - one directory for each screen. Start here for a UI change.
- `src/components/` - shared components. `ui/` holds the daisyUI wrappers (`button.tsx`,
  `checkbox.tsx`, `chips.tsx`), `layouts/` the page frames, `containers/` the wider blocks.
- `src/hooks/` - `react-query` hooks and small utilities (`useAuth`, `useConfig`,
  `useDebounce`, `useDisclosure`). One file for each Garage API area.
- `src/lib/api.ts` - the only place that sends a request to the Go backend. Request shapes
  and error handling live here.
- `src/context/`, `src/stores/` - React context and `zustand` stores. Keep client state
  here, not in components.
- `src/types/` - TypeScript types for Garage responses.
- `backend/router/` - one file for each route group (`auth.go`, `buckets.go`, `browse.go`,
  `config.go`, ...). Add a handler here, not in `main.go`.
- `backend/schema/` - request and response structs. Change these with `src/types/`.
- `backend/middleware/`, `backend/utils/` - cross-cutting helpers.
- `misc/` - screenshots and documentation assets.

## Toolchain and commands

Use `pnpm`. The lockfile is `pnpm-lock.yaml`; do not add a second lockfile.

```sh
pnpm install --frozen-lockfile   # install exactly the locked tree
pnpm lint                        # eslint, must exit 0
pnpm build                       # tsc -b && vite build, must exit 0
pnpm dev                         # vite + backend with hot reload
```

Backend:

```sh
cd backend
go build ./...                   # must exit 0
go vet ./...                     # must exit 0
go test ./...                    # see the test protocol below
```

Nix is not the primary path in this repository. If you add a flake, keep `pnpm build` and
`go build ./...` working without it.

## Red-green test protocol (required for every behavioral change)

Write the test before you change the code. Name the test for the behavior, not for the fix.

Run that single test against the unmodified tree. Capture the failure. If the test passes,
it does not reproduce the defect: the test is wrong, or the diagnosis is wrong. Correct one
of them before you continue.

Each change has four evidence checkpoints:

1. **Test**: the test name and the behavior that it asserts.
2. **Red run**: the command and the tail of the failing output from the unmodified tree.
3. **Green run**: the same command and the tail of the passing output after the change.
4. **Full suite**: the command and the totals.

The red run and the green run must use the same command. A failure from one command and a
pass from another command are not evidence. The red run must fail for the reason that the
test targets.

Put the command and the tail of its real output for each checkpoint in the pull request or
the issue comment. Do not paraphrase the output. A checkpoint without captured output has
not happened.

### Test harness status

The repository has no test runner yet. This is a real gap, not a convention:

- The backend has no `*_test.go` file. Use the standard Go test package and run it with
  `go test ./...`.
- The frontend has no `vitest` or `jest`. Add `vitest`, `@testing-library/react`, and
  `jsdom` in the same change that adds the first frontend test, and add a `test` script to
  `package.json`.

Until a harness exists, a change that needs a test must add the harness. Do not record
`No test:` for a change that has observable behavior.

### When a test is not applicable

Documentation, comments, formatting, dependency bumps, and prose have nothing to assert.
State the reason in one line in the pull request or the issue comment:

```
No test: documentation only
```

For another case, write `No test: <reason>`. Silence is not acceptable, because a reviewer
cannot tell "no test needed" from "no test written".

### Test standards

- Assert on behavior, not on rendered strings. A test on a message can pass while the
  behavior is wrong.
- Exercise the boundary that the change touches, not a helper next to it.
- For a backend test, call the handler through the router. Do not test a private helper in
  place of the route.
- For a frontend test, render the component and act on it as a user does. Do not assert on
  class names or DOM structure.
- Do not write a test that can only fail when the compiler breaks.
- Prefer the smallest test that fails for the right reason.

## CI scope

The repository has no CI configuration. Verification is local and manual:

- `pnpm lint`, `pnpm build`, `go build ./...`, and `go vet ./...` must pass before a merge.
- Run the test protocol above and put the output in the pull request.

If you add CI, keep it to these commands. Do not make the default checks depend on a live
Garage cluster.

## Key constraints (do not break these silently)

- **Secrets.** Never commit a real Garage admin token, S3 key, or `.env` file. Examples in
  `README.md` and `docker-compose.yml` hold placeholders only.
- **One API surface.** All Garage calls go through the Go backend. The browser does not
  hold the admin token and does not call Garage directly. Do not add a client-side request
  to the Garage admin API.
- **Generated files stay out.** Do not commit `dist/`, `node_modules/`, or a `result`
  symlink. Do not commit an editor state directory.
- **Upstream shape.** Keep request and response types close to the Garage admin API. Do not
  invent fields the API does not return. When the API changes, change `backend/schema/` and
  `src/types/` in the same change.
- **License.** MIT. Keep the upstream copyright notice. The license names the upstream
  project; do not replace it with a personal name.
- **Scope.** One purpose for one pull request. Do not reformat a file that you do not
  change, and do not upgrade a dependency in a pull request that fixes a defect.
- **Do not fake a result.** Report the real command output, including failures. A claim
  that a build passed must come from a run in this session.

## Fork and upstream policy

- The fork is the working copy. Branch in the fork, and open a pull request against the
  fork `main` for a local change.
- If a fix is general and upstream would accept it, offer it as a pull request to
  `khairul169/garage-webui`. Keep that change small and free of local configuration.
- Do not rewrite the fork's history on `main`. Do not force-push a branch that another
  person works on.

## Definition of done

A change is done when all of these are true:

- The red run and the green run exist, with captured output.
- `pnpm lint` and `pnpm build` pass. `go build ./...` and `go vet ./...` pass when the
  backend changed.
- The full test suite passes, and you report the totals.
- The prose follows ASD-STE100, and the diff contains only the change.
- The pull request body states the behavior, the evidence, and the reason for any test that
  is not applicable.
