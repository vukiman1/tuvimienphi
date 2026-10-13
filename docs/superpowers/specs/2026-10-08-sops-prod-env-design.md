# Production Env via SOPS + age — Design

Date: 2026-10-08
Status: Draft — awaiting review

## 1. Goal

Change production environment variables without SSH-ing into the VPS. The values live
encrypted in the repo, every change goes through a PR, and merging it deploys the new
`.env` automatically.

## 2. Non-goals

- AWS KMS / SSM / Secrets Manager. Revisit when the stack moves to ECS; SOPS can switch its key to KMS without changing the file or the workflow.
- Frontend and dashboard env on Vercel.
- Rotating the secrets themselves. This only changes how they are stored and delivered.
- Changing what the backend reads: compose still reads `/opt/tuvimienphi/.env`, and so does `watch-containers.sh`.

## 3. Locked decisions

| Decision          | Choice                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| Tool              | SOPS with age keys                                                                                    |
| Who decrypts      | CI (the deploy job). The VPS gets plaintext `.env` over SSH and holds no key                          |
| Applying a change | A push to `dev` touching `prod.enc.env` triggers `deploy-backend.yml` with the newest published image |
| Secret version    | Always `origin/dev:prod.enc.env`, never the copy in the deployed image's commit                       |
| `BACKEND_IMAGE`   | Not in the encrypted file; the deploy script keeps pinning it                                         |
| Source of truth   | Every value lives in exactly one place, split into the two layers of §4.0                             |

## 4. Files and keys

### 4.0 Two layers

| Layer                 | Holds                                                                                                                                                                                          | Lives in                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 0 — bootstrap         | Only what is needed to reach production and open layer 1: `VPS_SSH_KEY`, `VPS_HOST`, `VPS_SSH_KNOWN_HOSTS`, `SOPS_AGE_KEY`, plus the `VPS_USER` / `VPS_SSH_PORT` / `VPS_DEPLOY_PATH` variables | `vps-sieu-toc-production` GitHub environment |
| 1 — production config | Everything else, including `ZALO_BOT_TOKEN` and `ZALO_CHAT_ID`                                                                                                                                 | `prod.enc.env`                               |

Rule: a value belongs in GitHub only if it is needed to decrypt or reach `prod.enc.env`.
Every consumer reads layer 1 from the same decrypted file:

- The deploy job decrypts once, early, and uses that file for the upload and for the Zalo deploy message.
- `watch-containers.sh` on the VPS reads `.env`, which is the file the deploy wrote.

Changing the Zalo chat, a token or any other value is one edit in `prod.enc.env`.

### 4.1 `prod.enc.env`

Named `*.enc.env` so sops detects the dotenv format from the extension; `input_type` is not read from `.sops.yaml` creation rules.

Dotenv format, committed at the repo root. Holds every key of `.env.prod.example` except `BACKEND_IMAGE`.
`.env.prod.example` gains `ZALO_BOT_TOKEN` and `ZALO_CHAT_ID`, so the key check in §5.2 protects them too.

### 4.2 `.sops.yaml`

```yaml
creation_rules:
  - path_regex: ^prod\.enc\.env$
    age: >-
      <age public key: Kim An>,
      <age public key: CI>
    unencrypted_regex: ^(COMPOSE_FILE|COMPOSE_PROFILES|POSTGRES_USER|POSTGRES_DB|APP_URL|CORS_ORIGINS|R2_ENDPOINT_URL|R2_BACKUP_BUCKET|R2_MEDIA_BUCKET|R2_MEDIA_PUBLIC_URL|GOOGLE_CLIENT_ID|ZALO_CHAT_ID)$
```

Non-secret values stay readable so a PR diff shows what changed. The implementation verifies
that `unencrypted_regex` behaves this way for dotenv files with the pinned sops version. If it
does not, every value is encrypted and only the key names stay readable.

### 4.3 Keys

| Key      | Where the private half lives                                                                                                              | Used by                   |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Personal | `~/Library/Application Support/sops/age/keys.txt` on Kim An's Mac (`~/.config/sops/age/keys.txt` on Linux) + a copy in a password manager | `sops edit` on the laptop |
| CI       | `SOPS_AGE_KEY` secret of the `vps-sieu-toc-production` GitHub environment                                                                 | The deploy job only       |

Two recipients so the CI key can be replaced (`sops updatekeys`) without touching the personal
one. Losing both private halves makes the file unrecoverable; the password-manager copy is the backup.

### 4.4 Editing

```bash
sops edit prod.enc.env   # opens the decrypted file in $EDITOR, re-encrypts on save
```

Then a normal PR into `dev`.

## 5. Deploy workflow (`.github/workflows/deploy-backend.yml`)

### 5.1 Trigger

```yaml
on:
  push:
    branches: [dev]
    paths: ['prod.enc.env']
```

`inputs.commit` is empty on a push, so the existing "newest commit on dev with a published image"
resolution picks the image. A secret-only change therefore redeploys the running code with new env
and never rebuilds an image.

A PR that changes both backend code and `prod.enc.env` starts this workflow and `Publish Image`.
The existing `deploy-backend` concurrency group runs them one after the other: the first may deploy
the previous image with the new env, the second deploys the new image. Both end on the new env.

### 5.2 New steps, before "Deploy over SSH"

1. **Install sops**: download the pinned release binary, check its sha256, put it on `PATH`.
2. **Render the env**:
   - If `origin/dev:prod.enc.env` does not exist, set an output `has_env=false` and skip steps 3 and 4. Deploys then behave exactly as today. This lets the code merge before the encrypted file exists.
   - Otherwise decrypt `git show origin/dev:prod.enc.env` with `SOPS_AGE_KEY` into a `0600` file under `$RUNNER_TEMP`.
3. **Check the keys**: every key in `.env.prod.example` except `BACKEND_IMAGE` must be present in the decrypted file. A missing key fails the job before anything reaches the VPS, so deleting a line by mistake cannot strip a variable from production. Extra keys are allowed.
4. **Upload**: `ssh … "umask 077 && cat > '<deploy path>/.env.next'" < rendered-env`. The plaintext only travels on stdin, never in arguments or logs. The runner file is deleted in an `always()` step.

`SOPS_AGE_KEY` missing while `prod.enc.env` exists is an error, not a warning: deploying with stale env silently is worse than a red run.

### 5.3 Deploy notification

The "Tell Zalo how the deploy went" step reads `ZALO_BOT_TOKEN` / `ZALO_CHAT_ID` from the decrypted
file instead of `secrets.*`. Decryption therefore runs as the first step after checkout, so the
message can still be sent when a later step (image resolution, SSH, migrations) fails.

If decryption itself fails there is nothing to read the token from. That failure is reported by
GitHub's own failed-workflow notification (Settings → Notifications → Actions), not by a second
copy of the token in GitHub secrets, which would break the one-place rule.

Before `prod.enc.env` exists (§9 step 1) the step finds no token and only logs a warning, as today.

### 5.4 Layer-0 guard

A CI check fails if any workflow references a secret outside layer 0, so a config value cannot
drift back into GitHub secrets unnoticed. It scans `.github/workflows/*.yml` for `secrets.<NAME>`
references against an allowlist (layer 0 plus `GITHUB_TOKEN`).

## 6. VPS script (`tools/vps/deploy-backend.sh`)

The script picks its env file:

- `.env.next` present → `env_file=.env.next`.
- Otherwise → `env_file=.env` (today's behaviour).

Flow with `.env.next`:

1. `trap` removes `.env.next` on any exit that has not promoted it, so a stale file never leaks into a later deploy.
2. `docker compose --env-file "$env_file" pull` and `docker compose --env-file "$env_file" run --rm -T migrate`, both with `BACKEND_IMAGE="$IMAGE"`. Migrations therefore run with the new env.
3. On success, pin `BACKEND_IMAGE` into `.env.next`, then `mv .env.next .env`.
4. `docker compose up -d`, health checks as today.

Migration failure leaves `.env` untouched and the old containers running, matching #120.

The `.env` existence check at the top stays for the no-`.env.next` path. On a first install, `.env.next` is enough.

## 7. Documentation

New section in `docs/roadmap/12-deploy-notifications.md` (or a new `docs/prod-env.md` if it grows past one screen):

- One-time setup: install `sops` and `age`, generate both keys, fill `.sops.yaml`, add `SOPS_AGE_KEY` to GitHub.
- Migration from the current VPS `.env` (§9).
- Day-to-day editing (§4.4) and how to apply without code changes (merge → automatic deploy, or run `Deploy Backend` by hand).
- Caveat: changing `POSTGRES_PASSWORD` in the file does not change the password of the running database. Postgres reads it only on first init; run `ALTER USER` first, then change the file.
- Caveat: a rollback deploys old code with the newest env.

## 8. Testing

- `bash -n` on the changed scripts.
- `deploy-backend.sh` against a stub `docker`, four cases: with or without `.env.next` × migrate passes or fails. Assert which env file compose saw, whether `.env` was replaced, and that `.env.next` is gone afterwards.
- Key check: a decrypted file missing one key fails, one with an extra key passes.
- sops round trip with throwaway age keys and the real `.sops.yaml`: encrypt, check which values stay plaintext, decrypt with each recipient key.
- Layer-0 guard: a workflow referencing `secrets.ZALO_BOT_TOKEN` fails the check.
- After rollout: a PR that only changes a non-secret value deploys without an image build and the Zalo deploy message arrives.

## 9. Rollout

1. Merge the code. `prod.enc.env` does not exist yet, so deploys behave as today.
2. Kim An installs `sops` + `age`, generates the personal and CI keys, commits `.sops.yaml` with both public keys, and adds `SOPS_AGE_KEY` to the GitHub environment.
3. One last SSH: copy `/opt/tuvimienphi/.env`, drop `BACKEND_IMAGE`, encrypt it as `prod.enc.env`, open a PR. Merging it triggers a deploy, which must come up healthy with no change in behaviour.
4. From then on, env changes are PRs. The new Zalo bot token goes in this way, never as a GitHub secret.
5. Remove any `ZALO_*` secrets from the GitHub environment if they were ever added.

## 10. Open questions

None at the time of writing.
