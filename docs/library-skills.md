# Library Skills

Run:

```bash
uv tool run library-skills --all --yes
```

Use `.agents/skills` as the default install target. This keeps agent instructions synced
with installed package versions. On Windows, use `--copy` if symlinks are impractical.

CI runs `uvx library-skills --check || true` so skill drift is visible but non-blocking in v1.
On Windows shells where `uv` or `uvx` are not on `PATH`, use `python -m uv tool run`.
