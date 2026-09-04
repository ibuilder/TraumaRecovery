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

**Fork claim verified 2026-09-04**: the GitHub API reports `forks_count: 0`, so
the sentence above is true as written and the ticket can go as-is. Re-check if
any time passes before you send it — the repository is public and forkable
(`allow_forking: true`). If a fork appears, the objects live there too, and the
fork owner has to delete it; GitHub will not do that for you, and the ticket
should say so rather than claiming there are none.

## Full-history secret sweep — done, clean

Per-push CI deliberately scans only the working tree (see the `secrets` job in
`.github/workflows/ci.yml` for why), so history had never been swept. It has now,
once, against the rewritten history, with the same gitleaks build CI pins
(8.30.1, checksum verified):

```bash
gitleaks git --redact --config .gitleaks.toml --log-opts="--all" .
```

**Result: no leaks, across 4.15 MB and every commit that carries content.**

The tool reports "69 commits scanned" against 80 in the repository. That gap is
fully accounted for and is not a coverage hole: 3 are merge commits, which carry
no diff of their own, and 8 are commits `filter-repo` emptied — `attached_assets`
was their only content, so nothing remains in them to scan. 69 + 3 + 8 = 80.
Their commit messages were read separately; all eight are generic scaffolding
messages ("Saved progress at the end of the loop", "Published your App") and name
nothing.

Worth re-running after any future history rewrite, and cheap while history is
this short.

## If the rewrite needs undoing

GitHub still holds the old objects, so recovery is possible until the GC request
is actioned:

```bash
git fetch origin d0eb61a18d15118d86121f17e991a9d569f13665
git reset --hard FETCH_HEAD
git push --force origin main
```
