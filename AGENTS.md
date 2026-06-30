# Agent Instructions

This is a public FastAPI Cloud starter template.

## Commands

- `just setup`: install Python and frontend dependencies.
- `just dev`: run the FastAPI app.
- `just test`: run backend tests.
- `just check`: run lint and frontend type checks.
- `just build`: rebuild committed `dist/`.
- `just client-generate`: regenerate the OpenAPI TypeScript client.
- `just dist-check`: verify committed frontend build output is fresh.
- `just skills-check`: run advisory `library-skills --check` through `uv`.

## Library Skills

Run `uv tool run library-skills --all --yes` after dependencies are installed.
Use `.agents/skills` as the default target. On Windows, add `--copy` if symlinks are
inconvenient.

## Commit Messages

Commit messages must be at most 10 words.

Examples:

- `Add auth routes`
- `Document Cloud deployment`
- `Fix RBAC dependency`
