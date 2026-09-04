# Finishing the `attached_assets` purge

The history rewrite is done. **It is not sufficient on its own**, and this file
says why and what closes the gap.

## What has been done

`git filter-repo --path attached_assets --invert-paths` was run on 2026-09-04 and
force-pushed to `main` and to `claude/repo-analysis-github-pages-x33bmh`.

| | Before | After |
|---|---|---|
| Commits | 79 | 79 |
| Commits touching `attached_assets` | 10 | **0** |
| `.git` size | 16 MB | **1.8 MB** |
| Working tree | — | byte-identical (verified: empty `git diff`) |

Every commit message and every file at HEAD is unchanged. Only the blobs and the
commit SHAs differ. A fresh `git clone` of the repository now contains no trace
of the directory.

## What has *not* been done, and why it matters

**Rewriting history does not delete anything from GitHub.** The old commits become
unreferenced, but GitHub keeps unreferenced objects and continues to serve them at
their direct SHA URL:

```
https://github.com/ibuilder/TraumaRecovery/commit/<old-sha>
https://github.com/ibuilder/TraumaRecovery/raw/<old-sha>/attached_assets/<file>
```

Those SHAs are not secret. They appear in the pull-request pages, in the
repository's public events feed, in any fork, and in anything that cached them.
So **the third-party outpatient manual is still retrievable by anyone who has or
finds an old SHA** until GitHub garbage-collects the repository — which only
GitHub Support can force.

Until that request is actioned, treat the manual as still exposed.

The pre-rewrite heads, for reference in the request:

- `main` → `d0eb61a18d15118d86121f17e991a9d569f13665`
- `claude/repo-analysis-github-pages-x33bmh` → `e6839562aa610fcb0f403fbb602b99ff91332a31`

## The request to send

Open a ticket at <https://support.github.com/contact> — category *Repositories*,
subject "Remove cached views and unreachable objects after history rewrite".

> Hello,
>
> I have rewritten the history of https://github.com/ibuilder/TraumaRecovery with
> `git filter-repo` to remove a directory (`attached_assets/`) that contained a
> third-party copyrighted PDF I did not have the right to redistribute, and
> force-pushed the result to all branches.
>
> The old commits are now unreferenced, but they remain reachable by direct SHA
> URL. Please run garbage collection on the repository and purge any cached views
> so the removed content is no longer retrievable.
>
> Pre-rewrite branch heads:
>   main — d0eb61a18d15118d86121f17e991a9d569f13665
>   claude/repo-analysis-github-pages-x33bmh — e6839562aa610fcb0f403fbb602b99ff91332a31
>
> There are no forks of this repository. Thank you.

Check the fork claim before sending; if a fork exists, the objects live there too
and the fork owner has to delete it — GitHub will not do that for you.

## Also worth doing while the history is open

A one-time full-history secret sweep. Per-push CI deliberately scans only the
working tree (see the `secrets` job in `.github/workflows/ci.yml` for why), so
history has never been swept:

```bash
gitleaks detect --redact --verbose --config .gitleaks.toml
```

Without `--no-git` it walks every commit. Run it once now that history is short.

## If the rewrite needs undoing

GitHub still holds the old objects, so recovery is possible until the GC request
is actioned:

```bash
git fetch origin d0eb61a18d15118d86121f17e991a9d569f13665
git reset --hard FETCH_HEAD
git push --force origin main
```
