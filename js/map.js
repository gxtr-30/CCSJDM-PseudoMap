/* ============================================================
 * map.js — Campus map with 3D isometric game-style overlay
 * Photo background + SVG isometric building blocks, stone
 * pathways, trees. Matches reference game-map aesthetic.
 * ============================================================ */
const CampusMap = (() => {
  'use strict';

  const W = 1000, H = 700;
  const svg     = document.getElementById('map-svg');
  const scroll  = document.getElementById('map-scroll');
  const box     = document.getElementById('map-box');
  const photo   = document.getElementById('map-photo');
  const status  = document.getElementById('map-status');
  const zoomIn  = document.getElementById('zoom-in');
  const zoomOut = document.getElementById('zoom-out');
  const resetBtn= document.getElementById('map-reset');

  const NS = 'http://www.w3.org/2000/svg';
  let onSelect = null;
  const state = { zoom:1, tx:0, ty:0, activeBlockId:null };
  let rendered = false;

  /* ============================================================
   * Building data — positions match the real campus-photo.png
   * ============================================================ */
  const BLOCKS = [
    { id:'auditorium', x:215, y:55, w:195, h:120,
      color:'#c850b8', side:'#9a3888', bottom:'#7a2868',
      label:'Auditorium', buildings:['Auditorium'], depth:14 },

    { id:'ext', x:430, y:50, w:135, h:95,
      color:'#3a7abd', side:'#2a5a9d', bottom:'#1a4a8d',
      label:'Aud. Extension', buildings:['Auditorium Extension'], depth:12 },

    { id:'icc', x:25, y:195, w:120, h:195,
      color:'#c49a30', side:'#a07a18', bottom:'#806010',
      label:'Commercial Bldg', buildings:['ICC (Commercial Building)'], depth:14 },

    { id:'construction', x:250, y:215, w:175, h:110,
      color:'#a08838', side:'#7a6820', bottom:'#5a4a10',
      label:'Under Construction', buildings:['Under Construction'], depth:10, dashed:true },

    { id:'amphitheater', x:460, y:175, w:145, h:130,
      color:'#2aaa9a', side:'#1a8a7a', bottom:'#0a6a5a',
      label:'Amphitheater', buildings:['Campus Amphitheater'], shape:'ellipse', depth:10 },

    { id:'fishpond', x:640, y:165, w:105, h:85,
      color:'#38aadd', side:'#2888bb', bottom:'#1868aa',
      label:'Fish Pond', buildings:['Fish Pond'], shape:'ellipse', depth:6 },

    { id:'main', x:455, y:330, w:200, h:140,
      color:'#5a6070', side:'#3a4050', bottom:'#2a3040',
      label:'Main Building', buildings:['Main Building'], depth:16 },

    { id:'grounds', x:30, y:430, w:260, h:140,
      color:'#4a9a3a', side:'#2a7a1a', bottom:'#1a6a0a',
      label:'Campus Grounds', buildings:['Campus Grounds'], depth:8 },

    { id:'kadiwa', x:490, y:510, w:240, h:95,
      color:'#2a8a2a', side:'#1a6a1a', bottom:'#0a5a0a',
      label:'Kadiwa Market', buildings:['Kadiwa'], depth:12 },

    { id:'crim', x:700, y:45, w:115, h:80,
      color:'#cc3333', side:'#991a1a', bottom:'#880a0a',
      label:'Criminology Bldg', buildings:['CRIM Building'], depth:10 },

    { id:'firing', x:830, y:50, w:80, h:45,
      color:'#dd4444', side:'#aa2222', bottom:'#991111',
      label:'Firing Range', buildings:['Firing Range'], depth:8 },

    { id:'mgate', x:30, y:590, w:75, h:30,
      color:'#8a8868', side:'#6a6848', bottom:'#5a5838',
      label:'Main Gate', buildings:['Main Gate'], depth:5 },

    { id:'kgate', x:490, y:625, w:70, h:28,
      color:'#8a8868', side:'#6a6848', bottom:'#5a5838',
      label:'Kadiwa Gate', buildings:['Kadiwa Gate'], depth:5 },
  ];

  /* Stone pathway segments connecting buildings */
  const PATHS = [
    // Main horizontal road (upper) — Auditorium area
    { x:0, y:175, w:700, h:30 },
    // Middle horizontal — ICC to Amphitheater
    { x:0, y:310, w:600, h:30 },
    // Vertical left — Main Gate up to ICC
    { x:80, y:195, w:30, h:430 },
    // Vertical center — down from construction through Main Building to Kadiwa
    { x:475, y:175, w:30, h:475 },
    // Lower horizontal — Main Gate area to Kadiwa Gate
    { x:80, y:600, w:440, h:28 },
    // Short road: Main Building right to Kadiwa
    { x:475, y:470, w:30, h:45 },
    // Short road: Kadiwa down to Kadiwa Gate
    { x:475, y:595, w:30, h:35 },
    // Vertical right — from upper road down to Amphitheater
    { x:580, y:175, w:30, h:135 },
    // Road from upper right — CRIM/Firing area
    { x:700, y:130, w:30, h:50 },
  ];

  /* Decorative trees */
  const TREES = [
    {x:55,y:125,r:12},{x:135,y:105,r:10},{x:190,y:130,r:8},
    {x:395,y:110,r:9},{x:575,y:115,r:10},{x:630,y:125,r:8},
    {x:690,y:150,r:9},{x:920,y:80,r:11},{x:950,y:105,r:9},
    {x:880,y:130,r:8},{x:30,y:280,r:10},{x:165,y:275,r:8},
    {x:245,y:180,r:7},{x:50,y:580,r:10},{x:140,y:585,r:9},
    {x:310,y:570,r:8},{x:420,y:595,r:9},{x:780,y:365,r:10},
    {x:810,y:390,r:8},{x:900,y:380,r:9},{x:940,y:400,r:8},
    {x:800,y:530,r:9},{x:880,y:545,r:8},{x:940,y:530,r:10},
    {x:770,y:450,r:8},{x:660,y:440,r:9},{x:360,y:430,r:7},
  ];

  /* ============================================================
   * Render everything
   * ============================================================ */
  function render() {
    if (rendered) return;
    rendered = true;
    svg.innerHTML = '';

    // Defs
    const defs = document.createElementNS(NS,'defs');
    defs.innerHTML = `
      <filter id="sh3" x="-10%" y="-10%" width="125%" height="135%">
        <feDropShadow dx="3" dy="5" stdDeviation="3" flood-color="#000" flood-opacity="0.35"/>
      </filter>
      <filter id="sh2" x="-10%" y="-10%" width="125%" height="130%">
        <feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="#000" flood-opacity="0.28"/>
      </filter>
      <filter id="treeSh" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="1" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity="0.3"/>
      </filter>
      <radialGradient id="tg1" cx="35%" cy="30%" r="55%">
        <stop offset="0%" stop-color="#6cc85a"/><stop offset="100%" stop-color="#2a7a1a"/>
      </radialGradient>
      <radialGradient id="tg2" cx="35%" cy="30%" r="55%">
        <stop offset="0%" stop-color="#5ab84a"/><stop offset="100%" stop-color="#1a6a0a"/>
      </radialGradient>
      <pattern id="stone" width="24" height="24" patternUnits="userSpaceOnUse">
        <rect width="24" height="24" fill="#a09888"/>
        <rect x="0" y="0" width="11" height="11" fill="#968e7e" rx="1"/>
        <rect x="13" y="0" width="11" height="11" fill="#9a9282" rx="1"/>
        <rect x="0" y="13" width="11" height="11" fill="#9a9282" rx="1"/>
        <rect x="13" y="13" width="11" height="11" fill="#968e7e" rx="1"/>
      </pattern>
    `;
    svg.appendChild(defs);

    // --- Stone pathways ---
    const pathG = document.createElementNS(NS,'g');
    pathG.classList.add('roads');
    for (const p of PATHS) {
      // Stone base
      const r = document.createElementNS(NS,'rect');
      r.setAttribute('x', p.x); r.setAttribute('y', p.y);
      r.setAttribute('width', p.w); r.setAttribute('height', p.h);
      r.setAttribute('fill', 'url(#stone)');
      r.setAttribute('rx', '4');
      r.setAttribute('opacity', '0.7');
      pathG.appendChild(r);
      // Edge lines
      const tl = document.createElementNS(NS,'rect');
      tl.setAttribute('x', p.x); tl.setAttribute('y', p.y);
      tl.setAttribute('width', p.w); tl.setAttribute('height', p.h);
      tl.setAttribute('fill', 'none');
      tl.setAttribute('stroke', '#888070');
      tl.setAttribute('stroke-width', '1.5');
      tl.setAttribute('rx', '4');
      tl.setAttribute('opacity', '0.5');
      pathG.appendChild(tl);
    }
    svg.appendChild(pathG);

    // --- Trees ---
    const treeG = document.createElementNS(NS,'g');
    for (let i = 0; i < TREES.length; i++) {
      const t = TREES[i];
      const g = document.createElementNS(NS,'g');
      g.setAttribute('filter', 'url(#treeSh)');
      // Shadow
      const sh = document.createElementNS(NS,'ellipse');
      sh.setAttribute('cx', t.x + 2);
      sh.setAttribute('cy', t.y + t.r + 3);
      sh.setAttribute('rx', t.r * 0.8);
      sh.setAttribute('ry', t.r * 0.4);
      sh.setAttribute('fill', 'rgba(0,0,0,0.2)');
      g.appendChild(sh);
      // Trunk
      const trunk = document.createElementNS(NS,'rect');
      trunk.setAttribute('x', t.x - 2);
      trunk.setAttribute('y', t.y + t.r - 4);
      trunk.setAttribute('width', 4);
      trunk.setAttribute('height', 8);
      trunk.setAttribute('fill', '#6a4a2a');
      trunk.setAttribute('rx', '1');
      g.appendChild(trunk);
      // Canopy
      const c = document.createElementNS(NS,'circle');
      c.setAttribute('cx', t.x);
      c.setAttribute('cy', t.y);
      c.setAttribute('r', t.r);
      c.setAttribute('fill', i % 3 === 0 ? 'url(#tg1)' : 'url(#tg2)');
      g.appendChild(c);
      // Highlight
      const hl = document.createElementNS(NS,'circle');
      hl.setAttribute('cx', t.x - t.r * 0.2);
      hl.setAttribute('cy', t.y - t.r * 0.2);
      hl.setAttribute('r', t.r * 0.45);
      hl.setAttribute('fill', 'rgba(255,255,255,0.12)');
      g.appendChild(hl);
      treeG.appendChild(g);
    }
    svg.appendChild(treeG);

    // --- 3D Buildings ---
    for (const b of BLOCKS) {
      const g = document.createElementNS(NS,'g');
      g.dataset.blockId = b.id;
      g.classList.add('blk');
      g.setAttribute('filter', b.depth <= 6 ? 'url(#sh2)' : 'url(#sh3)');

      const d = b.depth || 8;

      if (b.shape === 'ellipse') {
        // 3D ellipse
        const cx = b.x + b.w/2, cy = b.y + b.h/2;
        const rx = b.w/2, ry = b.h/2;

        // Bottom half-side
        const side = document.createElementNS(NS,'path');
        side.setAttribute('d',
          `M${cx-rx},${cy} A${rx},${ry} 0 0,1 ${cx+rx},${cy} L${cx+rx},${cy+d} A${rx},${ry} 0 0,1 ${cx-rx},${cy+d} Z`);
        side.setAttribute('fill', b.side);
        g.appendChild(side);

        // Top ellipse
        const top = document.createElementNS(NS,'ellipse');
        top.setAttribute('cx', cx); top.setAttribute('cy', cy);
        top.setAttribute('rx', rx); top.setAttribute('ry', ry);
        top.setAttribute('fill', b.color);
        top.setAttribute('stroke', b.side);
        top.setAttribute('stroke-width', '2');
        g.appendChild(top);

      } else {
        // 3D rectangle: right face + bottom face + roof
        const bx = b.x, by = b.y, bw = b.w, bh = b.h;

        const rightFace = document.createElementNS(NS,'polygon');
        rightFace.setAttribute('points',
          `${bx+bw},${by} ${bx+bw+d},${by-d} ${bx+bw+d},${by+bh-d} ${bx+bw},${by+bh}`);
        rightFace.setAttribute('fill', b.side);
        g.appendChild(rightFace);

        const bottomFace = document.createElementNS(NS,'polygon');
        bottomFace.setAttribute('points',
          `${bx},${by+bh} ${bx+d},${by+bh-d} ${bx+bw+d},${by+bh-d} ${bx+bw},${by+bh}`);
        bottomFace.setAttribute('fill', b.bottom);
        g.appendChild(bottomFace);

        const topFace = document.createElementNS(NS,'rect');
        topFace.setAttribute('x', bx); topFace.setAttribute('y', by);
        topFace.setAttribute('width', bw); topFace.setAttribute('height', bh);
        topFace.setAttribute('rx', '5');
        topFace.setAttribute('fill', b.color);
        topFace.setAttribute('stroke', b.side);
        topFace.setAttribute('stroke-width', '2');
        if (b.dashed) topFace.setAttribute('stroke-dasharray', '10 5');
        g.appendChild(topFace);

        // Inner detail line (roof edge)
        const inner = document.createElementNS(NS,'rect');
        inner.setAttribute('x', bx+4); inner.setAttribute('y', by+4);
        inner.setAttribute('width', bw-8); inner.setAttribute('height', bh-8);
        inner.setAttribute('rx', '3');
        inner.setAttribute('fill', 'none');
        inner.setAttribute('stroke', 'rgba(255,255,255,0.15)');
        inner.setAttribute('stroke-width', '1');
        g.appendChild(inner);
      }

      // Label
      const lbl = document.createElementNS(NS,'text');
      lbl.setAttribute('x', b.x + b.w/2);
      lbl.setAttribute('y', b.y + b.h/2 + 4);
      lbl.classList.add('blk-label');
      lbl.textContent = b.label;
      g.appendChild(lbl);

      // Click handler
      g.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onSelect) onSelect(b);
      });

      svg.appendChild(g);
    }

    // --- Gate markers ---
    const gates = [
      { x:67, y:605 }, { x:525, y:639 }
    ];
    for (const gp of gates) {
      const dot = document.createElementNS(NS,'circle');
      dot.setAttribute('cx', gp.x); dot.setAttribute('cy', gp.y);
      dot.setAttribute('r', '6');
      dot.setAttribute('fill', '#eab308');
      dot.setAttribute('stroke', '#a16207');
      dot.setAttribute('stroke-width', '2');
      dot.setAttribute('filter', 'url(#sh2)');
      dot.classList.add('gate-dot');
      svg.appendChild(dot);
    }
  }

  /* ---------- Category highlight ---------- */
  function highlightCategory(catId) {
    if (!catId) { clearHighlight(); return; }
    const catLower = catId.toLowerCase();
    svg.querySelectorAll('.blk').forEach(g => {
      const blockId = g.dataset.blockId;
      const block = BLOCKS.find(b => b.id === blockId);
      if (!block) return;
      const hasMatch = LocationStore.all().some(l =>
        block.buildings.includes(l.building) && l.category.toLowerCase() === catLower
      );
      g.classList.toggle('dim', !hasMatch);
      g.classList.toggle('active', hasMatch);
    });
  }

  function clearHighlight() {
    svg.querySelectorAll('.blk').forEach(g => g.classList.remove('dim','active'));
    state.activeBlockId = null;
  }

  function selectBlock(blockId) {
    clearHighlight();
    state.activeBlockId = blockId;
    svg.querySelectorAll('.blk').forEach(g => {
      if (g.dataset.blockId === blockId) g.classList.add('active');
    });
  }

  /* ---------- Zoom / pan ---------- */
  function applyTransform() {
    const t = `translate(${state.tx}px,${state.ty}px) scale(${state.zoom})`;
    svg.style.transform = t;
    photo.style.transform = t;
    resetBtn.hidden = (state.zoom === 1 && state.tx === 0 && state.ty === 0);
  }

  function zoomAt(px, py, factor) {
    const r = box.getBoundingClientRect();
    const fx = (px - r.left - state.tx) / state.zoom;
    const fy = (py - r.top - state.ty) / state.zoom;
    state.zoom = Math.min(4, Math.max(0.5, state.zoom * factor));
    state.tx = px - r.left - fx * state.zoom;
    state.ty = py - r.top - fy * state.zoom;
    applyTransform();
  }

  function reset() {
    state.zoom = 1; state.tx = 0; state.ty = 0;
    applyTransform();
  }

  function showStatus(msg) {
    status.textContent = msg;
    status.hidden = false;
    status.classList.add('show');
    clearTimeout(showStatus._t);
    showStatus._t = setTimeout(() => { status.classList.remove('show'); status.hidden = true; }, 2500);
  }

  /* ---------- Controls ---------- */
  function setupControls() {
    zoomIn.addEventListener('click', () => {
      const r = box.getBoundingClientRect();
      zoomAt(r.left+r.width/2, r.top+r.height/2, 1.35);
    });
    zoomOut.addEventListener('click', () => {
      const r = box.getBoundingClientRect();
      zoomAt(r.left+r.width/2, r.top+r.height/2, 1/1.35);
    });
    resetBtn.addEventListener('click', reset);

    scroll.addEventListener('wheel', (e) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.2 : 1/1.2);
    }, { passive:false });

    let drag = null;
    scroll.addEventListener('mousedown', (e) => {
      if (e.target.closest('.blk')) return;
      drag = { sx:e.clientX, sy:e.clientY, tx:state.tx, ty:state.ty };
      scroll.classList.add('dragging');
    });
    window.addEventListener('mousemove', (e) => {
      if (!drag) return;
      state.tx = drag.tx + (e.clientX - drag.sx);
      state.ty = drag.ty + (e.clientY - drag.sy);
      applyTransform();
    });
    window.addEventListener('mouseup', () => { drag=null; scroll.classList.remove('dragging'); });

    let touches = new Map();
    let tDrag = null;
    scroll.addEventListener('touchstart', (e) => {
      for (const t of e.changedTouches) touches.set(t.identifier, {x:t.clientX,y:t.clientY});
      if (touches.size === 1 && !e.target.closest('.blk')) {
        tDrag = { sx:e.touches[0].clientX, sy:e.touches[0].clientY, tx:state.tx, ty:state.ty };
      }
    }, {passive:true});
    scroll.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (touches.size === 1 && tDrag) {
        state.tx = tDrag.tx + (e.touches[0].clientX - tDrag.sx);
        state.ty = tDrag.ty + (e.touches[0].clientY - tDrag.sy);
        applyTransform();
      } else if (touches.size >= 2) {
        const a = [...touches.values()];
        const d0 = Math.hypot(a[0].x-a[1].x, a[0].y-a[1].y);
        const b2 = [...e.touches].map(t=>({x:t.clientX,y:t.clientY}));
        const d1 = Math.hypot(b2[0].x-b2[1].x, b2[0].y-b2[1].y);
        if (d0>0&&d1>0) zoomAt((b2[0].x+b2[1].x)/2,(b2[0].y+b2[1].y)/2, d1/d0);
      }
    }, {passive:false});
    scroll.addEventListener('touchend', (e) => {
      for (const t of e.changedTouches) touches.delete(t.identifier);
      tDrag = null;
    });
    scroll.addEventListener('touchcancel', () => { touches.clear(); tDrag=null; });

    document.addEventListener('keydown', (e) => {
      if (e.key==='Escape') { reset(); clearHighlight(); }
    });
  }

  function setSelectHandler(fn) { onSelect = fn; }

  return { render, reset, setupControls, highlightCategory, clearHighlight, selectBlock, setSelectHandler, showStatus, BLOCKS };
})();
