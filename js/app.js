/* ============================================================
 * app.js — Bootstrap & glue (v3)
 * ------------------------------------------------------------
 * Wires search, chips, popup, map callbacks. No fetch, no
 * Excel — everything in memory from data.js.
 * ============================================================ */

'use strict';

const App = (() => {
  const els = {
    search: document.getElementById('search'),
    clear:  document.getElementById('search-clear'),
    suggest:document.getElementById('suggestions'),
    chips:  document.getElementById('chips'),
    overlay:document.getElementById('popup-overlay'),
    popup:  document.getElementById('popup'),
    pbody:  document.getElementById('popup-body'),
    pclose: document.getElementById('popup-close'),
    theme:  document.getElementById('theme-toggle'),
    brand:  document.getElementById('brand-home'),
  };

  let activeCategory = null;
  let activeIndex = -1;
  let suggList = [];

  /* ====== Init ====== */
  function init() {
    initTheme();
    CampusMap.render();
    CampusMap.setupControls();
    CampusMap.setSelectHandler(onBuildingClick);
    renderChips();
    wireEvents();
  }

  /* ====== Theme ====== */
  function initTheme() {
    const saved = localStorage.getItem('ccsjdm-theme');
    const dark = saved ? saved==='dark' : window.matchMedia?.('(prefers-color-scheme:dark)').matches;
    setTheme(dark ? 'dark' : 'light');
    els.theme.addEventListener('click', () => {
      setTheme(document.documentElement.dataset.theme==='dark' ? 'light' : 'dark');
    });
  }
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    localStorage.setItem('ccsjdm-theme', t);
  }

  /* ====== Chips (highlight only, no auto-popup) ====== */
  function renderChips() {
    els.chips.innerHTML = '';
    for (const cat of CATEGORIES) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip';
      btn.dataset.cat = cat.id;
      btn.textContent = cat.icon + ' ' + cat.label;
      btn.addEventListener('click', () => onChipClick(cat.id));
      els.chips.appendChild(btn);
    }
  }

  function onChipClick(catId) {
    // Toggle: same chip → deactivate
    if (activeCategory === catId) {
      activeCategory = null;
      CampusMap.clearHighlight();
      els.chips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      return;
    }
    activeCategory = catId;
    // Update chip visuals
    els.chips.querySelectorAll('.chip').forEach(c => {
      c.classList.toggle('active', c.dataset.cat === catId);
    });
    // Highlight matching buildings on map (no popup!)
    CampusMap.highlightCategory(catId);
    closePopup();
  }

  /* ====== Building click (open popup) ====== */
  function onBuildingClick(block) {
    const buildingNames = block.buildings; // e.g. ['Main Building']
    const rooms = LocationStore.all().filter(l => buildingNames.includes(l.building));

    if (rooms.length <= 1) {
      // Single location — show detail popup
      openDetailPopup(rooms[0] || { room:block.label, building:block.buildings[0], category:'Building' });
    } else {
      // Multiple rooms — show building overview
      openBuildingPopup(rooms);
    }

    CampusMap.selectBlock(block.id);
    CampusMap.showStatus(block.label);
  }

  /* ====== Building popup (rooms list) ====== */
  function openBuildingPopup(rooms) {
    const head = rooms.find(r => r.category==='Building') || rooms[0];
    const floors = [...new Set(rooms.map(r => r.floor||'Ground'))];
    const cc = catColor(head.category);

    let html = `<div class="p-head">
      <div class="p-icon" style="background:${cc}22;color:${cc}">${catIcon(head.category)}</div>
      <div><h2>${esc(head.building)}</h2>
      <span class="p-tag" style="background:${cc}18;color:${cc};border:1px solid ${cc}33">${esc(head.category)}</span></div>
    </div>`;

    if (head.description) html += `<div class="p-sec"><h3>📝 Description</h3><p>${esc(head.description)}</p></div>`;

    html += `<div class="p-grid">
      <div class="p-cell"><label>Building</label><span>${esc(head.building)}</span></div>
      <div class="p-cell"><label>Floors</label><span>${floors.length} (${floors.map(f=>esc(f)).join(', ')})</span></div>
    </div>`;

    if (head.nearby) html += `<div class="p-sec"><h3>📍 Nearby</h3><p>${esc(head.nearby)}</p></div>`;

    if (head.directions) {
      const steps = head.directions.split(/\.\s+/).filter(Boolean);
      html += `<div class="p-sec"><h3>🚶 How to Reach</h3><div class="walk-card"><ul>`;
      for (const s of steps) html += `<li>${esc(s.replace(/\.$/,''))}</li>`;
      html += `</ul></div></div>`;
    }

    html += `<div class="p-sec"><h3>🚪 Rooms &amp; Offices</h3><div class="room-list">`;
    for (const r of rooms) {
      html += `<button type="button" class="room-row" data-id="${esc(r.id)}">
        <span class="r-ico">${catIcon(r.category)}</span>
        <span><span class="r-name">${esc(r.room)}</span><br><span class="r-meta">${esc(r.floor||'Ground')}${r.nearby?' · '+esc(r.nearby):''}</span></span>
      </button>`;
    }
    html += `</div></div>`;

    els.pbody.innerHTML = html;
    openPopup();
    wireRoomClicks();
  }

  /* ====== Single detail popup ====== */
  function openDetailPopup(loc) {
    const cc = catColor(loc.category);
    let html = `<div class="p-head">
      <div class="p-icon" style="background:${cc}22;color:${cc}">${catIcon(loc.category)}</div>
      <div><h2>${esc(loc.room)}</h2>
      <span class="p-tag" style="background:${cc}18;color:${cc};border:1px solid ${cc}33">${esc(loc.category)}</span></div>
    </div>
    <div class="p-grid">
      <div class="p-cell"><label>Building</label><span>${esc(loc.building)}</span></div>
      <div class="p-cell"><label>Floor</label><span>${esc(loc.floor||'Ground')}</span></div>
    </div>`;
    if (loc.description) html += `<div class="p-sec"><h3>📝 Description</h3><p>${esc(loc.description)}</p></div>`;
    if (loc.nearby) html += `<div class="p-sec"><h3>📍 Nearby</h3><p>${esc(loc.nearby)}</p></div>`;
    if (loc.directions) {
      const steps = loc.directions.split(/\.\s+/).filter(Boolean);
      html += `<div class="p-sec"><h3>🚶 How to Reach</h3><div class="walk-card"><ul>`;
      for (const s of steps) html += `<li>${esc(s.replace(/\.$/,''))}</li>`;
      html += `</ul></div></div>`;
    }
    els.pbody.innerHTML = html;
    openPopup();
  }

  function wireRoomClicks() {
    els.pbody.querySelectorAll('.room-row').forEach(btn => {
      btn.addEventListener('click', () => {
        const loc = LocationStore.byId(btn.dataset.id);
        if (loc) openDetailPopup(loc);
      });
    });
  }

  /* ====== Popup open/close ====== */
  function openPopup() { els.overlay.hidden = false; els.popup.scrollTop = 0; }
  function closePopup() { els.overlay.hidden = true; }

  /* ====== Search ====== */
  function runSearch(query) {
    const q = String(query||'').trim();
    if (!q) return;
    const results = SearchEngine.search(q);
    if (!results.length) {
      closePopup();
      CampusMap.clearHighlight();
      return;
    }
    // Show the top result
    openDetailPopup(results[0]);
    // Find its building block and highlight it
    const block = CampusMap.BLOCKS.find(b => b.buildings.includes(results[0].building));
    if (block) CampusMap.selectBlock(block.id);
    CampusMap.showStatus(results[0].room + ' — ' + results[0].building);
  }

  function showSuggestions(query) {
    if (!query) { hideSuggestions(); return; }
    suggList = SearchEngine.suggestions(query);
    activeIndex = -1;
    if (!suggList.length) { hideSuggestions(); return; }

    els.suggest.innerHTML = suggList.map((s,i) => `
      <button type="button" class="suggestion" role="option" data-i="${i}">
        <span class="s-icon">${catIcon(s.category)}</span>
        <span class="s-main">
          <span class="s-name">${SearchEngine.highlight(s.room, query)}</span>
          <span class="s-meta">${esc(s.building)}${s.floor?' · '+esc(s.floor):''}</span>
        </span>
      </button>`).join('');
    els.suggest.hidden = false;

    els.suggest.querySelectorAll('.suggestion').forEach(el => {
      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const i = Number(el.dataset.i);
        if (suggList[i]) { runSearch(suggList[i].keyword); hideSuggestions(); }
      });
    });
  }

  function hideSuggestions() { els.suggest.hidden = true; els.suggest.innerHTML = ''; activeIndex = -1; }
  function moveActive(d) {
    const items = els.suggest.querySelectorAll('.suggestion');
    if (!items.length) return;
    activeIndex = (activeIndex + d + items.length) % items.length;
    items.forEach((el,i) => el.classList.toggle('active', i===activeIndex));
  }
  function pickActive() {
    if (activeIndex>=0 && suggList[activeIndex]) { runSearch(suggList[activeIndex].keyword); hideSuggestions(); return true; }
    return false;
  }

  /* ====== Event wiring ====== */
  function wireEvents() {
    els.search.addEventListener('input', () => {
      const q = els.search.value.trim();
      els.clear.hidden = !q;
      showSuggestions(q);
    });
    els.search.addEventListener('keydown', (e) => {
      if (e.key==='ArrowDown') { e.preventDefault(); moveActive(1); }
      else if (e.key==='ArrowUp') { e.preventDefault(); moveActive(-1); }
      else if (e.key==='Enter') { e.preventDefault(); if (!pickActive()) runSearch(els.search.value); hideSuggestions(); }
      else if (e.key==='Escape') { hideSuggestions(); closePopup(); CampusMap.clearHighlight(); els.search.value=''; els.clear.hidden=true; }
    });
    els.search.addEventListener('blur', () => setTimeout(hideSuggestions, 150));
    els.clear.addEventListener('click', () => {
      els.search.value=''; els.clear.hidden=true;
      hideSuggestions(); closePopup(); CampusMap.clearHighlight();
      els.search.focus();
    });

    els.pclose.addEventListener('click', closePopup);
    els.overlay.addEventListener('click', (e) => { if (e.target===els.overlay) closePopup(); });

    els.brand.addEventListener('click', (e) => {
      e.preventDefault();
      closePopup(); CampusMap.clearHighlight();
      els.search.value=''; els.clear.hidden=true; hideSuggestions();
      activeCategory = null;
      els.chips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    });
  }

  function esc(s) { return SearchEngine.esc(s); }
  function catColor(c) { return typeof window.catColor === 'function' ? window.catColor(c) : '#64748b'; }
  function catIcon(c)  { return typeof window.catIcon === 'function' ? window.catIcon(c) : '📍'; }

  document.addEventListener('DOMContentLoaded', init);
  return { runSearch, openDetailPopup };
})();
