# wiki

A Hugo theme for dumping technical reference notes somewhere you can find them
again. Built for Kubernetes, Linux, and Go notes, but it knows nothing about
any of that — it only knows how to get out of the way of content.

No web fonts, no CSS or JS dependencies, no build step. One stylesheet, one
script, both optional.

## Design

The chrome is a terminal; the content is a document. Structural text —
navigation, headings, metadata, tables, code — is monospace. Prose bodies are
set in a screen serif at a 68-character measure, while code and tables are
allowed to run wider, because a wrapped command is a command you cannot paste.

The breadcrumb is written as the command that would produce the page:

```
$ cat wiki/kubernetes/rbac.md      a note
$ ls wiki/kubernetes/              a section
$ grep -rl 'cgroups' wiki/         a tag
```

Every segment is a link, so it works as an ordinary breadcrumb too.

## What it does

- **Section tree navigation.** Directories are the only structure. The whole
  tree is in the sidebar on wide screens and collapsed behind `contents` on
  narrow ones, so a phone opens onto the note rather than onto the navigation.
- **Obsidian-style `[[wikilinks]]`**, resolved by title, filename, or path;
  `[[note|link text]]` and `[[note#heading]]` both work. A name with no note
  behind it renders as an unresolved link rather than vanishing. Brackets
  inside code are untouched, so `if [[ -z $x ]]` stays shell.
- **Backlinks.** Each note lists the notes that link to it, so a
  cross-reference can be read in both directions.
- **Link previews.** Hovering a wikilink shows the opening of the note it
  points at, so a reference can be checked without losing your place.
- **Client-side search** over a generated `/index.json`. Title beats tag beats
  path beats body; all terms must match. Press <kbd>/</kbd> to focus,
  arrows to move, <kbd>Enter</kbd> to open.
- **Light and dark**, following the system by default, with a text toggle that
  names what it will switch to. The choice is remembered and applied before
  first paint.
- **Staleness warnings.** A note older than `staleAfterMonths` says so at the
  top. Kubernetes API groups and kernel flags do not age well.
- **Syntax highlighting** via Hugo's built-in Chroma, coloured from the same
  CSS variables as the rest of the page, so one stylesheet serves both themes.
- **Copy buttons** on code blocks, **anchors** on headings, **scroll containers**
  on wide tables.

Everything above still reads, navigates, and prints with JavaScript disabled.
Search, copy buttons, and table scrolling are the only enhancements that need it.

## Install

```sh
git submodule add https://github.com/egegunes/wiki themes/wiki
```

Then set `theme = 'wiki'` in your `hugo.toml`.

## Required site config

Hugo does not merge `outputs`, `taxonomies`, or `markup` from a theme's config
into the site's, so this block has to live in your own `hugo.toml`. Search needs
the JSON output; the render hooks need `unsafe` and `noClasses = false`.

```toml
# Section and tag names are used exactly as written. Without these, Hugo
# retitles a `pxc/` directory as "Pxcs" and `systemd/` as "Systemds".
capitalizeListTitles = false
pluralizeListTitles = false

[outputs]
  home = ['html', 'rss', 'json']

[taxonomies]
  tag = 'tags'

[markup]
  [markup.goldmark.renderer]
    unsafe = true
  [markup.goldmark.extensions]
    definitionList = true
    footnote = true
    table = true
    typographer = false
  [markup.highlight]
    noClasses = false
    lineNumbersInTable = true
    tabWidth = 4
  [markup.tableOfContents]
    startLevel = 2
    endLevel = 4
```

`typographer = false` is deliberate: straight quotes must stay straight when
prose sits next to shell commands.

## Params

| Param              | Default  | Effect                                            |
| ------------------ | -------- | ------------------------------------------------- |
| `root`             | `wiki`   | Path root shown in the command-line breadcrumb.   |
| `search`           | `true`   | Show the search box.                              |
| `linkPreviews`     | `true`   | Preview a wikilink's target on hover.             |
| `staleAfterMonths` | `18`     | Warn on notes older than this. `0` disables it.   |
| `tocMinHeadings`   | `3`      | Headings needed before a table of contents shows. |
| `description`      | —        | Shown under the site title and as meta description. |
| `repo`             | —        | Adds a `source` link to the footer.               |

## Front matter

Only `title` is required.

| Field         | Effect                                                     |
| ------------- | ---------------------------------------------------------- |
| `title`       | Heading and search title.                                  |
| `lastmod`     | Shown as `updated`; drives the staleness warning.          |
| `tags`        | Cross-references between notes that share no directory.    |
| `weight`      | Pins a note above the A→Z ordering in nav and listings.     |
| `description` | One line under the entry in its parent listing.            |
| `toc`         | `false` suppresses the table of contents.                   |
| `noindex`     | `true` keeps a note out of search and out of search engines. |

## Wikilinks

| Written | Resolves to |
| ------- | ----------- |
| `[[MySQL Group Replication]]` | the note with that title |
| `[[mysql-group-replication]]` | the note with that filename |
| `[[databases/mysql-group-replication]]` | the note at that path |
| `[[Note\|other text]]` | that note, shown as "other text" |
| `[[Note#Some heading]]` | that note, at that heading |

Matching is case-insensitive. Unmatched names render as
`<span class="wikilink--missing">`, styled with a dashed underline.

Wikilinks are resolved in `partials/content.html`, which the page templates
call in place of `.Content`. It splits the rendered HTML on `<code>` elements
and rewrites only the text outside them, so bracket syntax in shell, Go, or any
other code survives untouched. Pages with no `[[` in them skip the work
entirely.

## Link previews

Hovering a resolved wikilink shows a card with the target note's title, its
folder, and the first 240 characters of its text. It reads from the same
`/index.json` the search box uses — one lazy fetch, shared, and nothing is
requested until the reader hovers a link or opens search.

Deliberately narrow: pointer devices only (`hover: hover`), so a tap on a
phone just follows the link. Unresolved links show no card, since there is
nothing to preview. The card never takes the pointer, so it cannot flicker the
link underneath, and it is dismissed by moving away, scrolling, or
<kbd>Esc</kbd>. Set `linkPreviews = false` to turn it off.

## Backlinks

Notes and sections end with a **Linked from** list of everything that
wikilinks to them. Self-links and repeated links to the same note collapse to
one entry, and links written inside code are not links.

Only wikilinks count. A plain Markdown link to another note is a link on the
page but does not produce a backlink.

The graph is built once per site by `partials/wikilink-edges.html` and read
back per page by `partials/backlinks.html`. Both share the resolver in
`partials/wikilink-parse.html`, so a backlink exists exactly when the
corresponding forward link resolved.

## Ordering

Anything with a `weight` sorts first, by weight. Everything else sorts
alphabetically. Dates never affect ordering — a note should not move just
because it was edited.

## Customising

Every colour, font, and measure is a custom property at the top of
`assets/css/main.css`. To set prose in a sans face instead of a serif, change
one line:

```css
--prose: system-ui, sans-serif;
```

Copy any template into your site's `layouts/` to override it.

## License

MIT. See [LICENSE](LICENSE).
