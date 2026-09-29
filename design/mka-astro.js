/* Maa Kali Astuti — astro layer: rashi & graha data, custom rashi glyphs, kundali maths + North-Indian chart,
   chakra, rashi wheel, yantras, thali, portrait, report pages, consultation/course/ritual content, FAQ, slots.
   Plain script, waits for mka-core. Exposes MKA.A and sets MKA.astroReady. */
(function boot() {
  const M = window.MKA;
  if (!M || !M.ready) { setTimeout(boot, 20); return; }
  if (M.A) return;
  const A = (M.A = {});
  const D2R = Math.PI / 180, norm = (x) => ((x % 360) + 360) % 360, f1 = (n) => (+n).toFixed(1);
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  A.MON = MON; A.MONL = MONL;

  /* ---------------- rashi glyphs (24 grid, 1.5 stroke — same family as MKA icons) ---------------- */
  const GL = {
    mesha: '<path d="M12 20.5V10M12 10c0-3.6-2-5.8-4.6-5.8-2.3 0-3.9 1.7-3.9 3.8 0 1.9 1.3 3.2 3 3.2M12 10c0-3.6 2-5.8 4.6-5.8 2.3 0 3.9 1.7 3.9 3.8 0 1.9-1.3 3.2-3 3.2"/>',
    vrishabha: '<circle cx="12" cy="14.6" r="5.2"/><path d="M4 4.2c1.3 3.2 4.3 5.2 8 5.2s6.7-2 8-5.2"/>',
    mithuna: '<path d="M5 4.5c4.6 1.4 9.4 1.4 14 0M5 19.5c4.6-1.4 9.4-1.4 14 0M9 5.7v12.6M15 5.7v12.6"/>',
    karka: '<circle cx="7.2" cy="9.6" r="2.5"/><circle cx="16.8" cy="14.4" r="2.5"/><path d="M7.2 7.1c3-2.2 9-2.4 12.6 1.2M16.8 16.9c-3 2.2-9 2.4-12.6-1.2"/>',
    simha: '<circle cx="7.2" cy="15.2" r="2.9"/><path d="M9.8 14c-.9-1.8-1.6-3.6-1.6-5.4C8.2 6 10.1 4 12.6 4 15 4 17 5.9 17 8.4c0 3.1-2.8 5.2-2.8 8.6 0 1.8 1.1 3 2.6 3 1.2 0 2.1-.7 2.6-1.8"/>',
    kanya: '<path d="M3.8 7c1.1-1.3 3-1.3 3 .8V18M6.8 7.8c0-2 3.8-2 3.8 0V18M10.6 7.8c0-2 3.8-2 3.8 0v6.4c0 2.8 1 4.5 2.8 5.3M14.4 13.2c1.4-1.9 4.9-2 5 .6.1 2.3-2.4 4.2-4.5 5.2"/>',
    tula: '<path d="M4 19.5h16M4 15.6h5.1a3.9 3.9 0 1 1 5.8 0H20"/>',
    vrishchika: '<path d="M3.8 7c1.1-1.3 3-1.3 3 .8V18M6.8 7.8c0-2 3.8-2 3.8 0V18M10.6 7.8c0-2 3.8-2 3.8 0v8.4c0 1.3.8 2 2 2h3.3M18.4 15.8l2.4 2.4-2.4 2.4"/>',
    dhanu: '<path d="M4.8 19.2L19.2 4.8M12.2 4.8h7v7M7.6 11.2l5.2 5.2"/>',
    makara: '<path d="M3.8 6.4c1.6 0 2.5 1 2.5 3v8.4M6.3 9.4c0-2.3 1.4-3.4 3-3.4s3 1.1 3 3.4v5.4c0 2.6 1.3 4.2 3.5 4.2 1.9 0 3.3-1.3 3.3-3.1 0-1.7-1.3-3-3-3-1.7 0-2.9 1.1-3.8 2.7"/>',
    kumbha: '<path d="M4 10.2l2.7-2.6 2.6 2.6L12 7.6l2.7 2.6 2.6-2.6 2.7 2.6M4 16.4l2.7-2.6 2.6 2.6 2.7-2.6 2.7 2.6 2.6-2.6 2.7 2.6"/>',
    meena: '<path d="M6.2 4.2c2.7 2 4.1 4.7 4.1 7.8s-1.4 5.8-4.1 7.8M17.8 4.2c-2.7 2-4.1 4.7-4.1 7.8s1.4 5.8 4.1 7.8M5.2 12h13.6"/>'
  };
  A.GL = GL;
  A.glyph = (k, col, sw) => `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="${col || 'currentColor'}" stroke-width="${sw || 1.5}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${GL[k] || ''}</svg>`;

  /* ---------------- rashi + lord data ---------------- */
  const LORD = {
    Mars: { day: 'Tuesday', dayHi: 'मंगलवार', num: 9, colour: 'Sindoor red', hex: '#A8322D', remedy: 'Offer red flowers at a Hanuman temple on Tuesday and recite the Hanuman Chalisa once, slowly.', rud: ['r3', 'r11'], amulet: 'a-hanuman' },
    Venus: { day: 'Friday', dayHi: 'शुक्रवार', num: 6, colour: 'Ivory white', hex: '#F4EDDD', remedy: 'On Friday, offer white sweets to Maa Lakshmi and recite “Om Shukraya Namah” 108 times.', rud: ['r6', 'r13'], amulet: 'a-durga' },
    Mercury: { day: 'Wednesday', dayHi: 'बुधवार', num: 5, colour: 'Tulsi green', hex: '#1C6B54', remedy: 'Feed green moong to a cow on Wednesday and recite “Om Budhaya Namah” 108 times.', rud: ['r4', 'r10'], amulet: 'a-vidya' },
    Moon: { day: 'Monday', dayHi: 'सोमवार', num: 2, colour: 'Pearl white', hex: '#E7E9EB', remedy: 'Offer water mixed with a little raw milk to a Shivling on Monday morning.', rud: ['r2', 'r5'], amulet: 'a-durga' },
    Sun: { day: 'Sunday', dayHi: 'रविवार', num: 1, colour: 'Saffron', hex: '#C9772E', remedy: 'Offer water to the rising Sun from a copper lota and recite the Gayatri mantra 11 times.', rud: ['r12', 'r5'], amulet: 'a-bagla' },
    Jupiter: { day: 'Thursday', dayHi: 'गुरुवार', num: 3, colour: 'Turmeric yellow', hex: '#E0A63A', remedy: 'Apply a turmeric tilak on Thursday, offer chana dal at a temple and recite “Om Gurave Namah” 108 times.', rud: ['r5', 'm5'], amulet: 'a-bagla' },
    Saturn: { day: 'Saturday', dayHi: 'शनिवार', num: 8, colour: 'Charcoal', hex: '#3A3835', remedy: 'Light a sesame-oil diya under a peepal tree on Saturday evening and sit quietly for a few minutes.', rud: ['r7', 'r14'], amulet: 'a-bhairav' }
  };
  const RS = [
    ['mesha', 'Mesha', 'Aries', 'मेष', 'Mangal', 'Mars', 'मंगल', 'Fire', 'अग्नि', [4, 14], 'b-jasper'],
    ['vrishabha', 'Vrishabha', 'Taurus', 'वृषभ', 'Shukra', 'Venus', 'शुक्र', 'Earth', 'पृथ्वी', [5, 15], 'b-jade'],
    ['mithuna', 'Mithuna', 'Gemini', 'मिथुन', 'Budh', 'Mercury', 'बुध', 'Air', 'वायु', [6, 15], 'b-citrine'],
    ['karka', 'Karka', 'Cancer', 'कर्क', 'Chandra', 'Moon', 'चंद्र', 'Water', 'जल', [7, 16], 'b-moon'],
    ['simha', 'Simha', 'Leo', 'सिंह', 'Surya', 'Sun', 'सूर्य', 'Fire', 'अग्नि', [8, 17], 'b-tiger'],
    ['kanya', 'Kanya', 'Virgo', 'कन्या', 'Budh', 'Mercury', 'बुध', 'Earth', 'पृथ्वी', [9, 17], 'b-quartz'],
    ['tula', 'Tula', 'Libra', 'तुला', 'Shukra', 'Venus', 'शुक्र', 'Air', 'वायु', [10, 17], 'b-rose'],
    ['vrishchika', 'Vrishchika', 'Scorpio', 'वृश्चिक', 'Mangal', 'Mars', 'मंगल', 'Water', 'जल', [11, 16], 'b-garnet'],
    ['dhanu', 'Dhanu', 'Sagittarius', 'धनु', 'Guru', 'Jupiter', 'गुरु', 'Fire', 'अग्नि', [12, 16], 'b-lapis'],
    ['makara', 'Makara', 'Capricorn', 'मकर', 'Shani', 'Saturn', 'शनि', 'Earth', 'पृथ्वी', [1, 14], 'b-pyrite'],
    ['kumbha', 'Kumbha', 'Aquarius', 'कुंभ', 'Shani', 'Saturn', 'शनि', 'Air', 'वायु', [2, 13], 'b-tourmaline'],
    ['meena', 'Meena', 'Pisces', 'मीन', 'Guru', 'Jupiter', 'गुरु', 'Water', 'जल', [3, 14], 'b-amethyst']
  ];
  A.RASHI = RS.map(([key, en, west, hi, lordHi, lord, lordDev, el, elHi, start, stone], i) => Object.assign({ i, key, en, west, hi, lordHi, lord, lordDev, el, elHi, start, stone }, LORD[lord]));
  A.RASHI.forEach((r, i) => {
    const n = A.RASHI[(i + 1) % 12].start, end = new Date(2026, n[0] - 1, n[1] - 1);
    r.dates = `${r.start[1]} ${MON[r.start[0] - 1]} – ${end.getDate()} ${MON[end.getMonth()]}`;
    r.href = 'Rashi-Detail.dc.html#r=' + r.key;
  });
  A.rashi = (k) => A.RASHI.find((r) => r.key === k) || A.RASHI[0];
  /* Surya rashi from date (sidereal sankranti dates) */
  A.sunRashi = (m, d) => { const v = m * 100 + d; let idx = 8, bv = -1; A.RASHI.forEach((r) => { const s = r.start[0] * 100 + r.start[1]; if (s <= v && s > bv) { bv = s; idx = r.i; } }); return A.RASHI[idx]; };
  A.compatible = (r) => { const same = A.RASHI.filter((x) => x.el === r.el && x.key !== r.key), ce = { Fire: 'Air', Air: 'Fire', Earth: 'Water', Water: 'Earth' }[r.el], c = A.RASHI.filter((x) => x.el === ce); return same.concat([c[r.i % 3]]); };

  A.GRAHA = [
    { k: 'su', en: 'Sun', hi: 'Surya', ab: 'Su', dev: 'सू' }, { k: 'mo', en: 'Moon', hi: 'Chandra', ab: 'Mo', dev: 'चं' }, { k: 'ma', en: 'Mars', hi: 'Mangal', ab: 'Ma', dev: 'मं' },
    { k: 'me', en: 'Mercury', hi: 'Budh', ab: 'Me', dev: 'बु' }, { k: 'ju', en: 'Jupiter', hi: 'Guru', ab: 'Ju', dev: 'गु' }, { k: 've', en: 'Venus', hi: 'Shukra', ab: 'Ve', dev: 'शु' },
    { k: 'sa', en: 'Saturn', hi: 'Shani', ab: 'Sa', dev: 'श' }, { k: 'ra', en: 'Rahu', hi: 'Rahu', ab: 'Ra', dev: 'रा' }, { k: 'ke', en: 'Ketu', hi: 'Ketu', ab: 'Ke', dev: 'के' }
  ];
  A.NAK = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
  A.CITIES = [['Varanasi', 'Uttar Pradesh', 25.32, 82.97], ['Lucknow', 'Uttar Pradesh', 26.85, 80.95], ['New Delhi', 'Delhi', 28.61, 77.21], ['Mumbai', 'Maharashtra', 19.08, 72.88], ['Kolkata', 'West Bengal', 22.57, 88.36], ['Chennai', 'Tamil Nadu', 13.08, 80.27], ['Bengaluru', 'Karnataka', 12.97, 77.59], ['Hyderabad', 'Telangana', 17.39, 78.49], ['Patna', 'Bihar', 25.59, 85.14], ['Jaipur', 'Rajasthan', 26.91, 75.79], ['Prayagraj', 'Uttar Pradesh', 25.44, 81.85], ['Kanpur', 'Uttar Pradesh', 26.45, 80.33], ['Pune', 'Maharashtra', 18.52, 73.86], ['Ahmedabad', 'Gujarat', 23.02, 72.57], ['Indore', 'Madhya Pradesh', 22.72, 75.86], ['Bhopal', 'Madhya Pradesh', 23.26, 77.41], ['Dehradun', 'Uttarakhand', 30.32, 78.03], ['Haridwar', 'Uttarakhand', 29.95, 78.16], ['Chandigarh', 'Chandigarh', 30.73, 76.78], ['Ranchi', 'Jharkhand', 23.34, 85.31], ['Gorakhpur', 'Uttar Pradesh', 26.76, 83.37], ['Agra', 'Uttar Pradesh', 27.18, 78.01], ['Nagpur', 'Maharashtra', 21.15, 79.09], ['Guwahati', 'Assam', 26.14, 91.74], ['Bhubaneswar', 'Odisha', 20.3, 85.82], ['Raipur', 'Chhattisgarh', 21.25, 81.63], ['Surat', 'Gujarat', 21.17, 72.83], ['Amritsar', 'Punjab', 31.63, 74.87], ['Ujjain', 'Madhya Pradesh', 23.18, 75.78], ['Gaya', 'Bihar', 24.79, 85.0], ['Ayodhya', 'Uttar Pradesh', 26.8, 82.2], ['Kathmandu', 'Nepal', 27.72, 85.32]];
  A.placeSearch = (q) => { q = String(q || '').trim().toLowerCase(); if (!q) return []; const a = A.CITIES.filter((c) => c[0].toLowerCase().startsWith(q)), b = A.CITIES.filter((c) => !c[0].toLowerCase().startsWith(q) && (c[0] + ' ' + c[1]).toLowerCase().includes(q)); return a.concat(b).slice(0, 6); };

  /* ---------------- kundali maths (approximate, prototype-grade; build uses Swiss Ephemeris) ---------------- */
  const jd = (y, m, d, h) => { if (m <= 2) { y -= 1; m += 12; } const a = Math.floor(y / 100), b = 2 - a + Math.floor(a / 4); return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5 + h / 24; };
  function longs(d) {
    const g = norm(357.529 + 0.98560028 * d), L = norm(280.459 + 0.98564736 * d);
    const su = norm(L + 1.915 * Math.sin(g * D2R) + 0.02 * Math.sin(2 * g * D2R));
    const L0 = norm(218.316 + 13.176396 * d), Mm = norm(134.963 + 13.064993 * d), Dm = norm(297.85 + 12.190749 * d), F = norm(93.272 + 13.22935 * d);
    const mo = norm(L0 + 6.289 * Math.sin(Mm * D2R) + 1.274 * Math.sin((2 * Dm - Mm) * D2R) + 0.658 * Math.sin(2 * Dm * D2R) + 0.214 * Math.sin(2 * Mm * D2R) - 0.186 * Math.sin(g * D2R) - 0.114 * Math.sin(2 * F * D2R));
    const E = [-Math.cos(su * D2R), -Math.sin(su * D2R)], o = { su, mo };
    const EL = { me: [252.251, 4.09233445, 0.387], ve: [181.98, 1.60213034, 0.723], ma: [355.433, 0.52402068, 1.524], ju: [34.351, 0.08308529, 5.203], sa: [50.077, 0.03344414, 9.537] };
    Object.keys(EL).forEach((k) => { const [l0, n, a] = EL[k], l = norm(l0 + n * d) * D2R; o[k] = norm(Math.atan2(a * Math.sin(l) - E[1], a * Math.cos(l) - E[0]) / D2R); });
    o.ra = norm(125.0445 - 0.0529538 * d); o.ke = norm(o.ra + 180);
    return o;
  }
  const dms = (x) => { const d = Math.floor(x), m = Math.floor((x - d) * 60); return `${d}°${String(m).padStart(2, '0')}′`; };
  A.kundali = (o) => {
    const [Y, Mo, Dd] = String(o.dob).split('-').map(Number);
    const [hh, mm] = (o.unknown || !o.tob ? '12:00' : o.tob).split(':').map(Number);
    const c = o.city || A.CITIES[0];
    const d = jd(Y, Mo, Dd, hh + mm / 60 - 5.5) - 2451545, T = d / 36525;
    const ay = 23.853 + 0.013969 * (Y + (Mo - 1) / 12 - 2000), sid = (x) => norm(x - ay);
    const L1 = longs(d), L2 = longs(d + 1);
    const lat = c[2] * D2R, lst = norm(280.46061837 + 360.98564736629 * d + c[3]) * D2R, eps = (23.4393 - 0.013 * T) * D2R;
    const asc = sid(norm(Math.atan2(Math.cos(lst), -(Math.sin(lst) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps))) / D2R));
    const lagna = Math.floor(asc / 30);
    const planets = A.GRAHA.map((g) => {
      const lon = sid(L1[g.k]); let dl = L2[g.k] - L1[g.k]; if (dl > 180) dl -= 360; if (dl < -180) dl += 360;
      const sign = Math.floor(lon / 30);
      return Object.assign({}, g, { lon, sign, degS: dms(lon % 30), house: ((sign - lagna + 12) % 12) + 1, retro: g.k === 'ra' || g.k === 'ke' || dl < 0, nak: A.NAK[Math.floor(lon / (360 / 27))] });
    });
    const moon = planets[1];
    return { lagna, lagnaDeg: dms(asc % 30), rashi: moon.sign, nak: A.NAK[Math.floor(moon.lon / (360 / 27))], pada: Math.floor((moon.lon % (360 / 27)) / (360 / 108)) + 1, planets, unknown: !!o.unknown, city: c };
  };
  A.DEMO_K = A.kundali({ dob: '1986-11-12', tob: '06:40', city: A.CITIES[0] });

  /* ---------------- North-Indian chart ---------------- */
  const HC = [[200, 100], [100, 40], [40, 100], [100, 200], [40, 300], [100, 360], [200, 300], [300, 360], [360, 300], [300, 200], [360, 100], [300, 40]];
  const SN = [[200, 180], [100, 86], [84, 100], [180, 200], [84, 300], [100, 316], [200, 222], [300, 316], [318, 300], [222, 200], [318, 100], [300, 86]];
  const HCOLS = [2, 2, 1, 2, 1, 2, 2, 2, 1, 2, 1, 2];
  A.chart = (K, o) => {
    o = o || {}; K = K || A.DEMO_K;
    const col = o.col || '#D9B96A', ink = o.ink || '#FBF7EE', sub = o.sub || '#9FB3AA', fs = o.fs || 15, hi = !!o.hi;
    const ln = (d) => `<path d="${d}" pathLength="1" data-cl=""/>`;
    let s = `<svg viewBox="-6 -6 412 412" width="100%" height="100%" role="img" aria-label="North Indian Lagna chart"><g fill="none" stroke="${col}" stroke-width="${o.sw || 1.3}" stroke-linejoin="round">${ln('M0 0H400V400H0Z')}${ln('M0 0L400 400')}${ln('M400 0L0 400')}${ln('M200 0L400 200L200 400L0 200Z')}</g>`;
    const pop = 'style="transform-box:fill-box;transform-origin:center"';
    for (let h = 0; h < 12; h++) {
      const sg = ((K.lagna + h) % 12) + 1, [sx, sy] = SN[h];
      s += `<text x="${sx}" y="${sy + 4}" text-anchor="middle" font-family="Manrope,sans-serif" font-size="11.5" font-weight="600" fill="${sub}" data-pl="" ${pop}>${sg}</text>`;
      const items = K.planets.filter((p) => p.house === h + 1).map((p) => ({ t: hi ? p.dev : p.ab, r: p.retro && p.k !== 'ra' && p.k !== 'ke', c: ink }));
      if (h === 0) items.unshift({ t: hi ? 'लग्न' : 'Asc', c: col, small: 1 });
      const cols = HCOLS[h], n = items.length, rows = Math.ceil(n / cols), [cx, cy] = HC[h];
      items.forEach((it, j) => {
        const row = Math.floor(j / cols), ci = j % cols, inRow = Math.min(cols, n - row * cols);
        const x = cx + (ci - (inRow - 1) / 2) * 34, y = cy + (row - (rows - 1) / 2) * 19 + 5;
        s += `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle" font-family="${hi ? "'Tiro Devanagari Hindi',serif" : 'Manrope,sans-serif'}" font-size="${it.small ? fs - 3 : fs}" font-weight="${hi ? 400 : 700}" letter-spacing="${it.small && !hi ? 1 : 0}" fill="${it.c}" data-pl="" ${pop}>${it.t}${it.r ? `<tspan font-size="${fs - 6}" dx="1" dy="-5">R</tspan>` : ''}</text>`;
      });
    }
    return s + '</svg>';
  };
  A.prime = (root) => {
    if (!root || M.isReduced()) return;
    root.querySelectorAll('[data-cl],[data-d]').forEach((e) => { e.style.strokeDasharray = '1'; e.style.strokeDashoffset = '1'; });
    root.querySelectorAll('[data-pl]').forEach((e) => (e.style.opacity = '0'));
  };
  A.drawChart = (root, o) => {
    if (!root) return; o = o || {};
    const ls = [...root.querySelectorAll('[data-cl]')], ps = [...root.querySelectorAll('[data-pl]')], dur = o.dur || 1200, dl = o.delay || 0;
    if (M.isReduced()) { ls.forEach((e) => { e.style.strokeDasharray = ''; e.style.strokeDashoffset = ''; }); ps.forEach((e) => (e.style.opacity = '')); return; }
    const per = dur / ls.length;
    ls.forEach((e, i) => { e.getAnimations().forEach((a) => a.cancel()); e.style.strokeDasharray = '1'; e.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: per * 1.3, delay: dl + i * per, easing: M.EASE, fill: 'both' }); });
    ps.forEach((e, i) => { e.getAnimations().forEach((a) => a.cancel()); e.animate([{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1.12)', offset: .7 }, { opacity: 1, transform: 'scale(1)' }], { duration: 420, delay: dl + dur + 60 + i * 45, easing: 'ease-out', fill: 'both' }); });
  };
  A.onView = (el, fn, th) => {
    if (!el || el.__ov) return; el.__ov = 1;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.disconnect(); fn(el); } }), { threshold: th == null ? .3 : th });
    io.observe(el);
  };

  /* ---------------- chakra (S7): three rings, layered for independent rotation ---------------- */
  const pt = (r, a) => { const t = (a - 90) * D2R; return f1(r * Math.cos(t)) + ' ' + f1(r * Math.sin(t)); };
  const spokes = (r1, r2, n, off) => { let d = ''; for (let i = 0; i < n; i++) { const a = off + (i * 360) / n; d += `M${pt(r1, a)}L${pt(r2, a)}`; } return d; };
  const dots = (r, n, w, off) => `<circle r="${r}" fill="none" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="0 ${((2 * Math.PI * r) / n).toFixed(3)}" transform="rotate(${f1(-90 + (off || 0))})"/>`;
  A.spokes = spokes; A.dots = dots;
  A.chakra = (col) => {
    col = col || '#D9B96A';
    const W = (inner) => `<svg viewBox="-200 -200 400 400" width="100%" height="100%" aria-hidden="true"><g fill="none" stroke="${col}" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;
    let o = `<circle r="193" stroke-width="1.2"/><circle r="185" stroke-width=".6" opacity=".6"/><circle r="146" stroke-width="1"/><path d="${spokes(146, 185, 12, 15)}" stroke-width=".8" opacity=".7"/>${dots(189, 72, 1.8)}`;
    for (let i = 0; i < 12; i++) o += `<g transform="rotate(${i * 30}) translate(0 -165.5) scale(.95) translate(-12 -12)" stroke-width="1.5">${GL[A.RASHI[i].key]}</g>`;
    let lt = '', st = '';
    for (let i = 0; i < 27; i++) { const a = (i / 27) * 360; if (i % 3) st += `M${pt(108, a)}L${pt(126, a)}`; else lt += `M${pt(108, a)}L${pt(136, a)}`; }
    const m = `<circle r="140" stroke-width="1"/><circle r="104" stroke-width="1"/><path d="${lt}${st}" stroke-width=".9"/>${dots(122, 27, 3.4, 360 / 54)}`;
    let pd = '';
    for (let i = 0; i < 8; i++) { const a = i * 45; pd += `M${pt(24, a)}C${pt(33, a + 20)} ${pt(47, a + 12)} ${pt(58, a)}C${pt(47, a - 12)} ${pt(33, a - 20)} ${pt(24, a)}Z`; }
    const n = `<circle r="96" stroke-width="1.1"/><circle r="88" stroke-width=".6" opacity=".7"/><circle r="22" stroke-width="1.1"/><circle r="12" stroke-width=".8"/><path d="${spokes(62, 86, 24, 0)}" stroke-width=".8"/><path d="${pd}" stroke-width="1"/><circle r="3.4" fill="${col}" stroke="none"/>`;
    return { outer: W(o), middle: W(m), inner: W(n) };
  };

  /* ---------------- rashi wheel (S8) ---------------- */
  const sector = (r1, r2, a1, a2) => `M${pt(r2, a1)}A${r2} ${r2} 0 0 1 ${pt(r2, a2)}L${pt(r1, a2)}A${r1} ${r1} 0 0 0 ${pt(r1, a1)}Z`;
  A.sector = sector;
  A.wheel = () => {
    const col = '#D9B96A', S = (inner) => `<svg viewBox="-310 -310 620 620" width="100%" height="100%" aria-hidden="true">${inner}</svg>`;
    let r = `<g fill="none" stroke="${col}" stroke-linecap="round"><circle r="292" stroke-width="1.2"/><circle r="285" stroke-width=".6" opacity=".5"/><circle r="206" stroke-width="1"/><path d="${spokes(206, 285, 12, 15)}" stroke-width=".8" opacity=".6"/>`;
    r += '</g>';
    A.RASHI.forEach((R, i) => {
      r += `<g id="rashi-${R.key}" data-seg="${i}" transform="rotate(${i * 30})"><path data-hl="" d="${sector(207, 284, -15, 15)}" fill="${col}" fill-opacity=".16" stroke="none" style="opacity:0;transition:opacity 450ms"/><g data-gl="" transform="translate(0 -254) scale(1.45) translate(-12 -12)" fill="none" stroke="${col}" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">${GL[R.key]}</g><text data-tx="" x="0" y="-219" text-anchor="middle" font-family="'Tiro Devanagari Hindi',serif" font-size="17" fill="#E4EEE8">${R.hi}</text></g>`;
    });
    let lt = '', st = '';
    for (let i = 0; i < 27; i++) { const a = (i * 360) / 27; if (i % 3 === 0) lt += `M${pt(156, a)}L${pt(194, a)}`; else st += `M${pt(156, a)}L${pt(178, a)}`; }
    const n = `<g fill="none" stroke="${col}" stroke-linecap="round"><circle r="198" stroke-width=".8" opacity=".55"/><circle r="152" stroke-width=".8" opacity=".55"/><path d="${lt}" stroke-width="1"/><path d="${st}" stroke-width=".6"/>${dots(166, 27, 3, 180 / 27)}<path d="${spokes(190, 196, 108, 0)}" stroke-width=".5" opacity=".6"/></g>`;
    let g = `<g fill="none" stroke="${col}"><circle r="144" stroke-width=".8" opacity=".45"/><circle r="94" stroke-width="1"/></g>`;
    A.GRAHA.forEach((p, i) => (g += `<g transform="rotate(${i * 40}) translate(0 -119)"><circle r="15.5" fill="#10302A" stroke="rgba(217,185,106,.45)" stroke-width=".8"/><text y="5.5" text-anchor="middle" font-family="'Tiro Devanagari Hindi',serif" font-size="15" fill="${col}">${p.dev}</text></g>`));
    let c = `<circle r="86" fill="#0A1F1A" stroke="${col}" stroke-width="1.2"/><circle r="78" fill="none" stroke="${col}" stroke-width=".6" opacity=".6"/><circle r="46" fill="none" stroke="${col}" stroke-width=".8" opacity=".7"/><g fill="none" stroke="${col}" stroke-linecap="round"><path d="${spokes(50, 72, 12, 0)}" stroke-width="1"/><path d="${spokes(50, 62, 12, 15)}" stroke-width=".6"/></g>`;
    c += `<text y="17" text-anchor="middle" font-family="'Tiro Devanagari Hindi',serif" font-size="50" fill="${col}">ॐ</text>`;
    const p = `<path d="M0 -279L-10 -304Q0 -299 10 -304Z" fill="${col}"/><circle cy="-306" r="3" fill="${col}"/>`;
    return { rashi: S(r), nak: S(n), graha: S(g), center: S(c), pointer: S(p) };
  };
  A.wheelActive = (root, i) => {
    if (!root) return;
    root.querySelectorAll('[data-seg]').forEach((g) => {
      const on = +g.getAttribute('data-seg') === i, hl = g.querySelector('[data-hl]'), gl = g.querySelector('[data-gl]'), tx = g.querySelector('[data-tx]');
      if (hl) hl.style.opacity = on ? '1' : '0';
      if (gl) gl.setAttribute('stroke', on ? '#F6E7BC' : '#D9B96A');
      if (tx) tx.setAttribute('fill', on ? '#F6E7BC' : '#E4EEE8');
    });
  };

  /* ---------------- yantras (S11) ---------------- */
  const yb = (s, g, dd) => { const c = 100, P = [[c - s, c - s], [c - g, c - s], [c - g, c - s - dd], [c + g, c - s - dd], [c + g, c - s], [c + s, c - s], [c + s, c - g], [c + s + dd, c - g], [c + s + dd, c + g], [c + s, c + g], [c + s, c + s], [c + g, c + s], [c + g, c + s + dd], [c - g, c + s + dd], [c - g, c + s], [c - s, c + s], [c - s, c + g], [c - s - dd, c + g], [c - s - dd, c - g], [c - s, c - g]]; return `<path d="M${P.map((p) => p.join(' ')).join('L')}Z" pathLength="1" data-d=""/>`; };
  const yc = (r) => `<circle cx="100" cy="100" r="${r}" pathLength="1" data-d=""/>`;
  const ytri = (r, up) => { const pts = [0, 1, 2].map((i) => { const a = ((up ? -90 : 90) + i * 120) * D2R; return f1(100 + r * Math.cos(a)) + ',' + f1(100 + r * Math.sin(a)); }); return `<polygon points="${pts.join(' ')}" pathLength="1" data-d=""/>`; };
  const ypet = (r1, r2, n, w, rot) => { let d = ''; const P = (r, t) => f1(100 + r * Math.cos(t)) + ' ' + f1(100 + r * Math.sin(t)); for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 - Math.PI / 2 + (rot || 0), aw = (w * Math.PI) / n, rm = r1 + (r2 - r1) * .62; d += `M${P(r1, a - aw)}Q${P(rm, a - aw * 1.05)} ${P(r2, a)}Q${P(rm, a + aw * 1.05)} ${P(r1, a + aw)}`; } return `<path d="${d}" pathLength="1" data-d=""/>`; };
  const ysq = (r, rot) => { const pts = [0, 1, 2, 3].map((i) => { const a = (rot + 45 + i * 90) * D2R; return f1(100 + r * Math.cos(a)) + ',' + f1(100 + r * Math.sin(a)); }); return `<polygon points="${pts.join(' ')}" pathLength="1" data-d=""/>`; };
  const BHU = yb(90, 16, 8) + yb(84, 11, 8);
  const YAN = {
    baglamukhi: () => ytri(22) + ytri(40, 1) + ytri(40) + yc(46) + ypet(47, 64, 8, .92) + yc(66) + ypet(67, 79, 16, .92) + yc(81) + BHU,
    hanuman: () => ytri(30, 1) + ytri(30) + yc(36) + ypet(37, 58, 8, .9) + yc(60) + yc(63) + ypet(64, 77, 8, .8, Math.PI / 8) + yc(80) + BHU,
    kali: () => [14, 24, 34, 44, 54].map((r) => ytri(r)).join('') + yc(58) + ypet(59, 77, 8, .95) + yc(79) + BHU,
    durga: () => ytri(20) + yc(25) + ytri(44, 1) + ytri(44) + yc(50) + ypet(51, 72, 8, .85) + yc(74) + yc(79) + BHU,
    shiva: () => ytri(26, 1) + yc(32) + ypet(33, 52, 8, .9) + yc(54) + ypet(55, 72, 16, .9) + yc(74) + yc(79) + BHU,
    bhairav: () => ytri(14) + ytri(26, 1) + ytri(26) + yc(32) + ypet(33, 56, 8, .7) + yc(58) + ysq(75, 0) + ysq(75, 45) + yc(80) + BHU
  };
  A.yantra = (k, col, u, sw) => `<svg viewBox="-3 -3 206 206" width="100%" height="100%" aria-hidden="true"><defs><radialGradient id="yg${u}"><stop offset="0" stop-color="${col}" stop-opacity=".5"/><stop offset=".6" stop-color="${col}" stop-opacity=".12"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs><circle cx="100" cy="100" r="100" fill="url(#yg${u})" data-yg="" style="opacity:0"/><g fill="none" stroke="${col}" stroke-width="${sw || 1}" stroke-linejoin="round" stroke-linecap="round">${(YAN[k] || YAN.kali)()}</g><circle cx="100" cy="100" r="2.8" fill="${col}"/></svg>`;
  A.drawYantra = (root, dur) => {
    if (!root) return; dur = dur || 1600;
    const els = [...root.querySelectorAll('[data-d]')], glow = root.querySelector('[data-yg]');
    if (M.isReduced()) { els.forEach((e) => { e.style.strokeDasharray = ''; e.style.strokeDashoffset = ''; }); if (glow) glow.style.opacity = '.4'; return; }
    const step = (dur * .5) / Math.max(1, els.length - 1);
    els.forEach((e, i) => { e.getAnimations().forEach((a) => a.cancel()); e.style.strokeDasharray = '1'; e.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: dur * .5, delay: i * step, easing: M.EASE, fill: 'both' }); });
    if (glow) { glow.getAnimations().forEach((a) => a.cancel()); glow.animate([{ opacity: 0 }, { opacity: .9, offset: .45 }, { opacity: .45 }], { duration: 1100, delay: dur * .9, easing: 'ease-out', fill: 'both' }); }
  };

  /* ---------------- thali, portrait, service art ---------------- */
  A.thali = (u) => {
    const R = M.rng('rice' + u); let rice = '';
    for (let i = 0; i < 46; i++) { const a = R() * Math.PI * 2, d = Math.sqrt(R()); rice += `<ellipse cx="${f1(338 + Math.cos(a) * d * 34)}" cy="${f1(318 + Math.sin(a) * d * 13)}" rx="2.6" ry="1.2" fill="#FFF6E2" transform="rotate(${Math.floor(R() * 180)} ${f1(338 + Math.cos(a) * d * 34)} ${f1(318 + Math.sin(a) * d * 13)})"/>`; }
    const flower = (x, y, s) => { let o = ''; for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; o += `<ellipse cx="${f1(x + Math.cos(a) * 11 * s)}" cy="${f1(y + Math.sin(a) * 6 * s)}" rx="${f1(7 * s)}" ry="${f1(4.6 * s)}" fill="#E0A63A" transform="rotate(${f1((a * 180) / Math.PI)} ${f1(x + Math.cos(a) * 11 * s)} ${f1(y + Math.sin(a) * 6 * s)})"/>`; } for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2 + .3; o += `<ellipse cx="${f1(x + Math.cos(a) * 5 * s)}" cy="${f1(y - 2 * s + Math.sin(a) * 3 * s)}" rx="${f1(5 * s)}" ry="${f1(3.4 * s)}" fill="#C9772E"/>`; } return o + `<ellipse cx="${x}" cy="${f1(y - 3 * s)}" rx="${f1(4 * s)}" ry="${f1(2.6 * s)}" fill="#9A4A1C"/>`; };
    const leaf = (x, y, a, l) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0C${l * .3} ${-l * .32} ${l * .72} ${-l * .3} ${l} 0C${l * .72} ${l * .3} ${l * .3} ${l * .32} 0 0Z" fill="#1C6B54"/><path d="M1 0H${f1(l * .85)}" stroke="#9CC9AE" stroke-width=".6"/></g>`;
    const diya = M.diya(u + 'd', true).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    return `<svg viewBox="0 0 520 400" width="100%" height="100%" role="img" aria-label="Brass puja thali with a lit diya, kumkum, haldi, akshat and marigold"><defs><radialGradient id="tg${u}"><stop offset="0" stop-color="#F2C66D" stop-opacity=".5"/><stop offset=".45" stop-color="#F2C66D" stop-opacity=".16"/><stop offset="1" stop-color="#F2C66D" stop-opacity="0"/></radialGradient><linearGradient id="tb${u}" x1="0" x2="1"><stop offset="0" stop-color="#6E521C"/><stop offset=".28" stop-color="#C9A24E"/><stop offset=".5" stop-color="#F1D894"/><stop offset=".72" stop-color="#B8923A"/><stop offset="1" stop-color="#6E521C"/></linearGradient><radialGradient id="tw${u}" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#EBD08E"/><stop offset=".7" stop-color="#C39A45"/><stop offset="1" stop-color="#9A7630"/></radialGradient><radialGradient id="tk${u}" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#CF5145"/><stop offset="1" stop-color="#7C1F1A"/></radialGradient><radialGradient id="th${u}" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#F6CB5C"/><stop offset="1" stop-color="#B07A1A"/></radialGradient><radialGradient id="ts${u}"><stop offset="0" stop-color="#0E3B30" stop-opacity=".3"/><stop offset="1" stop-color="#0E3B30" stop-opacity="0"/></radialGradient></defs>
<circle cx="260" cy="196" r="200" fill="url(#tg${u})" data-amb="glow:4"/>
<ellipse cx="262" cy="356" rx="236" ry="24" fill="url(#ts${u})"/>
<ellipse cx="260" cy="302" rx="232" ry="74" fill="url(#tb${u})"/><ellipse cx="260" cy="302" rx="232" ry="74" fill="none" stroke="#F7E7BC" stroke-width="1.2" opacity=".8"/>
<ellipse cx="260" cy="299" rx="213" ry="65" fill="none" stroke="#7A5C1C" stroke-width="1.4" stroke-dasharray="1.5 6" stroke-linecap="round"/>
<ellipse cx="260" cy="298" rx="194" ry="58" fill="url(#tw${u})"/><ellipse cx="260" cy="298" rx="150" ry="44" fill="none" stroke="#8A6A26" stroke-width=".7" opacity=".6"/><ellipse cx="260" cy="298" rx="104" ry="30" fill="none" stroke="#8A6A26" stroke-width=".6" opacity=".45"/>
<path d="M114 300L146 150" stroke="#5A2A12" stroke-width="2" stroke-linecap="round"/><circle cx="146" cy="150" r="2.4" fill="#F2B64A"/><rect x="104" y="292" width="22" height="12" rx="3" fill="url(#tb${u})"/>
<path data-amb="smoke:8:0" d="M146 146c-6-12 6-20 0-32s6-20 0-32" fill="none" stroke="#FBF7EE" stroke-width="1.6" stroke-linecap="round" opacity=".5"/><path data-amb="smoke:9:3" d="M147 144c7-11-5-19 1-31s-5-19 1-30" fill="none" stroke="#FBF7EE" stroke-width="1.2" stroke-linecap="round" opacity=".4"/>
<g><path d="M392 262c0-24 9-37 24-39 15 2 24 15 24 39z" fill="url(#tb${u})"/><ellipse cx="416" cy="262" rx="26" ry="6" fill="#8A6A26"/><rect x="411" y="210" width="10" height="14" rx="3" fill="#B8923A"/><circle cx="416" cy="206" r="6" fill="none" stroke="#B8923A" stroke-width="2.4"/><circle cx="416" cy="268" r="4" fill="#7A5C1C"/></g>
${leaf(150, 318, -160, 26)}${leaf(146, 322, -118, 24)}${leaf(156, 326, -200, 22)}${leaf(170, 328, -140, 20)}
<path d="M168 322c7-20 24-31 39-31s32 11 39 31c-26 8-52 8-78 0z" fill="url(#tk${u})"/><path d="M184 306c8-7 18-10 26-9" fill="none" stroke="#F2A89E" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>
<path d="M236 340c6-15 19-23 31-23s25 8 31 23c-21 6-41 6-62 0z" fill="url(#th${u})"/><path d="M249 328c6-5 13-7 19-6" fill="none" stroke="#FFF0C0" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>
${rice}${flower(398, 300, 1)}${flower(436, 318, .8)}<ellipse cx="372" cy="334" rx="6" ry="3.6" fill="#E0A63A" transform="rotate(-20 372 334)"/><ellipse cx="452" cy="296" rx="5" ry="3.2" fill="#C9772E" transform="rotate(30 452 296)"/>
<g transform="translate(197 172) scale(1.05)">${diya}</g></svg>`;
  };
  A.portrait = (u, part) => {
    const head = `<svg viewBox="0 0 300 380" width="100%" height="100%" ${part === 'bg' ? 'aria-hidden="true"' : 'role="img" aria-label="Portrait placeholder for Sadhak Pawan Pandey"'}><defs><clipPath id="pa${u}${part || ''}"><path d="M0 380V150A150 150 0 0 1 300 150V380Z"/></clipPath><radialGradient id="pg${u}" cx=".5" cy=".38" r=".6"><stop offset="0" stop-color="#1C4A3D"/><stop offset="1" stop-color="#0A1F1A"/></radialGradient></defs><g clip-path="url(#pa${u}${part || ''})">`;
    const bg = `<rect width="300" height="380" fill="url(#pg${u})"/>${M.stars(26, 300, 220, 'pt' + u)}`;
    const halo = `<circle cx="150" cy="146" r="82" fill="none" stroke="#D9B96A" stroke-width="1" opacity=".75"/><circle cx="150" cy="146" r="94" fill="none" stroke="#D9B96A" stroke-width=".5" opacity=".4"/>`;
    const fg = `<path d="M40 380C44 302 78 254 124 236c8 9 16 13 26 13s18-4 26-13c46 18 80 66 84 144z" fill="#123B31"/><path d="M84 262c42 30 98 66 152 118h-42C150 338 110 302 70 278z" fill="#184739"/><path d="M84 262c42 30 98 66 152 118" fill="none" stroke="#C9772E" stroke-width="2" opacity=".75"/><path d="M137 196h26v30c-4 6-8 9-13 9s-9-3-13-9z" fill="#10352C"/><ellipse cx="150" cy="150" rx="35" ry="43" fill="#153F34"/><path d="M117 158c2 30 14 52 33 57 19-5 31-27 33-57-8 13-20 21-33 21s-25-8-33-21z" fill="#1A4A3D"/><path d="M150 118v11" stroke="#D9B96A" stroke-width="2.2" stroke-linecap="round"/><circle cx="150" cy="133" r="1.7" fill="#A8322D"/>${[...Array(13)].map((_, i) => { const t = (i / 12) * Math.PI; return `<circle cx="${f1(150 - Math.cos(t) * 30)}" cy="${f1(236 + Math.sin(t) * 44)}" r="3.4" fill="#7C4B2B"/>`; }).join('')}<path d="M117 110c6-22 60-22 66 0" fill="none" stroke="#1F5A48" stroke-width="1.2" opacity=".8"/>`;
    const line = '<path d="M1 379V150A149 149 0 0 1 299 150V379" fill="none" stroke="#B8923A" stroke-width="1.2"/>';
    if (part === 'bg') return head + bg + '</g></svg>';
    if (part === 'fg') return head + fg + '</g>' + line + '</svg>';
    return head + bg + halo + fg + '</g>' + line + '</svg>';
  };

  A.palmArt = (col, ink, lab) => {
    col = col || '#D9B96A'; ink = ink || '#E4EEE8';
    const T = 'translate(-18 -6) scale(12)', ns = 'vector-effect="non-scaling-stroke"';
    const lines = [['M16.9 12.2c-1.6-.5-3.4-.4-5 .1-1.2.4-2.1.9-2.9 1.5', 'Heart line', 16.9, 12.2], ['M16.2 14.3c-2.2-.2-4.3 0-6.4.9', 'Head line', 16.2, 14.3], ['M9.9 13c-1.4 1.6-1.6 3.6-.6 5.5.4.8 1 1.4 1.7 1.9', 'Life line', 11, 20.4], ['M12.6 20.1c-.2-2.3-.1-4.6.4-6.9', 'Fate line', 12.6, 19]];
    let s = `<svg viewBox="0 0 300 280" width="100%" height="100%" role="img" aria-label="Palm with the four major lines marked"><g transform="${T}" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${'M7.2 12.5V6.3a1.25 1.25 0 0 1 2.5 0V11M9.7 10.5V4.8a1.25 1.25 0 0 1 2.5 0v5.7M12.2 10.5V5.6a1.25 1.25 0 0 1 2.5 0V11M14.7 11.2V8.4a1.25 1.25 0 0 1 2.5 0V14c0 3.8-2.4 6.5-5.8 6.5-2.7 0-4.2-1.3-5.5-3.3l-2.3-3.6a1.3 1.3 0 0 1 2-1.6l1.6 1.9'}" stroke="${ink}" stroke-width="1.4" ${ns} opacity=".85"/>`;
    lines.forEach((l) => (s += `<path d="${l[0]}" stroke="${col}" stroke-width="2" ${ns} pathLength="1" data-cl=""/>`));
    s += '</g>';
    if (lab !== false) lines.forEach((l, i) => { const x = l[2] * 12 - 18, y = l[3] * 12 - 6, ly = 70 + i * 44; s += `<path d="M${f1(x)} ${f1(y)}L232 ${ly}H242" fill="none" stroke="${col}" stroke-width=".7" opacity=".7" data-pl=""/><circle cx="${f1(x)}" cy="${f1(y)}" r="2.2" fill="${col}" data-pl=""/><text x="246" y="${ly + 4}" font-family="Manrope,sans-serif" font-size="11" font-weight="600" fill="${ink}" data-pl="">${l[1]}</text>`; });
    return s + '</svg>';
  };
  A.tarotArt = (u) => {
    const card = (x, y, a, hi) => `<g transform="translate(${x} ${y}) rotate(${a})"><rect x="-39" y="-64" width="78" height="128" rx="4" fill="${hi ? '#164E3F' : '#10302A'}" stroke="#D9B96A" stroke-width="${hi ? 1.3 : 1}"/><rect x="-32" y="-57" width="64" height="114" rx="2" fill="none" stroke="#D9B96A" stroke-width=".6" opacity=".7"/><circle r="17" fill="none" stroke="#D9B96A" stroke-width="1"/><circle r="8" fill="none" stroke="#D9B96A" stroke-width=".7"/>${[...Array(12)].map((_, i) => `<path d="M0 -21V-${i % 2 ? 26 : 30}" transform="rotate(${i * 30})" stroke="#D9B96A" stroke-width=".8" stroke-linecap="round"/>`).join('')}<path d="M0 36c3 3 3.6 6.6 0 11-3.6-4.4-3-8 0-11zM0 47c-3-3.6-6.4-4.8-10-4.4 1.2 3.4 4.4 5 10 4.4zM0 47c3-3.6 6.4-4.8 10-4.4-1.2 3.4-4.4 5-10 4.4z" fill="none" stroke="#D9B96A" stroke-width=".8"/><path d="M-6 -44a8 8 0 1 0 8-6 6.2 6.2 0 0 1-8 6z" fill="#D9B96A" opacity=".85"/></g>`;
    return `<svg viewBox="0 0 280 240" width="100%" height="100%" role="img" aria-label="Three-card tarot spread"><defs><radialGradient id="tr${u}"><stop offset="0" stop-color="#D9B96A" stop-opacity=".35"/><stop offset="1" stop-color="#D9B96A" stop-opacity="0"/></radialGradient></defs><circle cx="140" cy="112" r="92" fill="url(#tr${u})" data-amb="glow:5"/>${card(72, 128, -13)}${card(208, 128, 13)}${card(140, 110, 0, 1)}</svg>`;
  };
  A.loshuArt = () => {
    const G = [[4, 9, 2], [3, 5, 7], [8, 1, 6]], on = [9, 5, 1, 3];
    let s = '<svg viewBox="0 0 260 260" width="100%" height="100%" role="img" aria-label="Lo Shu grid with personal numbers circled"><g fill="none" stroke="#D9B96A" stroke-width="1.2"><rect x="34" y="34" width="192" height="192" rx="2"/><path d="M98 34V226M162 34V226M34 98H226M34 162H226" stroke-width=".9" opacity=".8"/></g>';
    G.forEach((row, r) => row.forEach((n, c) => { const x = 66 + c * 64, y = 66 + r * 64, o = on.includes(n); s += `${o ? `<circle cx="${x}" cy="${y}" r="21" fill="none" stroke="#D9B96A" stroke-width="1.3" data-pl="" style="transform-box:fill-box;transform-origin:center"/>` : ''}<text x="${x}" y="${y + 11}" text-anchor="middle" font-family="Fraunces,serif" font-size="30" fill="${o ? '#F6E7BC' : '#9FB3AA'}">${n}</text>`; }));
    return s + '<path d="M130 45V215" stroke="#D9B96A" stroke-width="1.4" stroke-dasharray="3 5" stroke-linecap="round" opacity=".8" pathLength="1" data-cl=""/></svg>';
  };
  A.svcArt = (k, u) => k === 'palm' ? A.palmArt() : k === 'tarot' ? A.tarotArt(u) : k === 'numerology' ? A.loshuArt() : A.chart(A.DEMO_K, { fs: 15 });

  /* ---------------- report page mockups (3:4) ---------------- */
  const bars = (x, y, w, n, gap, op) => { let o = ''; const R = M.rng('bars' + x + y + n); for (let i = 0; i < n; i++) o += `<rect x="${x}" y="${y + i * (gap || 11)}" width="${f1(i === n - 1 ? w * (.35 + R() * .3) : w * (.82 + R() * .18))}" height="3.2" rx="1.6" fill="#1F2A24" opacity="${op || .18}"/>`; return o; };
  A.page = (kind, title, u, sub) => {
    let body = '';
    if (kind === 'cover') body = `<g transform="translate(110 70) scale(.4)">${M.logo('pg' + u).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g><text x="150" y="196" text-anchor="middle" font-family="Fraunces,serif" font-size="24" fill="#0E3B30">Janam Kundali</text><text x="150" y="218" text-anchor="middle" font-family="'Tiro Devanagari Hindi',serif" font-size="13" fill="#7A5C1C">जन्म कुंडली</text><path d="M96 236H204" stroke="#B8923A" stroke-width=".8"/><text x="150" y="262" text-anchor="middle" font-family="Manrope,sans-serif" font-size="11" font-weight="700" letter-spacing="1.6" fill="#1F2A24">${sub || 'RAVI SHARMA'}</text>${bars(90, 280, 120, 3, 12)}`;
    else if (kind === 'chart') body = `<g transform="translate(62 62) scale(.43)">${A.chart(A.DEMO_K, { col: '#164E3F', ink: '#0E3B30', sub: '#7A5C1C', fs: 17, sw: 2 }).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g>${bars(40, 262, 220, 8, 11)}`;
    else if (kind === 'dasha') { const P = [['Venus', 20, '#1C6B54'], ['Sun', 6, '#B8923A'], ['Moon', 10, '#7A5C1C'], ['Mars', 7, '#A8322D'], ['Rahu', 18, '#164E3F'], ['Jupiter', 16, '#B8923A']]; let x = 40; body = P.map(([n, y, c]) => { const w = y * 1.95, o = `<rect x="${f1(x)}" y="84" width="${f1(w - 2)}" height="18" rx="2" fill="${c}" opacity=".85"/><text x="${f1(x + 2)}" y="116" font-family="Manrope,sans-serif" font-size="8.5" font-weight="600" fill="#5B6A61">${n}</text>`; x += w; return o; }).join('') + bars(40, 140, 220, 5, 11) + '<rect x="40" y="208" width="220" height="64" rx="3" fill="#F4EDDD" stroke="#EAE0CA"/>' + bars(52, 222, 196, 4, 11, .22) + bars(40, 290, 220, 6, 11); }
    else if (kind === 'palm') body = `<g transform="translate(24 60) scale(.84)">${A.palmArt('#B8923A', '#164E3F').replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g>${bars(40, 300, 220, 5, 11)}`;
    else if (kind === 'cards') body = `<g transform="translate(20 58) scale(.93)">${A.tarotArt('pg' + u).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace(/data-amb="[^"]*"/g, '')}</g>${bars(40, 290, 220, 6, 11)}`;
    else if (kind === 'grid') body = `<g transform="translate(60 56) scale(.7)"><rect x="20" y="20" width="220" height="220" rx="4" fill="#0E3B30"/>${A.loshuArt().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g>${bars(40, 262, 220, 8, 11)}`;
    else if (kind === 'remedy') body = [0, 1, 2, 3].map((i) => `<circle cx="52" cy="${92 + i * 52}" r="10" fill="none" stroke="#B8923A" stroke-width="1"/><path d="M48 ${92 + i * 52}l3 3 5-6" fill="none" stroke="#164E3F" stroke-width="1.4" stroke-linecap="round"/>${bars(72, 86 + i * 52, 188, 3, 10)}`).join('') + bars(40, 312, 220, 3, 11);
    else body = bars(40, 84, 220, 9, 11) + '<rect x="40" y="194" width="220" height="70" rx="3" fill="#F4EDDD" stroke="#EAE0CA"/>' + bars(52, 208, 196, 4, 11, .22) + bars(40, 282, 220, 5, 11);
    return `<svg viewBox="0 0 300 400" width="100%" height="100%" role="img" aria-label="${title} — sample report page"><rect width="300" height="400" fill="#FFFDF7"/><rect x="12" y="12" width="276" height="376" fill="none" stroke="#B8923A" stroke-width=".8" opacity=".7"/>${kind === 'cover' ? '' : `<text x="40" y="52" font-family="Fraunces,serif" font-size="15" fill="#0E3B30">${title}</text><path d="M40 62H260" stroke="#EAE0CA"/>`}${body}<text x="150" y="376" text-anchor="middle" font-family="Manrope,sans-serif" font-size="7.5" font-weight="600" letter-spacing="1.4" fill="#7A5C1C">MAA KALI ASTUTI</text></svg>`;
  };

  /* ---------------- consultations ---------------- */
  A.MODES = { call: { t: 'Phone call', ic: 'phone' }, video: { t: 'Video call', ic: 'video' }, wa: { t: 'WhatsApp call', ic: 'whatsapp' }, report: { t: 'Written report', ic: 'report' } };
  A.SVC = {
    kundali: { modes: ['call', 'video', 'wa', 'report'], guarantee: true, deliver: 'Session within 3 days · summary on WhatsApp', get: 'Chart overview, 5-year dasha timing, remedies you can follow',
      covered: [['office', 'Career & profession', 'Timing for job changes, promotions and business moves'], ['heart', 'Marriage & relationships', 'Marriage timing, compatibility and harmony at home'], ['coins', 'Finance & property', 'Income patterns, savings, property and investment windows'], ['health', 'Health tendencies', 'Areas to watch and the planetary periods behind them'], ['shield', 'Doshas & obstacles', 'Manglik, Kaal Sarp, Pitra dosha and Sade Sati, checked honestly'], ['calendar', 'Dasha timing', 'Your Vimshottari periods for the next five years'], ['lotus', 'Remedies', 'Mantra, daan and discipline first; gemstones only when they help']],
      tiers: [{ k: 'essential', t: 'Essential', price: 2100, mins: 60, inc: ['60-minute session', 'One life area in depth, plus a chart overview', 'Remedies you can follow at home'] }, { k: 'detailed', t: 'Detailed', price: 3100, mins: 90, rec: 1, inc: ['90-minute session', 'All major life areas and 5-year dasha timing', 'Written summary on WhatsApp', 'Two follow-up questions within 30 days'] }, { k: 'premium', t: 'Premium', price: 5100, mins: 90, inc: ['Everything in Detailed', '25-page written analysis before the session', 'Kundali Milan for one match, if needed', 'Follow-up guidance for 3 months'] }],
      samples: [['chart', 'Lagna chart & positions'], ['dasha', 'Vimshottari dasha'], ['remedy', 'Remedies to follow']] },
    palm: { modes: ['report', 'video'], deliver: 'Written report in 48 hrs', get: 'Both palms read, turning points, guidance',
      covered: [['palm', 'Life, head & heart lines', 'What they say about vitality, thinking and emotion'], ['scroll', 'Fate line & turning points', 'Approximate ages of major changes'], ['user', 'Mounts & finger shape', 'Temperament, strengths and blind spots'], ['heart', 'Marriage & children lines', 'Relationship indications, read with care'], ['coins', 'Career & wealth signs', 'Sun line, Mercury line and money indications'], ['health', 'Health signs', 'What the palm suggests, never a diagnosis'], ['returns', 'Left and right hand', 'Inherited tendencies compared with your present path']],
      tiers: [{ k: 'essential', t: 'Essential', price: 1100, mins: 20, inc: ['Written report in 48 hours', 'Both palms: major lines and mounts', 'Turning-point ages marked'] }, { k: 'detailed', t: 'Detailed', price: 1800, mins: 30, rec: 1, inc: ['Everything in Essential', 'Minor lines, marriage and children lines', 'Your specific question answered in the report'] }, { k: 'premium', t: 'Premium', price: 2500, mins: 40, inc: ['Everything in Detailed', '40-minute video walkthrough', 'Guidance for 30 days on WhatsApp'] }],
      samples: [['palm', 'Your palm, marked'], ['lines', 'Turning points'], ['remedy', 'Guidance summary']] },
    tarot: { modes: ['call', 'video', 'wa'], deliver: 'Live session · recap on WhatsApp', get: 'Clarity on one question, practical next steps',
      covered: [['question', 'One clear question', 'Or up to three in the Detailed package'], ['heart', 'Relationship spread', 'Where the relationship stands and what helps'], ['office', 'Career crossroads', 'Two options laid side by side'], ['arrowR', 'Practical next steps', 'What to do this month, in plain words'], ['tarot', 'Card-by-card explanation', 'Every card shown and explained on screen'], ['chat', 'Recap on WhatsApp', 'A written summary after the session']],
      tiers: [{ k: 'essential', t: 'Essential', price: 1100, mins: 30, inc: ['30-minute session', 'One question', 'Recap on WhatsApp'] }, { k: 'detailed', t: 'Detailed', price: 1700, mins: 45, rec: 1, inc: ['45-minute session', 'Up to three questions', 'Relationship or career spread'] }, { k: 'premium', t: 'Premium', price: 2500, mins: 60, inc: ['60-minute session', 'Full life spread', 'Follow-up reading within 30 days'] }],
      samples: [['cards', 'Your spread'], ['lines', 'Card meanings'], ['remedy', 'Next steps']] },
    numerology: { modes: ['call', 'video', 'report'], deliver: 'Session or written report in 48 hrs', get: 'Core numbers, name and number corrections',
      covered: [['loshu', 'Moolank & Bhagyank', 'Birth number and destiny number, explained'], ['edit', 'Name number', 'Spelling options that suit your numbers'], ['phone', 'Mobile number', 'How your current number sits with you, and alternatives'], ['office', 'Business or brand name', 'The vibration of the name you trade under'], ['calendar', 'Lucky dates', 'Dates for launches, signings and moves'], ['grid', 'Lo Shu grid', 'Missing numbers and simple remedies']],
      tiers: [{ k: 'essential', t: 'Essential', price: 1500, mins: 45, inc: ['45-minute session', 'Moolank, Bhagyank and name number', 'Lucky dates for the year'] }, { k: 'detailed', t: 'Detailed', price: 2500, mins: 60, rec: 1, inc: ['Everything in Essential', 'Mobile number analysis', 'Name spelling options'] }, { k: 'premium', t: 'Premium', price: 4100, mins: 60, inc: ['Everything in Detailed', 'Business or brand name', 'Launch dates and signature guidance'] }],
      samples: [['grid', 'Your Lo Shu grid'], ['lines', 'Core numbers'], ['remedy', 'Name options']] }
  };
  M.SERVICES.forEach((s) => Object.assign(A.SVC[s.key], { key: s.key, name: s.name, hi: s.hi, icon: s.icon, line: s.line, dur: s.dur, modesLine: s.modes, href: 'Consultation-Detail.dc.html#s=' + s.key, book: 'Booking.dc.html#s=' + s.key }));
  A.STEPS = [['chat', 'Share your details', 'Birth details, palm photos or your question, through a short form.'], ['kundali', 'Sadhak Ji studies them', 'Your chart or palms are read before the session, never on the spot.'], ['video', 'Live session or report', 'By call, video, WhatsApp or a written report, in Hindi or English.'], ['lotus', 'Guidance continues', 'Follow-up questions are answered until your doubts are resolved.']];
  A.SLOTS = { 30: ['10:00', '10:45', '11:30', '12:15', '14:30', '15:15', '16:00', '16:45', '17:30', '18:15'], 45: ['10:00', '11:00', '12:00', '14:30', '15:30', '16:30', '17:30', '18:15'], 60: ['10:00', '11:30', '14:30', '16:00', '17:30'], 90: ['10:00', '14:30', '16:30'] };
  A.slotsFor = (date, mins) => { const k = mins <= 30 ? 30 : mins <= 45 ? 45 : mins <= 60 ? 60 : 90, R = M.rng('slot' + date.toDateString() + k); return A.SLOTS[k].map((t) => ({ t, free: R() > .34 })); };
  A.t12 = (t) => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`; };
  A.istDate = (d, t) => { const [h, m] = t.split(':').map(Number); return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), h, m) - 330 * 60000); };
  const icsT = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  A.ics = (o) => ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Maa Kali Astuti//Booking//EN', 'BEGIN:VEVENT', 'UID:' + o.id + '@sadhakpawanpandey.com', 'DTSTAMP:' + icsT(new Date()), 'DTSTART:' + icsT(o.start), 'DTEND:' + icsT(new Date(o.start.getTime() + o.mins * 60000)), 'SUMMARY:' + o.title, 'DESCRIPTION:' + o.desc, 'LOCATION:' + o.loc, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  A.gcal = (o) => 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(o.title) + '&dates=' + icsT(o.start) + '/' + icsT(new Date(o.start.getTime() + o.mins * 60000)) + '&details=' + encodeURIComponent(o.desc) + '&location=' + encodeURIComponent(o.loc);

  A.TESTI = [
    { q: 'I had two job offers and could not decide. Sadhak Ji read my chart for an hour, explained the dasha I am in and why one role would drain me. Eight months on, I know it was the right call.', n: 'Ankit Mishra', c: 'Pune', s: 'Kundali Reading' },
    { q: 'Sent photos of both palms on a Sunday and had an eleven-page report by Tuesday. Specific, not the usual vague lines.', n: 'Shalini Rastogi', c: 'Lucknow', s: 'Palmistry' },
    { q: 'Calm, patient, and he never pushed a product. The remedy was a mantra and a daan, nothing to buy.', n: 'Vikas Tiwari', c: 'Indore', s: 'Kundali Reading' },
    { q: 'The tarot session gave me the clarity to finally speak to my parents about my marriage.', n: 'Neha Kapoor', c: 'Jaipur', s: 'Tarot Reading' },
    { q: 'We changed the spelling of our shop name on his advice. Footfall has been steady since Diwali.', n: 'Rajesh & Meena Gupta', c: 'Varanasi', s: 'Numerology' }
  ];
  A.K99REV = [
    { q: 'Downloaded it for my daughter. The dasha pages alone were worth far more than ₹99.', n: 'Kavita Soni', c: 'Bhopal' },
    { q: 'Planet degrees matched the chart our family pandit made by hand years ago.', n: 'Rohit Verma', c: 'Kanpur' },
    { q: 'Clean layout, and the Hindi version reads naturally, not like a translation.', n: 'Sushma Devi', c: 'Patna' },
    { q: 'I did not know my birth time. The report said so plainly instead of pretending.', n: 'Aditya Kulkarni', c: 'Bengaluru' }
  ];

  /* ---------------- rashifal content ---------------- */
  A.PERIODS = [['today', 'Today', 'आज'], ['tomorrow', 'Tomorrow', 'कल'], ['week', 'Weekly', 'साप्ताहिक'], ['month', 'Monthly', 'मासिक'], ['year', 'Yearly', 'वार्षिक']];
  const OPEN = ['{Span} rewards patience over speed; {lord}, your rashi lord, favours steady effort.', 'A calm, productive stretch {span}. Finish pending paperwork before starting something new.', 'Conversations carry extra weight {span}. Say less, and mean what you say.', 'Energy runs high {span}. Put it into the task you have been postponing.', 'Old contacts resurface {span}, and one of them brings useful news about work.', 'A good time to settle one open money question with family {span}.', 'Your intuition is sharp {span}, but confirm the details before you commit.', 'Keep plans simple {span}. Small finished tasks will matter more than big announcements.'];
  const AREA = {
    love: ['In relationships, listen fully before you reply; a small misunderstanding clears quickly.', 'Single seekers may meet someone through family or a place of worship.', 'An unhurried meal together does more for your bond than any gift.', 'Keep work stress out of the home; your partner is more patient than you think.', 'A long-pending conversation with your spouse goes better than you expect.', 'Say your appreciation out loud. It is noticed, and returned.'],
    career: ['At work, a senior notices steady effort. Keep your reports precise.', 'A good window to apply, pitch or ask for the responsibility you want.', 'Read agreements clause by clause and do not sign in a hurry.', 'Teamwork brings the result. Share credit generously.', 'Business owners may see a delayed payment finally arrive.', 'Focus on one project; scattered effort slows everything down.'],
    health: ['Sleep on time; your energy depends on it more than usual.', 'Favour warm, simple food if digestion feels sensitive.', 'Ten minutes of pranayama each morning keeps the mind steady.', 'Mind your posture during long hours at the desk.', 'Drink enough water and walk for a while after meals.', 'Gentle stretching eases stiffness in the joints.'],
    finance: ['Money matters are stable. Postpone large purchases by a few days.', 'An old investment shows modest gains; avoid speculative trades.', 'Clear small dues first. It frees your mind for bigger decisions.', 'A family expense may come up, so keep a small reserve ready.', 'A good time to begin a disciplined savings habit.', 'Avoid lending money for now, even to close friends.']
  };
  const monday = (d) => M.addDays(-((d.getDay() + 6) % 7), d);
  A.periodDate = (p, now) => {
    now = now || new Date();
    if (p === 'today') return M.dlong(now);
    if (p === 'tomorrow') return M.dlong(M.addDays(1, now));
    if (p === 'week') { const a = monday(now), b = M.addDays(6, a); return `${a.getDate()} ${MON[a.getMonth()]} – ${b.getDate()} ${MON[b.getMonth()]} ${b.getFullYear()}`; }
    if (p === 'month') return MONL[now.getMonth()] + ' ' + now.getFullYear();
    return 'Samvat ' + (now.getFullYear() + 57) + ' · ' + now.getFullYear();
  };
  A.predict = (r, p, now) => {
    now = now || new Date();
    const span = { today: 'today', tomorrow: 'tomorrow', week: 'this week', month: 'this month', year: 'this year' }[p] || 'today';
    const dk = p === 'today' ? now.toDateString() : p === 'tomorrow' ? M.addDays(1, now).toDateString() : p === 'week' ? monday(now).toDateString() : p === 'month' ? 'm' + now.getMonth() + now.getFullYear() : 'y' + now.getFullYear();
    const R = M.rng(r.key + p + dk), pick = (a) => a[Math.floor(R() * a.length)];
    const fill = (s) => s.replace(/\{span\}/g, span).replace(/\{Span\}/g, span[0].toUpperCase() + span.slice(1)).replace(/\{lord\}/g, r.lordHi);
    const o = fill(pick(OPEN)), love = pick(AREA.love), career = pick(AREA.career), health = pick(AREA.health), finance = pick(AREA.finance);
    const m = () => 2 + Math.floor(R() * 4), meters = { love: m(), career: m(), health: m(), finance: m() };
    return { text: o + ' ' + career + ' ' + love, short: o, love, career, health, finance, meters, luckyNum: [r.num, ((r.num + 2) % 9) + 1, ((r.num + 5) % 9) + 1][Math.floor(R() * 3)], overall: Math.round((meters.love + meters.career + meters.health + meters.finance) / 4) };
  };
  A.AREAS = [['love', 'Love', 'प्रेम', 'heart'], ['career', 'Career', 'करियर', 'office'], ['health', 'Health', 'स्वास्थ्य', 'health'], ['finance', 'Finance', 'धन', 'coins']];

  /* ---------------- love calculator ---------------- */
  const red = (n) => { while (n > 9) n = String(n).split('').reduce((a, b) => a + +b, 0); return n || 9; };
  A.nameNum = (s) => { const t = String(s || '').replace(/[^A-Za-z]/g, ''); if (!t) { let h = 0; for (const c of String(s || '')) h += c.charCodeAt(0); return red(h); } return red([...t.toUpperCase()].reduce((a, c) => a + (((c.charCodeAt(0) - 65) % 9) + 1), 0)); };
  A.NUMP = { 1: 'Surya', 2: 'Chandra', 3: 'Guru', 4: 'Rahu', 5: 'Budh', 6: 'Shukra', 7: 'Ketu', 8: 'Shani', 9: 'Mangal' };
  const FR = { 1: [2, 9, 3], 2: [1, 5], 3: [1, 2, 9], 4: [6, 8, 5], 5: [1, 6], 6: [5, 8, 4], 7: [6, 8, 5], 8: [5, 6, 4], 9: [1, 2, 3] };
  A.love = (a, b) => {
    const na = A.nameNum(a), nb = A.nameNum(b), NP = A.NUMP;
    const rel = na === nb ? 'same' : FR[na].includes(nb) || FR[nb].includes(na) ? 'friend' : Math.abs(na - nb) === 4 ? 'opp' : 'neutral';
    const R = M.rng('love' + [a, b].map((s) => String(s).trim().toLowerCase()).sort().join('|'));
    const pct = Math.max(52, Math.min(97, Math.round({ same: 81, friend: 86, neutral: 73, opp: 64 }[rel] + (R() - .4) * 16)));
    const L = pct >= 90 ? ['Rare Harmony', 'दुर्लभ सामंजस्य'] : pct >= 80 ? ['Harmonious Bond', 'मधुर बंधन'] : pct >= 70 ? ['Warm Companionship', 'स्नेहिल साथ'] : pct >= 60 ? ['Growing Together', 'साथ बढ़ता रिश्ता'] : ['Balanced Opposites', 'संतुलित विपरीत'];
    const line = { same: `You share the same vibration (${NP[na]}), so you often think alike. Leave room for each other’s quiet time.`, friend: `${NP[na]} and ${NP[nb]} are natural friends. Plans you make together tend to hold.`, neutral: `${NP[na]} and ${NP[nb]} move at different speeds. Talk plans through rather than assuming.`, opp: `${NP[na]} and ${NP[nb]} pull in different directions. Patience turns the difference into strength.` }[rel];
    return { na, nb, pa: NP[na], pb: NP[nb], rel, pct, label: L[0], labelHi: L[1], line };
  };
  A.initial = (s) => { const t = String(s || '').trim(); return t ? [...t][0].toUpperCase() : ''; };
  A.KOOTA = [['Varna', 1], ['Vashya', 2], ['Tara', 3], ['Yoni', 4], ['Graha Maitri', 5], ['Gana', 6], ['Bhakoot', 7], ['Nadi', 8]];

  /* ---------------- sadhana courses ---------------- */
  A.COURSES = [
    { key: 'baglamukhi', en: 'Baglamukhi Sadhana', hi: 'बगलामुखी साधना', deity: 'Maa Baglamukhi, the eighth Mahavidya', icon: 'gada', days: 36, essence: 'Protection, victory over opposition, and relief from legal and life obstacles.', overview: 'Maa Baglamukhi is the power that stills. Her sadhana is traditionally taken up by those facing persistent opposition, court matters or speech used against them. The practice builds a calm, unshakeable centre from which the seeker acts.', attain: ['Steadiness when facing opposition, disputes or hostile speech', 'Protection for yourself and your family through daily practice', 'Composure and clarity in legal and professional matters', 'The discipline to carry a long sankalp to completion'], niyam: 'Yellow clothing, a yellow asana and a haldi mala during japa.' },
    { key: 'hanuman', en: 'Hanuman Sadhana', hi: 'हनुमान साधना', deity: 'Shri Hanuman, Sankat Mochan', icon: 'gada', days: 41, essence: 'Inner strength, courage and steady protection from negative energies.', overview: 'Hanuman sadhana builds strength of body, breath and will. It suits seekers who feel drained, fearful or unprotected, and it asks for physical discipline as much as mantra.', attain: ['Physical and mental stamina through daily practice', 'Freedom from fear and night-time disturbance', 'Protection from negative energies at home', 'Devotion that steadies the mind under pressure'], niyam: 'A short daily physical practice and strict celibacy during the anushthan.' },
    { key: 'kali', en: 'Kali Sadhana', hi: 'काली साधना', deity: 'Maa Mahakali, the first Mahavidya', icon: 'sword', days: 41, essence: 'The intense, transformative grace of Maa Kali, for seekers ready for deep change.', overview: 'Kali sadhana is the heart of this lineage. It is intense and it is transformative: old fear, attachment and negativity are cut away. It is offered only after a personal conversation with Sadhak Ji.', attain: ['Release from long-held fear and negativity', 'Strong protection from dark and hostile energies', 'Deep inner change under close guidance', 'Grounding in the tradition of Maa Kali Astuti'], niyam: 'Night practice at a fixed hour, and a first course or long conversation before enrollment.' },
    { key: 'durga', en: 'Durga Sadhana', hi: 'दुर्गा साधना', deity: 'Maa Durga, protector of the three worlds', icon: 'conch', days: 27, essence: 'A complete shield of protection, peace, prosperity and steady energy.', overview: 'Durga sadhana draws on the Devi Mahatmya tradition. It suits householders who want protection for the family, peace in the home and the energy to carry responsibilities well.', attain: ['Protection for the home and family', 'Peace and steadiness in daily life', 'Energy to carry responsibilities without burning out', 'A living connection with the Navadurga forms'], niyam: 'Red asana and daily path of selected Devi Mahatmya chapters.' },
    { key: 'shiva', en: 'Shiva Sadhana', hi: 'शिव साधना', deity: 'Bhagwan Shiva, Mahadev', icon: 'trishul', days: 40, essence: 'Connection with cosmic consciousness for deep peace, inner mastery and spiritual growth.', overview: 'Shiva sadhana is the quietest of the six and the most inward. It centres on mantra, breath and stillness, and suits seekers whose aim is peace and self-mastery rather than worldly results.', attain: ['Deep peace and a quieter mind', 'Mastery over anger, restlessness and habit', 'A steady meditation practice', 'Progress on the inner path under guidance'], niyam: 'Monday fast (as health allows) and silence for one hour after japa.' },
    { key: 'bhairav', en: 'Bhairav Sadhana', hi: 'भैरव साधना', deity: 'Kaal Bhairav, guardian of Kashi', icon: 'damaru', days: 41, essence: 'Fierce protective energy that dissolves deep-seated fear and obstacles.', overview: 'Bhairav is the guardian. His sadhana is taken up for fearlessness and protection, and to clear obstacles that return again and again. Discipline and timing matter greatly, so guidance stays close throughout.', attain: ['Fearlessness in situations that once paralysed you', 'Protection during travel, night and difficult periods', 'Removal of recurring obstacles', 'Discipline in time, speech and conduct'], niyam: 'Practice after sunset and a sesame-oil diya every Sunday.' }
  ];
  A.COURSES.forEach((c) => (c.href = 'Course-Detail.dc.html#c=' + c.key));
  A.course = (k) => A.COURSES.find((c) => c.key === k) || A.COURSES[0];
  A.INCLUDES = [['user', 'Personal diksha', 'Given by Sadhak Pawan Pandey, in person or on video'], ['scroll', 'Mantra, vidhi & niyam', 'Explained step by step, in the order you practise them'], ['yantra', 'Energized yantra & mala', 'Prepared for you and sent before diksha'], ['calendar', 'Weekly check-ins', 'Your japa record reviewed every week'], ['lotus', 'Guidance after completion', 'How to keep the practice alive once the anushthan ends']];
  A.ENROLL = [['chat', 'Inquiry', 'Send the form or message on WhatsApp.'], ['phone', 'Personal conversation', 'A call with Sadhak Ji about your intention and life situation.'], ['seal', 'Eligibility', 'Whether this sadhana suits you now, or another one first.'], ['cert', 'Enrollment', 'Fee, dates and preparation shared in writing.'], ['flame', 'Guided sadhana', 'Diksha, daily practice and weekly check-ins.']];
  A.MODULES = [['Preparation & shuddhi', '7 days of diet, routine and purification before diksha'], ['Diksha & sankalp', 'The mantra and your sankalp, given personally'], ['Mantra, nyasa & dhyana', 'Daily japa with nyasa and meditation, in a fixed sequence'], ['Yantra puja & havan', 'Weekly puja of your energized yantra and a closing havan'], ['Purnahuti & integration', 'Completion rites and how to carry the practice forward']];
  A.NIYAM = ['The same time and place every day', 'Satvik food; no alcohol, meat or tobacco', 'Brahmacharya for the length of the anushthan', 'Measured, truthful speech; no arguments or gossip', 'A daily record of japa count and experiences', 'No discussion of the practice outside guidance'];

  /* ---------------- rituals ---------------- */
  A.RITUALS = [['scales', 'Baglamukhi Anushthan', 'बगलामुखी अनुष्ठान', 'For long legal disputes and persistent opposition.'], ['health', 'Maha Mrityunjaya Jaap', 'महामृत्युंजय जाप', 'For health and recovery, alongside medical care.'], ['sun', 'Navagraha Shanti', 'नवग्रह शांति', 'When several difficult planetary periods press at once.'], ['kalash', 'Rudrabhishek', 'रुद्राभिषेक', 'For peace at home and the removal of obstacles.'], ['conch', 'Durga Saptashati Path', 'दुर्गा सप्तशती पाठ', 'For protection of the family and new beginnings.'], ['home', 'Vastu Shanti', 'वास्तु शांति', 'Before moving into a new home, shop or office.']];
  A.RPROCESS = [['chat', 'Share your concern', 'Tell us what is happening, with birth details if you have them.'], ['eye', 'Spiritual analysis', 'Sadhak Ji studies the situation and your chart before anything is suggested.'], ['seal', 'Accepted only if confident', 'If a ritual is not the right path, we say so and suggest what is.'], ['calendar', 'Ritual at the right muhurat', 'Performed on a date chosen for you, with your name and gotra in the sankalp.'], ['bell', 'Updates & guidance', 'Photos from the ritual, prasad by post, and guidance for the weeks after.']];
  A.RECEIVE = [['scroll', 'Sankalp in your name', 'Your name, gotra and concern spoken in the sankalp'], ['calendar', 'Muhurat shared in advance', 'You know the date and time, and can sit in prayer at home'], ['camera', 'Photo & video updates', 'Sent on WhatsApp during and after the ritual'], ['package', 'Prasad & raksha sutra', 'Posted to your address after completion'], ['lotus', '40 days of guidance', 'What to follow at home, and answers to your questions']];

  /* ---------------- FAQ sets ---------------- */
  A.FAQ = {
    home: [['How do I know a Rudraksha is original?', 'Every bead is original Nepali Rudraksha, X-ray tested for its mukhi count and shipped with a lab certificate carrying the same number as the bead. If the certificate and the bead ever differ, the order is replaced or refunded.'], ['What does “energized in Mahapuja” mean?', 'Before dispatch, each product is placed in the Mahapuja performed by Sadhak Ji at an auspicious muhurat, with the mantra of the deity it belongs to. For ₹251 you can add personal energization with your name and gotra in the sankalp.'], ['How long does delivery take?', 'Orders ship 2–4 days after energization and reach most pincodes in 3–7 days. Shipping is free above ₹999, and cash on delivery is available across most of India.'], ['Can I return a product?', 'Unused products in their original packing can be returned within 7 days of delivery. Items energized with your personal sankalp can be exchanged but not refunded.'], ['How are consultations held?', 'By phone, video, WhatsApp call or as a written report, in Hindi or English. You share your details through a short form, Sadhak Ji studies them beforehand, and guidance continues until your doubts are resolved.'], ['Who can join a Sadhana course?', 'Serious seekers over 21 who can keep the daily practice and niyam for the full course. Enrollment follows a personal conversation with Sadhak Ji; the fee is ₹50,000 per sadhana.'], ['Is my birth information kept private?', 'Yes. Birth details, palm photos and questions are seen only by Sadhak Ji and his office, and are never shared or used for anything else.']],
    consult: [['How do I choose between Kundali, palmistry, tarot and numerology?', 'If you know your birth date, time and place, a Kundali reading gives the widest view of career, marriage, health and timing. Palmistry suits those without birth details. Tarot is best for one pressing question. Numerology helps with names, numbers and dates. Unsure? Message us on WhatsApp and we will suggest one.'], ['I don’t know my exact birth time. Can I still book?', 'Yes. Share an approximate window, such as early morning. Sadhak Ji can rectify the time from life events, or suggest palmistry instead.'], ['Which language are sessions in?', 'Hindi or English, whichever you are comfortable in. Written reports are available in both.'], ['What does the satisfaction guarantee cover?', 'For Kundali readings, if your questions are not answered clearly in the session, Sadhak Ji continues the guidance at no extra cost until they are.'], ['Can I reschedule?', 'Yes, once, up to 12 hours before your slot, from the link in your confirmation message or on WhatsApp.'], ['Will I be asked to buy expensive remedies?', 'No. Remedies begin with mantra, daan and discipline. A gemstone or rudraksha is suggested only when it clearly helps, and buying it is never a condition of guidance.'], ['Is my information kept private?', 'Your birth details, photos and questions are seen only by Sadhak Ji and his office, and are never shared.'], ['How do I pay?', 'UPI, cards, netbanking and wallets, secured by Razorpay. Your slot is confirmed as soon as payment goes through.']],
    kundali99: [['Is the report made by software or by Sadhak Ji?', 'Charts, planetary degrees and dashas are computed by software. The interpretations are written under Sadhak Ji’s guidance. For a personal reading of your chart, book a Kundali consultation.'], ['What if I don’t know my birth time?', 'Tick “I don’t know my exact time” and we calculate for noon. Planet signs stay accurate; the Lagna and houses may shift, and the report says so clearly.'], ['How do I receive it?', 'Instantly on this page after payment, and as a PDF on WhatsApp and email.'], ['Can I get it in Hindi?', 'Yes. Choose English or हिंदी before you generate. The other language can be downloaded later from your account at no cost.'], ['Is this the same as a Kundali reading?', 'No. This is a detailed printed report. A reading is a live session in which Sadhak Ji studies your chart and answers your questions.'], ['What if my payment fails?', 'No money is taken for a failed payment. If it was debited, it is refunded automatically within 5–7 working days.']],
    courses: [['Who can enroll?', 'Seekers over 21 who can commit to the daily practice and niyam for the full duration. Enrollment follows a personal conversation with Sadhak Ji.'], ['Do I need prior experience?', 'No, but you need sincerity and time. Some sadhanas, such as Kali, are offered only after a first course or a longer conversation.'], ['Is diksha included?', 'Yes. Every course begins with diksha and sankalp given personally by Sadhak Pawan Pandey.'], ['Can I practise from home?', 'Yes. Diksha is given in person or on video, and the daily practice is done at home with weekly check-ins.'], ['How much time does it take each day?', 'Usually 60 to 90 minutes at a fixed time, depending on the sadhana and the stage you are at.'], ['Is the fee refundable?', 'In full until diksha. After diksha it is not, because the sankalp has been taken.'], ['Why is the syllabus not published?', 'Mantra and vidhi are given to each seeker in a guided sequence. The syllabus is shared after the first conversation.']],
    kundali: [['What details do I need?', 'Date, time and place of birth. A time from a hospital record or family memory is fine; even a two-hour window helps.'], ['Do you check Manglik and Kaal Sarp dosha?', 'Yes, honestly. Many charts flagged elsewhere are not doshic when the whole chart is read, and Sadhak Ji will tell you so.'], ['Can my spouse join the session?', 'Yes. For marriage questions both charts help; the Premium package includes Kundali Milan.'], ['What happens after the session?', 'You receive a summary on WhatsApp and can send follow-up questions as your package allows.']],
    palm: [['How should I take the palm photos?', 'In daylight, palm open and flat, fingers together, the whole hand in the frame. Photograph both hands. The booking page shows a guide.'], ['Which hand is read?', 'Both. The left shows inherited tendencies; the right shows the path you are making.'], ['When do I get the report?', 'Within 48 hours of booking, on WhatsApp and email.'], ['Can I ask a specific question?', 'Yes. Add it in the booking form and the report answers it directly.']],
    tarot: [['Is tarot part of the Vedic tradition?', 'No, and Sadhak Ji is open about that. He uses tarot as an intuitive tool for clarity on present situations, not for long-range prediction.'], ['How many questions can I ask?', 'One in Essential, up to three in Detailed, and a full spread in Premium.'], ['Can I see the cards?', 'Yes. On video every card is shown; on calls each card is named and explained.'], ['Which questions work best?', 'Clear, present-tense ones. “What should I focus on in this relationship?” works better than “Will I be rich?”']],
    numerology: [['What do you need from me?', 'Your full name as you use it, date of birth, current mobile number and, for businesses, the trading name.'], ['Will I have to change my name?', 'Rarely. Usually a small spelling change or a different signature is enough, and only if your numbers call for it.'], ['Can you suggest a new mobile number?', 'Yes. You get number patterns that suit you, to choose from with your operator.'], ['Do you choose launch dates?', 'Yes. The Premium package includes dates for launches, signings and moves in the coming year.']],
    rituals: [['Can I attend the ritual?', 'Most rituals are performed at our puja sthan. You can sit in prayer at home at the same muhurat; attending in person can be arranged for some anushthans.'], ['How long does a ritual take?', 'From one day for a Rudrabhishek to 11 or 21 days for a full anushthan, depending on what is advised.'], ['What does it cost?', 'The cost depends on the ritual, its length and the samagri required. It is shared in writing only after analysis, before you commit.'], ['What if you decline my case?', 'We tell you why, and suggest what may help instead, such as a consultation, a mantra practice or simply patience.']]
  };

  A.stars5 = (col, n) => { const P = 'M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.7l-5.1 2.7 1-5.6-4.1-4 5.7-.8z'; let d = ''; for (let i = 0; i < 5; i++) d += `<path d="${P}" transform="translate(${i * 27} 0)" fill="${i < (n == null ? 5 : n) ? col : 'none'}" stroke="${col}" stroke-width="1" stroke-linejoin="round"/>`; return `<svg viewBox="2 2 128 20" width="100%" height="100%" aria-hidden="true">${d}</svg>`; };
  M.astroReady = true;
})();
