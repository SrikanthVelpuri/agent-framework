// SPA controller — routing, rendering, search, interview mode, persistence.
(function () {
  const app = document.getElementById("app");
  const search = document.getElementById("globalSearch");
  const chips = document.getElementById("filterChips");
  const themeBtn = document.getElementById("themeToggle");
  const STORAGE_KEY = "maf_dashboard_progress_v1";
  const THEME_KEY = "maf_dashboard_theme";

  // ──────────────────────────────────────────────────────────
  //  Theme
  // ──────────────────────────────────────────────────────────
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);
  themeBtn.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
  });

  // ──────────────────────────────────────────────────────────
  //  Progress (interview mastery + answer reveals) in localStorage
  // ──────────────────────────────────────────────────────────
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
    catch { return {}; }
  }
  function saveProgress(p) { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }
  function setMastered(qid, val) {
    const p = loadProgress();
    p.mastered = p.mastered || {};
    if (val) p.mastered[qid] = true; else delete p.mastered[qid];
    saveProgress(p);
  }
  function isMastered(qid) {
    const p = loadProgress();
    return p.mastered && p.mastered[qid];
  }

  // ──────────────────────────────────────────────────────────
  //  Filter chips
  // ──────────────────────────────────────────────────────────
  const activeFilters = { categories: new Set(), languages: new Set(), status: new Set() };

  function renderChips() {
    chips.innerHTML = "";
    const groups = [
      ["Category", Object.values(window.MAF_CATEGORIES).map(c => ({ id: c.id, label: c.label, kind: "categories" }))],
      ["Language", [{ id: "python", label: "Python", kind: "languages" }, { id: "dotnet", label: ".NET", kind: "languages" }]],
      ["Status", [{ id: "accepted", label: "Accepted", kind: "status" }, { id: "proposed", label: "Proposed", kind: "status" }, { id: "shipped", label: "Shipped", kind: "status" }]]
    ];
    groups.forEach(([label, items]) => {
      const sep = document.createElement("span");
      sep.className = "dim";
      sep.style.fontSize = "11px";
      sep.style.padding = "0 4px";
      sep.textContent = label + ":";
      chips.appendChild(sep);
      items.forEach(it => {
        const c = document.createElement("span");
        c.className = "chip" + (activeFilters[it.kind].has(it.id) ? " active" : "");
        c.textContent = it.label;
        c.addEventListener("click", () => {
          activeFilters[it.kind].has(it.id) ? activeFilters[it.kind].delete(it.id) : activeFilters[it.kind].add(it.id);
          renderChips();
          // Filters only have a visible effect on /catalog, so jump there
          // from any other view when the user clicks a chip.
          const route = parseRoute();
          if (route.name !== "catalog") { navigate("#/catalog"); }
          else { rerenderCurrentRoute(); }
        });
        chips.appendChild(c);
      });
    });
  }
  renderChips();

  // ──────────────────────────────────────────────────────────
  //  Search
  // ──────────────────────────────────────────────────────────
  search.addEventListener("input", () => {
    const route = parseRoute();
    if (search.value.trim() && route.name !== "catalog" && route.name !== "interview") {
      navigate("#/catalog");
    } else {
      rerenderCurrentRoute();
    }
  });
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); search.focus(); }
    if (e.key === "/" && document.activeElement !== search) { e.preventDefault(); search.focus(); }
  });

  function matchesFilter(row) {
    const q = search.value.trim().toLowerCase();
    if (q) {
      const hay = [row.title, row.summary, row.adr || "", row.id, ...(row.languages || []), row.category]
        .concat(JSON.stringify(row.story || {}))
        .concat(JSON.stringify(row.interview || []))
        .concat(JSON.stringify(row.interviewStory || {}))
        .join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (activeFilters.categories.size && !activeFilters.categories.has(row.category)) return false;
    if (activeFilters.languages.size) {
      const ok = (row.languages || []).some(l => activeFilters.languages.has(l));
      if (!ok) return false;
    }
    if (activeFilters.status.size && !activeFilters.status.has(row.status)) return false;
    return true;
  }

  // ──────────────────────────────────────────────────────────
  //  Routing
  // ──────────────────────────────────────────────────────────
  function parseRoute() {
    const h = location.hash || "#/";
    const parts = h.replace(/^#\//, "").split("/").filter(Boolean);
    if (parts.length === 0) return { name: "dashboard" };
    if (parts[0] === "catalog") return { name: "catalog" };
    if (parts[0] === "interview") return { name: "interview" };
    if (parts[0] === "about") return { name: "about" };
    if (parts[0] === "concept") return { name: "concept", id: parts[1] };
    return { name: "dashboard" };
  }
  function navigate(hash) { location.hash = hash; }
  window.addEventListener("hashchange", () => render());

  function rerenderCurrentRoute() { render(); }

  // ──────────────────────────────────────────────────────────
  //  Renderers
  // ──────────────────────────────────────────────────────────
  function render() {
    const route = parseRoute();
    document.querySelectorAll(".topnav a").forEach(a => a.classList.toggle("active", a.dataset.route === route.name));
    if (route.name === "dashboard") return renderDashboard();
    if (route.name === "catalog") return renderCatalog();
    if (route.name === "interview") return renderInterview();
    if (route.name === "about") return renderAbout();
    if (route.name === "concept") return renderConcept(route.id);
  }

  function renderDashboard() {
    const tpl = document.getElementById("tpl-dashboard").content.cloneNode(true);
    app.innerHTML = "";
    app.appendChild(tpl);

    // Stats
    const catalog = window.MAF_CATALOG;
    const adrCount = catalog.filter(r => r.adr).length;
    const featureCount = catalog.filter(r => r.id.startsWith("feature-")).length;
    const featuredCount = catalog.filter(r => r.featured).length;
    const totalQs = catalog.reduce((sum, r) => sum + countQuestions(r.interview), 0);
    const stats = document.getElementById("stats");
    stats.innerHTML = [
      { num: catalog.length, lbl: "Total docs" },
      { num: adrCount, lbl: "ADRs" },
      { num: featureCount, lbl: "Feature deep dives" },
      { num: featuredCount, lbl: "Five-lens treatments" },
      { num: totalQs, lbl: "Interview questions (with follow-ups)" }
    ].map(s => `<div class="stat"><div class="num">${s.num}</div><div class="lbl">${s.lbl}</div></div>`).join("");

    // Category grid
    const cats = Object.values(window.MAF_CATEGORIES);
    document.getElementById("categoryGrid").innerHTML = cats.map(c => {
      const count = catalog.filter(r => r.category === c.id).length;
      return `<div class="card" data-cat="${c.id}">
        <div class="card-eyebrow">${count} docs</div>
        <h3>${c.label}</h3>
        <div class="summary">${c.blurb}</div>
      </div>`;
    }).join("");
    document.querySelectorAll("#categoryGrid .card").forEach(card => {
      card.addEventListener("click", () => {
        activeFilters.categories.clear();
        activeFilters.categories.add(card.dataset.cat);
        renderChips();
        navigate("#/catalog");
      });
    });

    // Featured
    document.getElementById("featuredGrid").innerHTML = catalog
      .filter(r => r.featured)
      .map(r => cardHTML(r))
      .join("");
    bindCardLinks();
  }

  function cardHTML(r) {
    const langTags = (r.languages || []).map(l => `<span class="tag ${l}">${l}</span>`).join("");
    const statusTag = r.status ? `<span class="tag ${r.status}">${r.status}</span>` : "";
    const adrTag = r.adr ? `<span class="tag">ADR ${r.adr}</span>` : "";
    return `<div class="card" data-id="${r.id}">
      <div class="card-eyebrow">${(window.MAF_CATEGORIES[r.category] || {}).label || r.category}</div>
      <h3>${r.title}</h3>
      <div class="summary">${r.summary}</div>
      <div class="meta">${adrTag}${langTags}${statusTag}</div>
    </div>`;
  }

  function bindCardLinks() {
    document.querySelectorAll(".card[data-id]").forEach(c => {
      c.addEventListener("click", () => navigate("#/concept/" + c.dataset.id));
    });
  }

  function renderCatalog() {
    const tpl = document.getElementById("tpl-catalog").content.cloneNode(true);
    app.innerHTML = "";
    app.appendChild(tpl);

    const rows = window.MAF_CATALOG.filter(matchesFilter);
    const tableHost = document.getElementById("catalogTable");
    if (!rows.length) {
      tableHost.innerHTML = `<p class="muted">No docs match the current filter.</p>`;
      return;
    }
    tableHost.innerHTML = `<table class="catalog-table">
      <thead><tr>
        <th>Title</th><th>Category</th><th>ADR</th><th>Status</th><th>Lang</th><th>Source</th>
      </tr></thead>
      <tbody>
      ${rows.map(r => `<tr data-id="${r.id}">
        <td><strong>${r.title}</strong><div class="dim" style="font-size:12px">${r.summary}</div></td>
        <td>${(window.MAF_CATEGORIES[r.category] || {}).label || r.category}</td>
        <td>${r.adr || ""}</td>
        <td>${r.status || ""}</td>
        <td>${(r.languages || []).join(" / ")}</td>
        <td><a href="${window.MAF_REPO_BASE}${r.source}" target="_blank" rel="noopener" onclick="event.stopPropagation()">github ↗</a></td>
      </tr>`).join("")}
      </tbody>
    </table>`;
    tableHost.querySelectorAll("tr[data-id]").forEach(tr => {
      tr.addEventListener("click", () => navigate("#/concept/" + tr.dataset.id));
    });
  }

  function renderConcept(id) {
    const row = window.MAF_CATALOG.find(r => r.id === id);
    if (!row) {
      app.innerHTML = `<section class="section"><h2>Not found</h2><p>No concept with id <code>${id}</code>.</p><a href="#/catalog">Back to catalog</a></section>`;
      return;
    }
    const tpl = document.getElementById("tpl-concept").content.cloneNode(true);
    app.innerHTML = "";
    app.appendChild(tpl);

    const head = app.querySelector(".concept-head");
    const langTags = (row.languages || []).map(l => `<span class="tag ${l}">${l}</span>`).join("");
    const statusTag = row.status ? `<span class="tag ${row.status}">${row.status}</span>` : "";
    const adrTag = row.adr ? `<span class="tag">ADR ${row.adr}</span>` : "";
    head.innerHTML = `
      <div class="card-eyebrow">${(window.MAF_CATEGORIES[row.category] || {}).label || row.category}</div>
      <h1>${row.title}</h1>
      <div class="summary">${row.summary}</div>
      <div class="meta" style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px;">${adrTag}${langTags}${statusTag}</div>
      <div class="source-link"><a href="${window.MAF_REPO_BASE}${row.source}" target="_blank" rel="noopener">View source markdown on GitHub ↗</a></div>
    `;

    const tabs = app.querySelectorAll(".concept-tabs button");
    const body = app.querySelector(".concept-body");
    tabs.forEach(t => t.addEventListener("click", () => {
      tabs.forEach(x => x.classList.remove("active"));
      t.classList.add("active");
      renderConceptTab(row, t.dataset.tab, body);
    }));
    renderConceptTab(row, "story", body);
  }

  function renderConceptTab(row, tab, body) {
    if (!row.story && tab !== "source") {
      body.innerHTML = `<p class="muted">This concept is in the catalog but does not have a five-lens deep dive yet. The featured concepts (see Dashboard) have full story, architect view, failure modes, and interview ladders. The <a href="${window.MAF_REPO_BASE}${row.source}" target="_blank" rel="noopener">source markdown</a> is your best deep dive.</p>`;
      return;
    }
    if (tab === "story") return renderStory(row, body);
    if (tab === "interview-story" && !row.interviewStory) {
      body.innerHTML = `<p class="muted">Interview-story rehearsal is authored only for the featured concepts (the ones with five-lens treatment). Use the <em>Story</em> tab for the four-beat narrative on this concept.</p>`;
      return;
    }
    if (tab === "interview-story") return renderInterviewStory(row, body);
    if (tab === "architect") return renderArchitect(row, body);
    if (tab === "failures") return renderFailures(row, body);
    if (tab === "interview") return renderLadder(row, body);
    if (tab === "connections") return renderConnections(row, body);
    if (tab === "source") return renderSource(row, body);
  }

  // Markdown helpers — used in questions, answers, story beats, etc.
  // marked is loaded via CDN with `defer`; on first call after page load it
  // should be ready, but we fall back to escaping if it's not.
  function md(s) {
    if (!s) return "";
    if (window.marked && marked.parse) return marked.parse(String(s));
    return `<p>${escapeHTML(String(s))}</p>`;
  }
  function mdInline(s) {
    if (!s) return "";
    if (window.marked && marked.parseInline) return marked.parseInline(String(s));
    return escapeHTML(String(s));
  }

  function renderStory(row, body) {
    const s = row.story;
    body.innerHTML = `<div class="beats">
      <div class="beat"><h4>Hook</h4>${md(s.hook)}</div>
      <div class="beat"><h4>Conflict</h4>${md(s.conflict)}</div>
      <div class="beat"><h4>Turn</h4>${md(s.turn)}</div>
      <div class="beat"><h4>Payoff</h4>${md(s.payoff)}</div>
    </div>
    <p class="muted" style="margin-top:18px;">Storyteller's note — every featured concept here follows the same four-beat structure, so a reader can compare designs by skimming the same shape across pages.</p>`;
  }

  function renderArchitect(row, body) {
    const a = row.architect;
    body.innerHTML = `
      <div class="kv"><h4>Problem</h4>${md(a.problem)}</div>
      <div class="kv"><h4>Forces</h4><ul>${a.forces.map(f => `<li>${mdInline(f)}</li>`).join("")}</ul></div>
      <div class="kv"><h4>Decision</h4>${md(a.decision)}</div>
      <div class="tradeoff-grid">
        <div class="kv good"><h4>Good</h4><ul>${a.tradeoffs.good.map(g => `<li>${mdInline(g)}</li>`).join("")}</ul></div>
        <div class="kv bad"><h4>Bad / costs</h4><ul>${a.tradeoffs.bad.map(g => `<li>${mdInline(g)}</li>`).join("")}</ul></div>
      </div>
      <div class="kv"><h4>Reversibility</h4>${md(a.reversibility)}</div>
    `;
  }

  function renderFailures(row, body) {
    body.innerHTML = `<div class="failures kv">
      <h4>What breaks at scale or in prod</h4>
      <ul>${row.failureModes.map(f => `<li>${mdInline(f)}</li>`).join("")}</ul>
      <p class="muted" style="margin-top:14px;">Staff-engineer's note — every concept has at least three failure modes worth surfacing in design review. If you can't list them for a feature you're shipping, you don't fully own the design.</p>
    </div>`;
  }

  function renderConnections(row, body) {
    const related = row.related || [];
    const further = row.furtherReading || [];
    const compare = row.compareWith || [];
    const directions = row.thinkingDirections || [];
    const rows = [];

    if (related.length) {
      const items = related.map(r => {
        const target = window.MAF_CATALOG.find(c => c.id === r.id);
        const title = target ? target.title : r.id;
        const featuredBadge = target && target.featured ? "" : ` <span class="dim" style="font-size:11px;">(catalog only)</span>`;
        return `<li><a href="#/concept/${r.id}"><strong>${title}</strong></a>${featuredBadge} — ${mdInline(r.why)}</li>`;
      }).join("");
      rows.push(`<div class="kv"><h4>Related concepts in MAF</h4><ul>${items}</ul></div>`);
    }

    if (compare.length) {
      const items = compare.map(c => `<li><strong>${escapeHTML(c.framework)}:</strong> ${mdInline(c.contrast)}</li>`).join("");
      rows.push(`<div class="kv"><h4>How other frameworks handle this</h4><ul>${items}</ul></div>`);
    }

    if (further.length) {
      const items = further.map(f => `<li><a href="${escapeAttr(f.url)}" target="_blank" rel="noopener">${escapeHTML(f.label)} ↗</a>${f.note ? ` — <span class="muted">${mdInline(f.note)}</span>` : ""}</li>`).join("");
      rows.push(`<div class="kv"><h4>Further reading (external)</h4><ul>${items}</ul></div>`);
    }

    if (directions.length) {
      const items = directions.map(d => `<li>${mdInline(d)}</li>`).join("");
      rows.push(`<div class="kv" style="border-left-color:var(--accent-2);"><h4 style="color:var(--accent-2);">Thinking directions — attack the design from these angles</h4><ul>${items}</ul><p class="muted" style="margin-top:8px;">Sit with each prompt for two or three minutes before answering. The goal is not to recall — it's to generate alternatives, then defend or reject the original choice.</p></div>`);
    }

    if (!rows.length) {
      body.innerHTML = `<p class="muted">No connection metadata yet for this concept. The featured concepts (see Dashboard) include cross-links, comparisons, and thinking prompts.</p>`;
      return;
    }
    body.innerHTML = rows.join("");
  }

  function renderInterviewStory(row, body) {
    const s = row.interviewStory;
    const storyboard = (s.storyboard || []).map(p => `<div class="story-para">${md(p)}</div>`).join("");
    const star = `
      <div class="star-grid">
        <div class="kv star-s"><h4>Situation</h4>${md(s.star.situation)}</div>
        <div class="kv star-t"><h4>Task</h4>${md(s.star.task)}</div>
        <div class="kv star-a"><h4>Action</h4>${md(s.star.action)}</div>
        <div class="kv star-r"><h4>Result</h4>${md(s.star.result)}</div>
      </div>`;
    const lps = (s.leadership || []).map(l =>
      `<li class="lp-item"><span class="lp-name">${escapeHTML(l.lp)}</span><span class="lp-note">${mdInline(l.note)}</span></li>`
    ).join("");
    const pitch = `<div class="elevator-pitch">
      <div class="elevator-eyebrow">90-second elevator pitch · say it aloud</div>
      ${md(s.elevatorPitch || "")}
    </div>`;
    body.innerHTML = `
      <p class="muted rehearsal-banner">Rehearsal artifact — first-person framing for behavioral-interview practice. I did <strong>not</strong> author the Microsoft Agent Framework; these are <em>"if I had led this design"</em> stories anchored in the public ADRs.</p>
      <section class="storyboard">${storyboard}</section>
      <h3 class="is-section-head">STAR breakdown — the 3-minute behavioral answer</h3>
      ${star}
      <h3 class="is-section-head">Leadership lens — Amazon LPs in play</h3>
      <ul class="lp-list">${lps}</ul>
      ${pitch}
    `;
  }

  function renderLadder(row, body) {
    body.innerHTML = `<div class="ladder">${row.interview.map(q => questionHTML(q, 0, row.id)).join("")}</div>`;
    bindQuestionActions(body);
  }

  function questionHTML(q, level, conceptId) {
    const qid = conceptId + "::" + hashStr(q.q);
    const mastered = isMastered(qid) ? "mastered" : "";
    const diffTag = q.difficulty ? `<span class="diff-tag diff-${q.difficulty}">${q.difficulty}</span>` : "";
    const typeTag = q.type ? `<span class="diff-tag" style="background:rgba(255,255,255,.05); color:var(--fg-muted);">${q.type}</span>` : "";
    const fu = q.followUps && q.followUps.length
      ? `<div class="followups">${q.followUps.map(f => questionHTML(f, level + 1, conceptId)).join("")}</div>`
      : "";
    return `<div class="q-card ${mastered}" data-level="${level}" data-qid="${qid}">
      <div class="q-meta">${diffTag}${typeTag}${level > 0 ? `<span class="diff-tag" style="background:rgba(0,0,0,.04); color:var(--fg-muted); border:1px solid var(--border-soft);">follow-up · L${level}</span>` : ""}</div>
      <div class="q-text">${mdInline(q.q)}</div>
      <div class="answer" style="display:none;">${q.modelAnswer ? md(q.modelAnswer) : "<em class='muted'>(answer to be authored — submit a PR!)</em>"}</div>
      <div class="q-actions">
        <button class="ghost btn-reveal">Reveal model answer</button>
        <button class="ghost btn-master">${isMastered(qid) ? "Unmark mastered" : "Mark mastered"}</button>
      </div>
      ${fu}
    </div>`;
  }

  function escapeAttr(s) { return String(s).replace(/"/g, "&quot;"); }

  function bindQuestionActions(root) {
    root.querySelectorAll(".q-card").forEach(card => {
      const qid = card.dataset.qid;
      const reveal = card.querySelector(":scope > .q-actions > .btn-reveal");
      const master = card.querySelector(":scope > .q-actions > .btn-master");
      const answer = card.querySelector(":scope > .answer");
      if (reveal && answer) reveal.addEventListener("click", (e) => {
        e.stopPropagation();
        const showing = answer.style.display !== "none";
        answer.style.display = showing ? "none" : "block";
        reveal.textContent = showing ? "Reveal model answer" : "Hide answer";
      });
      if (master) master.addEventListener("click", (e) => {
        e.stopPropagation();
        const now = !isMastered(qid);
        setMastered(qid, now);
        card.classList.toggle("mastered", now);
        master.textContent = now ? "Unmark mastered" : "Mark mastered";
      });
    });
  }

  function renderSource(row, body) {
    body.innerHTML = `<p class="muted">Loading <code>${row.source}</code> from the repo...</p>`;
    const url = window.MAF_REPO_BASE.replace("/blob/", "/raw/") + row.source;
    fetch(url).then(r => r.ok ? r.text() : Promise.reject(r.status)).then(txt => {
      const html = (window.marked && marked.parse) ? marked.parse(txt) : `<pre>${escapeHTML(txt)}</pre>`;
      body.innerHTML = `<div class="markdown">${html}</div>`;
    }).catch(err => {
      body.innerHTML = `<p class="muted">Could not fetch the source markdown directly (CORS / status ${err}). Open it on GitHub: <a href="${window.MAF_REPO_BASE}${row.source}" target="_blank" rel="noopener">${row.source}</a></p>`;
    });
  }

  // ──────────────────────────────────────────────────────────
  //  Interview Mode
  // ──────────────────────────────────────────────────────────
  let timerHandle = null;

  function renderInterview() {
    const tpl = document.getElementById("tpl-interview").content.cloneNode(true);
    app.innerHTML = "";
    app.appendChild(tpl);

    const conceptSel = document.getElementById("interviewConcept");
    const diffSel = document.getElementById("interviewDifficulty");
    const body = document.getElementById("interviewBody");
    const startBtn = document.getElementById("startTimer");
    const timerDisp = document.getElementById("timerDisplay");
    const resetBtn = document.getElementById("resetProgress");

    const featured = window.MAF_CATALOG.filter(r => r.interview && r.interview.length);
    conceptSel.innerHTML = `<option value="">All concepts (${featured.length})</option>` +
      featured.map(r => `<option value="${r.id}">${r.title}</option>`).join("");

    function rerender() {
      const cid = conceptSel.value;
      const diff = diffSel.value;
      const concepts = featured.filter(r => !cid || r.id === cid);
      let html = "";
      concepts.forEach(c => {
        const filtered = filterLadder(c.interview, diff);
        if (!filtered.length) return;
        html += `<div class="section">
          <h3 style="margin-top:24px;">${c.title}</h3>
          <p class="muted" style="margin-top:0;">${c.summary}</p>
          <div class="ladder">${filtered.map(q => questionHTML(q, 0, c.id)).join("")}</div>
        </div>`;
      });
      body.innerHTML = html || `<p class="muted">No questions match the current filter.</p>`;
      bindQuestionActions(body);
    }
    conceptSel.addEventListener("change", rerender);
    diffSel.addEventListener("change", rerender);
    rerender();

    startBtn.addEventListener("click", () => {
      if (timerHandle) { clearInterval(timerHandle); timerHandle = null; timerDisp.textContent = ""; startBtn.textContent = "Start 10-min timer"; return; }
      let t = 10 * 60;
      timerDisp.textContent = format(t);
      startBtn.textContent = "Stop timer";
      timerHandle = setInterval(() => {
        t -= 1;
        timerDisp.textContent = format(t);
        if (t <= 0) {
          clearInterval(timerHandle); timerHandle = null;
          timerDisp.textContent = "Time!";
          startBtn.textContent = "Start 10-min timer";
        }
      }, 1000);
      function format(s) { const m = Math.floor(s/60); const r = s%60; return `${m}:${String(r).padStart(2, "0")}`; }
    });

    resetBtn.addEventListener("click", () => {
      if (!confirm("Clear all 'mastered' marks and answer-reveal state?")) return;
      saveProgress({});
      rerender();
    });
  }

  function filterLadder(qs, diff) {
    if (!diff) return qs;
    const out = [];
    function walk(q, depth) {
      const matches = (q.difficulty === diff) || depth === 0;
      const children = (q.followUps || []).flatMap(f => {
        const inner = (f.difficulty === diff) ? [f] : walk(f, depth + 1) || [];
        return inner;
      }).filter(Boolean);
      if (q.difficulty === diff || children.length) {
        out.push({ ...q, followUps: children });
      }
    }
    qs.forEach(q => walk(q, 0));
    return out;
  }

  function renderAbout() {
    const tpl = document.getElementById("tpl-about").content.cloneNode(true);
    app.innerHTML = "";
    app.appendChild(tpl);
  }

  // ──────────────────────────────────────────────────────────
  //  Helpers
  // ──────────────────────────────────────────────────────────
  function countQuestions(qs) {
    if (!qs) return 0;
    let n = 0;
    function walk(q) { n++; (q.followUps || []).forEach(walk); }
    qs.forEach(walk);
    return n;
  }
  function hashStr(s) {
    let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h).toString(36);
  }
  function escapeHTML(s) { return s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }

  // Boot
  render();
})();
