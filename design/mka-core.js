/* Maa Kali Astuti — shared core: tokens, icons, logo, product art, catalog, store, motion.
   Plain script; exposes window.MKA. All SVG is generated as strings so every DC shares one source. */
(function () {
  const M = (window.MKA = window.MKA || {});
  if (M.ready) return;

  /* ---------------- tokens ---------------- */
  M.C = { em9: '#0E3B30', em7: '#164E3F', em5: '#1C6B54', em1: '#E4EEE8', n9: '#0A1F1A', n8: '#10302A', g5: '#B8923A', g3: '#D9B96A', g7: '#7A5C1C', iv: '#FBF7EE', s1: '#F4EDDD', s2: '#EAE0CA', ink: '#1F2A24', ink6: '#5B6A61', cu: '#B8683D', sin: '#A8322D', rose: '#EBCFC9', ok: '#2F7A4F' };
  M.EASE = 'cubic-bezier(0.22,1,0.36,1)';
  M.INOUT = 'cubic-bezier(0.45,0,0.55,1)';

  /* ---------------- utils ---------------- */
  M.fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  M.off = (p) => Math.round((1 - p.price / p.mrp) * 100);
  function rng(seed) { let s = 7; for (const ch of String(seed)) s = (s * 31 + ch.charCodeAt(0)) >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  M.rng = rng;
  const hash = (s) => { let h = 5381; for (const c of String(s)) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0; return h.toString(36); };
  const mix = (hex, t, to) => { const n = parseInt(hex.slice(1), 16), a = [n >> 16, (n >> 8) & 255, n & 255], b = to === 'w' ? [255, 255, 255] : [0, 0, 0]; return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  M.hash = hash;
  const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAYH = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'], MONH = ['जन', 'फ़र', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'];
  M.addDays = (n, from) => { const d = from ? new Date(from) : new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return d; };
  M.dfmt = (d, hi) => hi ? `${DAYH[d.getDay()]}, ${d.getDate()} ${MONH[d.getMonth()]}` : `${DAY[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`;
  M.dlong = (d) => `${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;
  /* next Mahapuja muhurat = next Thursday at least 2 days out [confirm calendar with client] */
  M.muhurat = () => { let d = M.addDays(2); while (d.getDay() !== 4) d = M.addDays(1, d); return d; };
  M.hashParams = () => { const o = {}; (location.hash || '').replace(/^#/, '').split('&').forEach((kv) => { if (!kv) return; const [k, v] = kv.split('='); o[decodeURIComponent(k)] = decodeURIComponent(v || ''); }); return o; };

  /* ---------------- icons (24 grid, 1.5 stroke, round) ---------------- */
  const I = {
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    heart: '<path d="M12 20.2S3.8 15.3 3.8 9.6C3.8 7 5.8 5 8.3 5c1.6 0 3 .9 3.7 2.2C12.7 5.9 14.1 5 15.7 5c2.5 0 4.5 2 4.5 4.6 0 5.7-8.2 10.6-8.2 10.6z"/>',
    user: '<circle cx="12" cy="8.5" r="3.6"/><path d="M5 20c.8-3.7 3.6-5.7 7-5.7s6.2 2 7 5.7"/>',
    bag: '<path d="M5.2 8.5h13.6l-1 11.5H6.2z"/><path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    chevD: '<path d="M7 10l5 5 5-5"/>', chevU: '<path d="M7 14l5-5 5 5"/>', chevR: '<path d="M10 7l5 5-5 5"/>', chevL: '<path d="M14 7l-5 5 5 5"/>',
    arrowR: '<path d="M5 12h14M14 7l5 5-5 5"/>', arrowL: '<path d="M19 12H5M10 7l-5 5 5 5"/>', arrowUR: '<path d="M7 17L17 7M9 7h8v8"/>', arrowU: '<path d="M12 19V5M7 10l5-5 5 5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    star: '<path d="M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.7l-5.1 2.7 1-5.6-4.1-4 5.7-.8z"/>',
    play: '<path d="M8.5 5.8v12.4l10-6.2z"/>', pause: '<path d="M9 6v12M15 6v12"/>',
    whatsapp: '<path d="M4.3 19.7l1.2-3.7a8 8 0 1 1 2.9 2.7z"/><path d="M9.3 8.3c.3-.5.8-.6 1.1-.1l.8 1.5c.2.3.1.7-.2 1l-.5.5a5 5 0 0 0 2.4 2.4l.5-.5c.3-.3.7-.4 1-.2l1.5.8c.5.3.4.8-.1 1.1-.9.6-2 .6-3 .2a8 8 0 0 1-4-4c-.4-1-.4-2.1.5-2.7z"/>',
    phone: '<path d="M6.6 4h2.6l1.4 3.7-1.8 1.2a10.3 10.3 0 0 0 4.3 4.3l1.2-1.8 3.7 1.4v2.6a1.9 1.9 0 0 1-2.1 1.9A14.6 14.6 0 0 1 4.7 6.1 1.9 1.9 0 0 1 6.6 4z"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="M4 7l8 6 8-6"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
    calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="1.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    truck: '<path d="M3.5 6.5h10v9h-10zM13.5 9.5h3.8l2.7 3v3h-6.5"/><circle cx="7.5" cy="17.8" r="1.7"/><circle cx="16.5" cy="17.8" r="1.7"/>',
    shield: '<path d="M12 3.5l7 2.8v5.1c0 4.4-3 8.1-7 9.1-4-1-7-4.7-7-9.1V6.3z"/><path d="M9 12l2.2 2.2 3.8-4"/>',
    lock: '<rect x="5.5" y="10.5" width="13" height="9.5" rx="1.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14.2v2"/>',
    returns: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9"/><path d="M4.5 4.5V9H9"/>',
    home: '<path d="M4 11l8-6.5 8 6.5"/><path d="M6 9.5V20h12V9.5M10 20v-5h4v5"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>',
    globe: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.2 2.3 3.2 5 3.2 8s-1 5.7-3.2 8c-2.2-2.3-3.2-5-3.2-8s1-5.7 3.2-8z"/>',
    youtube: '<rect x="3" y="6" width="18" height="12" rx="3.5"/><path d="M10.5 9.5v5l4.2-2.5z"/>',
    instagram: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.7"/><path d="M16.8 7.2h.01"/>',
    facebook: '<path d="M13.5 20v-7h2.6l.4-3h-3V8.2c0-.9.3-1.5 1.5-1.5h1.6V4.1c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9V10H8v3h2.5v7"/>',
    filter: '<path d="M4 6.5h16M7 12h10M10 17.5h4"/>', sort: '<path d="M7.5 5v14M4.5 16l3 3 3-3M16.5 19V5M13.5 8l3-3 3 3"/>',
    trash: '<path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5"/>',
    gift: '<path d="M4.5 10.5h15V20h-15zM3.5 7.5h17v3h-17zM12 7.5V20"/><path d="M12 7.5c-1.4-3-4.2-3.4-4.6-1.9-.3 1.3 1.6 1.9 4.6 1.9zM12 7.5c1.4-3 4.2-3.4 4.6-1.9.3 1.3-1.6 1.9-4.6 1.9z"/>',
    tag: '<path d="M3.5 12.3V4.5h7.8l9.2 9.2-7.8 7.8z"/><circle cx="8" cy="9" r="1.4"/>',
    info: '<circle cx="12" cy="12" r="8"/><path d="M12 11v5M12 8h.01"/>', alert: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5v5.5M12 16.2h.01"/>',
    share: '<path d="M12 15V4M8 7.5L12 4l4 3.5M6 12.5V20h12v-7.5"/>',
    zoom: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5M11 8.5v5M8.5 11h5"/>',
    camera: '<path d="M4 8.5h3.5L9 6h6l1.5 2.5H20V19H4z"/><circle cx="12" cy="13.2" r="3.3"/>',
    video: '<rect x="3.5" y="6.5" width="12" height="11" rx="1.5"/><path d="M15.5 10.5l5-2.8v8.6l-5-2.8"/>',
    cert: '<path d="M6 3.5h12v17H6z"/><path d="M9 7.5h6M9 10.5h6M9 13.5h3"/><circle cx="15" cy="16.5" r="2"/>',
    xray: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><circle cx="12" cy="12" r="4"/><path d="M12 8v8M10 8.6c-.8 2.2-.8 4.6 0 6.8M14 8.6c.8 2.2.8 4.6 0 6.8"/>',
    card: '<rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="M3 9.5h18M6.5 15h3.5"/>',
    bank: '<path d="M4 9.5L12 5l8 4.5M5.5 9.5v7.5M9.5 9.5v7.5M14.5 9.5v7.5M18.5 9.5v7.5M3.5 19.5h17"/>',
    wallet: '<path d="M4 7.5h14.5a1.5 1.5 0 0 1 1.5 1.5v9.5a1.5 1.5 0 0 1-1.5 1.5H4z"/><path d="M4 7.5V6a1.5 1.5 0 0 1 1.5-1.5H16M15.5 14h.01"/>',
    cash: '<rect x="3" y="6.5" width="18" height="11" rx="1.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v.01M18 14.5v.01"/>',
    bolt: '<path d="M13 3.5L5.5 13.5h5.5l-1 7 7.5-10H12z"/>',
    edit: '<path d="M4.5 19.5l1-4L15.8 5.2a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8L8.5 18.5z"/><path d="M13.5 7.5l3 3"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
    download: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>', upload: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 19.5h14"/>',
    ruler: '<path d="M3.5 15.5L15.5 3.5l5 5-12 12z"/><path d="M7.5 11.5l2 2M10 9l1.5 1.5M12.5 6.5l2 2"/>',
    chat: '<path d="M4.5 18.5V6.5A1.5 1.5 0 0 1 6 5h12a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 18 16H8z"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01"/>',
    report: '<path d="M6.5 3.5h7.5l4 4v13H6.5z"/><path d="M14 3.5v4h4M9.5 12h5M9.5 15h5M9.5 18h3"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-2.8 2.8a4 4 0 0 0 5.7 5.7l1-1"/>',
    thumb: '<path d="M7.5 10.5v9h-3v-9zM7.5 10.5L11 4c1.2 0 2 .9 2 2v3h5.2a1.8 1.8 0 0 1 1.8 2.1l-1.2 6.6a1.8 1.8 0 0 1-1.8 1.5H7.5"/>',
    question: '<circle cx="12" cy="12" r="8"/><path d="M9.8 9.5a2.3 2.3 0 0 1 4.4.8c0 1.6-2.2 1.9-2.2 3.4M12 16.2h.01"/>',
    checkc: '<circle cx="12" cy="12" r="8"/><path d="M8.5 12.2l2.4 2.4 4.6-4.8"/>',
    package: '<path d="M4 7.5l8-4 8 4v9l-8 4-8-4z"/><path d="M4 7.5l8 4 8-4M12 11.5v9M8 5.5l8 4"/>',
    seal: '<circle cx="12" cy="10" r="6"/><path d="M9.5 10l1.8 1.8L15 8.3M8.5 15l-1.5 5.5 5-2.5 5 2.5-1.5-5.5"/>',
    lotus: '<path d="M12 5c2 2.4 2.6 5.4 0 9.5C9.4 10.4 10 7.4 12 5z"/><path d="M12 14.5C10.7 10.8 8.4 9 4.8 8.9c.2 3.4 2.6 5.6 7.2 5.6zM12 14.5c1.3-3.7 3.6-5.5 7.2-5.6-.2 3.4-2.6 5.6-7.2 5.6z"/><path d="M4.5 15.8c2 1.8 4.6 2.7 7.5 2.7s5.5-.9 7.5-2.7M8.5 20.5h7"/>',
    diya: '<path d="M4 13.5c1.3 2.9 4.2 4.5 8 4.5s6.7-1.6 8-4.5z"/><path d="M20 13.5l1.3-1.2M9.5 18l-.7 2h6.4l-.7-2"/><path d="M12 4.2c1.6 2 2.2 3.7 1.6 5.2-.3.9-.9 1.4-1.6 1.4s-1.3-.5-1.6-1.4c-.6-1.5 0-3.2 1.6-5.2z"/>',
    flame: '<path d="M12 3.5c3.5 3.8 5.2 7 5.2 9.8a5.2 5.2 0 0 1-10.4 0c0-1.7.6-3.2 1.7-4.6.3 1.4 1 2.3 2 2.6-.6-2.8-.2-5.3 1.5-7.8z"/>',
    rudraksha: '<circle cx="12" cy="13" r="6.5"/><path d="M12 6.5v13M9.1 7.2c-1.2 3.5-1.2 8.1 0 11.6M14.9 7.2c1.2 3.5 1.2 8.1 0 11.6M12 6.5V3.5"/>',
    trishul: '<path d="M12 21V7M12 3.5l-1.3 2.6h2.6zM6.5 4.5c0 3.8 2.1 6 5.5 6s5.5-2.2 5.5-6M6.5 4.5L5.4 6.3M17.5 4.5l1.1 1.8M10.2 14h3.6"/>',
    damaru: '<path d="M7 4.5h10l-3.6 7.5 3.6 7.5H7l3.6-7.5z"/><path d="M10.6 12H6.3M13.4 12h4.3"/><circle cx="5.5" cy="12" r="1"/><circle cx="18.5" cy="12" r="1"/>',
    kalash: '<path d="M8.2 10h7.6c1.8 1.4 2.8 3.1 2.8 5 0 3-3 5-6.6 5s-6.6-2-6.6-5c0-1.9 1-3.6 2.8-5z"/><path d="M9.2 10V8.5h5.6V10M6 14.2h12"/><path d="M9.5 8.5C8 7 6.8 6.4 5.3 6.5c.7 1.6 2.2 2.3 4.2 2zM14.5 8.5c1.5-1.5 2.7-2.1 4.2-2-.7 1.6-2.2 2.3-4.2 2zM10.2 8.5c0-2 .8-4 1.8-4.8 1 .8 1.8 2.8 1.8 4.8"/>',
    yantra: '<rect x="3.5" y="3.5" width="17" height="17" rx=".5"/><circle cx="12" cy="12" r="6"/><path d="M8 9.8h8l-4 6.8zM8 14.2h8l-4-6.8z"/>',
    palm: '<path d="M7.2 12.5V6.3a1.25 1.25 0 0 1 2.5 0V11M9.7 10.5V4.8a1.25 1.25 0 0 1 2.5 0v5.7M12.2 10.5V5.6a1.25 1.25 0 0 1 2.5 0V11M14.7 11.2V8.4a1.25 1.25 0 0 1 2.5 0V14c0 3.8-2.4 6.5-5.8 6.5-2.7 0-4.2-1.3-5.5-3.3l-2.3-3.6a1.3 1.3 0 0 1 2-1.6l1.6 1.9"/><path d="M10 15.5c1.3.6 2.8.5 4.2-.3"/>',
    tarot: '<rect x="6" y="3.5" width="12" height="17" rx="1.2"/><circle cx="12" cy="11" r="2.6"/><path d="M12 6.2v1.6M12 14.2v1.6M8.7 11h1.6M13.7 11h1.6M9 17.8h6"/>',
    kundali: '<rect x="4" y="4" width="16" height="16"/><path d="M4 4l16 16M20 4L4 20M12 4l8 8-8 8-8-8z"/>',
    loshu: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M9.33 4v16M14.67 4v16M4 9.33h16M4 14.67h16"/>',
    conch: '<path d="M6 17.5c-1.3-5 2-10.7 7.5-12.3 2.8-.8 5.3.6 5.6 3 .5 3.9-3.6 8.2-9.2 9.8z"/><path d="M6 17.5l-2 2.5 3.8-.6M9.9 18c.4-3.4 2.6-6.3 5.4-7.6M14 7.6c1.3-.2 2.3.5 2.4 1.6"/>',
    bell: '<path d="M6.5 16.5h11l-1.3-2.2V10a4.2 4.2 0 0 0-8.4 0v4.3z"/><path d="M10.5 18.5a1.5 1.5 0 0 0 3 0M12 4.5v1.3"/>',
    sun: '<circle cx="12" cy="12" r="3.8"/><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6L18 18M6 18l1.4-1.4M16.6 7.4L18 6"/>',
    moon: '<path d="M18.5 14.6A7.2 7.2 0 0 1 9.4 5.5a7.2 7.2 0 1 0 9.1 9.1z"/>',
    gem: '<path d="M7 4.5h10l3.5 4.5L12 20 3.5 9z"/><path d="M3.5 9h17M9.5 4.5L8.2 9 12 20l3.8-11-1.3-4.5"/>',
    leaf: '<path d="M5 19c0-8 5-13.5 14.5-14.5C19 13.5 13.5 19 5 19z"/><path d="M5 19l8.5-8.5"/>',
    scroll: '<path d="M7 5h10M7 19h10M7 5a1.5 1.5 0 0 0 0 3h10a1.5 1.5 0 0 0 0-3M7 16a1.5 1.5 0 0 0 0 3h10a1.5 1.5 0 0 0 0-3M8 8v8M16 8v8M10 11h4M10 13.5h4"/>',
    sword: '<path d="M5 19l1.8-1.8M3.8 16.4l3.8 3.8M6.9 17.1C12.5 11.5 16.3 7.5 19.8 4.2c-.3 4.6-4.4 9.3-10.6 14.6"/>',
    gada: '<path d="M4.5 19.5l7-7"/><circle cx="15" cy="9" r="4.3"/><path d="M12 6l6 6M15 4.7v8.6M10.7 9h8.6M18.2 5.8l1.6-1.6"/>',
    serpent: '<path d="M7 20.5h10"/><path d="M8.5 20.5c-1.6-.6-2.5-1.7-2.5-3 0-2.2 2.7-3 6-3.4 2.8-.3 4.8-1.1 4.8-3 0-1.1-.8-1.9-2-2.3"/><path d="M12 3.5c-1.9 0-3.3 1.4-3.3 3.2 0 1.4.8 2.3 1.9 2.8.6.3 1.1.8 1.4 1.4.3-.6.8-1.1 1.4-1.4 1.1-.5 1.9-1.4 1.9-2.8 0-1.8-1.4-3.2-3.3-3.2z"/>',
    coins: '<ellipse cx="12" cy="7" rx="6.5" ry="2.5"/><path d="M5.5 7v4.5c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5V7M5.5 11.5V16c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-4.5"/>',
    scales: '<path d="M12 4v16M8.5 20h7M5 7h14"/><path d="M5 7l-2.5 6h5zM19 7l-2.5 6h5z"/>',
    health: '<path d="M12 20S4.8 15.6 4.8 10.2A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7.2 2.2C19.2 15.6 12 20 12 20z"/><path d="M7.5 12.5h2.3l1.2-2 1.8 4 1.2-2h2.5"/>',
    temple: '<path d="M4.5 20.5h15M6 20.5v-7h12v7M7.5 13.5l4.5-8 4.5 8M12 5.5V3.5M10 20.5v-3.3a2 2 0 0 1 4 0v3.3"/>',
    locker: '<rect x="4.5" y="4.5" width="15" height="13.5" rx="1.2"/><circle cx="12" cy="11.2" r="3"/><path d="M12 8.2v1M12 13.2v1M9 11.2h1M14 11.2h1M7 18v2M17 18v2"/>',
    office: '<path d="M5 20V5.5h9V20M14 9.5h5V20M3.5 20h17M8 8.5h3M8 11.5h3M8 14.5h3M16.5 12.5v.01M16.5 15.5v.01"/>',
    chakra: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 4v6M12 14v6M4 12h6M14 12h6M6.3 6.3l4.3 4.3M13.4 13.4l4.3 4.3M6.3 17.7l4.3-4.3M13.4 10.6l4.3-4.3"/>',
    mala: '<circle cx="12" cy="4.6" r="1.2"/><circle cx="8.3" cy="5.7" r="1.2"/><circle cx="15.7" cy="5.7" r="1.2"/><circle cx="5.8" cy="8.7" r="1.2"/><circle cx="18.2" cy="8.7" r="1.2"/><circle cx="5.3" cy="12.4" r="1.2"/><circle cx="18.7" cy="12.4" r="1.2"/><circle cx="7" cy="15.7" r="1.2"/><circle cx="17" cy="15.7" r="1.2"/><circle cx="12" cy="17.8" r="1.7"/><path d="M12 19.5v2.5"/>'
  };
  const FILLED = { heartF: I.heart, starF: I.star };
  M.ICON_NAMES = Object.keys(I);
  M.icon = (n, sw) => FILLED[n]
    ? `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round" aria-hidden="true">${FILLED[n]}</svg>`
    : `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="${sw || 1.5}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ''}</svg>`;
  /* React element helpers (cached so React never re-sets innerHTML) */
  const EL = new Map();
  M.h = (React, html, style, key) => {
    const k = key || html;
    if (key && EL.has(k)) return EL.get(k);
    const el = React.createElement('span', { style: Object.assign({ display: 'block', width: '100%', height: '100%' }, style || {}), dangerouslySetInnerHTML: { __html: html } });
    if (key) EL.set(k, el);
    return el;
  };
  M.ic = (React) => {
    if (M._ic) return M._ic;
    const o = {};
    Object.keys(I).concat(Object.keys(FILLED)).forEach((k) => (o[k] = M.h(React, M.icon(k))));
    return (M._ic = o);
  };

  /* ---------------- logo emblem (faithful redraw of the supplied mark) ---------------- */
  M.logo = (u) => {
    u = u || 'l';
    const leaf = (x, y, a, l, c) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0,0 C${l * .25},${-l * .34} ${l * .7},${-l * .38} ${l},0 C${l * .7},${l * .38} ${l * .25},${l * .34} 0,0 Z" fill="${c}"/><path d="M1.2,0 H${(l * .84).toFixed(1)}" stroke="#E4EEE8" stroke-width=".55" opacity=".75"/></g>`;
    const L = [[82, 117, 168, 14, '#1C6B54'], [73, 108, 198, 15, '#2F7A4F'], [68, 96, 152, 15, '#1C6B54'], [66, 84, 204, 14, '#2F7A4F'], [69, 72, 158, 13, '#1C6B54'], [76, 62, 214, 12, '#2F7A4F'], [84, 56, 250, 9, '#3E8A64'], [88, 113, 28, 11, '#3E8A64'], [76, 99, -14, 11, '#3E8A64'], [73, 86, 26, 10, '#3E8A64'], [76, 74, -26, 9, '#3E8A64']];
    let leaves = '';
    L.forEach(([x, y, a, l, c]) => { leaves += leaf(x, y, a, l, c) + leaf(200 - x, y, 180 - a, l, c); });
    let band = '';
    for (let i = 0; i < 24; i++) band += `<g transform="rotate(${i * 15} 100 100)"><path d="M100,12.8 C102.8,16 102.8,19.8 100,23 C97.2,19.8 97.2,16 100,12.8 Z" fill="#2F7A4F"/><circle cx="100" cy="26" r=".9" fill="#2F7A4F"/><path d="M97.6,16.2 Q95,19 96.4,22" transform="rotate(7.5 100 100)" fill="none" stroke="#2F7A4F" stroke-width=".7"/></g>`;
    return `<svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label="Maa Kali Astuti emblem"><defs><clipPath id="lo${u}"><circle cx="100" cy="100" r="92.5"/></clipPath><clipPath id="li${u}"><circle cx="100" cy="100" r="71"/></clipPath></defs>
<circle cx="100" cy="100" r="98.5" fill="#164E3F"/><circle cx="100" cy="100" r="93.5" fill="#FBF7EE"/><circle cx="100" cy="100" r="91.5" fill="#1C6B54"/>${band}
<circle cx="100" cy="100" r="71" fill="#FBF7EE"/><circle cx="100" cy="100" r="68.6" fill="none" stroke="#1C6B54" stroke-width=".8"/>
<g clip-path="url(#li${u})"><rect x="0" y="160" width="200" height="40" fill="#1C6B54"/><circle cx="100" cy="100" r="66.5" fill="none" stroke="#FBF7EE" stroke-width=".8"/></g>
<text x="100" y="59" text-anchor="middle" font-family="'Tiro Devanagari Hindi',serif" font-size="31" fill="#FBF7EE" stroke="#1C6B54" stroke-width="1.1">ॐ</text>
<path d="M100,124 V110 M100,121 C88,119 74,112 69,98 C64,84 69,70 80,60 M100,121 C112,119 126,112 131,98 C136,84 131,70 120,60" fill="none" stroke="#1C6B54" stroke-width="2"/>${leaves}
<path d="M100,111 C88,105 76,104 66,107 C73,115 88,117 100,111 Z M100,111 C112,105 124,104 134,107 C127,115 112,117 100,111 Z" fill="#3E8A64"/>
<path d="M100,109 C93,98 84,92 74,91 C77,102 87,109 100,109 Z M100,109 C107,98 116,92 126,91 C123,102 113,109 100,109 Z" fill="#2F7A4F"/>
<path d="M100,107 C95,95 89,87 82,82 C82,95 89,104 100,107 Z M100,107 C105,95 111,87 118,82 C118,95 111,104 100,107 Z" fill="#1C6B54"/>
<path d="M100,72 C108,83 109,95 100,107 C91,95 92,83 100,72 Z" fill="#2F7A4F"/><path d="M100,77 V103" stroke="#9CC9AE" stroke-width=".7"/>
<g clip-path="url(#lo${u})"><rect x="0" y="127.5" width="200" height="32.5" fill="#FBF7EE"/><path d="M0,127.5H200M0,160H200" stroke="#164E3F" stroke-width=".9"/></g>
<text x="100" y="147" text-anchor="middle" font-family="Fraunces,serif" font-size="16" font-weight="500" fill="#0E3B30">Maa Kali Astuti</text>
<text x="100" y="156.4" text-anchor="middle" font-family="Manrope,sans-serif" font-size="6.6" font-weight="600" letter-spacing=".5" fill="#164E3F">Sadhak Pawan Pandey</text></svg>`;
  };

  /* ---------------- ornaments ---------------- */
  M.mandala = (R, col, sw) => {
    col = col || '#D9B96A'; sw = sw || 1;
    const pt = (r, t) => `${(r * Math.cos(t)).toFixed(1)},${(r * Math.sin(t)).toFixed(1)}`;
    const P = (r1, r2, n, w, rot) => { let d = ''; rot = rot || 0; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + rot, aw = (w * Math.PI * 2) / n; d += `M${pt(r1, a - aw)} Q${pt(r1 + (r2 - r1) * .62, a - aw * 1.05)} ${pt(r2, a)} Q${pt(r1 + (r2 - r1) * .62, a + aw * 1.05)} ${pt(r1, a + aw)} `; } return `<path d="${d}"/>`; };
    const C = (r) => `<circle r="${r.toFixed(1)}"/>`;
    const D = (r, n, s) => `<circle r="${r.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${(s * 2).toFixed(2)}" stroke-linecap="round" stroke-dasharray="0 ${((2 * Math.PI * r) / n).toFixed(3)}"/>`;
    return `<g fill="none" stroke="${col}" stroke-width="${sw}">${C(R)}${C(R * .97)}${P(R * .74, R * .95, 32, .5)}${P(R * .74, R * .87, 32, .5, Math.PI / 32)}${C(R * .72)}${D(R * .68, 72, R * .005 + .5)}${C(R * .64)}${P(R * .44, R * .63, 16, .5)}${P(R * .44, R * .55, 16, .28)}${C(R * .42)}${P(R * .2, R * .41, 8, .46)}${C(R * .19)}${D(R * .155, 24, R * .004 + .5)}${C(R * .1)}${C(R * .035)}</g>`;
  };
  M.stars = (n, w, h, seed, col) => { const R = rng(seed || 's'); let o = ''; for (let i = 0; i < n; i++) { const r = R() < .15 ? 1.4 : R() < .5 ? .9 : .6; o += `<circle cx="${(R() * w).toFixed(1)}" cy="${(R() * h).toFixed(1)}" r="${r}" fill="${col || '#D9B96A'}" data-amb="twinkle"/>`; } return o; };
  M.lotusRule = (col) => `<svg viewBox="0 0 240 16" width="100%" height="100%" fill="none" stroke="${col || '#B8923A'}" stroke-width="1" stroke-linecap="round"><path d="M0 8H100M140 8H240"/><path d="M120 2c2.4 2.4 2.8 5.2 0 9-2.8-3.8-2.4-6.6 0-9zM120 11c-2.6-3.2-5.6-4.4-9-4 1 3 4 4.6 9 4zM120 11c2.6-3.2 5.6-4.4 9-4-1 3-4 4.6-9 4z"/><circle cx="104" cy="8" r="1.2" fill="${col || '#B8923A'}"/><circle cx="136" cy="8" r="1.2" fill="${col || '#B8923A'}"/></svg>`;
  M.corner = (col) => `<svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" stroke="${col || '#B8923A'}" stroke-width="1" stroke-linecap="round"><path d="M2 46V14C2 7.4 7.4 2 14 2h32"/><path d="M8 46V18c0-5.5 4.5-10 10-10h28"/><path d="M14 14c4 0 6 2 6 6-4 0-6-2-6-6z"/><circle cx="26" cy="26" r="1.3" fill="${col || '#B8923A'}"/></svg>`;

  /* ---------------- product art (4:5 viewBox 400x500) ---------------- */
  const SH = (u) => `<radialGradient id="sh${u}"><stop offset="0" stop-color="#0E3B30" stop-opacity=".28"/><stop offset="1" stop-color="#0E3B30" stop-opacity="0"/></radialGradient>`;
  const STONES = {
    pyrite: { g: ['#F4E4A8', '#B99B52', '#5A4820'], gloss: .6, fleck: '#FFF6CC' },
    citrine: { g: ['#FCE7A8', '#E0A63A', '#94580F'], gloss: .5 },
    jade: { g: ['#C4E3C6', '#5E9A6E', '#234F38'], gloss: .38 },
    tourmaline: { g: ['#7C7C79', '#2B2B2A', '#0A0A0A'], gloss: .62 },
    tiger: { g: ['#F2C274', '#A2672F', '#472911'], gloss: .42, band: '#2F1B0B' },
    rose: { g: ['#FFF3F0', '#EDC1BA', '#C28A83'], gloss: .45 },
    amethyst: { g: ['#E8DAE8', '#A48AA7', '#5A4460'], gloss: .45 },
    chakra: { g: ['#6B6864', '#3A3835', '#1B1A18'], gloss: .12, lava: true, seven: ['#A8322D', '#C9772E', '#D6AE3A', '#3E8A5A', '#3F6F95', '#454C86', '#7F6391'] },
    quartz: { g: ['#FFFFFF', '#E5EBEA', '#A6B2B0'], gloss: .75, clear: true },
    lapis: { g: ['#7185BA', '#2F4278', '#152047'], gloss: .35, fleck: '#D9B96A' },
    moon: { g: ['#FFFFFF', '#E7E9EB', '#B8BFC5'], gloss: .55, sheen: '#D5E5F0' },
    garnet: { g: ['#D26C75', '#7C1F2A', '#380B11'], gloss: .55 },
    blood: { g: ['#5E7E68', '#2D4B37', '#14241A'], gloss: .35, fleck: '#B03A30' },
    jasper: { g: ['#D88A6B', '#9B4B33', '#522015'], gloss: .3 },
    malachite: { g: ['#80D4A8', '#1F7A52', '#0B432D'], gloss: .36, band: '#08301F' }
  };
  M.STONES = STONES;
  function bead(m, u, o) {
    o = o || {}; const R = rng('bead' + m), cx = 200, cy = o.cy || 238, r = o.r || 96;
    let s = `<defs><radialGradient id="bg${u}" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#BC885C"/><stop offset=".5" stop-color="#7C4B2B"/><stop offset="1" stop-color="#40230E"/></radialGradient><clipPath id="bc${u}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>${SH(u)}</defs>`;
    s += `<ellipse cx="${cx}" cy="${cy + r + 16}" rx="${r * .95}" ry="${r * .15}" fill="url(#sh${u})"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#bg${u})"/>`;
    let t = '';
    for (let i = 0; i < 120; i++) { const a = R() * Math.PI * 2, d = Math.sqrt(R()) * r, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, dk = R() < .55; t += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(1.6 + R() * 3.6).toFixed(1)}" ry="${(1.2 + R() * 2.6).toFixed(1)}" fill="${dk ? '#2A1409' : '#D8A274'}" opacity="${dk ? .3 : .17}"/>`; }
    for (let k = 0; k < m; k++) { let th = (((k * 360) / m + 14) % 360 + 360) % 360; if (th > 180) th -= 360; if (Math.abs(th) > 84) continue; const rx = Math.abs(Math.sin((th * Math.PI) / 180)) * r, sw = th > 0 ? 1 : 0, d = `M${cx},${cy - r} A${rx.toFixed(1)},${r} 0 0,${sw} ${cx},${cy + r}`; t += `<path d="${d}" fill="none" stroke="#1F0E06" stroke-width="3.8" opacity=".8"/><path d="${d}" fill="none" stroke="#C99466" stroke-width="1.1" opacity=".45" transform="translate(${th > 0 ? 2.2 : -2.2},0)"/>`; }
    s += `<g clip-path="url(#bc${u})">${t}<ellipse cx="${cx - r * .34}" cy="${cy - r * .42}" rx="${r * .3}" ry="${r * .17}" fill="#fff" opacity=".14" transform="rotate(-32 ${cx - r * .34} ${cy - r * .42})"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#1F0E06" stroke-width="8" opacity=".22"/></g>`;
    if (!o.bare) s += `<path d="M${cx},${cy - r - 3} C${cx - 18},${cy - r - 42} ${cx - 7},${cy - r - 74} ${cx},${cy - r - 92} C${cx + 7},${cy - r - 74} ${cx + 18},${cy - r - 42} ${cx},${cy - r - 3}" fill="none" stroke="#A8322D" stroke-width="2.4"/><path d="M${cx - 16},${cy - r + 8} Q${cx},${cy - r - 10} ${cx + 16},${cy - r + 8}" fill="#C9A24E" stroke="#7A5C1C" stroke-width="1"/>`;
    return s;
  }
  function mala(m, u) {
    const R = rng('mala' + m), cx = 200, cy = 226, a = 114, b = 148, N = m === 5 ? 46 : 38, br = m === 5 ? 9.4 : 11;
    const c = m === 5 ? ['#B47E54', '#74452A', '#3A1F0D'] : ['#C79062', '#8C5434', '#4A2912'];
    let s = `<defs><radialGradient id="mb${u}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${c[0]}"/><stop offset=".55" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></radialGradient>${SH(u)}</defs>`;
    s += `<ellipse cx="${cx}" cy="${cy + b + 22}" rx="160" ry="18" fill="url(#sh${u})" opacity=".55"/><ellipse cx="${cx}" cy="${cy}" rx="${a}" ry="${b}" fill="none" stroke="#A8322D" stroke-width="1.3"/>`;
    let sh = '', bd = '';
    for (let i = 0; i < N; i++) { const t = ((i + .5) / N) * Math.PI * 2; if (Math.abs(t - Math.PI) < .15) continue; const x = cx + a * Math.sin(t), y = cy - b * Math.cos(t), rot = (R() * 180).toFixed(0); sh += `<circle cx="${(x + 2.6).toFixed(1)}" cy="${(y + 3.6).toFixed(1)}" r="${br}" fill="#0E3B30" opacity=".16"/>`; bd += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${br}" fill="url(#mb${u})"/><path d="M0,${-br} Q${br * .55},0 0,${br} M0,${-br} Q${-br * .5},0 0,${br}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot})" fill="none" stroke="#1F0E06" stroke-width="1.1" opacity=".55"/>`; }
    const gy = cy + b, gr = br * 1.5;
    s += sh + bd + `<circle cx="${cx + 3}" cy="${gy + 4}" r="${gr}" fill="#0E3B30" opacity=".16"/><circle cx="${cx}" cy="${gy}" r="${gr}" fill="url(#mb${u})"/><path d="M${cx},${gy - gr} Q${cx + gr * .6},${gy} ${cx},${gy + gr}" fill="none" stroke="#1F0E06" stroke-width="1.2" opacity=".5"/>`;
    s += `<rect x="${cx - 7}" y="${gy + gr - 1}" width="14" height="9" rx="2" fill="#C9A24E" stroke="#7A5C1C" stroke-width=".8"/><path d="M${cx - 5},${gy + gr + 8} L${cx - 20},${gy + gr + 74} Q${cx},${gy + gr + 82} ${cx + 20},${gy + gr + 74} L${cx + 5},${gy + gr + 8} Z" fill="#A8322D"/><path d="M${cx - 2},${gy + gr + 12} L${cx - 9},${gy + gr + 74} M${cx + 2},${gy + gr + 12} L${cx + 9},${gy + gr + 74} M${cx},${gy + gr + 12} V${gy + gr + 76}" stroke="#761D19" stroke-width="1"/>`;
    return s;
  }
  function bracelet(k, u) {
    const S = STONES[k], R = rng('br' + k), cx = 200, cy = 236, rx = 122, ry = 64, N = 18;
    const G = (id, g) => `<radialGradient id="${id}" cx=".34" cy=".3" r=".8"><stop offset="0" stop-color="${g[0]}"/><stop offset=".55" stop-color="${g[1]}"/><stop offset="1" stop-color="${g[2]}"/></radialGradient>`;
    let d = SH(u) + G('g' + u, S.g);
    if (S.seven) S.seven.forEach((c, i) => (d += G(`g${u}s${i}`, [mix(c, .45, 'w'), c, mix(c, .5, 'k')])));
    d += `<radialGradient id="gs${u}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#F6E3A6"/><stop offset=".5" stop-color="#C9A24E"/><stop offset="1" stop-color="#6E5220"/></radialGradient>`;
    const bs = [...Array(N)].map((_, i) => { const t = (i / N) * Math.PI * 2 + .17; return { i, t, x: cx + rx * Math.cos(t), y: cy + ry * Math.sin(t), d: (Math.sin(t) + 1) / 2 }; });
    const front = bs.slice().sort((p, q) => q.d - p.d).slice(0, 7).sort((p, q) => p.x - q.x).map((b) => b.i);
    let body = '';
    bs.slice().sort((p, q) => p.y - q.y).forEach((b) => {
      const r = 17 + 8 * b.d, x = b.x.toFixed(1), y = b.y.toFixed(1), fi = front.indexOf(b.i);
      const fill = S.seven && fi > -1 ? `url(#g${u}s${fi})` : `url(#g${u})`;
      d += `<clipPath id="c${u}${b.i}"><circle cx="${x}" cy="${y}" r="${r.toFixed(1)}"/></clipPath>`;
      let inner = '';
      if (S.band) for (let j = -1; j <= 1; j++) inner += `<path d="M${b.x - r},${b.y + j * r * .45 + r * .1} Q${b.x},${b.y + j * r * .45 - r * .45} ${b.x + r},${b.y + j * r * .45 + r * .1}" fill="none" stroke="${S.band}" stroke-width="${(r * .16).toFixed(1)}" opacity=".45"/>`;
      if (S.fleck) for (let j = 0; j < 5; j++) inner += `<circle cx="${(b.x + (R() - .5) * r * 1.4).toFixed(1)}" cy="${(b.y + (R() - .5) * r * 1.4).toFixed(1)}" r="${(.8 + R() * 1.4).toFixed(1)}" fill="${S.fleck}" opacity=".8"/>`;
      if (S.lava && fi < 0) for (let j = 0; j < 9; j++) inner += `<circle cx="${(b.x + (R() - .5) * r * 1.6).toFixed(1)}" cy="${(b.y + (R() - .5) * r * 1.6).toFixed(1)}" r="${(.7 + R() * 1.6).toFixed(1)}" fill="#0E0D0C" opacity=".7"/>`;
      if (S.sheen) inner += `<ellipse cx="${(b.x + r * .1).toFixed(1)}" cy="${(b.y + r * .15).toFixed(1)}" rx="${(r * .7).toFixed(1)}" ry="${(r * .45).toFixed(1)}" fill="${S.sheen}" opacity=".55"/>`;
      if (S.clear) inner += `<ellipse cx="${(b.x + r * .28).toFixed(1)}" cy="${(b.y + r * .34).toFixed(1)}" rx="${(r * .38).toFixed(1)}" ry="${(r * .22).toFixed(1)}" fill="#fff" opacity=".5"/>`;
      body += `<circle cx="${x}" cy="${y}" r="${r.toFixed(1)}" fill="${fill}"${S.clear ? ' stroke="#9AA6A4" stroke-width=".8"' : ''}/><g clip-path="url(#c${u}${b.i})">${inner}<circle cx="${x}" cy="${y}" r="${r.toFixed(1)}" fill="#0E1A14" opacity="${((1 - b.d) * .24).toFixed(2)}"/></g><ellipse cx="${(b.x - r * .34).toFixed(1)}" cy="${(b.y - r * .4).toFixed(1)}" rx="${(r * .33).toFixed(1)}" ry="${(r * .19).toFixed(1)}" fill="#fff" opacity="${(S.gloss * (.55 + .45 * b.d)).toFixed(2)}" transform="rotate(-25 ${(b.x - r * .34).toFixed(1)} ${(b.y - r * .4).toFixed(1)})"/>`;
    });
    const st = (Math.PI / 2 + .17 + Math.PI / 18), sx = cx + rx * Math.cos(st), sy = cy + ry * Math.sin(st);
    body += `<ellipse cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" rx="7" ry="13" fill="url(#gs${u})" stroke="#6E5220" stroke-width=".6"/>`;
    return `<defs>${d}</defs><ellipse cx="200" cy="${cy + ry + 46}" rx="156" ry="16" fill="url(#sh${u})"/>${body}`;
  }
  const THREADS = { yellow: ['#D4A72C'], saffron: ['#C9772E'], red: ['#A8322D'], black: ['#1F1F1F'], redblack: ['#A8322D', '#1F1F1F'], blackred: ['#1F1F1F', '#A8322D'] };
  function amulet(th, u) {
    const T = THREADS[th] || THREADS.red;
    let s = `<defs>${SH(u)}<linearGradient id="cu${u}" x1="0" x2="1"><stop offset="0" stop-color="#6A3216"/><stop offset=".22" stop-color="#B8683D"/><stop offset=".42" stop-color="#F2BE92"/><stop offset=".58" stop-color="#C87A4A"/><stop offset="1" stop-color="#6E3418"/></linearGradient><linearGradient id="bp${u}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#F3E6C8"/><stop offset="1" stop-color="#D6BF94"/></linearGradient></defs>`;
    s += `<ellipse cx="206" cy="400" rx="60" ry="9" fill="url(#sh${u})"/><ellipse cx="132" cy="424" rx="74" ry="8" fill="url(#sh${u})"/>`;
    const thr = (c, dash) => `<path d="M112,10 C108,120 150,178 186,196 M288,10 C292,120 250,178 214,196" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round"${dash ? ' stroke-dasharray="6 6"' : ''}/>`;
    s += thr(T[0]) + (T[1] ? thr(T[1], 1) : '');
    s += `<circle cx="190" cy="199" r="5.5" fill="none" stroke="url(#cu${u})" stroke-width="3"/><circle cx="210" cy="199" r="5.5" fill="none" stroke="url(#cu${u})" stroke-width="3"/><rect x="170" y="204" width="60" height="184" rx="30" fill="url(#cu${u})"/>`;
    [244, 252, 340, 348].forEach((y) => (s += `<path d="M171,${y} Q200,${y + 6} 229,${y}" fill="none" stroke="#5A2A12" stroke-width="1.1" opacity=".7"/><path d="M171,${y + 1.8} Q200,${y + 7.8} 229,${y + 1.8}" fill="none" stroke="#F6CDA6" stroke-width=".8" opacity=".6"/>`));
    s += `<path d="M200,278 V322 M190,284 C190,296 194,302 200,302 C206,302 210,296 210,284 M200,271 l-3.2,6.4 h6.4z" fill="none" stroke="#5A2A12" stroke-width="1.4" opacity=".6"/><rect x="185" y="216" width="7" height="160" rx="3.5" fill="#fff" opacity=".2"/>`;
    s += `<g transform="rotate(-12 132 404)"><rect x="72" y="390" width="120" height="28" rx="14" fill="url(#bp${u})" stroke="#BFA476"/><ellipse cx="86" cy="404" rx="7" ry="13" fill="none" stroke="#BFA476"/><path d="M106,398 h42 M106,405 h60 M106,411 h32" stroke="#A8322D" stroke-width="1" opacity=".55"/><path d="M164,389 v30" stroke="${T[0]}" stroke-width="3"/></g>`;
    return s;
  }
  function cert(u) {
    let lines = '';
    for (let k = 0; k < 5; k++) { const th = ((k * 72 + 14) % 360 + 360) % 360; const t = th > 180 ? th - 360 : th; if (Math.abs(t) > 84) continue; const rx = Math.abs(Math.sin((t * Math.PI) / 180)) * 44; lines += `<path d="M200,164 A${rx.toFixed(1)},44 0 0,${t > 0 ? 1 : 0} 200,252" fill="none" stroke="#DCE5E0" stroke-width="1.4" opacity=".75"/>`; }
    return `<defs>${SH(u)}</defs><ellipse cx="200" cy="456" rx="150" ry="11" fill="url(#sh${u})"/><rect x="72" y="52" width="256" height="396" rx="2" fill="#FFFDF7" stroke="#EAE0CA"/><rect x="84" y="64" width="232" height="372" fill="none" stroke="#B8923A" stroke-width="1.2"/><rect x="89" y="69" width="222" height="362" fill="none" stroke="#B8923A" stroke-width=".5"/>
<text x="200" y="102" text-anchor="middle" font-family="Fraunces,serif" font-size="17" fill="#0E3B30">Certificate of Authenticity</text><text x="200" y="120" text-anchor="middle" font-family="Manrope,sans-serif" font-size="7.4" font-weight="600" letter-spacing="1.6" fill="#7A5C1C">X-RAY TESTED · NEPALI ORIGIN</text>
<circle cx="200" cy="208" r="58" fill="#1F2A24"/><circle cx="200" cy="208" r="44" fill="none" stroke="#DCE5E0" stroke-width="1.4" opacity=".75"/>${lines}<g fill="#DCE5E0" opacity=".35"><ellipse cx="186" cy="200" rx="5" ry="9"/><ellipse cx="200" cy="196" rx="5" ry="9"/><ellipse cx="214" cy="200" rx="5" ry="9"/><ellipse cx="192" cy="220" rx="5" ry="9"/><ellipse cx="208" cy="220" rx="5" ry="9"/></g>
<g stroke="#D8CCB2" stroke-width="2"><path d="M110 296h180M110 316h140M110 336h160M110 356h120"/></g><circle cx="270" cy="392" r="22" fill="#C9A24E"/><circle cx="270" cy="392" r="16" fill="none" stroke="#FFF4D6" stroke-width="1"/><path d="M270 382c3 3 3.6 6.6 0 11-3.6-4.4-3-8 0-11z" fill="#FFF4D6"/><path d="M112 398c10-12 18 6 28-4s16 4 26-2" fill="none" stroke="#0E3B30" stroke-width="1.2"/>`;
  }
  function vthumb(u, pid) {
    return `<rect width="400" height="500" fill="#0A1F1A"/><g transform="translate(200 230)" opacity=".22">${M.mandala(210, '#D9B96A', .8)}</g><g transform="translate(0 -8) scale(1)" opacity=".85">${pid && /^r\d/.test(pid) ? bead(+pid.slice(1), u + 'v', { bare: 1, r: 70, cy: 236 }) : bead(5, u + 'v', { bare: 1, r: 70, cy: 236 })}</g><circle cx="200" cy="236" r="34" fill="#0A1F1A" opacity=".55"/><circle cx="200" cy="236" r="34" fill="none" stroke="#D9B96A" stroke-width="1.5"/><path d="M191 222v28l23-14z" fill="#D9B96A"/><text x="200" y="408" text-anchor="middle" font-family="Manrope,sans-serif" font-size="13" font-weight="600" letter-spacing="2" fill="#D9B96A">WATCH · 0:48</text>`;
  }
  M.diya = (u, noGlow) => `<svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true"><defs><radialGradient id="dg${u}"><stop offset="0" stop-color="#F2C66D" stop-opacity=".6"/><stop offset="1" stop-color="#F2C66D" stop-opacity="0"/></radialGradient><linearGradient id="df${u}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#C9772E"/><stop offset=".45" stop-color="#F2B64A"/><stop offset="1" stop-color="#FFF1C9"/></linearGradient><linearGradient id="db${u}" x1="0" x2="1"><stop offset="0" stop-color="#6E521C"/><stop offset=".45" stop-color="#E0C27A"/><stop offset="1" stop-color="#7E6024"/></linearGradient></defs>${noGlow ? '' : `<circle cx="60" cy="50" r="48" fill="url(#dg${u})" data-amb="glow:3"/>`}<path d="M18,72 C22,92 98,92 102,72 C88,79 32,79 18,72 Z" fill="url(#db${u})"/><path d="M18,72 C34,67 86,67 102,72" fill="none" stroke="#F7E7BC" stroke-width="1.3"/><path d="M50,87 L46,100 H74 L70,87 Z" fill="url(#db${u})"/><ellipse cx="60" cy="101" rx="19" ry="3.6" fill="#6E521C"/><path d="M60,71 v-6" stroke="#2A1A10" stroke-width="2.2" stroke-linecap="round"/><g data-amb="flicker" style="transform-origin:60px 67px"><path d="M60,30 C68,43 70,54 60,67 C50,54 52,43 60,30 Z" fill="url(#df${u})"/><path d="M60,48 C63.4,54 63.4,60 60,65 C56.6,60 56.6,54 60,48 Z" fill="#FFF8E6"/></g></svg>`;
  M.kalash = (u) => `<svg viewBox="0 0 260 200" width="100%" height="100%" aria-hidden="true"><defs>${SH(u)}<linearGradient id="kc${u}" x1="0" x2="1"><stop offset="0" stop-color="#6A3216"/><stop offset=".3" stop-color="#B8683D"/><stop offset=".48" stop-color="#EDB88C"/><stop offset=".62" stop-color="#C47548"/><stop offset="1" stop-color="#6E3418"/></linearGradient></defs><ellipse cx="116" cy="184" rx="78" ry="8" fill="url(#sh${u})"/><path d="M78,98 C60,114 58,146 72,164 C86,182 146,182 160,164 C174,146 172,114 154,98 Z" fill="url(#kc${u})"/><path d="M90,98 C92,88 95,82 99,78 H133 C137,82 140,88 142,98 Z" fill="url(#kc${u})"/><ellipse cx="116" cy="76" rx="30" ry="7" fill="#D99A6C"/><ellipse cx="116" cy="76" rx="22" ry="4.2" fill="#4A2210"/><path d="M66,128 Q116,142 166,128 M68,136 Q116,150 164,136" fill="none" stroke="#F4C8A0" stroke-width="1.2" opacity=".7"/><path d="M116,112 c4,4 4.6,8.6 0,14 -4.6,-5.4 -4,-10 0,-14z" fill="none" stroke="#F4C8A0" stroke-width="1.2" opacity=".8"/><g transform="translate(170 108) scale(.62)">${M.diya(u + 'd').replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g></svg>`;
  M.place = (k) => {
    const g = { stroke: '#7A5C1C', fill: 'none', w: 1.4 };
    const P = (d, x) => `<path d="${d}" fill="none" stroke="${x || g.stroke}" stroke-width="${g.w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const nag = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${P('M0,0 c-6,0 -9,-2 -9,-4 c0,-2 4,-3 9,-3 s9,1 9,3 c0,2 -3,4 -9,4 M2,-7 C4,-14 1,-20 0,-26 M-3,-27 C-3,-33 3,-33 3,-27 C3,-24 1,-23 0,-22 C-1,-23 -3,-24 -3,-27 Z', '#B8683D')}</g>`;
    if (k === 'temple') return `<svg viewBox="0 0 160 120" width="100%" height="100%">${P('M26 106h108M38 106V64h84v42M32 64h96M44 64l36-40 36 40M80 24v-9M74 15h12M58 106V84a22 22 0 0 1 44 0v22')}${nag(70, 100, .8)}${nag(80, 100, .8)}${nag(90, 100, .8)}<ellipse cx="80" cy="101" rx="18" ry="2.5" fill="none" stroke="#B8923A"/>${P('M44 100c3 3 9 3 12 0z M50 97c1.5-2 1.5-4 0-6-1.5 2-1.5 4 0 6z', '#B8923A')}</svg>`;
    if (k === 'tijori') return `<svg viewBox="0 0 160 120" width="100%" height="100%">${P('M48 18h72v86H48zM48 18L28 26v70l20 8M48 58h72M56 104v6M112 104v6M36 58h4')}<path d="M72 58c-2-11 4-17 11-17s13 6 11 17z" fill="#A8322D" opacity=".85"/>${P('M76 43c4 3 10 3 14 0', '#D9B96A')}${P('M60 82h48M60 90h30', '#B8923A')}</svg>`;
    return `<svg viewBox="0 0 160 120" width="100%" height="100%">${P('M16 90h128M26 90v22M134 90v22M50 88V62h50v26M42 90h66')}<ellipse cx="122" cy="86" rx="13" ry="3" fill="none" stroke="#B8923A" stroke-width="1.2"/>${nag(116, 85, .55)}${nag(122, 85, .55)}${nag(128, 85, .55)}<circle cx="136" cy="28" r="13" fill="none" stroke="#B8923A" stroke-width="1.2"/>${P('M136 28l7-7M141 21h2v2', '#B8923A')}<text x="136" y="50" text-anchor="middle" font-family="Manrope,sans-serif" font-size="8" font-weight="700" fill="#7A5C1C" letter-spacing="1">NE</text></svg>`;
  };
  M.artSvg = (p, slot, u) => {
    const a = p.art || {};
    const vb = slot === 'detail' ? '90 110 220 275' : '0 0 400 500';
    let inner;
    if (slot === 'cert') inner = cert(u);
    else if (slot === 'video') inner = vthumb(u, p.id);
    else if (a.t === 'bead') inner = bead(a.m, u);
    else if (a.t === 'mala') inner = mala(a.m, u);
    else if (a.t === 'bracelet') inner = bracelet(a.s, u);
    else if (a.t === 'amulet') inner = amulet(a.th, u);
    else inner = '';
    return `<svg viewBox="${vb}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${p.name}">${inner}</svg>`;
  };
  /* returns a cached React element for a product image slot: main | alt | detail | cert | video | tabiz */
  M.img = (React, p, slot, key) => {
    slot = slot || 'main';
    const k = 'img:' + (key || '') + ':' + p.id + ':' + slot;
    if (EL.has(k)) return EL.get(k);
    const photo = slot === 'main' ? p.photo : slot === 'alt' ? (p.photo2 || (p.cat === 'amulets' ? 'assets/p-tabiz.png' : null)) : slot === 'tabiz' ? 'assets/p-tabiz.png' : slot.startsWith('photo:') ? slot.slice(6) : null;
    let el;
    if (photo) el = React.createElement('img', { src: (window.__resources && window.__resources[photo]) || photo, alt: p.name, loading: 'lazy', draggable: false, style: { display: 'block', width: '100%', height: '100%', objectFit: 'cover' } });
    else {
      const s2 = slot === 'alt' ? 'detail' : slot;
      el = React.createElement('span', { style: { display: 'block', width: '100%', height: '100%' }, dangerouslySetInnerHTML: { __html: M.artSvg(p, s2, hash(k)) } });
    }
    EL.set(k, el);
    return el;
  };
  M.svgEl = (React, html, key, style) => M.h(React, html, style, 'svg:' + key);

  /* ---------------- catalog ---------------- */
  M.CATS = [
    { key: 'rudraksha', name: 'Rudraksha & Malas', hi: 'रुद्राक्ष एवं माला', short: 'Rudraksha', desc: 'Original Nepali beads from 2 to 14 Mukhi, X-ray tested and energized in Mahapuja before dispatch.', deshi: 'मूल नेपाली 2 से 14 मुखी रुद्राक्ष, एक्स-रे परीक्षित और भेजने से पहले महापूजा में ऊर्जित।' },
    { key: 'bracelets', name: 'Crystal Bracelets', hi: 'क्रिस्टल ब्रेसलेट', short: 'Bracelets', desc: 'Fifteen natural-stone bracelets, each chosen for one intention and strung on durable stretch cord.', deshi: 'पंद्रह प्राकृतिक रत्न ब्रेसलेट, हर एक किसी एक उद्देश्य के लिए चुना गया।' },
    { key: 'amulets', name: 'Sacred Amulets on Bhojpatra', hi: 'भोजपत्र कवच', short: 'Amulets', desc: 'Handmade on authentic Bhojpatra, energized at an auspicious muhurat during Mahapuja and sealed in a consecrated copper tabiz.', deshi: 'असली भोजपत्र पर हस्तनिर्मित, शुभ मुहूर्त में महापूजा में ऊर्जित और तांबे के ताबीज़ में बंद।' },
    { key: 'havan', name: 'Havan Samagri', hi: 'हवन सामग्री', short: 'Havan', desc: 'Bitter Havan blend to clear deep negativity, evil eye and stagnant energy from the home.', deshi: 'घर से गहरी नकारात्मकता, बुरी नज़र और रुकी हुई ऊर्जा दूर करने वाला कड़वा हवन।' },
    { key: 'copper', name: 'Energized Copper', hi: 'ऊर्जित ताम्र', short: 'Copper', desc: 'Pure copper offerings, hand-energized through traditional ritual for the home temple, tijori and office.', deshi: 'शुद्ध तांबे की वस्तुएँ, पारंपरिक अनुष्ठान से ऊर्जित — मंदिर, तिजोरी और ऑफ़िस के लिए।' }
  ];
  M.INTENTS = [
    { key: 'wealth', en: 'Wealth', hi: 'धन', icon: 'coins' }, { key: 'protection', en: 'Protection', hi: 'रक्षा', icon: 'shield' }, { key: 'love', en: 'Love', hi: 'प्रेम', icon: 'heart' },
    { key: 'peace', en: 'Peace', hi: 'शांति', icon: 'lotus' }, { key: 'health', en: 'Health', hi: 'स्वास्थ्य', icon: 'health' }, { key: 'courage', en: 'Courage', hi: 'साहस', icon: 'trishul' }, { key: 'clarity', en: 'Clarity', hi: 'स्पष्टता', icon: 'sun' }
  ];
  const HIN = ['', '', 'दो', 'तीन', 'चार', 'पंच', 'छह', 'सात', 'आठ', 'नौ', 'दस', 'ग्यारह', 'बारह', 'तेरह', 'चौदह'];
  M.RUD = {
    2: { deity: 'Ardhanarishvara', planet: 'Moon', intent: 'Harmony & Relationships', ik: 'love', mantra: 'Om Namah', price: 551, mrp: 799 },
    3: { deity: 'Agni', planet: 'Mars', intent: 'Confidence & Release', ik: 'courage', mantra: 'Om Kleem Namah', price: 451, mrp: 699 },
    4: { deity: 'Brahma', planet: 'Mercury', intent: 'Learning & Focus', ik: 'clarity', mantra: 'Om Hreem Namah', price: 451, mrp: 699 },
    5: { deity: 'Kalagni Rudra', planet: 'Jupiter', intent: 'Peace & Health', ik: 'peace', mantra: 'Om Hreem Namah', price: 351, mrp: 549 },
    6: { deity: 'Kartikeya', planet: 'Venus', intent: 'Courage & Willpower', ik: 'courage', mantra: 'Om Hreem Hum Namah', price: 551, mrp: 799 },
    7: { deity: 'Mahalakshmi', planet: 'Saturn', intent: 'Wealth & Abundance', ik: 'wealth', mantra: 'Om Hum Namah', price: 751, mrp: 1099 },
    8: { deity: 'Ganesha', planet: 'Rahu', intent: 'Removing Obstacles', ik: 'clarity', mantra: 'Om Hum Namah', price: 1250, mrp: 1799 },
    9: { deity: 'Maa Durga', planet: 'Ketu', intent: 'Shakti & Fearlessness', ik: 'protection', mantra: 'Om Hreem Hum Namah', price: 1850, mrp: 2499 },
    10: { deity: 'Vishnu', planet: 'All nine grahas', intent: 'Protection from Negativity', ik: 'protection', mantra: 'Om Hreem Namah Namah', price: 2100, mrp: 2999 },
    11: { deity: 'Hanuman (Ekadasha Rudra)', planet: 'Mars', intent: 'Courage & Wisdom', ik: 'courage', mantra: 'Om Hreem Hum Namah', price: 3100, mrp: 4199 },
    12: { deity: 'Surya', planet: 'Sun', intent: 'Leadership & Radiance', ik: 'courage', mantra: 'Om Kraum Sraum Raum Namah', price: 4100, mrp: 5499 },
    13: { deity: 'Kamadeva', planet: 'Venus', intent: 'Attraction & Fulfilment', ik: 'love', mantra: 'Om Hreem Namah', price: 6100, mrp: 7999 },
    14: { deity: 'Deva Mani (Shiva)', planet: 'Saturn', intent: 'Intuition & Protection', ik: 'protection', mantra: 'Om Namah', price: 11000, mrp: 13999 }
  };
  const P = [];
  for (let m = 2; m <= 14; m++) {
    const r = M.RUD[m];
    P.push({ id: 'r' + m, cat: 'rudraksha', sub: String(m), mukhi: m, name: `${m} Mukhi Rudraksha`, hi: `${HIN[m]} मुखी रुद्राक्ष`, price: r.price, mrp: r.mrp, intent: r.intent, ik: r.ik, art: { t: 'bead', m }, stock: m === 12 ? 0 : m === 13 ? 2 : m === 14 ? 1 : m === 5 ? 40 : 14, badges: m === 5 ? ['bestseller', 'energized'] : m === 14 ? ['rare'] : ['energized'], rating: m === 5 ? 4.8 : null, reviews: m === 5 ? 126 : null, date: 20 - m });
  }
  P.push({ id: 'm5', cat: 'rudraksha', sub: 'malas', name: '5 Mukhi Rudraksha Mala', hi: 'पंचमुखी रुद्राक्ष माला', price: 1100, mrp: 1499, rating: 4.8, reviews: 212, intent: 'Japa & Peace', ik: 'peace', badges: ['bestseller'], stock: 22, art: { t: 'mala', m: 5 }, date: 9 });
  P.push({ id: 'm7', cat: 'rudraksha', sub: 'malas', name: '7 Mukhi Rudraksha Mala', hi: 'सातमुखी रुद्राक्ष माला', price: 3100, mrp: 3999, rating: 4.9, reviews: 64, intent: 'Wealth & Abundance', ik: 'wealth', badges: ['energized'], stock: 4, art: { t: 'mala', m: 7 }, date: 30 });
  [
    ['pyrite', 'Pyrite', 'पायराइट', 899, 1499, 'Wealth & Abundance', 'wealth', ['bestseller'], 4.7, 318],
    ['citrine', 'Citrine', 'सिट्रीन', 1099, 1799, 'Success & Joy', 'wealth'],
    ['jade', 'Green Jade', 'ग्रीन जेड', 899, 1399, 'Prosperity & Harmony', 'wealth'],
    ['tourmaline', 'Black Tourmaline', 'ब्लैक टूमलाइन', 999, 1599, 'Negative Energy Protection', 'protection', ['energized'], 4.8, 187],
    ['tiger', 'Tiger Eye', 'टाइगर आई', 849, 1399, 'Courage & Focus', 'courage'],
    ['rose', 'Rose Quartz', 'रोज़ क्वार्ट्ज़', 799, 1299, 'Love & Relationships', 'love', ['bestseller'], 4.8, 204],
    ['amethyst', 'Amethyst', 'एमेथिस्ट', 999, 1699, 'Intuition & Peace', 'peace'],
    ['chakra', 'Seven Chakra', 'सप्त चक्र', 749, 1199, 'Chakra Balancing', 'health', ['new']],
    ['quartz', 'Clear Quartz', 'क्लियर क्वार्ट्ज़', 799, 1299, 'Master Healer & Clarity', 'clarity'],
    ['lapis', 'Lapis Lazuli', 'लैपिस लाज़ुली', 1199, 1899, 'Wisdom & Truth', 'clarity'],
    ['moon', 'Moonstone', 'मूनस्टोन', 1099, 1799, 'Emotional Balance & Intuition', 'peace', ['new']],
    ['garnet', 'Garnet', 'गार्नेट', 1299, 1999, 'Passion & Energy', 'love'],
    ['blood', 'Bloodstone', 'ब्लडस्टोन', 999, 1599, 'Vitality & Strength', 'health'],
    ['jasper', 'Red Jasper', 'रेड जैस्पर', 699, 999, 'Grounding & Stability', 'courage'],
    ['malachite', 'Malachite', 'मैलाकाइट', 1199, 1799, 'Transformation & Protection', 'protection', ['new']]
  ].forEach(([s, n, h, pr, mrp, it, ik, b, ra, rv], i) => P.push({ id: 'b-' + s, cat: 'bracelets', stone: s, stoneName: n, name: n + ' Bracelet', hi: h + ' ब्रेसलेट', price: pr, mrp, intent: it, ik, badges: b || [], rating: ra || null, reviews: rv || null, sizes: ['S', 'M', 'L'], stock: s === 'lapis' ? 3 : 20, art: { t: 'bracelet', s }, date: [4, 12, 18, 7, 22, 6, 15, 2, 26, 11, 3, 19, 24, 28, 1][i] }));
  [
    ['bagla', 'Maa Baglamukhi Amulet', 'माँ बगलामुखी कवच', 2100, 2700, 'Victory & Protection', 'protection', 'yellow', ['energized'], 4.9, 96],
    ['hanuman', 'Hanuman Amulet', 'हनुमान कवच', 1100, 1500, 'Courage & Sankat Mochan', 'courage', 'saffron'],
    ['durga', 'Durga Amulet', 'दुर्गा कवच', 1500, 1999, 'Universal Divine Shield', 'protection', 'red'],
    ['kali', 'Mahakali Amulet', 'महाकाली कवच', 2100, 2700, 'Destroyer of Negativity & Dark Forces', 'protection', 'black'],
    ['vidya', 'Mahavidya Amulet', 'महाविद्या कवच', 2100, 2700, 'Supreme Occult Knowledge & Power', 'clarity', 'redblack'],
    ['bhairav', 'Bhairav Amulet', 'भैरव कवच', 1500, 1999, 'Fearlessness & Fierce Protection', 'courage', 'black'],
    ['child', 'Child Evil Eye Protection Amulet', 'बालमुखी · बुरी नज़र कवच', 1100, 1500, 'Balamukhi / Buri Nazar Kavach', 'protection', 'blackred', ['bestseller'], 4.9, 158]
  ].forEach(([s, n, h, pr, mrp, it, ik, th, b, ra, rv], i) => P.push({ id: 'a-' + s, cat: 'amulets', name: n, hi: h, price: pr, mrp, intent: it, ik, badges: b || ['energized'], rating: ra || null, reviews: rv || null, stock: s === 'vidya' ? 5 : 16, art: { t: 'amulet', th }, date: [5, 14, 21, 8, 27, 16, 10][i] }));
  P.push({ id: 'havan', cat: 'havan', name: 'Bitter Havan Packet – 100 g', hi: 'कड़वा हवन – 100 ग्राम', price: 299, mrp: 399, rating: 4.7, reviews: 412, intent: 'Wards off negativity & evil eye', ik: 'protection', badges: ['bestseller'], stock: 60, photo: 'assets/p-bitter-havan.png', photo2: 'assets/p-bitter-havan-2.png', date: 13 });
  P.push({ id: 'nag12', cat: 'copper', name: 'Hand-Energized Pure Copper 12 Nag', long: 'Hand-Energized Pure Copper 12 Nag (Twelve Serpents Set) – For Wealth, Protection & Success', hi: 'ऊर्जित शुद्ध ताम्र 12 नाग', price: 1250, mrp: 1599, rating: 4.9, reviews: 143, intent: 'Wealth, Protection & Success', ik: 'wealth', badges: ['energized', 'featured'], stock: 9, photo: 'assets/p-12-nag.png', photo2: 'assets/p-12-nag-2.png', date: 17 });
  P.forEach((p, i) => {
    const R = rng(p.id);
    if (!p.rating) p.rating = +(4.5 + R() * .4).toFixed(1);
    if (!p.reviews) p.reviews = 18 + Math.floor(R() * 150);
    p.pop = p.reviews * p.rating;
    p.catName = M.CATS.find((c) => c.key === p.cat).name;
    p.href = p.id === 'nag12' ? 'Product-Copper-12-Nag.dc.html' : 'Product-Rudraksha.dc.html#p=' + p.id;
  });
  M.P = P;
  M.byId = Object.fromEntries(P.map((p) => [p.id, p]));
  M.BADGE = { bestseller: ['Bestseller', 'बेस्टसेलर', '#164E3F', '#FBF7EE'], energized: ['Energized', 'ऊर्जित', '#FBF7EE', '#7A5C1C'], new: ['New', 'नया', '#FBF7EE', '#164E3F'], rare: ['Rare', 'दुर्लभ', '#0A1F1A', '#D9B96A'], featured: ['Featured', 'विशेष', '#FBF7EE', '#8A4A26'] };
  M.stockNote = (p, hi) => p.stock === 0 ? (hi ? 'स्टॉक में नहीं' : 'Out of stock') : p.stock <= 5 ? (hi ? `केवल ${p.stock} शेष` : `Only ${p.stock} left`) : '';

  /* ---------------- pincode ---------------- */
  const PIN = { 221001: ['Varanasi', 'Uttar Pradesh'], 226001: ['Lucknow', 'Uttar Pradesh'], 110001: ['New Delhi', 'Delhi'], 400001: ['Mumbai', 'Maharashtra'], 800001: ['Patna', 'Bihar'], 302001: ['Jaipur', 'Rajasthan'], 452001: ['Indore', 'Madhya Pradesh'], 560001: ['Bengaluru', 'Karnataka'], 700001: ['Kolkata', 'West Bengal'], 411001: ['Pune', 'Maharashtra'], 380001: ['Ahmedabad', 'Gujarat'], 208001: ['Kanpur', 'Uttar Pradesh'], 273001: ['Gorakhpur', 'Uttar Pradesh'], 248001: ['Dehradun', 'Uttarakhand'], 122001: ['Gurugram', 'Haryana'], 500001: ['Hyderabad', 'Telangana'], 600001: ['Chennai', 'Tamil Nadu'], 462001: ['Bhopal', 'Madhya Pradesh'], 834001: ['Ranchi', 'Jharkhand'], 160017: ['Chandigarh', 'Chandigarh'], 211001: ['Prayagraj', 'Uttar Pradesh'], 282001: ['Agra', 'Uttar Pradesh'] };
  const ST = [[11, 'Delhi'], [12, 'Haryana'], [14, 'Punjab'], [17, 'Himachal Pradesh'], [18, 'Jammu & Kashmir'], [20, 'Uttar Pradesh'], [24, 'Uttarakhand'], [25, 'Uttar Pradesh'], [30, 'Rajasthan'], [36, 'Gujarat'], [40, 'Maharashtra'], [45, 'Madhya Pradesh'], [49, 'Chhattisgarh'], [50, 'Telangana'], [51, 'Andhra Pradesh'], [56, 'Karnataka'], [60, 'Tamil Nadu'], [67, 'Kerala'], [70, 'West Bengal'], [75, 'Odisha'], [78, 'Assam'], [79, 'North East'], [80, 'Bihar'], [81, 'Jharkhand'], [85, 'Bihar']];
  M.pin = (pin, express) => {
    pin = String(pin || '').trim();
    if (!/^[1-9]\d{5}$/.test(pin)) return { ok: false };
    const two = +pin.slice(0, 2); let state = 'India';
    ST.forEach(([k, s]) => { if (two >= k) state = s; });
    const known = PIN[pin];
    const days = { 1: 4, 2: 3, 3: 5, 4: 5, 5: 6, 6: 7, 7: two >= 78 ? 8 : 6, 8: 4 }[pin[0]] || 6;
    const lead = 2 + days - (express ? 2 : 0);
    return { ok: true, city: known ? known[0] : '', state: known ? known[1] : state, cod: two < 78 || two > 79, date: M.addDays(lead), days: lead };
  };

  /* ---------------- store ---------------- */
  const KEY = 'mka.store.v2';
  const seed = { cart: [{ key: 'r5||Ravi Sharma/Kashyap', id: 'r5', v: null, qty: 1, energ: { name: 'Ravi Sharma', gotra: 'Kashyap' } }, { key: 'havan||', id: 'havan', v: null, qty: 1, energ: null }], wish: ['b-rose', 'a-bagla', 'm7'], recent: ['b-pyrite', 'm5', 'a-bagla'], lang: 'en', coupon: null, gift: null, orders: [], searches: ['5 mukhi', 'pyrite bracelet'] };
  let d; try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { d = null; }
  if (!d) d = JSON.parse(JSON.stringify(seed));
  const S = (M.store = {
    d,
    ENERG: 251, FREE: 999, SHIP: 79, EXPRESS: 99, COD: 49, GIFT: 49,
    save() { try { localStorage.setItem(KEY, JSON.stringify(this.d)); } catch (e) {} window.dispatchEvent(new CustomEvent('mka:store')); },
    on(fn) { const h = () => fn(); window.addEventListener('mka:store', h); const st = (e) => { if (e.key === KEY) { try { this.d = JSON.parse(e.newValue); } catch (x) {} fn(); } }; window.addEventListener('storage', st); return () => { window.removeEventListener('mka:store', h); window.removeEventListener('storage', st); }; },
    lineKey(id, v, energ) { return `${id}|${v || ''}|${energ ? energ.name + '/' + energ.gotra : ''}`; },
    add(id, o) { o = o || {}; const key = this.lineKey(id, o.v, o.energ); const ex = this.d.cart.find((l) => l.key === key); if (ex) ex.qty = Math.min(10, ex.qty + (o.qty || 1)); else this.d.cart.unshift({ key, id, v: o.v || null, qty: o.qty || 1, energ: o.energ || null }); this.save(); return key; },
    setQty(key, q) { const l = this.d.cart.find((x) => x.key === key); if (!l) return; l.qty = Math.max(1, Math.min(10, q)); this.save(); },
    remove(key) { const i = this.d.cart.findIndex((l) => l.key === key); if (i < 0) return null; const snap = { line: this.d.cart[i], i }; this.d.cart.splice(i, 1); this.save(); return snap; },
    restore(snap) { if (!snap) return; this.d.cart.splice(Math.min(snap.i, this.d.cart.length), 0, snap.line); this.save(); },
    setEnerg(key, energ) { const l = this.d.cart.find((x) => x.key === key); if (!l) return; l.energ = energ; l.key = this.lineKey(l.id, l.v, energ); this.save(); },
    clearCart() { this.d.cart = []; this.d.coupon = null; this.d.gift = null; this.save(); },
    isWish(id) { return this.d.wish.includes(id); },
    wishToggle(id) { const i = this.d.wish.indexOf(id); if (i > -1) this.d.wish.splice(i, 1); else this.d.wish.unshift(id); this.save(); return i < 0; },
    view(id) { this.d.recent = [id].concat(this.d.recent.filter((x) => x !== id)).slice(0, 10); this.save(); },
    setLang(l) { this.d.lang = l; this.save(); },
    count() { return this.d.cart.reduce((a, l) => a + l.qty, 0); },
    lines() { return this.d.cart.map((l) => ({ ...l, p: M.byId[l.id] })).filter((l) => l.p); },
    applyCoupon(code) {
      code = String(code || '').trim().toUpperCase();
      const t = this.totals({ noCoupon: 1 });
      if (!code) return { ok: false, msg: 'Enter a coupon code' };
      if (code === 'SADHANA10') { this.d.coupon = { code, pct: 10 }; this.save(); return { ok: true, msg: '10% off applied' }; }
      if (code === 'FIRST100') { if (t.sub < 999) return { ok: false, msg: 'FIRST100 needs a cart of ₹999 or more' }; this.d.coupon = { code, flat: 100 }; this.save(); return { ok: true, msg: '₹100 off applied' }; }
      return { ok: false, msg: `"${code}" isn't a valid coupon` };
    },
    removeCoupon() { this.d.coupon = null; this.save(); },
    totals(o) {
      o = o || {}; const ls = this.lines();
      const items = ls.reduce((a, l) => a + l.p.price * l.qty, 0), mrp = ls.reduce((a, l) => a + l.p.mrp * l.qty, 0);
      const energ = ls.reduce((a, l) => a + (l.energ ? this.ENERG * l.qty : 0), 0);
      const sub = items + energ; const c = o.noCoupon ? null : this.d.coupon;
      const disc = c ? (c.pct ? Math.round(items * c.pct / 100) : c.flat) : 0;
      const gift = this.d.gift ? this.GIFT : 0;
      const ship = ls.length === 0 ? 0 : sub - disc >= this.FREE ? 0 : this.SHIP;
      const express = o.express ? this.EXPRESS : 0, cod = o.cod ? this.COD : 0;
      return { count: this.count(), items, mrp, save: mrp - items, energ, sub, disc, gift, ship, express, cod, total: sub - disc + gift + ship + express + cod, toFree: Math.max(0, this.FREE - (sub - disc)), pct: Math.min(1, (sub - disc) / this.FREE) };
    },
    placeOrder(o) { const id = 'MKA-' + String(Date.now()).slice(-7); const order = Object.assign({ id, at: Date.now(), lines: this.lines().map(({ p, ...l }) => l), totals: this.totals(o) }, o); this.d.orders.unshift(order); this.d.cart = []; this.d.coupon = null; this.d.gift = null; this.save(); return order; },
    reset() { this.d = JSON.parse(JSON.stringify(seed)); this.save(); }
  });
  if (!localStorage.getItem(KEY)) S.save();

  /* ---------------- UI bus ---------------- */
  M.ui = {
    emit(type, detail) { window.dispatchEvent(new CustomEvent('mka:ui', { detail: Object.assign({ type }, detail || {}) })); },
    on(fn) { const h = (e) => fn(e.detail); window.addEventListener('mka:ui', h); return () => window.removeEventListener('mka:ui', h); },
    toast(msg, o) { this.emit('toast', Object.assign({ msg }, o || {})); }
  };
  M.lang = () => S.d.lang || 'en';
  M.BUILT = { shop: 'Shop.dc.html', cart: 'Cart.dc.html', checkout: 'Checkout.dc.html', success: 'Order-Success.dc.html', wishlist: 'Wishlist.dc.html', search: 'Search.dc.html', pdp: 'Product-Rudraksha.dc.html', nag: 'Product-Copper-12-Nag.dc.html', consult: 'Consultations.dc.html', consultDetail: 'Consultation-Detail.dc.html', booking: 'Booking.dc.html', kundali: 'Kundali-99.dc.html', love: 'Love-Calculator.dc.html', rashifal: 'Rashifal.dc.html', rashi: 'Rashi-Detail.dc.html', courses: 'Sadhana-Courses.dc.html', course: 'Course-Detail.dc.html', rituals: 'Rituals.dc.html', home: 'Home.dc.html', videos: 'Videos.dc.html', about: 'About.dc.html' };
  const ROUTE = { 'The Home page': 'Home.dc.html', Home: 'Home.dc.html', Videos: 'Videos.dc.html', 'वीडियो': 'Videos.dc.html', 'About Sadhak Ji': 'About.dc.html', About: 'About.dc.html', 'परिचय': 'About.dc.html' };
  M.soon = (label) => (e) => { if (e && e.preventDefault) e.preventDefault(); if (ROUTE[label]) { location.href = ROUTE[label]; return; } M.ui.toast(`${label} is designed in an upcoming batch`, { tone: 'info' }); };

  /* ---------------- motion ---------------- */
  const reduced = () => !!M.reduced || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  M.isReduced = reduced;
  const ALL = new Set();
  let io = null;
  const obs = () => io || (io = new IntersectionObserver((es) => es.forEach((e) => (e.target.__amb || []).forEach((a) => { try { e.isIntersecting && !document.hidden ? a.play() : a.pause(); } catch (x) {} })), { rootMargin: '120px' }));
  document.addEventListener('visibilitychange', () => ALL.forEach((a) => { try { document.hidden ? a.pause() : a.play(); } catch (x) {} }));
  const DONE = new WeakSet();
  M.fx = {
    scan(root) {
      if (reduced()) return;
      (root || document).querySelectorAll('[data-amb]').forEach((el) => {
        if (DONE.has(el)) return; DONE.add(el);
        const [k, ...a] = el.getAttribute('data-amb').split(':'); const n = a.map(Number), R = Math.random; let an = null;
        if (k === 'spin') an = el.animate([{ transform: 'rotate(0deg)' }, { transform: `rotate(${n[0] < 0 ? -360 : 360}deg)` }], { duration: Math.abs(n[0] || 60) * 1000, iterations: Infinity });
        else if (k === 'float') { const du = (n[0] || 8) * 1000, y = n[1] || 12, r = n[2] || 4; an = el.animate([{ transform: 'translate3d(0,0,0) rotate(0deg)' }, { transform: `translate3d(0,${-y}px,0) rotate(${r}deg)` }, { transform: 'translate3d(0,0,0) rotate(0deg)' }], { duration: du, delay: -(isNaN(n[3]) ? R() : n[3]) * du, iterations: Infinity, easing: M.INOUT }); }
        else if (k === 'twinkle') { const du = 2000 + R() * 4000; an = el.animate([{ opacity: .2 }, { opacity: 1 }, { opacity: .2 }], { duration: du, delay: -R() * du, iterations: Infinity, easing: 'ease-in-out' }); }
        else if (k === 'glow') an = el.animate([{ opacity: .45 }, { opacity: .9 }, { opacity: .45 }], { duration: (n[0] || 3) * 1000, iterations: Infinity, easing: M.INOUT });
        else if (k === 'flicker') an = el.animate([{ transform: 'scale(1,1) skewX(0deg)', opacity: 1 }, { transform: 'scale(.94,1.07) skewX(-3deg)', opacity: .92, offset: .13 }, { transform: 'scale(1.04,.95) skewX(2deg)', opacity: 1, offset: .29 }, { transform: 'scale(.97,1.08) skewX(-1.5deg)', opacity: .95, offset: .41 }, { transform: 'scale(1.02,.94) skewX(3deg)', opacity: 1, offset: .6 }, { transform: 'scale(.96,1.05) skewX(-2deg)', opacity: .9, offset: .78 }, { transform: 'scale(1,1) skewX(0deg)', opacity: 1 }], { duration: 1600 + R() * 500, iterations: Infinity, easing: 'ease-in-out' });
        else if (k === 'smoke') { const du = (n[0] || 8) * 1000; an = el.animate([{ transform: 'translateY(0) scaleX(1)', opacity: 0 }, { opacity: .5, offset: .25 }, { transform: 'translateY(-44px) scaleX(1.7)', opacity: 0 }], { duration: du, delay: -(n[1] || 0) * 1000, iterations: Infinity, easing: 'linear' }); }
        else if (k === 'pulse') an = el.animate([{ transform: 'scale(1)', opacity: .55 }, { transform: 'scale(1.75)', opacity: 0, offset: .22 }, { transform: 'scale(1.75)', opacity: 0 }], { duration: (n[0] || 8) * 1000, iterations: Infinity, easing: 'ease-out' });
        else if (k === 'shoot') an = el.animate([{ transform: 'translate(0,0)', opacity: 0 }, { opacity: 1, offset: .015 }, { transform: 'translate(-280px,170px)', opacity: 0, offset: .1 }, { transform: 'translate(-280px,170px)', opacity: 0 }], { duration: (n[0] || 12) * 1000, delay: (n[1] || 0) * 1000, iterations: Infinity, easing: 'ease-in' });
        else if (k === 'draw') { el.style.strokeDasharray = '1'; an = el.animate([{ strokeDashoffset: 1, opacity: 0 }, { strokeDashoffset: 0, opacity: 1, offset: .35 }, { strokeDashoffset: 0, opacity: 1, offset: .85 }, { strokeDashoffset: 0, opacity: 0 }], { duration: (n[0] || 16) * 1000, delay: (n[1] || 0) * 1000, iterations: Infinity, easing: M.INOUT }); }
        if (an) { el.__amb = [an]; ALL.add(an); obs().observe(el); }
      });
    },
    reveal(root) {
      const els = [...(root || document).querySelectorAll('[data-reveal]')].filter((e) => !e.__rv);
      if (!els.length) return;
      if (reduced()) { els.forEach((e) => (e.__rv = 1)); return; }
      const rio = M._rio || (M._rio = new IntersectionObserver((es) => es.forEach((en) => { if (!en.isIntersecting) return; const e = en.target; rio.unobserve(e); const i = +e.getAttribute('data-reveal') || 0; e.style.opacity = ''; e.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: i * 80, easing: M.EASE, fill: 'backwards' }); }), { threshold: .12 }));
      const vh = innerHeight;
      els.forEach((e) => { e.__rv = 1; if (e.getBoundingClientRect().top > vh * .92) e.style.opacity = '0'; rio.observe(e); });
    },
    cartTarget() { return [...document.querySelectorAll('[data-cart-target]')].find((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight; }); },
    fly(src) {
      const t = this.cartTarget();
      if (!src || !t || reduced()) { this.bumpCart(); return; }
      const a = src.getBoundingClientRect(), b = t.getBoundingClientRect(), c = src.cloneNode(true);
      Object.assign(c.style, { position: 'fixed', left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px', zIndex: 9999, pointerEvents: 'none', borderRadius: '4px', overflow: 'hidden', background: '#F4EDDD', boxShadow: '0 12px 32px -12px rgba(14,59,48,.4)', margin: 0, transformOrigin: 'center' });
      document.body.appendChild(c);
      const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2), s = Math.max(.06, 26 / a.width);
      const an = c.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1, borderRadius: '4px' }, { transform: `translate(${dx * .45}px,${Math.min(dy, 0) * .45 - 90}px) scale(${(.5 + s) / 1.6})`, opacity: 1, offset: .5, borderRadius: '40px' }, { transform: `translate(${dx}px,${dy}px) scale(${s})`, opacity: .4, borderRadius: '999px' }], { duration: 620, easing: 'cubic-bezier(.5,0,.2,1)' });
      an.onfinish = () => { c.remove(); this.bumpCart(); };
    },
    bumpCart() { document.querySelectorAll('[data-cart-badge]').forEach((e) => this.bump(e)); },
    bump(e) { if (!e || reduced()) return; e.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.5)', offset: .35 }, { transform: 'scale(.9)', offset: .65 }, { transform: 'scale(1.05)', offset: .85 }, { transform: 'scale(1)' }], { duration: 560, easing: 'ease-out' }); },
    burst(el) {
      if (!el || reduced()) return; const r = el.getBoundingClientRect();
      for (let i = 0; i < 6; i++) { const d = document.createElement('span'); const ang = (i / 6) * Math.PI * 2 - Math.PI / 2; Object.assign(d.style, { position: 'fixed', left: r.left + r.width / 2 - 2.5 + 'px', top: r.top + r.height / 2 - 2.5 + 'px', width: '5px', height: '5px', borderRadius: '50%', background: '#B8923A', zIndex: 9999, pointerEvents: 'none' }); document.body.appendChild(d); d.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${Math.cos(ang) * 20}px,${Math.sin(ang) * 20}px) scale(.3)`, opacity: 0 }], { duration: 520, easing: M.EASE }).onfinish = () => d.remove(); }
      el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)', offset: .4 }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
    },
    roll(el, dir) { if (!el || reduced()) return; el.animate([{ transform: `translateY(${dir > 0 ? 70 : -70}%)`, opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 240, easing: M.EASE }); },
    shimmer(el) { if (!el || el.__sh || reduced()) return; el.__sh = el.animate([{ backgroundPosition: '150% 0' }, { backgroundPosition: '-50% 0' }], { duration: 1400, iterations: Infinity, easing: 'linear' }); },
    drawIn(el, dur, delay) { if (!el) return; el.style.strokeDasharray = '1'; if (reduced()) { el.style.strokeDashoffset = '0'; return; } el.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: dur || 900, delay: delay || 0, easing: M.EASE, fill: 'both' }); },
    enter(el, o) { if (!el || reduced()) return; o = o || {}; el.animate([{ opacity: 0, transform: `translateY(${o.y == null ? 8 : o.y}px)` }, { opacity: 1, transform: 'none' }], { duration: o.dur || 300, delay: o.delay || 0, easing: M.EASE, fill: 'backwards' }); },
    stagger(root, sel, o) { if (!root) return; [...root.querySelectorAll(sel)].forEach((e, i) => this.enter(e, Object.assign({ delay: i * ((o && o.step) || 60) }, o))); },
    pageIn() {
      if (M._paged) return; M._paged = 1; if (reduced()) return;
      const root = document.getElementById('dc-root'); if (root) root.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 520, easing: M.EASE });
      const line = document.createElement('div'); Object.assign(line.style, { position: 'fixed', left: 0, top: 0, height: '2px', width: '100%', background: '#B8923A', transformOrigin: '0 50%', zIndex: 10000, pointerEvents: 'none' }); document.body.appendChild(line);
      line.animate([{ transform: 'scaleX(0)', opacity: 1 }, { transform: 'scaleX(1)', opacity: 1, offset: .7 }, { transform: 'scaleX(1)', opacity: 0 }], { duration: 900, easing: M.EASE }).onfinish = () => line.remove();
    }
  };
  /* shared helper for DCs: viewport + store + ui subscriptions */
  M.bind = (cmp) => {
    const onR = () => cmp.setState({ vw: window.innerWidth });
    window.addEventListener('resize', onR);
    const u1 = S.on(() => cmp.forceUpdate());
    return () => { window.removeEventListener('resize', onR); u1(); };
  };
  /* ---------------- content indexes ---------------- */
  M.SERVICES = [
    { key: 'kundali', name: 'Kundali Reading', hi: 'कुंडली विश्लेषण', icon: 'kundali', price: 2100, dur: '60 min', modes: 'Call · Video · WhatsApp · Written report', line: 'Career, marriage, finance and health, read from your birth chart with guidance until your doubts are resolved.' },
    { key: 'palm', name: 'Palmistry', hi: 'हस्तरेखा', icon: 'palm', price: 1100, dur: 'Report in 48 hrs', modes: 'Photo upload · Written report', line: 'Share clear photos of both palms; life line, destiny and turning points decoded by Hastrekha principles.' },
    { key: 'tarot', name: 'Tarot Card Reading', hi: 'टैरो कार्ड', icon: 'tarot', price: 1100, dur: '30 min', modes: 'Call · Video', line: 'An intuitive spread for one clear question, especially relationship and career dilemmas.' },
    { key: 'numerology', name: 'Numerology', hi: 'अंक ज्योतिष', icon: 'loshu', price: 1500, dur: '45 min', modes: 'Call · Written report', line: 'Align your name, mobile number and business name with favourable vibrations.' }
  ];
  M.ARTICLES = [
    { t: 'How to identify an original Nepali Rudraksha: six checks you can do at home', c: 'Rudraksha guide', m: 8, pid: 'r5' },
    { t: 'Which crystal bracelet suits your rashi?', c: 'Crystals', m: 6, pid: 'b-rose' },
    { t: 'Rules of wearing a Baglamukhi amulet', c: 'Remedies', m: 5, pid: 'a-bagla' },
    { t: '5 Mukhi or 7 Mukhi: choosing between peace and prosperity', c: 'Rudraksha guide', m: 7, pid: 'r7' },
    { t: 'Using Bitter Havan at home: the correct method', c: 'Remedies', m: 4, pid: 'havan' },
    { t: 'Why a Kundali reading needs your exact birth time', c: 'Astrology', m: 6, pid: 'r4' }
  ];
  M.TRENDING = ['5 Mukhi Rudraksha', 'Pyrite bracelet', 'Baglamukhi kavach', 'Copper 12 Nag', 'Rose quartz', 'Bitter havan'];
  M.search = (q) => {
    const toks = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (!toks.length) return { products: [], services: [], articles: [] };
    const hit = (s) => toks.every((t) => s.toLowerCase().includes(t) || (t === 'kavach' && s.toLowerCase().includes('amulet')) || (t.startsWith('mukhi') && s.toLowerCase().includes('mukhi')));
    return {
      products: M.P.filter((p) => hit([p.name, p.hi, p.intent, p.catName, p.stoneName || '', p.mukhi ? p.mukhi + ' mukhi' : ''].join(' '))).sort((a, b) => b.pop - a.pop),
      services: M.SERVICES.filter((s) => hit(s.name + ' ' + s.hi + ' ' + s.line)),
      articles: M.ARTICLES.filter((a) => hit(a.t + ' ' + a.c))
    };
  };
  /* auto-wire ambient + reveal for any DC that renders [data-amb] / [data-reveal] */
  const auto = () => { let t; const run = () => { clearTimeout(t); t = setTimeout(() => { M.fx.scan(); M.fx.reveal(); }, 80); }; new MutationObserver(run).observe(document.body, { childList: true, subtree: true }); run(); };
  if (document.body) auto(); else document.addEventListener('DOMContentLoaded', auto);
  M.whenReady = (fn) => { if (M.ready) fn(); else setTimeout(() => M.whenReady(fn), 30); };
  M.ready = true;
})();
