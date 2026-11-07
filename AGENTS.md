# AGENTS.md - garage-webui

How agents (including future LLM agents that work on this repository) build, test, and
change this project. This file describes the repository conventions. It does not describe
the user.

## What this project is

An admin web UI for Garage, a self-hosted S3-compatible object store. Two parts in one
repository:

- `src/` - the React frontend. React 18, TypeScript, Vite, Tailwind with daisyUI,
  `@tanstack/react-query`, `zustand`, `zod`.
- `backend/` - a Go server. It serves the built frontend, proxies the Garage admin API, and
  holds the admin token. Go module `khairul169/garage-webui`.

The Nix flake is the main build path. It builds the UI with pnpm, embeds the output in the
Go backend, and produces one `garage-webui` binary. `README.md` calls the flake the easiest
setup, and it is: the flake supplies Go, Node.js, pnpm, Air, and Garage.

`docker-compose.yml` is not a development runner. It starts the published
`khairul169/garage-webui:latest` image with a Garage node, for a trial run. It has no
`build:` section. Do not use it to test a change.

The repository is a fork of `khairul169/garage-webui`, maintained by `suorcd`. Keep the
upstream identity in the module path, the image name, and the license.

`README.md` holds the feature list and the documented configuration. Do not re-open a
decision that `README.md` records without new user input.

## Writing standard

All new and changed prose must follow ASD-STE100 Simplified Technical English. The
standard is Issue 9, released 2025-01-15. The standard is at https://www.asd-ste100.org/.

The standard covers this prose:

- `AGENTS.md`, `README.md`, `misc/SCREENSHOTS.md`, and any documentation file
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
- Write the action as a verb. Write "delete the key", not "perform the deletion".
- Use one word for one thing. A Garage object is an "object" in all files. A cluster node is
  a "node".
- Do not use marketing adjectives, idioms, or phrasal verbs.
- Do not use "simply", "just", or "obviously".
- Use American English spelling.

Do not rename code identifiers to obey these rules. Keep the prose term and the identifier
equal in meaning, so the documents cannot drift from the API.

Do not rewrite unrelated text in a change that has another purpose.

## Repository map

Frontend:

- `src/app/` - `app.tsx`, the route table in `router.tsx`, global styles, and the daisyUI
  themes.
- `src/pages/` - one directory for each screen: `auth`, `buckets`, `cluster`, `home`,
  `keys`. Start here for a UI change. Page-local code stays with the page: `hooks.ts` holds
  that screen's `react-query` hooks and `types.ts` its response types. A page may also own a
  `context.ts` (for example `src/pages/buckets/manage/`) or a store (for example
  `src/pages/cluster/stores.ts`).
- `src/components/` - shared components. `ui/` holds the daisyUI wrappers: `button.tsx`,
  `checkbox.tsx`, `chips.tsx`, `code.tsx`, `form-control.tsx`, `goto-top-btn.tsx`,
  `input.tsx`, `select.tsx`, `toggle.tsx`. `layouts/` holds the page frames and
  `containers/` the wider blocks.
- `src/hooks/` - the shared hooks only: `useAuth`, `useConfig`, `useDebounce`,
  `useDisclosure`. A hook that one screen uses belongs in that screen.
- `src/lib/api.ts` - the only place that sends a request to the Go backend. Request shapes
  and error handling live here.
- `src/context/` - the React context that more than one screen uses.
- `src/types/garage.ts` - the types for the Garage configuration object.

Backend:

- `backend/router/` - one file for each route group: `auth.go`, `browse.go`, `buckets.go`,
  `config.go`, `router.go`, and `proxy.go` for the responses that pass through. Add a
  handler in the file for its area, not in `main.go`.
- `backend/router/proxy.go` - passes other admin responses through without a typed struct.
  The frontend types those responses.
- `backend/schema/` - the structs that both sides type: `browse.go`, `bucket.go`,
  `config.go`. Change one of these with the frontend type in the same change.
- `backend/middleware/`, `backend/utils/` - cross-cutting helpers. `utils/garage.go` holds
  the Garage client and the admin token.
- `backend/ui/` - the embedded frontend. `ui.go` serves the files in development,
  `ui_prod.go` serves the embedded build, and `pnpm build` or the flake fills it.
- `backend/Makefile`, `backend/.air.toml` - the Go targets and the Air live-reload
  configuration.

Build, development, and operations:

- `flake.nix`, `flake.lock`, `.envrc` - the Nix build and the development shell.
- `scripts/` - `dev.sh` (Garage node, API with Air, and Vite), `garage-dev.sh`,
  `garage-setup.sh`, and `clean.sh`.
- `dev/garage.toml` - the Garage configuration for local development. `.gitignore` keeps it
  and ignores every other `garage.toml`.
- `Dockerfile`, `docker-compose.yml` - the image and the trial stack.
- `misc/` - `SCREENSHOTS.md`, `img/`, `build-binaries.sh`, and `build-docker.sh`.

## Toolchain and commands (Nix first)

```sh
nix develop                      # Go, gopls, Node 22, pnpm 10, Air, Garage, jq, curl
pnpm install                     # frontend dependencies
dev                              # Garage node, API on :3909, Vite on :5173
nix build                        # one binary, UI embedded
nix run                          # build and run in one step
nix fmt                          # nixfmt
nix run .#clean                  # remove build output and local development state
```

A pass looks like this:

- `nix develop` drops into a shell that has `go`, `node`, `pnpm`, `air`, and `garage`.
- `nix build` exits 0 and creates `./result` with `bin/garage-webui`.
- `nix run .#clean` removes `.dev/`, `.direnv/`, `dist/`, `backend/tmp/`, `result`, and
  `result-*`. Add `-- --deps` to remove `node_modules` as well.

The toolchain also works without Nix. Keep both paths working:

```sh
pnpm install --frozen-lockfile   # install exactly the locked tree
pnpm lint                        # eslint, must exit 0
pnpm build                       # tsc -b && vite build, must exit 0
pnpm dev                         # vite plus the Go backend with Air

cd backend
go build ./...                   # must exit 0
go vet ./...                     # must exit 0
go test ./...                    # see the test protocol below
```

Use `pnpm`. The lockfile is `pnpm-lock.yaml`. Do not add a second lockfile.

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

### Test commands

One backend test:

```sh
cd backend && go test ./router -run <TestName> -v
```

The full backend suite:

```sh
cd backend && go test ./...
```

Through the real build, which runs the suite in its check phase:

```sh
nix build -L
```

### Test harness status

- The backend has tests: `backend/router/browse_test.go`. Add a new Go test as
  `<file>_test.go` in the package that holds the code, and call the handler through the
  router with a real request.
- The frontend has no test runner. There is no `vitest` and no `jest`. Add `vitest`,
  `@testing-library/react`, and `jsdom` in the same change that adds the first frontend
  test, and add a `test` script to `package.json`.

Do not record `No test:` for a change that has observable behavior.

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

The repository has no CI configuration. `nix build` runs the Go tests in its `checkPhase`.
Otherwise, verification is local and manual:

- `pnpm lint`, `pnpm build`, and `nix build` must pass before a merge.
- `go vet ./...` and `go test ./...` must pass in `backend/` when the backend changed.
- Run the test protocol above and put the output in the pull request.

If you add CI, keep it to these commands. Do not make the default checks depend on a live
Garage cluster.

## Key constraints (do not break these silently)

- **One API surface.** All Garage calls go through the Go backend. A browser request goes to
  `/api` on the same origin, and `src/lib/api.ts` is the only client. Do not add a
  client-side request to the Garage admin API.
- **The admin token must not reach the browser. This rule is broken today.**
  `backend/router/config.go` returns the whole `utils.Garage.Config` from `GET /config`, and
  `src/hooks/useConfig.ts` fetches it. That response includes `admin.admin_token`,
  `rpc_secret`, and `admin.metrics_token`. Do not add a new field from that config to the
  UI, and do not treat the token as secret until the endpoint is corrected. The correction
  is a separate security change with its own test.
- **Secrets.** Never commit a real Garage admin token, S3 key, or `.env` file.
  `.env.example` holds placeholders only. `.gitignore` ignores `.env*` and every
  `garage.toml` except `dev/garage.toml`.
- **Generated files stay out.** Do not commit `dist/`, `node_modules/`, `.dev/`, the local
  Garage `data/` and `meta/`, a `result` symlink, or `backend/tmp/`. Air writes
  `backend/tmp/` on each reload.
- **Upstream shape.** Keep the request and response types close to the Garage admin API. Do
  not invent a field the API does not return. When an admin response becomes typed, change
  `backend/schema/` and the frontend type in the same change.
- **License.** MIT. `LICENSE` names the upstream author, Khairul Hidayat. Keep that notice.
  Do not replace it with a personal name.
- **Scope.** One purpose for one pull request. Do not reformat a file that you do not
  change, and do not upgrade a dependency in a pull request that fixes a defect.
- **Do not fake a result.** Report the real command output, including failures. A claim that
  a build passed must come from a run in this session.

## Fork and upstream policy

- The fork is the working copy. Branch in the fork, and open a pull request against the fork
  `main` for a local change.
- If a fix is general and upstream would accept it, offer it as a pull request to
  `khairul169/garage-webui`. Keep that change small and free of local configuration.
- Do not rewrite the fork's history on `main`. Do not force-push a branch that another
  person works on.

## Definition of done

A change is done when all of these are true:

- The red run and the green run exist, with captured output.
- `pnpm lint` and `pnpm build` pass. `go vet ./...` and `go test ./...` pass in `backend/`
  when the backend changed.
- `nix build -L` passes when the change can affect the build.
- The full test suite passes, and you report the totals.
- The prose follows ASD-STE100, and the diff contains only the change.
- The pull request body states the behavior, the evidence, and the reason for any test that
  is not applicable.
