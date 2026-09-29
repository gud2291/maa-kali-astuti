/* Maa Kali Astuti — home layer: Pandit Ji composition (named, animatable groups), hero arch frame,
   floating gemstones, category art (havan, copper), video + Shorts thumbnails, book covers, seal,
   About chapters, video / review / timeline content. Plain script, waits for mka-astro. Exposes MKA.H. */
(function boot() {
  const M = window.MKA;
  if (!M || !M.astroReady) { setTimeout(boot, 20); return; }
  if (M.H) return;
  const H = (M.H = {}), A = M.A, f1 = (n) => (+n).toFixed(1);
  const strip = (s) => String(s).replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/\sdata-amb="[^"]*"/g, '');
  const fit = (inner, vb, box) => { const s = Math.min(box[2] / vb[2], box[3] / vb[3]), x = box[0] + (box[2] - vb[2] * s) / 2 - vb[0] * s, y = box[1] + (box[3] - vb[3] * s) / 2 - vb[1] * s; return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s.toFixed(4)})">${inner}</g>`; };
  H.strip = strip; H.fit = fit;

  /* ---------------- japa mala path (arc-length lookup, shared by SVG + animation) ---------------- */
  const MP = [[179, 292], [163, 310], [157, 344], [165, 372], [171, 392], [195, 400], [205, 384], [213, 368], [205, 332], [191, 306], [187, 299], [183, 295], [179, 292]];
  const LUT = (() => { const pts = []; for (let s = 0; s < MP.length - 1; s += 3) { const [a, b, c, d] = [MP[s], MP[s + 1], MP[s + 2], MP[s + 3]]; for (let i = s ? 1 : 0; i <= 48; i++) { const t = i / 48, v = 1 - t; pts.push([v * v * v * a[0] + 3 * v * v * t * b[0] + 3 * v * t * t * c[0] + t * t * t * d[0], v * v * v * a[1] + 3 * v * v * t * b[1] + 3 * v * t * t * c[1] + t * t * t * d[1]]); } } let L = 0; const cum = [0]; for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); cum.push(L); } return { pts, cum, L }; })();
  H.MALA_N = 30; H.MALA_L = LUT.L;
  H.malaAt = (s) => { const { pts, cum, L } = LUT; s = ((s % L) + L) % L; let lo = 0, hi = cum.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] < s) lo = m; else hi = m; } const k = (s - cum[lo]) / Math.max(1e-6, cum[hi] - cum[lo]); return [pts[lo][0] + (pts[hi][0] - pts[lo][0]) * k, pts[lo][1] + (pts[hi][1] - pts[lo][1]) * k]; };
  H.malaSet = (beads, off) => { const st = LUT.L / H.MALA_N; beads.forEach((b, i) => { const p = H.malaAt(off + i * st); b.setAttribute('transform', `translate(${f1(p[0])} ${f1(p[1])})`); }); };

  /* ---------------- Pandit Ji (S1–S6). viewBox 0 0 400 500; transparent ground.
     Named groups: #aura #torso #torso-front #eyelids #pupils #mala-beads #hand-thumb #diya-flame #smoke ---------------- */
  H.pandit = (u) => {
    u = u || 'pj';
    const skD = '#8C5838', hair = '#27211D', grey = '#7D746B', saff = '#C9772E', gold = '#D9B96A', creamD = '#D3C09C';
    const defs = `<defs>
<radialGradient id="au${u}" cx=".5" cy=".44" r=".5"><stop offset="0" stop-color="#F2C66D" stop-opacity=".55"/><stop offset=".5" stop-color="#F2C66D" stop-opacity=".16"/><stop offset="1" stop-color="#F2C66D" stop-opacity="0"/></radialGradient>
<linearGradient id="sk${u}" x1="0" x2="1"><stop offset="0" stop-color="#7E4D2E"/><stop offset=".36" stop-color="#A8714C"/><stop offset=".62" stop-color="#B47C55"/><stop offset="1" stop-color="#8F5C3B"/></linearGradient>
<linearGradient id="ar${u}" x1="0" x2="1"><stop offset="0" stop-color="#7A4A2C"/><stop offset=".55" stop-color="#A26B46"/><stop offset="1" stop-color="#8A5636"/></linearGradient>
<radialGradient id="fc${u}" cx=".58" cy=".4" r=".66"><stop offset="0" stop-color="#C38D65"/><stop offset=".68" stop-color="#AA734E"/><stop offset="1" stop-color="#8A5636"/></radialGradient>
<linearGradient id="dh${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5EBD6"/><stop offset="1" stop-color="#DCC9A5"/></linearGradient>
<linearGradient id="sh${u}" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6EDD9"/><stop offset="1" stop-color="#E0CFAE"/></linearGradient>
<radialGradient id="bd${u}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#C8925F"/><stop offset=".55" stop-color="#7C4B2B"/><stop offset="1" stop-color="#3A1F0D"/></radialGradient>
<linearGradient id="br${u}" x1="0" x2="1"><stop offset="0" stop-color="#6E521C"/><stop offset=".45" stop-color="#E6C981"/><stop offset="1" stop-color="#7E6024"/></linearGradient>
<linearGradient id="wd${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E4428"/><stop offset="1" stop-color="#3A2313"/></linearGradient>
<linearGradient id="qz${u}" x1="0" x2="1"><stop offset="0" stop-color="#C7D2CF"/><stop offset=".5" stop-color="#FFFFFF"/><stop offset="1" stop-color="#A9B5B2"/></linearGradient>
<radialGradient id="dg${u}"><stop offset="0" stop-color="#F2C66D" stop-opacity=".6"/><stop offset="1" stop-color="#F2C66D" stop-opacity="0"/></radialGradient>
<linearGradient id="fl${u}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#C9772E"/><stop offset=".45" stop-color="#F2B64A"/><stop offset="1" stop-color="#FFF1C9"/></linearGradient>
<clipPath id="ey${u}"><path d="M181 171.5C184 168.3 191.5 168.3 195 171.5C191.5 173.7 184 173.7 181 171.5ZM205 171.5C208.5 168.3 216 168.3 219 171.5C216 173.7 208.5 173.7 205 171.5Z"/></clipPath>
</defs>`;
    const aura = `<g id="aura"><circle cx="200" cy="224" r="178" fill="url(#au${u})"/></g>`;
    const backHair = `<path d="M167 186C163 214 167 240 179 257L221 257C233 240 237 214 233 186Z" fill="${hair}"/>`;
    const shawl = `<path d="M221 237C242 238 262 245 274 260C283 272 286 297 285 335C279 343 265 344 258 337C254 307 248 283 238 267C231 256 223 247 221 237Z" fill="url(#sh${u})"/>
<path d="M274 260C283 272 286 297 285 335C279 343 265 344 258 337" fill="none" stroke="${saff}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M270 263C278 275 281 298 280.5 331" fill="none" stroke="${gold}" stroke-width=".7" opacity=".9"/>
<path d="M221 238C210 262 184 300 145 341L176 365C207 334 237 292 252 261C244 250 233 242 221 238Z" fill="url(#sh${u})"/>
<path d="M231 248C219 274 195 309 160 350M242 255C229 283 205 318 169 358" fill="none" stroke="${creamD}" stroke-width="1.1" stroke-linecap="round" opacity=".75"/>
<path d="M221 238C210 262 184 300 145 341M252 261C237 292 207 334 176 365" fill="none" stroke="${saff}" stroke-width="3.2" stroke-linecap="round"/>
<path d="M225.5 242C214.5 265 188.5 303 150.5 343.5M247.5 263C232.5 294 202.5 335 172 362" fill="none" stroke="${gold}" stroke-width=".7" opacity=".9"/>
<g fill="${gold}" opacity=".85"><circle cx="228" cy="262" r="1.1"/><circle cx="212" cy="287" r="1.1"/><circle cx="195" cy="312" r="1.1"/><circle cx="177" cy="337" r="1.1"/></g>`;
    const head = `<g id="head">
<path d="M171 170C165 167 161 173 162 181C163 188 167 192 171 190Z" fill="${skD}"/><path d="M229 170C235 167 239 173 238 181C237 188 233 192 229 190Z" fill="${skD}"/>
<path d="M166.5 175C165.6 180 166.4 185 169 187.4M233.5 175C234.4 180 233.6 185 231 187.4" fill="none" stroke="#6A3E26" stroke-width=".8" opacity=".7"/>
<path d="M200 140C219 140 231 155 231 176C231 197 222 212 211 219C205 222 195 222 189 219C178 212 169 197 169 176C169 155 181 140 200 140Z" fill="url(#fc${u})"/>
<circle cx="182" cy="187" r="8" fill="#C98A66" opacity=".22"/><circle cx="218" cy="187" r="8" fill="#C98A66" opacity=".22"/>
<ellipse cx="200" cy="123" rx="17" ry="11" fill="${hair}"/><path d="M189 117.5C194 113.6 206 113.6 211 117.5" fill="none" stroke="${grey}" stroke-width=".8" opacity=".55"/><path d="M186 125Q200 132 214 125" fill="none" stroke="#B8923A" stroke-width="1.3"/>
<path d="M167 181C163 151 177 129 200 127C223 129 237 151 233 181C231 166 227 157 221 151C213 145 206 143 200 143C194 143 187 145 179 151C173 157 169 166 167 181Z" fill="${hair}"/>
<path d="M175 156C182 142 193 135 205 134M225 156C219 144 210 137 199 135M170.5 170C171 160 175 152 181 146" fill="none" stroke="${grey}" stroke-width="1" stroke-linecap="round" opacity=".55"/>
<g stroke="#EFE6D4" stroke-width="1" stroke-linecap="round" opacity=".72"><path d="M190.5 149.6H209.5M190 152.6H210M190.5 155.6H209.5"/></g><circle cx="200" cy="152.6" r="1.8" fill="#A8322D"/>
<path d="M179 162C183.5 158.8 190.5 158.5 195.5 160.8M221 162C216.5 158.8 209.5 158.5 204.5 160.8" fill="none" stroke="#3A322D" stroke-width="2" stroke-linecap="round"/><path d="M180.5 161.2C185 158.8 190.5 158.8 194 160.4M219.5 161.2C215 158.8 209.5 158.8 206 160.4" fill="none" stroke="#9A9087" stroke-width=".6" opacity=".7"/>
<path d="M181.5 167.8C185.5 165.6 190.5 165.6 194 167.6M206 167.6C209.5 165.6 214.5 165.6 218.5 167.8" fill="none" stroke="#7A4A2E" stroke-width=".8" stroke-linecap="round" opacity=".55"/>
<g id="eyelids" style="transform-box:fill-box;transform-origin:50% 50%">
<path d="M181 171.5C184 168.3 191.5 168.3 195 171.5C191.5 173.7 184 173.7 181 171.5ZM205 171.5C208.5 168.3 216 168.3 219 171.5C216 173.7 208.5 173.7 205 171.5Z" fill="#EDE3D1"/>
<g clip-path="url(#ey${u})"><g id="pupils"><circle cx="188" cy="171.3" r="2.6" fill="#2A1A10"/><circle cx="212" cy="171.3" r="2.6" fill="#2A1A10"/><circle cx="188.9" cy="170.4" r=".65" fill="#FFF" opacity=".85"/><circle cx="212.9" cy="170.4" r=".65" fill="#FFF" opacity=".85"/></g></g>
<path d="M180.6 171.4C184 167.3 192 167.3 195.4 171.4M204.6 171.4C208 167.3 216 167.3 219.4 171.4" fill="none" stroke="#24160D" stroke-width="1.35" stroke-linecap="round"/>
<path d="M182.5 172.7C185.5 174.1 190.5 174.1 193.5 172.7M206.5 172.7C209.5 174.1 214.5 174.1 217.5 172.7" fill="none" stroke="#6E4028" stroke-width=".6" opacity=".6"/>
</g>
<path d="M200.6 168C200.2 176 198.6 182.6 196.4 187.6C198.4 190 201.8 190.2 204 188.2" fill="none" stroke="#744528" stroke-width="1.2" stroke-linecap="round" opacity=".75"/><path d="M195.6 188.2C194.4 189.4 195 190.6 196.8 190.6M204.4 188.2C205.6 189.4 205 190.6 203.2 190.6" fill="none" stroke="#744528" stroke-width="1" stroke-linecap="round" opacity=".55"/><path d="M202 172C202 178 201.6 182.6 200.9 185.6" fill="none" stroke="#D29D76" stroke-width=".9" stroke-linecap="round" opacity=".6"/>
<path d="M169 185C169 205 177 228 192 238C197 241 203 241 208 238C223 228 231 205 231 185C227 198 220 206 213 209.5C206 212.5 194 212.5 187 209.5C180 206 173 198 169 185Z" fill="#4A423C"/>
<path d="M180 207C183 218 187 228 193 235M190 212C191 222 194 231 197 237M200 213V239M210 212C209 222 206 231 203 237M220 207C217 218 213 228 207 235M174 196C176 206 180 214 185 220M226 196C224 206 220 214 215 220" fill="none" stroke="#A39A91" stroke-width=".8" stroke-linecap="round" opacity=".55"/>
<path d="M195.4 204.6C197.8 206 202.2 206 204.6 204.6" fill="none" stroke="#6E3526" stroke-width="1.4" stroke-linecap="round" opacity=".85"/>
<path d="M184.5 199.4C189 194.8 196 194.6 200 197.4C204 194.6 211 194.8 215.5 199.4C212 201.8 206 201.2 200 200C194 201.2 188 201.8 184.5 199.4Z" fill="#3A332E"/><path d="M184.6 199.4C182.8 202.8 183.2 206.8 185.8 209.2M215.4 199.4C217.2 202.8 216.8 206.8 214.2 209.2" fill="none" stroke="#3A332E" stroke-width="2" stroke-linecap="round"/>
</g>`;
    const torso = `<g id="torso" style="transform-origin:200px 372px">
<path d="M144 250C129 254 121 271 121 293C121 311 123 325 127 335C133 343 145 341 149 331C151 317 151 299 153 281C155 268 153 255 144 250Z" fill="url(#ar${u})"/>
<path d="M256 250C271 254 279 271 279 293C279 313 279 327 277 337C273 345 261 343 257 333C255 317 253 299 251 281C249 268 249 255 256 250Z" fill="url(#ar${u})"/>
<path d="M186 234C172 239 154 242 143 249C133 256 131 272 135 290L141 320C145 336 151 348 156 358L244 358C249 348 255 336 259 320L265 290C269 272 267 256 257 249C246 242 228 239 214 234Z" fill="url(#sk${u})"/>
<path d="M160 253C172 257 186 257 194 251M240 253C228 257 214 257 206 251" fill="none" stroke="${skD}" stroke-width="1.2" stroke-linecap="round" opacity=".55"/>
<path d="M150 298C166 308 186 309 197 302M250 298C234 308 214 309 203 302" fill="none" stroke="#6E4028" stroke-width="1.3" stroke-linecap="round" opacity=".38"/><path d="M200 262V302" stroke="#6E4028" stroke-width="1" opacity=".2"/>
<path d="M189 206L187 238C195 245 205 245 213 238L211 206Z" fill="${skD}"/><path d="M188 226C194 231 206 231 212 226" fill="none" stroke="#6E4028" stroke-width="1" opacity=".35"/>
${shawl}${head}</g>`;
    const R = M.rng('dhoti' + u);
    const legs = `<g id="legs">
<path d="M64 448C84 438 316 438 336 448C340 458 304 467 200 467C96 467 60 458 64 448Z" fill="#4A2418"/><path d="M76 450C96 443 304 443 324 450" fill="none" stroke="#B8923A" stroke-width=".8" stroke-dasharray="2 4" opacity=".8"/>
<path d="M84 434C86 404 116 380 156 368C172 363 186 362 200 362C214 362 228 363 244 368C284 380 314 404 316 434C304 450 258 456 200 456C142 456 96 450 84 434Z" fill="url(#dh${u})"/>
<path d="M112 424C134 410 160 402 184 402M288 424C266 410 240 402 216 402M100 438C130 445 170 447 195 445M300 438C270 445 230 447 205 445M126 398C140 390 156 386 170 385M274 398C260 390 244 386 230 385" fill="none" stroke="${creamD}" stroke-width="1.2" stroke-linecap="round" opacity=".85"/>
<path d="M91 431C104 446 150 452 200 452C250 452 296 446 309 431" fill="none" stroke="${saff}" stroke-width="2" opacity=".9"/><path d="M93.5 427.5C107 441 151 447 200 447C249 447 293 441 306.5 427.5" fill="none" stroke="${gold}" stroke-width=".6" opacity=".8"/>
<path d="M196 398C194 388 182 382 166 380C154 378 144 380 142 386C141 392 150 398 164 400C178 402 192 404 196 398Z" fill="#A36B47"/><path d="M190 396C186 390 176 386 165 385C156 384 149 386 148 389C151 393 160 396 170 397C180 398 187 399 190 396Z" fill="#C4916C" opacity=".85"/>
<path d="M204 398C206 388 218 382 234 380C246 378 256 380 258 386C259 392 250 398 236 400C222 402 208 404 204 398Z" fill="#A36B47"/><path d="M210 396C214 390 224 386 235 385C244 384 251 386 252 389C249 393 240 396 230 397C220 398 213 399 210 396Z" fill="#C4916C" opacity=".85"/>
<g fill="#B77E58"><circle cx="145" cy="383.5" r="2.1"/><circle cx="145.4" cy="388.4" r="1.9"/><circle cx="255" cy="383.5" r="2.1"/><circle cx="254.6" cy="388.4" r="1.9"/></g>
<path d="M154 359C170 365 230 365 246 359L248 371C232 377 168 377 152 371Z" fill="#E7D8B9"/><path d="M152 371C168 377 232 377 248 371" fill="none" stroke="${saff}" stroke-width="1.6" opacity=".85"/><path d="M196 367L192 385M204 367L208 385M200 368V386" fill="none" stroke="${creamD}" stroke-width="1" opacity=".9"/>
</g>`;
    const N = H.MALA_N, st = LUT.L / N;
    let beads = '';
    for (let i = 0; i < N; i++) { const p = H.malaAt(i * st); beads += `<g data-bead="${i}" transform="translate(${f1(p[0])} ${f1(p[1])})"><circle r="3.6" fill="url(#bd${u})"/><path d="M-2.2 -1.8Q0 -3.2 2.2 -1.8" fill="none" stroke="#2A140A" stroke-width=".6" opacity=".6"/><circle cx="-1.1" cy="-1.2" r=".9" fill="#EBCBA8" opacity=".5"/></g>`; }
    const front = `<g id="torso-front" style="transform-origin:200px 372px">
<path d="M261 331C271 337 285 361 295 391C297 399 291 405 285 403C275 383 265 363 255 345C251 337 255 329 261 331Z" fill="url(#ar${u})"/>
<path d="M283 396C290 391 302 393 308 401C311 407 307 414 299 414C290 414 283 408 283 402Z" fill="#AA734E"/><path d="M299 405.5a3.4 3.4 0 1 1 6.2 -1.9" fill="none" stroke="#6E4028" stroke-width="1" stroke-linecap="round"/><path d="M288 399C292 397 297 398 300 401" fill="none" stroke="#6E4028" stroke-width=".8" opacity=".6"/>
<path d="M125 331C131 319 147 305 163 293C169 289 177 291 179 297C181 303 177 307 171 311C159 321 147 333 141 343C135 349 123 343 125 331Z" fill="url(#ar${u})"/>
<path d="M162.4 293.6C166.6 297.4 170.4 303.2 171.4 309.4" fill="none" stroke="#A8322D" stroke-width="2.2" stroke-linecap="round"/><path d="M160.6 295.2C164.6 299 168 304.4 169 310.4" fill="none" stroke="#E0A63A" stroke-width=".7" opacity=".8"/>
<path d="M179 292C163 310 157 344 165 372C171 392 195 400 205 384C213 368 205 332 191 306C187 299 183 295 179 292Z" fill="none" stroke="#7A2A22" stroke-width=".8" opacity=".9"/>
<g id="mala-beads">${beads}</g>
<circle cx="181" cy="301" r="5" fill="url(#bd${u})"/><path d="M178.6 305L173.5 331Q181.5 336 189.5 331L184 305Z" fill="#A8322D"/><path d="M180.4 306L177 330M183 306L185.4 330M181.6 306V332" fill="none" stroke="#761D19" stroke-width=".8"/><rect x="177.5" y="304" width="7.4" height="3.4" rx="1.2" fill="#C9A24E"/>
<path d="M166 292C164 282 168 272 176 268C182 265 190 268 192 276C194 284 190 294 182 298C176 300 168 298 166 292Z" fill="#AE774F"/>
<path d="M177 271C180.6 275 182.4 281 182 288M184.6 270.6C187 276 188.4 282 186.4 289.6M170 274C172 279 173 285 172 291" fill="none" stroke="#6E4028" stroke-width=".8" stroke-linecap="round" opacity=".55"/>
<g id="hand-thumb"><path d="M171 277C174 270.5 183 268 188 272C190.6 275.6 187 280.4 181 280.6C176.6 281 172.6 280.4 171 277Z" fill="#BC8660"/><path d="M181 276.6C183 276.2 185.2 275.4 186.6 274" fill="none" stroke="#6E4028" stroke-width=".7" opacity=".6"/></g>
</g>`;
    const dR = M.rng('altar' + u);
    let leaves = '';
    [[118, 452, -120, 16], [122, 450, -70, 15], [114, 446, -150, 13], [126, 444, -40, 13], [119, 440, -100, 12], [128, 438, -58, 11], [112, 436, -128, 10]].forEach(([x, y, a, l]) => { leaves += `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0C${f1(l * .3)} ${f1(-l * .34)} ${f1(l * .72)} ${f1(-l * .32)} ${l} 0C${f1(l * .72)} ${f1(l * .32)} ${f1(l * .3)} ${f1(l * .34)} 0 0Z" fill="${dR() < .5 ? '#1C6B54' : '#2F7A4F'}"/><path d="M1 0H${f1(l * .85)}" stroke="#9CC9AE" stroke-width=".5"/></g>`; });
    const altar = `<g id="altar">
<rect x="94" y="457" width="212" height="9" rx="1.5" fill="url(#wd${u})"/><path d="M95 457.6H305" stroke="#A8764A" stroke-width="1"/>
<rect x="104" y="466" width="192" height="40" fill="url(#wd${u})"/><path d="M104 467.4H296" stroke="#C9A24E" stroke-width="1.2"/><path d="M112 474H288" stroke="#C9A24E" stroke-width=".6" stroke-dasharray="1.5 4" stroke-linecap="round" opacity=".8"/>
<g transform="translate(200 488)" fill="none" stroke="#C9A24E" stroke-width=".9"><path d="M0 -8C3 -5 3.4 -1.6 0 2.6C-3.4 -1.6 -3 -5 0 -8Z"/><path d="M0 2.6C-3 -.4 -6.6 -1.2 -10 -.6C-8.6 2.6 -5.2 3.8 0 2.6ZM0 2.6C3 -.4 6.6 -1.2 10 -.6C8.6 2.6 5.2 3.8 0 2.6Z"/><path d="M-26 2H-14M14 2H26"/></g>
${leaves}<path d="M117 456C118 448 120 441 124 434" fill="none" stroke="#2F5A3A" stroke-width="1"/><path d="M123 436C124 431 126 428 128.5 426" fill="none" stroke="#7A5C1C" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="1.2 1.4"/>
<rect x="100" y="449" width="12" height="8" rx="2" fill="url(#br${u})"/><path d="M106 450L102 396" stroke="#5A2A12" stroke-width="1.6" stroke-linecap="round"/><circle cx="102" cy="396" r="1.8" fill="#F2B64A"/>
<g id="smoke" fill="none" stroke="#FBF7EE" stroke-linecap="round"><path data-amb="smoke:8:0" d="M102 392c-6-12 6-20 0-32s6-20 0-32s6-20 0-30" stroke-width="1.4" opacity=".5"/><path data-amb="smoke:9:3" d="M103 390c7-11-5-19 1-31s-5-19 1-30s-5-18 1-28" stroke-width="1.1" opacity=".42"/><path data-amb="smoke:10:5.5" d="M101 391c-5-10 5-18 0-28s5-18 0-28" stroke-width=".9" opacity=".36"/></g>
<circle cx="176" cy="424" r="40" fill="url(#dg${u})" data-amb="glow:3"/>
<path d="M150 444C153 458 199 458 202 444C193 449 159 449 150 444Z" fill="url(#br${u})"/><path d="M150 444C160 440 192 440 202 444" fill="none" stroke="#F7E7BC" stroke-width="1"/><path d="M168 455L166 458H186L184 455Z" fill="url(#br${u})"/><path d="M176 443.6V439.6" stroke="#2A1A10" stroke-width="1.6" stroke-linecap="round"/>
<g id="diya-flame" data-amb="flicker" style="transform-origin:176px 441px"><path d="M176 414C181 422 182.4 429 176 441C169.6 429 171 422 176 414Z" fill="url(#fl${u})"/><path d="M176 426C178.2 430 178.2 434.4 176 438C173.8 434.4 173.8 430 176 426Z" fill="#FFF8E6"/></g>
<ellipse cx="232" cy="456" rx="16" ry="3.4" fill="url(#br${u})"/><circle cx="232" cy="447" r="9" fill="url(#bd${u})"/><path d="M232 438A4 9 0 0 0 232 456M232 438A4 9 0 0 1 232 456M226 440.4A8.6 9 0 0 0 226 453.6M238 440.4A8.6 9 0 0 1 238 453.6" fill="none" stroke="#1F0E06" stroke-width="1.2" opacity=".55"/><circle cx="229" cy="443.5" r="1.8" fill="#EBCBA8" opacity=".35"/>
<g transform="translate(268 457)"><path d="M-7 0V-24L-1 -35L7 -26V0Z" fill="url(#qz${u})" opacity=".92"/><path d="M-7 -24L-1 -35L1.5 -24ZM1.5 -24L-1 -35L7 -26Z" fill="#FFFFFF" opacity=".5"/><path d="M1.5 -24V0" stroke="#FFFFFF" stroke-width=".8" opacity=".8"/><path d="M-3 -18V-4" stroke="#9FACAA" stroke-width=".6" opacity=".6"/><path d="M-7 0V-24L-1 -35L7 -26V0Z" fill="none" stroke="#8E9C9A" stroke-width=".6" opacity=".7"/></g>
</g>`;
    return `<svg viewBox="0 0 400 500" width="100%" height="100%" role="img" aria-label="Illustration of a sadhak seated in padmasana doing japa with a rudraksha mala, before a small altar with a lit diya">${defs}${aura}${backHair}${torso}${legs}${front}${altar}</svg>`;
  };

  /* ---------------- hero arch: clip (objectBoundingBox) + gold frame (drawn beyond the 400x500 box) ---------------- */
  H.ARCH_BB = 'M0 1V.392C0 .184 .23 .044 .5 .008C.77 .044 1 .184 1 .392V1Z';
  H.archClip = (id) => `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><clipPath id="${id}" clipPathUnits="objectBoundingBox"><path d="${H.ARCH_BB}"/></clipPath></defs></svg>`;
  H.archFrame = () => {
    const P = (d, sw, op, dash) => `<path d="${d}" fill="none" stroke="#B8923A" stroke-width="${sw}" ${op ? `opacity="${op}"` : ''} ${dash ? `stroke-dasharray="${dash}" stroke-linecap="round"` : ''} vector-effect="non-scaling-stroke"/>`;
    const arc = (o) => `M${-o} 500V196C${-o} ${92 - o} ${f1(92 - o * .6)} ${f1(22 - o * .9)} 200 ${f1(4 - o * 1.1)}C${f1(308 + o * .6)} ${f1(22 - o * .9)} ${400 + o} ${92 - o} ${400 + o} 196V500`;
    const fin = `<g fill="none" stroke="#B8923A" stroke-width="1.1" stroke-linecap="round" vector-effect="non-scaling-stroke"><path d="M200 -13.6V-30"/><path d="M200 -52C206 -44 206 -36 200 -30C194 -36 194 -44 200 -52Z"/><path d="M200 -30C194 -35 187 -35 182 -31C187 -26.5 194 -26.5 200 -30ZM200 -30C206 -35 213 -35 218 -31C213 -26.5 206 -26.5 200 -30Z"/></g><circle cx="200" cy="-59" r="1.8" fill="#B8923A"/>`;
    const curl = (x, s) => `<path d="M${x} 196H${x - 14 * s}C${x - 21 * s} 196 ${x - 23 * s} 205 ${x - 17 * s} 209C${x - 12.5 * s} 211 ${x - 9 * s} 206.5 ${x - 11.5 * s} 203" fill="none" stroke="#B8923A" stroke-width="1" stroke-linecap="round" vector-effect="non-scaling-stroke"/><circle cx="${x - 26 * s}" cy="196" r="1.4" fill="#B8923A"/>`;
    return `<svg viewBox="0 0 400 500" width="100%" height="100%" style="overflow:visible" aria-hidden="true">${P(arc(-6), .8, .45)}${P(arc(10), 1.3)}${P(arc(16), .7, .55)}${P(arc(44), 1, .5, '0 5')}${fin}${curl(-10, 1)}${curl(410, -1)}<path d="M-36 500H436" stroke="#B8923A" stroke-width="1.2" vector-effect="non-scaling-stroke"/><path d="M-48 508H448" stroke="#B8923A" stroke-width=".6" opacity=".6" vector-effect="non-scaling-stroke"/></svg>`;
  };

  /* ---------------- floating gemstones (S9). viewBox 0 0 100 100 ---------------- */
  const GC = { amethyst: ['#EBDDEA', '#A88CAB', '#5A4460'], citrine: ['#FCE7A8', '#E0A63A', '#94580F'], quartz: ['#FFFFFF', '#E3EAE8', '#9FACAA'], rose: ['#FFF3F0', '#EDC1BA', '#B97C75'], jade: ['#C4E3C6', '#5E9A6E', '#234F38'], tiger: ['#F2C274', '#A2672F', '#472911'], pyrite: ['#F4E4A8', '#B99B52', '#5A4820'], garnet: ['#E08A92', '#8C2632', '#3A0B12'] };
  const pt = (cx, by, w, h, t, rot, c, clear) => {
    const x0 = -w / 2, x1 = -w / 6, x2 = w / 6, x3 = w / 2, tx = w * .06, ty = -h - t;
    const L = `M${f1(x0)} 0L${f1(x1)} ${f1(w * .06)}L${f1(x1)} ${f1(-h)}L${f1(tx)} ${f1(ty)}L${f1(x0)} ${f1(-h + w * .1)}Z`;
    const Mi = `M${f1(x1)} ${f1(w * .06)}L${f1(x2)} ${f1(w * .04)}L${f1(x2)} ${f1(-h - w * .04)}L${f1(tx)} ${f1(ty)}L${f1(x1)} ${f1(-h)}Z`;
    const Rt = `M${f1(x2)} ${f1(w * .04)}L${f1(x3)} 0L${f1(x3)} ${f1(-h + w * .06)}L${f1(tx)} ${f1(ty)}L${f1(x2)} ${f1(-h - w * .04)}Z`;
    const op = clear ? ' opacity=".88"' : '';
    return `<g transform="translate(${cx} ${by}) rotate(${rot})"><path d="${L}" fill="${c[2]}"${op}/><path d="${Mi}" fill="${c[1]}"${op}/><path d="${Rt}" fill="${c[0]}"${op}/><path d="M${f1(x1)} ${f1(-h)}L${f1(tx)} ${f1(ty)}L${f1(x2)} ${f1(-h - w * .04)}Z" fill="#FFFFFF" opacity=".28"/><path d="M${f1(x2)} ${f1(w * .04)}V${f1(-h - w * .04)}L${f1(tx)} ${f1(ty)}" fill="none" stroke="#FFFFFF" stroke-width=".9" stroke-linejoin="round" opacity=".6"/>${clear ? `<path d="M${f1(x1 + 1.5)} ${f1(-h * .2)}V${f1(-h * .78)}" stroke="#FFFFFF" stroke-width="1.2" opacity=".7"/>` : ''}</g>`;
  };
  const blob = (r) => `M${-r} 0C${-r} ${f1(-r * .62)} ${f1(-r * .5)} ${f1(-r * .95)} ${f1(r * .05)} ${f1(-r * .9)}C${f1(r * .62)} ${f1(-r * .86)} ${r} ${f1(-r * .45)} ${f1(r * .98)} ${f1(r * .05)}C${f1(r * .96)} ${f1(r * .6)} ${f1(r * .5)} ${f1(r * .9)} ${f1(-r * .05)} ${f1(r * .88)}C${f1(-r * .62)} ${f1(r * .86)} ${-r} ${f1(r * .5)} ${-r} 0Z`;
  H.GEMS = Object.keys(GC).concat(['rudraksha']);
  H.gem = (k, u) => {
    u = (u || 'g') + k; const c = GC[k] || GC.quartz;
    const G = (id) => `<radialGradient id="${id}" cx=".34" cy=".3" r=".8"><stop offset="0" stop-color="${c[0]}"/><stop offset=".55" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></radialGradient>`;
    let s = '';
    if (k === 'amethyst') s = pt(34, 82, 18, 40, 13, -16, c) + pt(66, 84, 16, 34, 11, 18, c) + pt(50, 88, 24, 54, 16, 2, c);
    else if (k === 'citrine') s = pt(50, 90, 30, 52, 20, 8, c);
    else if (k === 'quartz') s = pt(42, 88, 18, 44, 14, -10, c, 1) + pt(56, 90, 24, 56, 18, 6, c, 1);
    else if (k === 'pyrite') { const cube = (x, y, a) => `<g transform="translate(${x} ${y})"><path d="M0 ${-a}L${f1(a * .87)} ${f1(-a / 2)}L0 0L${f1(-a * .87)} ${f1(-a / 2)}Z" fill="${c[0]}"/><path d="M${f1(-a * .87)} ${f1(-a / 2)}L0 0V${a}L${f1(-a * .87)} ${f1(a / 2)}Z" fill="${c[1]}"/><path d="M${f1(a * .87)} ${f1(-a / 2)}L0 0V${a}L${f1(a * .87)} ${f1(a / 2)}Z" fill="${c[2]}"/><path d="M${f1(-a * .6)} ${f1(-a * .1)}L${f1(-a * .6)} ${f1(a * .55)}M${f1(-a * .3)} ${f1(a * .05)}V${f1(a * .72)}M${f1(a * .45)} ${f1(a * .02)}V${f1(a * .66)}" stroke="#FFF6CC" stroke-width=".6" opacity=".5"/></g>`; s = cube(38, 60, 18) + cube(62, 52, 24); }
    else if (k === 'garnet') { let f = ''; for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, b = ((i + 1) / 8) * Math.PI * 2, P = (r, t) => `${f1(50 + r * Math.cos(t))} ${f1(50 + r * Math.sin(t))}`; f += `<path d="M${P(18, a)}L${P(36, (a + b) / 2)}L${P(18, b)}Z" fill="#FFFFFF" opacity="${i % 2 ? .08 : .22}"/><path d="M${P(36, (a + b) / 2)}L${P(36, b + (b - a) / 2 - (b - a))}" stroke="none"/>`; } s = `<defs>${G('gr' + u)}</defs><circle cx="50" cy="50" r="36" fill="url(#gr${u})"/><path d="${[...Array(8)].map((_, i) => { const t = (i / 8) * Math.PI * 2 + Math.PI / 8; return (i ? 'L' : 'M') + f1(50 + 18 * Math.cos(t)) + ' ' + f1(50 + 18 * Math.sin(t)); }).join('')}Z" fill="#FFFFFF" opacity=".16" stroke="#FFFFFF" stroke-width=".6" stroke-opacity=".4"/>${f}<circle cx="50" cy="50" r="36" fill="none" stroke="#FFFFFF" stroke-width=".8" opacity=".35"/><ellipse cx="38" cy="34" rx="9" ry="5" fill="#FFFFFF" opacity=".45" transform="rotate(-30 38 34)"/>`; }
    else if (k === 'rudraksha') { let m = ''; [[-62], [-26], [10], [46]].forEach(([th]) => { const rx = Math.abs(Math.sin((th * Math.PI) / 180)) * 30; m += `<path d="M50 20A${f1(rx)} 30 0 0 ${th > 0 ? 1 : 0} 50 80" fill="none" stroke="#1F0E06" stroke-width="2.6" opacity=".7"/>`; }); const R = M.rng('rgem' + u); let t = ''; for (let i = 0; i < 40; i++) { const a = R() * Math.PI * 2, d = Math.sqrt(R()) * 28; t += `<circle cx="${f1(50 + Math.cos(a) * d)}" cy="${f1(50 + Math.sin(a) * d)}" r="${f1(.8 + R() * 1.6)}" fill="${R() < .5 ? '#2A1409' : '#D8A274'}" opacity=".22"/>`; } s = `<defs>${G('rg' + u).replace(c[0], '#C8925F').replace(c[1], '#7C4B2B').replace(c[2], '#3A1F0D')}<clipPath id="rc${u}"><circle cx="50" cy="50" r="30"/></clipPath></defs><circle cx="50" cy="50" r="30" fill="url(#rg${u})"/><g clip-path="url(#rc${u})">${t}${m}</g><ellipse cx="50" cy="21.5" rx="4" ry="2" fill="#1F0E06" opacity=".7"/><ellipse cx="40" cy="36" rx="8" ry="4.5" fill="#FFFFFF" opacity=".16" transform="rotate(-30 40 36)"/>`; }
    else { let extra = ''; if (k === 'tiger') for (let j = -2; j <= 2; j++) extra += `<path d="M-34 ${j * 11 + 4}Q0 ${j * 11 - 12} 34 ${j * 11 + 4}" fill="none" stroke="${j % 2 ? '#2F1B0B' : '#F6D08A'}" stroke-width="${j % 2 ? 3.4 : 1.6}" opacity=".45"/>`; if (k === 'jade') extra = `<circle cx="-10" cy="8" r="9" fill="#234F38" opacity=".22"/><circle cx="12" cy="-6" r="6" fill="#C4E3C6" opacity=".3"/>`; if (k === 'rose') extra = `<ellipse cx="6" cy="8" rx="16" ry="10" fill="#FFFFFF" opacity=".22"/>`; s = `<defs>${G('tb' + u)}<clipPath id="tc${u}"><path d="${blob(34)}"/></clipPath></defs><g transform="translate(50 52) rotate(-14)"><path d="${blob(34)}" fill="url(#tb${u})"/><g clip-path="url(#tc${u})">${extra}</g><ellipse cx="-12" cy="-16" rx="11" ry="6" fill="#FFFFFF" opacity=".5" transform="rotate(-24 -12 -16)"/></g>`; }
    if (k === 'amethyst' || k === 'citrine' || k === 'quartz') s += `<path d="M22 90C34 94 66 94 78 90" fill="none" stroke="${c[2]}" stroke-width="3" stroke-linecap="round" opacity=".55"/>`;
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">${s}</svg>`;
  };

  /* ---------------- category art for Havan and Copper (4:5, matches M.artSvg framing) ---------------- */
  H.catArt = (k, u) => {
    u = u || 'ca';
    const SH = `<radialGradient id="cs${u}"><stop offset="0" stop-color="#0E3B30" stop-opacity=".28"/><stop offset="1" stop-color="#0E3B30" stop-opacity="0"/></radialGradient>`;
    if (k === 'havan') {
      const R = M.rng('havan' + u); let g = '';
      for (let i = 0; i < 110; i++) { const a = R() * Math.PI, d = Math.sqrt(R()), x = 200 + Math.cos(a + Math.PI) * d * 104 * (R() < .5 ? 1 : -1) * .98, yy = 262 - Math.sin(a) * d * 70 * (1 - Math.abs(x - 200) / 150); const cc = ['#2E1F14', '#6B4A2E', '#8A6A3E', '#4A3322', '#5E7A3E', '#A0522D'][Math.floor(R() * 6)]; g += `<ellipse cx="${f1(x)}" cy="${f1(yy)}" rx="${f1(1.4 + R() * 3)}" ry="${f1(1 + R() * 1.8)}" fill="${cc}" opacity="${f1(.6 + R() * .4)}" transform="rotate(${Math.floor(R() * 180)} ${f1(x)} ${f1(yy)})"/>`; }
      return `<svg viewBox="0 0 400 500" width="100%" height="100%" role="img" aria-label="Brass bowl heaped with Bitter Havan samagri"><defs>${SH}<linearGradient id="hb${u}" x1="0" x2="1"><stop offset="0" stop-color="#6E521C"/><stop offset=".3" stop-color="#C9A24E"/><stop offset=".5" stop-color="#F1D894"/><stop offset=".72" stop-color="#B8923A"/><stop offset="1" stop-color="#6E521C"/></linearGradient><clipPath id="hc${u}"><path d="M92 262C104 206 150 184 200 182C252 184 296 206 308 262C286 274 244 278 200 278C156 278 114 274 92 262Z"/></clipPath></defs>
<ellipse cx="200" cy="380" rx="136" ry="17" fill="url(#cs${u})"/>
<path d="M84 262C88 332 140 368 200 368C260 368 312 332 316 262Z" fill="url(#hb${u})"/><path d="M104 300C140 318 260 318 296 300M114 322C148 338 252 338 286 322" fill="none" stroke="#7A5C1C" stroke-width="1.2" opacity=".75"/><g fill="#7A5C1C" opacity=".7">${[130, 165, 200, 235, 270].map((x) => `<circle cx="${x}" cy="${x === 200 ? 314 : x === 165 || x === 235 ? 312 : 306}" r="2.2"/>`).join('')}</g>
<path d="M182 368L176 384H224L218 368Z" fill="url(#hb${u})"/><ellipse cx="200" cy="385" rx="30" ry="5" fill="#6E521C"/>
<ellipse cx="200" cy="262" rx="116" ry="21" fill="#D9B96A" stroke="#7A5C1C" stroke-width="1"/><ellipse cx="200" cy="262" rx="105" ry="16" fill="#3A2A16"/>
<path d="M92 262C104 206 150 184 200 182C252 184 296 206 308 262C286 274 244 278 200 278C156 278 114 274 92 262Z" fill="#4A3322"/><g clip-path="url(#hc${u})">${g}</g>
<path d="M150 214C160 206 176 204 188 208C178 216 162 218 150 214Z" fill="#6E7A3E"/><path d="M226 204C238 200 252 204 258 212C246 214 234 212 226 204Z" fill="#5E6A34"/><path d="M204 196L232 236" stroke="#6B4226" stroke-width="5" stroke-linecap="round"/>
</svg>`;
    }
    const nag = (x, y, s, id) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="6" rx="44" ry="12.5" fill="#3E2514"/><ellipse cx="0" cy="0" rx="40" ry="11" fill="none" stroke="url(#cu${id})" stroke-width="6"/><ellipse cx="2" cy="-7" rx="38" ry="10.4" fill="none" stroke="url(#cu${id})" stroke-width="6"/><ellipse cx="0" cy="-14" rx="36" ry="10" fill="none" stroke="url(#cu${id})" stroke-width="6"/><path d="M-30 -18C-10 -24 12 -22 26 -14" fill="none" stroke="#F6CDA6" stroke-width="1.1" opacity=".7"/>
<path d="M22 -16C30 -40 -14 -84 -2 -130C4 -154 8 -168 2 -182" fill="none" stroke="url(#cu${id})" stroke-width="6" stroke-linecap="round"/><path d="M20 -18C27 -40 -12 -84 0 -130" fill="none" stroke="#F6CDA6" stroke-width="1" opacity=".6"/>
<path d="M2 -176C-18 -182 -34 -204 -32 -226C-30 -246 -14 -258 2 -260C18 -258 34 -246 36 -226C38 -204 22 -182 2 -176Z" fill="url(#ch${id})"/><path d="M2 -184C-12 -190 -22 -206 -21 -222M2 -184C16 -190 26 -206 25 -222M-16 -236C-6 -244 10 -244 20 -236M-12 -224C-4 -230 8 -230 16 -224" fill="none" stroke="#5A2A12" stroke-width="1.3" opacity=".6"/><path d="M-6 -214L2 -198L10 -214" fill="none" stroke="#5A2A12" stroke-width="1.2" opacity=".6"/><circle cx="-7" cy="-230" r="1.8" fill="#5A2A12"/><circle cx="11" cy="-230" r="1.8" fill="#5A2A12"/></g>`;
    const grad = (id) => `<linearGradient id="cu${id}" x1="0" x2="1"><stop offset="0" stop-color="#6A3216"/><stop offset=".25" stop-color="#B8683D"/><stop offset=".45" stop-color="#F2BE92"/><stop offset=".6" stop-color="#C87A4A"/><stop offset="1" stop-color="#6E3418"/></linearGradient><radialGradient id="ch${id}" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#F4C49A"/><stop offset=".45" stop-color="#C47548"/><stop offset="1" stop-color="#6E3418"/></radialGradient>`;
    return `<svg viewBox="0 0 400 500" width="100%" height="100%" role="img" aria-label="Three hand-energized copper nag"><defs>${SH}${grad(u)}</defs><ellipse cx="200" cy="396" rx="150" ry="16" fill="url(#cs${u})"/>${nag(118, 356, .78, u)}${nag(284, 350, .74, u)}${nag(200, 390, 1, u)}</svg>`;
  };

  /* ---------------- video content [confirm: titles, durations and dates come from the client's channel] ---------------- */
  H.VCATS = [['all', 'All', 'सभी'], ['pravachan', 'Pravachan', 'प्रवचन'], ['sadhana', 'Sadhana', 'साधना'], ['remedies', 'Remedies', 'उपाय'], ['qa', 'Q&A', 'प्रश्नोत्तर']];
  H.VCAT = Object.fromEntries(H.VCATS.map(([k, en, hi]) => [k, { en, hi }]));
  H.VIDEOS = [
    { id: 'v1', cat: 'pravachan', en: 'Why sadhana is a science, not superstition', hi: ['साधना विज्ञान है,', 'अंधविश्वास नहीं'], dur: '18:42', date: '14 Sep 2026', motif: 'portrait', desc: 'Why mantra, time and niyam behave like a method you can test, and why fear has no place in it.' },
    { id: 'v2', cat: 'remedies', en: 'How to identify an original Nepali Rudraksha', hi: ['असली नेपाली रुद्राक्ष', 'कैसे पहचानें'], dur: '11:05', date: '2 Sep 2026', motif: 'bead', desc: 'Six checks you can do at home, from mukhi lines to the X-ray certificate, and the water test that proves nothing.' },
    { id: 'v3', cat: 'sadhana', en: 'Baglamukhi sadhana: who should begin, and when', hi: ['बगलामुखी साधना:', 'किसे और कब'], dur: '24:10', date: '21 Aug 2026', motif: 'yantra:baglamukhi', desc: 'The niyam, the muhurat and the kind of seeker this sadhana suits, explained before anyone enrolls.' },
    { id: 'v4', cat: 'remedies', en: 'Wearing a kavach: the rules most people miss', hi: ['कवच धारण के', 'नियम'], dur: '9:32', date: '9 Aug 2026', motif: 'amulet', desc: 'Which day to wear it, what to recite, and when a kavach should be taken off.' },
    { id: 'v5', cat: 'qa', en: 'Seekers ask: Sade Sati, Manglik and fear', hi: ['साढ़ेसाती, मांगलिक', 'और डर'], dur: '32:18', date: '27 Jul 2026', motif: 'chart', desc: 'Live questions answered plainly: what these periods mean, and what they do not.' },
    { id: 'v6', cat: 'pravachan', en: 'The meaning of a diya at dusk', hi: ['संध्या दीप', 'का अर्थ'], dur: '7:48', date: '12 Jul 2026', motif: 'diya', desc: 'A short discourse on sandhya, the lamp and the quiet minute that changes an evening.' },
    { id: 'v7', cat: 'sadhana', en: 'Kali sadhana is not for everyone. Here is why.', hi: ['काली साधना', 'सबके लिए नहीं'], dur: '21:36', date: '28 Jun 2026', motif: 'yantra:kali', desc: 'Why this sadhana is offered only after a personal conversation, and what it asks of a seeker.' },
    { id: 'v8', cat: 'qa', en: 'Does a gemstone really work? Seekers ask', hi: ['क्या रत्न सच में', 'काम करते हैं?'], dur: '26:04', date: '14 Jun 2026', motif: 'gem', desc: 'When a stone helps, when it does not, and why a mantra usually comes first.' },
    { id: 'v9', cat: 'remedies', en: 'Bitter Havan at home: the correct method', hi: ['घर में कड़वा हवन', 'सही विधि'], dur: '8:15', date: '31 May 2026', motif: 'havan', desc: 'The day, the time, the quantity and the one mistake that fills a house with smoke.' },
    { id: 'v10', cat: 'pravachan', en: 'Mantra and the restless mind', hi: ['मंत्र और', 'चंचल मन'], dur: '15:50', date: '17 May 2026', motif: 'chakra', desc: 'Why japa settles the mind, and how to begin when you cannot sit still for five minutes.' },
    { id: 'v11', cat: 'sadhana', en: 'Hanuman sadhana for fear at night', hi: ['रात के डर के लिए', 'हनुमान साधना'], dur: '19:22', date: '3 May 2026', motif: 'yantra:hanuman', desc: 'A disciplined practice for seekers troubled by fear and disturbed sleep.' },
    { id: 'v12', cat: 'qa', en: 'Palmistry questions: the fate line and the marriage line', hi: ['भाग्य रेखा और', 'विवाह रेखा'], dur: '28:40', date: '19 Apr 2026', motif: 'palm', desc: 'Seekers send palm photos and Sadhak Ji reads them live, line by line.' }
  ];
  H.SHORTS = [
    { id: 's1', en: 'One mantra for a restless mind', hi: ['चंचल मन के लिए', 'एक मंत्र'], dur: '0:48', motif: 'chakra' },
    { id: 's2', en: 'Where to keep the 12 Nag set', hi: ['12 नाग', 'कहाँ रखें'], dur: '0:41', motif: 'nag' },
    { id: 's3', en: 'The rudraksha water test is a myth', hi: ['रुद्राक्ष का', 'पानी टेस्ट'], dur: '0:55', motif: 'bead' },
    { id: 's4', en: 'Haldi mala or rudraksha mala?', hi: ['हल्दी माला या', 'रुद्राक्ष माला?'], dur: '0:37', motif: 'mala' },
    { id: 's5', en: 'Why Tuesday for Hanuman ji', hi: ['मंगलवार और', 'हनुमान जी'], dur: '0:52', motif: 'yantra:hanuman' },
    { id: 's6', en: 'Lighting the sandhya diya', hi: ['संध्या दीप', 'कैसे जलाएँ'], dur: '0:44', motif: 'diya' }
  ];
  H.SUBS = '1.2 lakh subscribers';
  H.secs = (d) => d.split(':').reduce((a, b) => a * 60 + +b, 0);

  const motif = (m, u) => {
    const [k, v] = String(m).split(':');
    if (k === 'yantra') return [strip(A.yantra(v || 'kali', '#D9B96A', 'th' + u, 1.1)), [-3, -3, 206, 206]];
    if (k === 'bead') return [strip(H.gem('rudraksha', 'th' + u)), [14, 14, 72, 72]];
    if (k === 'gem') return [strip(H.gem('amethyst', 'th' + u)), [10, 10, 80, 84]];
    if (k === 'diya') return [strip(M.diya('th' + u)), [0, 10, 120, 100]];
    if (k === 'chart') return [strip(A.chart(A.DEMO_K, { col: '#D9B96A', ink: '#FBF7EE', sub: '#9FB3AA', fs: 17 })), [-6, -6, 412, 412]];
    if (k === 'palm') return [strip(A.palmArt('#D9B96A', '#E4EEE8', false)), [10, 30, 250, 230]];
    if (k === 'chakra') { const c = A.chakra('#D9B96A'); return [strip(c.outer) + strip(c.middle) + strip(c.inner), [-200, -200, 400, 400]]; }
    if (k === 'amulet') return [strip(M.artSvg(M.byId['a-bagla'], 'main', 'th' + u)), [60, 150, 280, 300]];
    if (k === 'mala') return [strip(M.artSvg(M.byId.m5, 'main', 'th' + u)), [40, 60, 320, 420]];
    if (k === 'havan') return [strip(H.catArt('havan', 'th' + u)), [70, 160, 260, 240]];
    if (k === 'nag') return [strip(H.catArt('copper', 'th' + u)), [40, 100, 320, 320]];
    return [strip(A.portrait('th' + u)), [0, 0, 300, 380]];
  };
  const tsize = (lines, w, max) => Math.min(max, Math.floor(w / (Math.max(...lines.map((l) => [...l].length)) * .5)));
  H.thumb = (v, u, tall) => {
    u = u || v.id;
    const [art, vb] = motif(v.motif, u), cat = H.VCAT[v.cat] || { en: 'Shorts' };
    if (tall) {
      const fs = tsize(v.hi, 150, 22);
      return `<svg viewBox="0 0 180 320" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${v.en}"><defs><radialGradient id="tg${u}" cx=".5" cy=".34" r=".6"><stop offset="0" stop-color="#1C4A3D"/><stop offset="1" stop-color="#0A1F1A"/></radialGradient></defs><rect width="180" height="320" fill="url(#tg${u})"/><g transform="translate(90 112)" opacity=".16">${M.mandala(84, '#D9B96A', .7)}</g>${fit(art, vb, [36, 52, 108, 118])}<text x="16" y="232" font-family="'Tiro Devanagari Hindi',serif" font-size="${fs}" fill="#FBF7EE">${v.hi[0]}</text><text x="16" y="${232 + fs * 1.3}" font-family="'Tiro Devanagari Hindi',serif" font-size="${fs}" fill="#D9B96A">${v.hi[1] || ''}</text><path d="M16 290H164" stroke="#D9B96A" stroke-width=".5" opacity=".5"/><text x="16" y="304" font-family="Manrope,sans-serif" font-size="6.6" font-weight="700" letter-spacing="1.4" fill="#D9B96A">MAA KALI ASTUTI</text></svg>`;
    }
    const fs = tsize(v.hi, 168, 23);
    return `<svg viewBox="0 0 320 180" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${v.en}"><defs><radialGradient id="tg${u}" cx=".76" cy=".5" r=".6"><stop offset="0" stop-color="#1C4A3D"/><stop offset="1" stop-color="#0A1F1A"/></radialGradient></defs><rect width="320" height="180" fill="url(#tg${u})"/><g transform="translate(250 92)" opacity=".14">${M.mandala(96, '#D9B96A', .7)}</g>${fit(art, vb, [196, 22, 110, 140])}<rect x="6.5" y="6.5" width="307" height="167" fill="none" stroke="#D9B96A" stroke-width=".6" opacity=".45"/><text x="22" y="44" font-family="Manrope,sans-serif" font-size="7.6" font-weight="700" letter-spacing="1.8" fill="#D9B96A">${cat.en.toUpperCase()}</text><text x="22" y="${60 + fs}" font-family="'Tiro Devanagari Hindi',serif" font-size="${fs}" fill="#FBF7EE">${v.hi[0]}</text><text x="22" y="${60 + fs * 2.3}" font-family="'Tiro Devanagari Hindi',serif" font-size="${fs}" fill="#D9B96A">${v.hi[1] || ''}</text><path d="M22 146H64" stroke="#D9B96A" stroke-width=".8"/><text x="22" y="160" font-family="Manrope,sans-serif" font-size="6.6" font-weight="700" letter-spacing="1.4" fill="#C9D6CF">SADHAK PAWAN PANDEY</text></svg>`;
  };

  /* ---------------- books [confirm titles] ---------------- */
  H.BOOKS = [
    { key: 'satya', hi: ['साधना के', 'सत्य'], en: 'The Truths of Sadhana', sub: 'Experiences on the path of Shakti', year: '2021', pages: '212 pages · Hindi', tone: ['#164E3F', '#0E3B30', '#0A2A22'], line: 'Accounts from eighteen years of practice: what changed, what did not, and what every seeker should know before beginning.' },
    { key: 'adrishya', hi: ['अदृश्य के', 'अनुभव'], en: 'Encounters with the Unseen', sub: 'Notes from paranormal research', year: '2023', pages: '184 pages · Hindi', tone: ['#10302A', '#0A1F1A', '#06140F'], line: 'Case notes from years of paranormal research, written without sensation and read against the shastras.' },
    { key: 'mantra', hi: ['मंत्र और', 'मन'], en: 'Mantra and the Mind', sub: 'A practical guide to japa', year: '2025', pages: '148 pages · Hindi & English', tone: ['#7A3E1E', '#5E2E14', '#3E1C0B'], line: 'How to begin japa, keep count, choose a mala and carry the practice through ordinary days.' }
  ];
  H.book = (b, u) => {
    u = u || b.key; const [c0, c1, c2] = b.tone;
    const corner = strip(M.corner('#D9B96A'));
    return `<svg viewBox="0 0 240 320" width="100%" height="100%" role="img" aria-label="Book cover: ${b.en} by Sadhak Pawan Pandey"><defs><linearGradient id="bk${u}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></linearGradient><linearGradient id="bs${u}" x1="0" x2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".16"/><stop offset=".12" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient><radialGradient id="bsh${u}"><stop offset="0" stop-color="#0E3B30" stop-opacity=".35"/><stop offset="1" stop-color="#0E3B30" stop-opacity="0"/></radialGradient></defs>
<ellipse cx="124" cy="308" rx="104" ry="9" fill="url(#bsh${u})"/><path d="M36 14H210V298H36Z" fill="#EFE6D2"/><path d="M206 16V296" stroke="#D6C9AE" stroke-width="1"/><path d="M203 17V295M200 18V294" stroke="#E0D4BB" stroke-width=".6"/>
<rect x="22" y="10" width="178" height="290" rx="2" fill="url(#bk${u})"/><rect x="22" y="10" width="16" height="290" fill="${c2}"/><path d="M38 10V300" stroke="#D9B96A" stroke-width=".6" opacity=".6"/><rect x="22" y="10" width="178" height="290" rx="2" fill="url(#bs${u})"/>
<rect x="48" y="24" width="140" height="262" fill="none" stroke="#D9B96A" stroke-width=".8"/><rect x="52" y="28" width="132" height="254" fill="none" stroke="#D9B96A" stroke-width=".4" opacity=".7"/>
<g fill="none" stroke="#D9B96A" stroke-width="1.4" stroke-linecap="round"><g transform="translate(52 28) scale(.42)">${corner}</g><g transform="translate(184 28) scale(-.42 .42)">${corner}</g><g transform="translate(52 282) scale(.42 -.42)">${corner}</g><g transform="translate(184 282) scale(-.42 -.42)">${corner}</g></g>
<g transform="translate(118 78)" fill="none" stroke="#D9B96A" stroke-width="1"><path d="M0 -14C5 -9 5.6 -3 0 4.6C-5.6 -3 -5 -9 0 -14Z"/><path d="M0 4.6C-5 -.6 -11 -2 -17 -1C-15 4.6 -9 6.6 0 4.6ZM0 4.6C5 -.6 11 -2 17 -1C15 4.6 9 6.6 0 4.6Z"/></g>
<text x="118" y="146" text-anchor="middle" font-family="'Tiro Devanagari Hindi',serif" font-size="27" fill="#F6E7BC">${b.hi[0]}</text><text x="118" y="182" text-anchor="middle" font-family="'Tiro Devanagari Hindi',serif" font-size="33" fill="#D9B96A">${b.hi[1]}</text>
<path d="M92 200H144" stroke="#D9B96A" stroke-width=".7"/><text x="118" y="218" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-size="10" fill="#E4EEE8">${b.en}</text>
<text x="118" y="262" text-anchor="middle" font-family="Manrope,sans-serif" font-size="7" font-weight="700" letter-spacing="1.6" fill="#D9B96A">SADHAK PAWAN PANDEY</text></svg>`;
  };

  /* ---------------- satisfaction seal ---------------- */
  H.seal = (u, col, ink) => {
    col = col || '#D9B96A'; ink = ink || col;
    return `<svg viewBox="0 0 120 120" width="100%" height="100%" role="img" aria-label="Satisfaction guarantee seal"><defs><path id="sp${u}" d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1 -90 0"/></defs><circle cx="60" cy="60" r="56" fill="none" stroke="${col}" stroke-width="1"/><circle cx="60" cy="60" r="53" fill="none" stroke="${col}" stroke-width=".5" stroke-dasharray="0 3.2" stroke-linecap="round" opacity=".9"/><circle cx="60" cy="60" r="36" fill="none" stroke="${col}" stroke-width=".8"/><text font-family="Manrope,sans-serif" font-size="7.6" font-weight="700" fill="${ink}"><textPath href="#sp${u}" textLength="278" lengthAdjust="spacing">SATISFACTION GUARANTEE · KUNDALI READING · </textPath></text><g transform="translate(60 58)" fill="none" stroke="${col}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M0 -14C5 -9 5.6 -3 0 4.6C-5.6 -3 -5 -9 0 -14Z"/><path d="M0 4.6C-5 -.6 -11 -2 -17 -1C-15 4.6 -9 6.6 0 4.6ZM0 4.6C5 -.6 11 -2 17 -1C15 4.6 9 6.6 0 4.6Z"/><path d="M-10 13H10"/></g></svg>`;
  };

  /* ---------------- reviews with customer photos (photo placeholders use product art) ---------------- */
  H.PHOTO_REV = [
    { pid: 'nag12', n: 'Meenakshi Iyer', c: 'Chennai', q: 'Arrived in a cloth pouch with a printed vidhi card. We placed the set in the tijori on a Thursday, exactly as the card said.', r: 5, d: '12 Sep 2026' },
    { pid: 'r5', n: 'Harish Chandra Joshi', c: 'Dehradun', q: 'The X-ray certificate matched the five mukhi lines on my bead. Packed with care and energized in my name.', r: 5, d: '3 Sep 2026' },
    { pid: 'b-pyrite', n: 'Pooja Agarwal', c: 'Jaipur', q: 'Beautiful weight and shine. The size guide was right; medium fits my wrist perfectly.', r: 5, d: '28 Aug 2026' }
  ];

  /* ---------------- About: timeline, pillars ---------------- */
  H.TIMELINE = [
    { k: 'career', yr: '2001–2008', dev: '१', t: 'MBA and a career in multinational companies', hi: 'प्रबंधन और कॉर्पोरेट जीवन', d: 'Sadhak Ji studied management and spent his early working years in multinational companies, in roles that ran on targets, reports and deadlines.', note: 'The discipline of those years still shapes how he works: clear reasoning, careful records and plain language.' },
    { k: 'turning', yr: '2008', dev: '२', t: 'The turning point', hi: 'जीवन का मोड़', d: 'A long personal crisis led him to the sadhana he had watched his elders keep. The results he saw in his own life were steady enough to make him ask why.', note: 'He began to treat the practice the way he had treated work: as something to test, record and understand.' },
    { k: 'sadhana', yr: '2008–2016', dev: '३', t: 'Years of sadhana under enlightened mentors', hi: 'गुरुओं के सान्निध्य में साधना', d: 'He left the corporate path and gave himself to sadhana in the Shakta tradition, learning mantra, vidhi and niyam directly from his mentors, one anushthan at a time.', note: 'Maa Kali’s sadhana became the centre of his practice and later gave the platform its name.' },
    { k: 'research', yr: '2012 onwards', dev: '४', t: 'Paranormal research', hi: 'अलौकिक शोध', d: 'Alongside his own practice he began studying paranormal cases brought to his mentors, keeping written notes and reading each one against the shastras.', note: 'This work is behind his insistence that every case is analysed before anything is suggested.' },
    { k: 'founding', yr: '2019', dev: '५', t: 'Founding Maa Kali Astuti', hi: 'माँ काली अस्तुति की स्थापना', d: 'He founded Maa Kali Astuti to offer consultations, sadhana courses and energized products in one honest place, without fear-selling or false promises.', note: 'Every product is energized in Mahapuja before dispatch, and every consultation is read personally.' },
    { k: 'today', yr: 'Today', dev: '६', t: 'Guiding seekers across India', hi: 'आज', d: 'Today he guides seekers by call, video and WhatsApp, teaches six sadhana courses, performs anushthans and shares weekly discourses on YouTube.', note: 'Guidance continues until a seeker’s doubts are resolved. That promise has not changed.' }
  ];
  H.PILLARS = [
    ['question', 'Every answer comes with its reason', 'A prediction is explained through the chart: the dasha, the house and the graha behind it. You should be able to follow the reasoning, not just the result.'],
    ['lotus', 'Remedies begin with discipline', 'Mantra, daan and niyam come first. A rudraksha, stone or kavach is suggested only when it clearly helps, and buying one is never a condition of guidance.'],
    ['shield', 'Honesty over fear', 'No threats of doshas, no urgent rituals. When a ritual is not the right path, you are told so plainly and shown what may help instead.']
  ];
  H.chapter = (k, u) => {
    u = u || k; const G = '#D9B96A', P = (d, w, o) => `<path d="${d}" fill="none" stroke="${G}" stroke-width="${w || 1.3}" stroke-linecap="round" stroke-linejoin="round"${o ? ` opacity="${o}"` : ''} pathLength="1" data-cd=""/>`;
    let s = '';
    if (k === 'career') { s = P('M40 300H260') + P('M64 300V150H112V300M112 300V104H176V300M176 300V176H232V300') + P('M76 170H100M76 192H100M76 214H100M76 236H100M76 258H100M126 124H162M126 148H162M126 172H162M126 196H162M126 220H162M126 244H162M126 268H162M190 196H218M190 220H218M190 244H218M190 268H218', 1, .7) + P('M144 104V80M136 80H152', 1.1) + `<circle cx="226" cy="118" r="16" fill="none" stroke="${G}" stroke-width="1.1" opacity=".7"/>`; }
    else if (k === 'turning') { s = P('M70 300V168A80 80 0 0 1 230 168V300') + P('M88 300V172A62 62 0 0 1 212 172V300', .8, .6) + P('M50 300H250M62 312H238') + fit(strip(M.diya('ch' + u)), [0, 0, 120, 120], [100, 180, 100, 100]); }
    else if (k === 'sadhana') { s = fit(strip(A.yantra('kali', G, 'ch' + u, 1.1)), [-3, -3, 206, 206], [40, 96, 220, 220]); }
    else if (k === 'research') { s = `<path d="M198 92A34 34 0 1 1 164 58A26 26 0 1 0 198 92Z" fill="none" stroke="${G}" stroke-width="1.3" pathLength="1" data-cd=""/>` + P('M150 300C152 260 146 226 132 204M150 300C150 258 160 222 178 200M132 204C112 196 92 200 76 214M132 204C130 186 118 172 100 166M178 200C196 190 218 194 232 208M178 200C182 182 196 170 214 166M150 240C136 236 122 240 112 250M150 236C166 232 180 236 190 246') + P('M100 166V206M84 174V218M214 166V210M230 176V226M118 196V236M200 192V232', .8, .6) + P('M44 300H256') + `<g fill="${G}">${[[70, 90], [104, 64], [236, 132], [252, 76], [56, 140], [122, 112]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" data-amb="twinkle"/>`).join('')}</g>`; }
    else if (k === 'founding') { s = fit(strip(M.logo('ch' + u)), [0, 0, 200, 200], [70, 110, 160, 160]) + P('M150 84V100M150 290V274M76 190H60M224 190H240M98 138L87 127M202 138L213 127M98 242L87 253M202 242L213 253', 1.1, .8); }
    else { const c = A.chakra(G); s = `<g data-spin="" style="transform-origin:150px 196px">${fit(strip(c.outer), [-200, -200, 400, 400], [40, 86, 220, 220])}</g>${fit(strip(c.middle), [-200, -200, 400, 400], [40, 86, 220, 220])}${fit(strip(c.inner), [-200, -200, 400, 400], [40, 86, 220, 220])}`; }
    return `<svg viewBox="0 0 300 380" width="100%" height="100%" aria-hidden="true">${M.stars(10, 300, 200, 'chs' + k)}${s}</svg>`;
  };

  H.QUOTE = 'Welcome to a space where ancient spiritual wisdom meets modern clarity.';
  M.homeReady = true;
})();
