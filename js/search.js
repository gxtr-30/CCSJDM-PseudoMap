/* ============================================================
 * search.js — Smart search engine (v3, clean rewrite)
 * ------------------------------------------------------------
 * Single-token: exact word > word-prefix > substring.
 * Multi-token: every token must match.
 * Aliases: comma-separated, each checked independently.
 * Typos: Levenshtein + Jaro-Winkler fallback.
 * ============================================================ */

const SearchEngine = (() => {
  'use strict';

  const JARO_THRESHOLD = 0.88;

  function tokenize(text) {
    return String(text||'').toLowerCase().replace(/[^a-z0-9\s]+/g,' ').split(/\s+/).filter(Boolean);
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    let prev = Array.from({length:b.length+1},(_,i)=>i);
    for (let i=1;i<=a.length;i++) {
      const cur=[i];
      for (let j=1;j<=b.length;j++) {
        const cost = a[i-1]===b[j-1]?0:1;
        cur[j] = Math.min(prev[j]+1, cur[j-1]+1, prev[j-1]+cost);
      }
      prev = cur;
    }
    return prev[b.length];
  }

  function jaroWinkler(a, b) {
    if (a===b) return 1;
    if (!a.length||!b.length) return 0;
    const range = Math.floor(Math.max(a.length,b.length)/2)-1;
    const aM=new Array(a.length).fill(false), bM=new Array(b.length).fill(false);
    let matches=0;
    for (let i=0;i<a.length;i++) {
      const lo=Math.max(0,i-range), hi=Math.min(i+range+1,b.length);
      for (let j=lo;j<hi;j++) { if(bM[j]||a[i]!==b[j]) continue; aM[i]=true;bM[j]=true;matches++;break; }
    }
    if (!matches) return 0;
    let t=0, k=0;
    for (let i=0;i<a.length;i++) { if(!aM[i]) continue; while(!bM[k])k++; if(a[i]!==b[k])t++; k++; }
    const jaro = (matches/a.length + matches/b.length + (matches-t/2)/matches)/3;
    let p=0; for(let i=0;i<Math.min(4,a.length,b.length);i++){if(a[i]===b[i])p++;else break;}
    return jaro + p*0.1*(1-jaro);
  }

  function scoreLocation(loc, query, qTokens) {
    const room    = String(loc.room||'').toLowerCase();
    const keyword = String(loc.keyword||'').toLowerCase();
    const alias   = String(loc.alias||'').toLowerCase();
    const building= String(loc.building||'').toLowerCase();

    let score = 0;

    /* --- Multi-word queries --- */
    if (qTokens.length > 1) {
      const FLOOR_WORDS = ['basement','ground','1st','2nd','3rd','4th','5th','6th','7th'];
      let matched = 0;
      for (const tok of qTokens) {
        const inRoom = room.includes(tok) || keyword.includes(tok);
        const inFloor = FLOOR_WORDS.includes(tok) && String(loc.floor||'').toLowerCase().includes(tok);
        const inAny  = inRoom || inFloor || alias.includes(tok) || building.includes(tok);
        if (!inAny) return 0;
        matched += inRoom ? 2 : (inFloor ? 1.5 : 1);
      }
      let score = matched * 30 + (alias.includes(query) ? 40 : 0);
      // Bonus: full query as substring of room or keyword
      if (room.includes(query) || keyword.includes(query)) score += 80;
      return score;
    }

    /* --- Single-word queries --- */
    const q = qTokens[0] || '';
    const roomWords = room.split(' ');
    const kwWords   = keyword.split(' ');
    const roomWordExact = roomWords.some(w => w===q) || kwWords.some(w => w===q);

    // Exact whole-name — dominant, can't be overtaken by word-level
    if (room === q) { score = 500; }
    else if (keyword === q) { score = 450; }
    else if (building === q) { score = 400; }
    else {
      // Word-level: exact word > prefix > substring
      if (roomWords.some(w => w===q)) score += 150;
      else if (roomWords.some(w => w.startsWith(q))) score += 80;
      else if (room.includes(q)) score += 50;

      if (kwWords.some(w => w===q)) score += 130;
      else if (kwWords.some(w => w.startsWith(q))) score += 50;
      else if (keyword.includes(q)) score += 40;
    }

    // Building — only count if room/keyword didn't word-match
    if (!roomWordExact) {
      if (building === q) score += 100;
      else if (building.startsWith(q)) score += 60;
      else if (building.includes(q)) score += 30;
    }

    // Aliases (comma-separated)
    const aliasWords = alias.split(/[,;]/).map(s => s.trim());
    if (aliasWords.some(w => w===q)) score += 400;
    else if (aliasWords.some(w => w.startsWith(q))) score += 50;
    else if (alias.includes(q)) score += 30;

    // Typo fallback (only if no direct hit)
    if (!room.includes(q) && !keyword.includes(q) && q.length >= 4) {
      for (const name of [room, keyword]) {
        if (name.includes(q)) continue;
        if (name.length >= 4 && (levenshtein(name,q)<=1 || jaroWinkler(name,q)>=JARO_THRESHOLD)) score += 40;
      }
    }

    // Category tiebreaks
    if (score > 0) {
      if (loc.category==='Building') score += 5;
      if (loc.category==='Office') score += 3;
      if (loc.category==='Park') score += 2;
    }

    return score;
  }

  function search(query) {
    const q = String(query||'').trim().toLowerCase();
    if (!q) return [];
    const qTokens = tokenize(q);
    const results = [];
    for (const loc of LocationStore.all()) {
      const s = scoreLocation(loc, q, qTokens);
      if (s > 0) results.push({...loc, score:s});
    }
    results.sort((a,b) => b.score - a.score);
    return results.slice(0, 30);
  }

  function suggestions(query, limit=8) {
    const results = search(query);
    const seen = new Set();
    const out = [];
    for (const r of results) {
      const key = r.room + '|' + r.building;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(r);
      if (out.length >= limit) break;
    }
    return out;
  }

  function byCategory(catId) {
    const cat = String(catId||'').toLowerCase();
    return LocationStore.all()
      .filter(l => String(l.category).toLowerCase() === cat)
      .sort((a,b) => {
        const fa = floorRank(a.floor) - floorRank(b.floor);
        return fa !== 0 ? fa : String(a.room).localeCompare(String(b.room));
      });
  }

  function floorRank(f) {
    const s = String(f||'').toLowerCase();
    if (s.includes('basement')) return -1;
    if (s.includes('ground')) return 0;
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : 99;
  }

  function highlight(text, query) {
    const t = String(text||'');
    const q = String(query||'').trim();
    if (!q||!t) return esc(t);
    const i = t.toLowerCase().indexOf(q.toLowerCase());
    if (i===-1) return esc(t);
    return esc(t.slice(0,i))+'<mark>'+esc(t.slice(i,i+q.length))+'</mark>'+esc(t.slice(i+q.length));
  }

  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  return { search, suggestions, byCategory, highlight, esc };
})();
