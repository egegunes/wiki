+++
title = 'Wiki conventions'
date = 2026-07-31
lastmod = 2026-07-31
tags = ['hugo', 'meta']
weight = 1
+++

How this wiki is put together, so future me does not have to reverse-engineer it.

## Adding a note

```sh
hugo new content kubernetes/pod-eviction.md
```

Directories are the only structure. A directory becomes a section in the
sidebar as soon as it holds an `_index.md`:

```sh
mkdir -p content/kubernetes/networking
hugo new content kubernetes/networking/_index.md --kind section
```

## Front matter

Only `title` is required. Everything else has a working default.

| Field      | Effect                                                       |
| ---------- | ------------------------------------------------------------ |
| `title`    | Heading and search title.                                    |
| `lastmod`  | Shown as `updated`; drives the staleness warning.            |
| `tags`     | Cross-references between notes that share no directory.      |
| `weight`   | Pins a note above the A→Z ordering in nav and listings.       |
| `description` | One line under the entry in its parent listing.            |
| `toc`      | Set `false` to suppress the table of contents.                |
| `noindex`  | Set `true` to keep a note out of search and search engines.   |

## Ordering

Anything with a `weight` sorts first, by weight. Everything else sorts
alphabetically. Dates never affect ordering — a note's position should not move
just because it was edited.

## Staleness

Notes go quietly stale after 18 months and say so at the top. Bump `lastmod`
when you re-verify something; change `staleAfterMonths` in `hugo.toml` to move
the threshold, or set it to `0` to turn it off.

## Markdown worth remembering

Definition lists render as a two-column grid, which suits flags and fields:

```md
`--force`
: Skips graceful deletion. Leaves the container running.

`--grace-period=0`
: Must be paired with `--force`.
```

`--force`
: Skips graceful deletion. Leaves the container running.

`--grace-period=0`
: Must be paired with `--force`.

Raw HTML is enabled, so a `<details>` block works when a note needs to hide a
long dump:

<details>
<summary>Full output</summary>

```
NAME       READY   STATUS    RESTARTS   AGE
etcd-0     1/1     Running   0          41d
```

</details>

Code blocks show their language, scroll rather than wrap, and grow a copy
button on hover. Long lines stay on one line, because a command that has been
wrapped is a command you cannot paste:

```go
func main() {
	// Highlighting is Chroma's, coloured from the same CSS variables as the
	// rest of the page, so it follows the light and dark themes.
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
}
```

## Keyboard

<kbd>/</kbd>
: Jump to search.

<kbd>↑</kbd> <kbd>↓</kbd>
: Move through results.

<kbd>Esc</kbd>
: Close results, then leave the box.
