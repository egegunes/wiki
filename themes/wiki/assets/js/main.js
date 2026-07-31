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

// ── search ──────────────────────────────────────────────────────────────────
// Substring scoring over a static JSON index. No library, no server.

(function search() {
  const root = document.querySelector("[data-search]");
  if (!root) return;

  const input = root.querySelector("[data-search-input]");
  const list = root.querySelector("[data-search-results]");
  let docs = null;
  let loading = null;
  let cursor = -1;

  const load = () => {
    if (docs) return Promise.resolve(docs);
    if (!loading) {
      loading = fetch(root.dataset.index)
        .then((r) => r.json())
        .then((d) => (docs = d))
        .catch(() => (docs = []));
    }
    return loading;
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

  const mark = (text, terms) => {
    let out = escapeHTML(text);
    for (const t of terms) {
      const re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      out = out.replace(re, "<mark>$1</mark>");
    }
    return out;
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
    if (!terms.length || !docs) {
      list.hidden = true;
      list.innerHTML = "";
      cursor = -1;
      return;
    }

    const hits = docs
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
            d.u +
            '"><span class="search__title">' +
            mark(d.t, terms) +
            "</span>" +
            (d.s ? '<span class="search__where">' + escapeHTML(d.s) + "/</span>" : "") +
            '<span class="search__snippet">' +
            mark(snippet(d, terms), terms) +
            "</span></a></li>",
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
