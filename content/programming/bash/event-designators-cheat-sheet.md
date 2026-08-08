+++
title = 'Event Designators Cheat Sheet'
date = 2026-08-08T12:38:34+03:00
lastmod = 2026-08-08T12:38:34+03:00
tags = []
+++

# shell `!` (event designator) cheat sheet

based on ["a shell exclamation mark is not for yelling. be lazy."](https://refp.se/articles/your-shell-and-the-lazy-exclamation-mark) by filip roséen. applies to interactive `bash`, `csh`, `tcsh`, `zsh` — not scripts.

## anatomy

```
![event][:word][:modifier]
    |      |        |
    |      |        '--> modifier    [ :h :t :r :e ... ]
    |      '-----------> which part  [ :0 :$ :* :2-3 ... ]
    '------------------> which line  [ !! !-2 !ssh !?needle? ... ]
```

`!` followed directly by `:` refers to the previous line.

## event designators — which line

| syntax | meaning |
|---|---|
| `!!` | previous command |
| `!-2` | two lines back |
| `!1337` | line 1337 from `history` |
| `!ssh` | most recent line starting with `ssh` |
| `!?needle?` | most recent line containing `needle` |
| `!#` | the current line, as typed so far |
| `^old^new^` | rerun previous command with first `old` → `new` |

## word designators — which part

example previous line: `/path/to/script.sh "hello world" --enable 1337`

| syntax | selects | result |
|---|---|---|
| `!:0` | command word | `/path/to/script.sh` |
| `!:1` | 2nd word (1st arg) | `hello world` |
| `!:$` | last word | `1337` |
| `!:1-2` | range | `hello world --enable` |
| `!:*` | all args | `hello world --enable 1337` |
| `!:1-` | all args but last | `hello world --enable` |
| `!:2*` | 3rd word through last | `--enable 1337` |

short forms: `!$` = `!:$`, `!*` = `!:*`.

## modifiers — transform the part

| syntax | effect |
|---|---|
| `:h` | strip filename (like `dirname`) |
| `:t` | strip leading path (like `basename`) |
| `:r` | strip extension |
| `:e` | keep only extension |
| `:s/a/b/` | replace first `a` with `b` |
| `:gs/a/b/` | replace all `a` with `b` |
| `:p` | print, don't run (e.g. `!ssh:p`) |

## the four worth memorizing

| syntax | use case |
|---|---|
| `!$` | last argument of previous command |
| `!:0` | rerun that annoyingly located script |
| `!$:h` | directory part of last argument |
| `!$:t` | filename part of last argument |

## everyday combos

```shell
$ apt install pkg          # permission denied
$ sudo !!                  # rerun with sudo

$ mkdir /var/mnt/cache
$ cd !$                    # cd into it

$ touch ~/projects/work/awesome.sh
$ cd !$:h                  # cd to its directory

$ ssh 10.240.33.109 -p2222 -i ~/.ssh/prod/ed25519
$ ssh 10.240.33.110 !:2*   # same flags, other host

$ ffmpeg -i /rec/day.mov !#:2:r.mkv   # reuse arg from current line, swap ext
$ scp !$:r.* example.com:/media
```

## posix fallback: `fc`

works in any posix shell (except truly minimal ones like `dash` / busybox `ash`). edits history in `$FCEDIT` (fallback `ed`; many shells use `$EDITOR`).

| syntax | effect |
|---|---|
| `fc` | edit previous command in editor, then run |
| `fc -2` | edit command 2 back |
| `fc grep` | edit last command starting with `grep` |
| `fc -3 -1` | last three commands in one buffer |
| `fc ssh -1` | from last `ssh` line through most recent |
| `fc -s ssh` | rerun last `ssh` command, no editor |
| `fc -s a=b ssh` | rerun last `ssh` command with `a` → `b` |
| `fc -e 'sed -i s/x/y/g' -3 -1` | rerun last 3 cmds through a non-interactive "editor" |

## turning it off / customizing

```shell
set +H                 # bash: disable history expansion
setopt nobanghist      # zsh: same
histchars='%^#'        # change trigger chars (event, substitution, comment)
```

common gotcha: `echo "!dlrow olleh"` → `event not found` (double quotes don't protect `!`; single quotes do).
