// Progressive enhancement only. Everything here is optional: with JS disabled
// the wiki still navigates, reads, and prints.

// ── theme ───────────────────────────────────────────────────────────────────
// The button says what happens when you press it.

(function theme() {
  const btn = document.querySelector("[data-theme-toggle]");
  if (!btn) return;

  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

  const current = () =>
    document.documentElement.dataset.theme ||
    (systemDark.matches ? "dark" : "light");

  const label = () => {
    const next = current() === "dark" ? "light" : "dark";
    btn.textContent = next;
    btn.setAttribute("aria-label", "Switch to " + next + " theme");
  };

  btn.addEventListener("click", () => {
    const next = current() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
    label();
  });

  systemDark.addEventListener("change", label);
  label();
})();

// ── sidebar ─────────────────────────────────────────────────────────────────
// CSS already keeps the tree open on wide screens. This only keeps the element's
// own state honest, so the toggle behaves after the breakpoint is crossed.

(function sidebar() {
  const panel = document.querySelector(".sidebar");
  if (!panel) return;
  const wide = window.matchMedia("(min-width: 60.0625rem)");
  const sync = () => {
    panel.open = wide.matches;
  };
  wide.addEventListener("change", sync);
  sync();
})();

// ── code blocks ─────────────────────────────────────────────────────────────
// A wiki of commands is only useful if the commands are easy to take.

(function copyButtons() {
  for (const block of document.querySelectorAll(".code")) {
    const pre = block.querySelector("pre");
    if (!pre) continue;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "code__copy";
    btn.textContent = "copy";
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(pre.innerText.replace(/\n$/, ""));
        btn.textContent = "copied";
      } catch (e) {
        btn.textContent = "failed";
      }
      setTimeout(() => (btn.textContent = "copy"), 1200);
    });
    block.appendChild(btn);
  }
})();

// Wide reference tables scroll inside themselves, never the page.
(function scrollableTables() {
  for (const table of document.querySelectorAll(".prose table")) {
    if (table.closest(".table-scroll") || table.closest(".chroma")) continue;
    const wrap = document.createElement("div");
    wrap.className = "table-scroll";
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  }
})();

// ── the note index ──────────────────────────────────────────────────────────
// One lazy fetch of /index.json, shared by search and by link previews.
// Nothing loads it until the reader reaches for one of them.

let indexDocs = null;
let indexLoading = null;

const loadIndex = () => {
  if (indexDocs) return Promise.resolve(indexDocs);
  if (!indexLoading) {
    const url = document.body.dataset.index;
    indexLoading = fetch(url)
      .then((r) => r.json())
      .then((d) => (indexDocs = d))
      .catch(() => (indexDocs = []));
  }
  return indexLoading;
};

const escapeHTML = (s) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );

// ── link previews ───────────────────────────────────────────────────────────
// Hovering a [[wikilink]] shows the opening of the note it points at, so a
// cross-reference can be checked without losing your place. Pointer devices
// only — on a touch screen a tap should just follow the link.

(function linkPreviews() {
  const card = document.querySelector("[data-preview]");
  if (!card) return;
  if (!window.matchMedia("(hover: hover)").matches) return;

  const DELAY = 220;
  let byUrl = null;
  let timer = null;
  let active = null;

  const hide = () => {
    clearTimeout(timer);
    if (active) active.removeAttribute("aria-describedby");
    active = null;
    card.hidden = true;
  };

  // Anchored under the link, flipped above when the bottom is close, and
  // always kept inside the viewport.
  const place = (link) => {
    card.style.left = "0px";
    card.style.top = "0px";
    const l = link.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    const edge = 8;
    const room = document.documentElement.clientWidth;

    let left = l.left + window.scrollX;
    left = Math.min(left, window.scrollX + room - c.width - edge);
    left = Math.max(left, window.scrollX + edge);

    const below = l.bottom + c.height + 14 < window.innerHeight;
    const top = below
      ? l.bottom + window.scrollY + 6
      : l.top + window.scrollY - c.height - 6;

    card.style.left = left + "px";
    card.style.top = top + "px";
  };

  const show = (link) => {
    loadIndex().then((docs) => {
      if (active !== link) return;
      if (!byUrl) {
        byUrl = new Map();
        for (const d of docs) byUrl.set(d.u, d);
      }
      const doc = byUrl.get(link.getAttribute("href").split("#")[0]);
      if (!doc || !doc.b) return;

      card.innerHTML =
        '<span class="preview__title">' +
        escapeHTML(doc.t) +
        "</span>" +
        (doc.s ? '<span class="preview__where">' + escapeHTML(doc.s) + "/</span>" : "") +
        '<span class="preview__body">' +
        escapeHTML(doc.b.slice(0, 240)) +
        (doc.b.length > 240 ? "…" : "") +
        "</span>";
      card.hidden = false;
      place(link);
      link.setAttribute("aria-describedby", card.id);
    });
  };

  const arm = (e) => {
    const link = e.target.closest("a.wikilink");
    if (!link || link === active) return;
    hide();
    active = link;
    timer = setTimeout(() => show(link), DELAY);
  };

  const disarm = (e) => {
    if (active && e.target.closest("a.wikilink") === active) hide();
  };

  document.addEventListener("mouseover", arm);
  document.addEventListener("mouseout", disarm);
  document.addEventListener("focusin", arm);
  document.addEventListener("focusout", disarm);
  window.addEventListener("scroll", hide, { passive: true });
  document.addEventListener("keydown", (e) => e.key === "Escape" && hide());
})();

// ── search ──────────────────────────────────────────────────────────────────
// Substring scoring over the static index. No library, no server.

(function search() {
  const root = document.querySelector("[data-search]");
  if (!root) return;

  const input = root.querySelector("[data-search-input]");
  const list = root.querySelector("[data-search-results]");
  let cursor = -1;
  const load = loadIndex;

  const escapeRE = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Match on the raw text and escape each piece afterwards. Escaping first
  // would let a search for "quo" or "39" land inside an entity like &quot;
  // or &#39; and split it into broken markup.
  const mark = (text, terms) => {
    if (!terms.length) return escapeHTML(text);
    const re = new RegExp("(" + terms.map(escapeRE).join("|") + ")", "gi");
    let out = "";
    let last = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (!m[0]) {
        re.lastIndex++;
        continue;
      }
      out += escapeHTML(text.slice(last, m.index));
      out += "<mark>" + escapeHTML(m[0]) + "</mark>";
      last = m.index + m[0].length;
    }
    return out + escapeHTML(text.slice(last));
  };

  // Title beats tag beats path beats body. Prefix matches beat mid-word ones.
  const score = (doc, terms) => {
    const title = doc.t.toLowerCase();
    const tags = (doc.g || []).join(" ").toLowerCase();
    const where = (doc.s || "").toLowerCase();
    const body = (doc.b || "").toLowerCase();
    let total = 0;

    for (const t of terms) {
      let best = 0;
      const at = title.indexOf(t);
      if (at === 0) best = 160;
      else if (at > 0) best = /[\s\-_/]/.test(title[at - 1]) ? 130 : 90;
      if (!best && tags.includes(t)) best = 70;
      if (!best && where.includes(t)) best = 45;
      if (!best && body.includes(t)) best = 12;
      if (!best) return 0; // every term must land somewhere
      total += best;
    }
    return total;
  };

  const snippet = (doc, terms) => {
    const body = doc.b || "";
    const at = body.toLowerCase().indexOf(terms[0]);
    if (at < 0) return body.slice(0, 150);
    const from = Math.max(0, at - 60);
    return (from ? "…" : "") + body.slice(from, from + 170);
  };

  const render = (query) => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length || !indexDocs) {
      list.hidden = true;
      list.innerHTML = "";
      cursor = -1;
      return;
    }

    const hits = indexDocs
      .map((d) => ({ d, n: score(d, terms) }))
      .filter((h) => h.n > 0)
      .sort((a, b) => b.n - a.n || a.d.t.length - b.d.t.length)
      .slice(0, 20);

    if (!hits.length) {
      list.innerHTML =
        '<li class="search__empty"># no matches for ' + escapeHTML(query) + "</li>";
    } else {
      list.innerHTML = hits
        .map(
          ({ d }) =>
            '<li><a href="' +
            escapeHTML(d.u) +
            '"><span class="search__title">' +
            mark(d.t, terms) +
            "</span>" +
            (d.s ? '<span class="search__where">' + escapeHTML(d.s) + "/</span>" : "") +
            (d.b
              ? '<span class="search__snippet">' + mark(snippet(d, terms), terms) + "</span>"
              : "") +
            "</a></li>",
        )
        .join("");
    }
    list.hidden = false;
    cursor = -1;
  };

  const links = () => Array.from(list.querySelectorAll("a"));

  const move = (delta) => {
    const items = links();
    if (!items.length) return;
    if (cursor >= 0) items[cursor].removeAttribute("aria-selected");
    cursor = (cursor + delta + items.length) % items.length;
    items[cursor].setAttribute("aria-selected", "true");
    items[cursor].scrollIntoView({ block: "nearest" });
  };

  const close = () => {
    list.hidden = true;
    cursor = -1;
  };

  input.addEventListener("focus", load);
  input.addEventListener("input", () => {
    const q = input.value.trim();
    load().then(() => {
      if (input.value.trim() === q) render(q);
    });
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter" && cursor >= 0) {
      e.preventDefault();
      links()[cursor].click();
    } else if (e.key === "Escape") {
      if (list.hidden) input.blur();
      close();
    }
  });

  document.addEventListener("click", (e) => {
    if (!root.contains(e.target)) close();
  });

  // "/" jumps to search, the way it does in most tools that hold notes.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
    const el = document.activeElement;
    if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
    if (el && el.isContentEditable) return;
    e.preventDefault();
    input.focus();
    input.select();
  });
})();
