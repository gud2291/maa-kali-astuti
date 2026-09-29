# DESIGN INVENTORY — line-range map of `design/`

Built in F1 from three parallel Explore passes plus grep cross-checks (2026-09-29). All line numbers are 1-based and were verified against the files as committed in F0.
**Rule:** later steps read design files **only by these ranges** (see §H). If a range looks off by a few lines, grep the named member/section first; don't read the whole file.

---

## §0 How the prototype is wired (read once)

- **No `render()` anywhere.** Every `.dc.html` script is `class Component extends DCLogic` and bindings come from **`renderVals()`**. Each `renderVals` returns an early placeholder object while `!s.ready`.
- **Props + defaults** are JSON in the script tag's `data-props="{…}"` attribute (HTML-escaped), on the `<script type="text/x-dc" data-dc-script …>` line.
- **Boot:** `mka-core.js` sets `M = window.MKA`, `M.ready`. `mka-astro.js` polls `M.ready` (20 ms) → sets `M.A`, `M.astroReady`. `mka-home.js` polls `M.astroReady` → sets `M.H`, `M.homeReady`. Pages poll (30 ms) for `astroReady` (Home, About, Videos: `homeReady`), then `MKA.bind(this)` (resize → `vw`, store change → `forceUpdate`). **The extractor (F2) must wait for `M.homeReady`.**
- **Global page CSS** is per page in the helmet `<style>` (not in core): Home.dc.html **16–27** is the canonical copy — box-sizing, paper grain (`feTurbulence` data-URI on `body`, bg `#FBF7EE`), `a` colours `#164E3F` / hover `#1C6B54`, `:focus-visible` 2px `#B8923A` offset 2, `::selection` `#D9B96A` on `#0E3B30`, reduced-motion kill. Shop 14–24 adds `scroll-behavior:auto!important` to the reduced-motion block (use that superset).
- **Fonts** (helmet line 11–12 in every page): Fraunces (ital, opsz 9–144, wght 300–600, SOFT 0–100), Manrope 400–700, Mukta, Tiro Devanagari Hindi.
- **Motion engine in core** handles only `data-amb` and `data-reveal` (MutationObserver, 80 ms debounce). `data-mask`, `data-ln`, `data-fade`, `data-px`, `data-depth`, `data-count`, `data-rot` are driven **locally** by page scripts (mostly Home). See §E.
- **Hindi:** only Home, SiteChrome, ProductCard and SiteFooter (toggle underline only) switch on `M.lang()`. **Every other page is English copy with static Devanagari subtitles** — the HI message files need a full translation pass for those pages (flag `[HI review]`).
- **Hash params** are read with `M.hashParams()` (core 27). Some pages listen to `hashchange`, some read once (see §C).
- **Placeholder WhatsApp** `+91 90000 12345` / `wa.me/919000012345` is hard-coded in SiteChrome, SiteFooter, Shop, InquiryForm, Home (260, 906, 926).

---

## §A File → section → lines

Background key: **ivory** `#FBF7EE` · **sand** `#F4EDDD` · **night** `#0A1F1A` · **emerald** `#164E3F` / deep `#0E3B30` · card `#FFFDF8`.

### A.1 Home.dc.html (1483 lines)

| Part | Lines |
|---|---|
| helmet (fonts 11–12, scripts 13–15, global `<style>` 16–27) | 10–28 |
| template body / `<main id="main">` | 29–937 / 31–935 |
| SiteChrome `active="home"` | 30 |
| hidden `{{ archClip }}` (hero clipPath) | 32 |
| SiteFooter `newsletter="off"` | 936 |
| script / class | 939–1481 / 940–1480 |

**Sections** (§ numbers are the ones PROGRESS uses; `data-screen-label` in quotes):

| § | Section | Template | Bg | Script bindings / methods |
|---|---|---|---|---|
| 1 | "01 Hero" (incl. mobile **Quick actions** 169–181) | 34–184 | ivory | vHero 1393–1425 · L 1366–1382 · startProg 993–1000 · syncProg 1001 · goSlide 1002–1010 · revealSlide 1011–1015 · initPandit 1016–1025 · visChange 1026 · blinkLater/blink 1027–1028 · malaStep 1029–1036 · gaze 1037–1043 · qaAnim 1044–1049 · frame 982–990 |
| 2 | Trust marquee (aria `{{ marqLabel }}`) | 186–195 | sand band | vHero `marqLabel` 1420, `marqRef` 1421–1422, `marq` 1423 |
| 3 | "02 Categories" (arches) | 197–239 | ivory | vCats 1426–1448 |
| 4 | "03 Bestsellers" (tabs + grid) | 241–272 | ivory + top hairline | vBest 1449–1459 · switchTab 1052–1058 · bestList 1059–1065 |
| 5 | "04 Featured 12 Nag" | 274–344 | sand + copper hairlines | vSpot 1460–1479 · spotAdd 1068–1079 |
| 6 | "05 Daily Rashifal" (wheel / mobile dial) | 346–435 | night | vRashi 1163–1187 · boot 1082–1086 · teardown 1087 · updated 1088–1095 · rHeld/rHoldNow 1097–1098 · rTick 1099–1103 · rStep 1104 · rGo 1105–1109 · rRotate 1110–1115 · rWatch 1116 · L2 1149–1161 |
| 7 | "06 Kundali and Love Calculator" | 437–560 | sand | vTools 1188–1215 · kSubmit 1118–1129 · kSet 1130 · lOk/lClear 1132–1133 · lCalc 1134–1147 · lReset 1148 |
| 8 | "07 Consultations" (bento + how-it-works) | 562–620 | ivory | vBento 1216–1232 |
| 9 | "08 Shop by intention" (floating stones) | 622–645 | sand | vIntent 1233–1247 (`stMove` 1242) |
| 10 | "09 Sadhana courses" (track) | 647–686 | night | vCourses 1301–1312 · initTrack 1276–1282 · L3 1249–1260 |
| 11 | "10 Rituals and Anushthan" | 688–719 | ivory | vRituals 1313–1319 · frame2 1269–1275 |
| 12 | "11 About Sadhak Ji" | 721–761 | sand | vAbout 1320–1327 · afterReady2 1261–1264 · count 1265–1268 |
| 13 | "12 YouTube discourses" (+ Shorts) | 763–839 | night | vVideo 1328–1345 · vStart 1283–1291 · vTick/vPause/vPick 1292–1294 · svOpen 1295–1298 · svClose 1299 · teardown2 1300 |
| 14 | "13 Testimonials and reviews" | 841–868 | ivory | vTesti 1346–1353 |
| 15 | "14 Journal" | 870–892 | sand | vBlog 1354–1357 |
| 16 | "15 FAQ" (FaqList `set="home"`) | 894–911 | ivory | L3 1258 |
| 17 | Newsletter (aria "Newsletter") | 913–933 | emerald | vNews 1358–1365 |

Sub-blocks worth knowing:
- **§1 Hero:** mandala bg 35 · art column 37–55 (`artRef` 38–53; arch night panel 39–48: `heroSky` 41, chakra rings 42–46, `pandit` 47; `archFrame` 49; `heroGems` 50–52; bottom fade 54) · text column 57–182 (slides: EN1 59–73, HI1 74–88, EN2 89–103, HI2 104–118, EN3 119–133, HI3 134–148; controls 151–159: counter 152, progress `progRef` 153, prev/toggle/next 155–157; trust row 161–167; quick actions 169–181).
- **§3:** header 199–218 (EN mask 200–206, HI mask 207–213, intro + Shop all 214–217) · arch grid/rail 219–237 (card 221–235: fill 223, art lift 225, hover gem 226, CTA 227, names 231/232).
- **§4:** heading 244–248 · tablist 249–253 · grid `gridRef` 255–267 (ProductCard 256–258; WhatsApp "Not sure?" tile 259–266) · view-all 268–270.
- **§5:** gallery 276–296 ("12" `twelveRef` 277–279, thumbs 281–285, main image 287–289, note 290–293) · info 297–342 (heading 298–302, rating 303–307, badges 308–310, desc 311, benefits 312–319, price 320–325, stock + muhurat 326, qty/Add/Buy/Wish 327–336, ideal-for 337–340, PDP link 341).
- **§6:** sky 347 · mandala 348 · header 350–359 · desktop `L.rFull` 361–407 (wheel `wheelRef` 364–371: nak 366, graha 367, rashi `data-rot` 368, centre 369, pointer 370; controls 372–376; panel `panelRef` 378–405: tabs 379–381, glyph/name 382–385, text 386, meters 387–391, lucky 392–396, remedy 397–400, CTAs 401–404) · mobile `L.rDial` 409–433 (dial 410–419, rail 420–428, dots 429–431, CTA 432).
- **§7:** header 439–446 · **Kundali mini** 449–519 (emerald; form 467–500: place combobox 485–497; chart `kChartRef` 503, gen overlay 504, ready facts 506–514) · **Love** 521–557 (stage `lStageRef` 527–536: ring `[data-ring]` 531, medallions 533/534, `%` 535; live region 537; result 538–543; form 544–555).
- **§8:** header 564–574 · bento 575–607 (Kundali tile 576–592: `bChart` 577 static, `bSeal` 578; tiles 593–606) · how-it-works 608–618.
- **§9:** stones layer `stonesRef` 623–625 · heading 627–631 · intent chips 632–636 · line 637 · products `intGridRef` 638–642 · CTA 643.
- **§10:** sky 648 · copy 650–662 (₹50,000 box 657–660) · track `trackRef` 664–679 (yantra 669) · prev/next 680–683.
- **§11:** sticky thali 690–696 (halo `glow:5` 692, thali 693) · heading 698–701 · process `procRef` 702–711 (track 703, fill `procFillRef` 704, steps 705–710) · ethics quote 712–715 · CTA 716.
- **§12:** text 723–747 (mini timeline 729–733, stats `statsRef` 734–738, book 739–742, CTAs 743–746) · art 748–759 (portrait 749–753, quote 754–758 — hard-coded copy of `H.QUOTE`).
- **§13:** header + subscribe 766–775 · Shorts stories row (mobile) 776–785 · featured 787–812 (idle 790–795, playing 796–805: bar `vBarRef` 800, time `vTimeRef` 801; meta 807–811) · up-next 813–824 · **Shorts viewer dialog** 827–838 (segments `[data-sg]` 831, tap zones 832/833, close 834).
- **§14:** header 843–852 · masonry / mobile rail 853–866 (photo 856, video 857).
- **§15:** header 872–878 · grid 879–890 (featured 880–883, list 884–889). All links `soonJournal`.
- **§16:** sticky column 896–908 (WhatsApp card 902–907) · FaqList 909.
- **§17:** mandala 914 · form 921–929 · done 930.

Script scaffolding: state 941–943 · componentDidMount 944–952 · componentWillUnmount 953–961 · obs 962 · componentDidUpdate 963 · afterReady 966–980 · maskIn 981 · fallback 1383 · fallback2 1162 · **renderVals 1384–1392**.
Inline data in script: gem table `G` 1395 · `tr` trust row 1411 · `qa` 1414–1419 · cats `D` 1427–1433, `AR` 1434 · best ids 1061 · tabs `T` 1450 · spot photos 1461, badges 1467, benefits 1468, ideal-for 1477 · `rTabs` 1181 · bento palettes 1218–1219, tiles 1225–1229 · intent `LINE` 1236, stones mobile 1237 / desktop 1238 · about `mini` 1322, `stats` 1323 · testimonial order 1349–1350.

### A.2 SiteChrome.dc.html (566)

helmet 10–13 · template 14–388 · script 390–564 (props on 390) · class 391–563.
**Props:** `active` (shop|cart|home|consult|kundali|rashifal|courses|rituals|videos|about|"" — default `shop`) · `mode` full|checkout · `backHref` / `backLabel` / `secureLabel` (checkout header) · `tabbar` on|off · `fabLift` (default `88px`, applies only on mobile with `tabbar=off`).

| Block | Lines | Bindings |
|---|---|---|
| Skip link | 15 | |
| Fixed top wrapper (`topY` −32px when stuck, 380 ms) | 17–166 | 463–465 |
| Announcement bar 32px (rotator 21–27; WhatsApp + EN/हिं 28–37, ≥768) | 18–40 | 446–447, 466–470 |
| Full header (≥1180): logo 45–51, nav 52–61, icons 62–67 (cart `data-cart-target/badge` 66) | 42–70 | 471–481 |
| Compact header 56px (<1180): menu 74, logo 75, search 77, cart 78 | 72–81 | |
| Checkout header 64px | 83–91 | |
| **Shop mega menu** (grid 95–139: rudraksha 96–105, bracelets 106–111, amulets 112–116, havan+copper 117–124, "Not sure?" 125–130, featured 12 Nag 131–138; intention chips 140–143) | 93–145 | 475–490 |
| Consult mega menu (4 service cards + guarantee) | 147–165 | 491 |
| **Full-screen night menu** (mandala `spin:180` 170, lang chips 175–178, links `data-mi` 179–186, CTAs 192–195) | 168–197 | 498–500 |
| **Search overlay** (input 206–209; trending 212–217, recent 218–221; results 224–239) | 199–242 | 455–458, 501–508, `saveQ` 562 |
| Cart backdrop / **Cart drawer** (header 246–249; free-ship 250–256; empty kalash+diya 257–264; lines 267–285; upsell 286–297; coupon 298–310; footer 312–321) | 244 / 245–323 | 509–536 |
| **Bottom tab bar** (<768; chakra `spin:24` 330–332; cart 333) | 325–337 | 537–538 |
| WhatsApp FAB (`pulse:8` ring 340) | 339–342 | 539 |
| Back-to-top ring (≥768, y>700) | 343–348 | 540–541 |
| Toast host (`aria-live`) | 350–359 | 427–436, 542–549 |
| **Quick-add sheet** (product 365–369, S/M/L 374–378, size guide 379–384, Add 385) | 361–387 | 550–559 |

Script: state 392 · componentDidMount 393–407 (ann interval 406, rAF scroll 402, Esc 404, `fx.pageIn` 398) · willUnmount 408 · didUpdate 409–413 (scroll lock 410) · scrolled 414–420 · onUi 421–426 · toast 427–431 · dismiss 432–436 · closeAll 437 · **renderVals 438–561** (EN/HI `T` 443–445; `annEn`/`annHi` 446/447).

### A.3 SiteFooter.dc.html (118)

helmet 10–13 · template `<footer>` 14–76 · script 78–116 (props on 78) · class 79–115 · state 80 · didMount/willUnmount 81–85 · `sub()` newsletter 86 · renderVals 87–114 (stars 92, constellations 93–94, `cols` 102–108, social 109, pay 110, lang 111–112).
**Props:** `tabbar` on|off (72px mobile bottom padding) · `newsletter` on|off.
Blocks: sky + constellations 15 · mandala 680px `spin:180` 16 · shooting star `shoot:12:2` 17 · brand row 20–26 · newsletter 27–37 · gold divider 40 · link columns 42–56 (loop 43–48, Contact 49–55) · bottom bar 58–70 (social 59–61, payments 62–64, EN/हिंदी 65–69) · shloka + © 71–74. **No HI copy** except the toggle.

### A.4 ProductCard.dc.html (141)

helmet 10–13 · template 14–75 · script 77–139 (props on 77) · class 78–138 · state 79 · uid 80 · didMount/willUnmount 81–85 · **doAdd 86–98** · renderVals 99–137 (badges 106–107, **EN/HI `T` 108**, return 110–136).
**Props:** `pid` (default `b-pyrite`) · `size` std|compact|row (there is no "card" value; std/compact = card layout, title 19 vs 16px) · `mode` shop|wish.
Blocks: row layout 14–24 · card layout 25–75 (media 27–53: main 29, hover crossfade 30, gold ring 31, badges 33–37, heart 38, quick-add bar 39–49 (size chips 41–46, add button 47), mobile "+" 50–52; info 54–73: cat + rating 55–58, title 59, intent 60, price 61–65, stock 66, wish actions 67–72).

### A.5 Shop.dc.html (386)

helmet 10–25 (global `<style>` 14–24) · template 26–236 · script 238–384 (props on 238: `demo` live|loading|empty) · class 239–383.
Script: state 240 · didMount 241–247 (parse, 650 ms loading, hashchange) · willUnmount 248 · didUpdate 249–255 (grid stagger 251, scroll lock, sheet slide 254) · parse 256–260 · pushHash 261–267 · change 268–270 · toggleIn 271 · toPos/toVal 272–273 · drag* 274–281 · keyPrice 282–286 · base 287 · **results 288–296** (filter 291–293, sort 294) · **renderVals 297–382** (breakpoints 300–301, head 305–307, art 308–312, tabs 313–314, subs 315–318, filter groups 320–330, price 331–332, active chips 333–341, cells 343–346, sorts 347–348, banner 349, seoMap 350–354, sheet style 356–358, return 359–381).

| Block | Lines |
|---|---|
| SiteChrome `active="shop"` | 27 |
| Header band (mandala 30, breadcrumb 33–37, h1 38–41, count 42–46, arch + floating stones 48–53) | 29–55 |
| Category tabs | 58–62 |
| Sub-chips (rudraksha → mukhi; havan/copper → none; others → intents) | 63–69 |
| Mobile Filter · Sort bar (sticky top 56) | 72–80 |
| Layout grid | 82–211 |
| · filter `<aside>` (sheet header 85–90; "Refine" 91–96; groups 97–133: list 102–111, mukhi 112–116, **price slider 117–126**, stock switch 127–129; mobile footer 134–139) | 84–140 |
| · results: toolbar 143–160 (active chips 144–149, sort dropdown 150–159) · empty 162–172 · grid 174–201 (card 176, skeleton 177–184, **editorial banner 185–199**) · load more 203–209 | 142–210 |
| SEO "Buyer's note" | 213–224 |
| SiteFooter | 226 |
| Mobile sort sheet | 228–235 |

Notes: the editorial banner appears **once**, at index `cols*2` (345), not every 12 cards; "Load more" adds 12. No EN/HI object.

### A.6 FaqList.dc.html (61)
helmet 10–14 (needs `mka-astro.js`) · template 15–30 (loop 16–29: button 19–23, answer 25–27) · script 32–59 (props on 32) · state 34 · didMount 36–39 · renderVals 41–57.
**Props:** `set` consult|kundali99|courses|kundali|palm|tarot|numerology|rituals (+ `home` exists in data) · `openFirst` yes|no. Single-open accordion; icon rotates 45° (300 ms EASE); answer mounts with `fx.enter {y:-6, dur:320}`; no close animation. Data: `A.FAQ` (astro 410–420).

### A.7 InquiryForm.dc.html (165)
helmet 10–14 · template 15–92 (corners 16–17; form 18–79: heading 20–24, fields 25–36, course select 38–48, chip groups 50–60, textarea 62–66, agree 68–72, submit + WhatsApp 74–77; done 80–91) · script 94–163 (props on 94) · state 96 · didMount 97–100 · didUpdate 101 · set 103 · **errors 104–115** · renderVals 116–161 (course/ritual copy `t` 121–123, ring 124, F 125, chip 126, groups 127–129, fields 136, submit 143–153, doneMsg 156, seal 157, doneRef 158, reset 159).
**Props:** `kind` course|ritual · `preset` baglamukhi|hanuman|kali|durga|shiva|bhairav.
Validation: name ≥2 · phone `/^[6-9]\d{9}$/` (digits only, max 10) · email optional + regex · city ≥2 · area (ritual) / experience (course) required · message 20–600 · agree required · errors only after first submit; focus first bad field. Submit: 1100 ms "Sending…" with chakra `spin:1.4` (141) → done, ref `MKA-R-`/`MKA-S-` + last 6 of `Date.now`, saved to `store.d.inquiries` (max 20). Done: `fx.enter {y:10,dur:420}` + `A.drawChart(dur 900)` on seal `data-cl`.

### A.8 Consultations.dc.html (290)
helmet 10–26 · template 27–234 · script 236–288 · class 237–287 · state 238 · didMount 239–242 · `count` 244–253 · renderVals 254–286 (L 256–264, return 268–285).

| # | Section | Lines | Bg |
|---|---|---|---|
| 1 | Hero (mandala 32; copy 34–51; portrait arch 52–68 with **chakra 57–61** `spin:120/-90/60`) | 31–70 | ivory |
| 2 | Four services `#services` (rows 83–111; WhatsApp nudge 113–116) | 72–118 | sand |
| 3 | How it works (sky 121; `stepsRef` 128–142 with `data-line` 129; facts 143–147) | 120–149 | night |
| 4 | Credentials (quote 153–158; creds 164–171; stats `data-count` 172–179) | 151–183 | ivory |
| 5 | Testimonials (masonry / rail 197–213; video card 208–212) | 185–215 | sand |
| 6 | FAQ (sticky WhatsApp card 219–228; FaqList `set="consult"` 229) | 217–231 | ivory |

Imports: SiteChrome `active="consult"` 28 · FaqList 229 · SiteFooter 233.

### A.9 Consultation-Detail.dc.html (231)
helmet 10–26 · template 27–173 · script 175–229 · state 177 · didMount 178–183 (hashchange) · didUpdate 185–188 · parse 189 · drawArt 190 · renderVals 191–227 (L 193–198, **COPY per service 201–206**, `v` 207–214).

| # | Section | Lines | Bg |
|---|---|---|---|
| 1 | Service hero (copy 33–54, `ctaRef` 43–47; arch + `svcArt` 55–65) | 31–67 | ivory |
| 2 | What's covered | 69–85 | sand |
| 3 | Sample pages (3 × `A.page`) | 87–106 | night |
| 4 | Packages `#tiers` (Essential / Detailed / Premium; recommended dark) | 108–134 | ivory |
| 5 | Service FAQ (FaqList `set="{{ v.key }}"` 143) | 136–145 | sand |
| 6 | Other services | 147–160 | ivory |
| – | Sticky Book bar (desktop top 64 / mobile bottom) | 164–172 | ivory |

Imports: SiteChrome `active="consult" tabbar="off" fab-lift="92px"` 28 · SiteFooter `tabbar="off"` 162.

### A.10 Booking.dc.html (605)
helmet 10–27 · template 28–475 · script 477–603 · state 479–482 · didMount 483–486 · fromHash 488–492 · toTop 493 · needsSlot 494 · **errs 495–511** · iso 512 · **next 513–523** · renderVals 524–600 (L 526; handlers 528–538; sum 539–544; HEAD 545; STEPT 546; steps 547; svcs 548–549; modes 550; MN 551; tiers 552; D2 553; guide 554–555; palms 556–557; langs 558; placeRes 559; calendar 560–565; slots 566–567; tz 568–570; timeline 571; methods 572–573; apps 574; banks 575; trust 576; CTA 577; payT 578; done 580–583; nextSteps 584).

| Block | Lines |
|---|---|
| SiteChrome `mode="checkout" active="consult" back-href="Consultations.dc.html" back-label="Consultations" secure-label="Secure booking" tabbar="off" fab-lift="104px"` | 29 |
| Flow (`inFlow`) · stepper section (heading 36–39, **progress line 41–55**) | 32–393 / 33–392 |
| Step 1 service & mode (services 59–71, modes 73–81, packages 83–97) | 57–99 |
| Step 2 details (name/phone 103–117, email 118–122, birth block 124–176 incl. place autocomplete 152–168, **palm block 178–216** (guide 184–195, upload preview 201, remove 207–209), question 218–223, language 224–231) | 101–233 |
| Step 3 date & slot (calendar 239–258, slots 259–284, report timeline 287–300) | 235–302 |
| Step 4 pay (mobile summary 306–315, methods 316–354, Razorpay note 355) | 304–357 |
| Nav row (hidden on mobile) | 359–363 |
| Desktop summary aside (night, ≥1024) | 366–390 |
| Done (`isDone`): confirmed 396–422 (check draw 400–402, **gcal 409 + .ics 410**, details 415–420) · what's next 423–445 · SiteFooter 446 | 395–447 |
| Mobile bottom bar | 450–460 |
| Processing overlay (chakra `spin:8/-6/4` 465–469) | 462–474 |

### A.11 Kundali-99.dc.html (502)
helmet 10–27 · template 28–390 · script 392–500 (props on 392: `demoState` form|generating|preview|success, `payOutcome` success|fail) · state 394 · didMount 395–400 · **demo 404–413** · errs 414–423 · **gen 424–431** · scrollTo 432 · **payNow 433–436** · **download 437–445** · birthLine 446 · renderVals 447–497 (L 449, MSG 459, pages 464–465, apps 467).

| Block | Lines | Bg |
|---|---|---|
| SiteChrome `active="kundali"` | 29 | |
| Tool (intro 35–46; facts 48–56; card 58–163: **form 64–128** (unknown time 87, place 89–103, report lang 104–109), **generating 130–148** (chakra `data-ring` 132–136, messages 138–145, bar 146), **ready 150–162**) | 32–165 | night |
| Preview `#preview` (chart `chartRef` 178–181, trio 183–191, planet table 192–209, 6 locked pages 217–227, unlock CTA 229–244, **success + download 245–256**) | 166–259 | ivory |
| What's inside (10 rows) | 260–279 | sand |
| Samples (4 × `A.page`) | 281–298 | night |
| Reviews | 300–318 | ivory |
| FAQ (FaqList `set="kundali99"` 327) | 320–329 | sand |
| SiteFooter / mobile bar | 331 / 333–340 | |
| **Pay sheet** (idle apps 354–365, processing chakra 366–375, fail 376–385) | 342–389 | |

### A.12 Love-Calculator.dc.html (256)
helmet 10–26 · template 27–188 · script 190–254 · state 192 · **calc 200–213** · reset 214 · breakdown 215–222 · renderVals 223–251 (L 225, stage geometry 227–229).

| # | Section | Lines | Bg |
|---|---|---|---|
| 1 | Tool (stage `stageRef` 45–59: ring `data-ring` 49, medallions 51–58; result 60–72; form 74–96) | 31–99 | ivory |
| 2 | How it works (tiles 112–120, reduction 121–127, graha 128–135) | 101–138 | night |
| 3 | Disclaimer + Kundali Milan CTA (8 koota bars 153–161; CTA 164) | 139–168 | sand |
| 4 | Related products (ProductCard ×4, 181) | 170–185 | ivory |

Imports: SiteChrome `active=""` 28 · SiteFooter 187.

### A.13 Rashifal.dc.html (301)
helmet 10–27 · template 28–200 · script 202–299 · state 204 · didMount 205–215 (4 s tick interval 214) · didUpdate 217–225 · held/hold 226–227 · **tick 228–232** · cardStep 233 · **go 234–238** · **rotate 239–246** · watch 247 · findRashi 248–256 · renderVals 257–296 (L 258–260, pan 268–269, rail 270, tabs 271, cards 272).

| # | Block | Lines | Bg |
|---|---|---|---|
| 1 | Hero wheel: header 35–42 · desktop 44–83 (wheel 47–53, prev/pause/next 54–58, panel 60–81) · mobile dial 85–108 (dial 86–95, rail 96–104, dots 105–107) | 32–110 | night |
| 2 | 12-rashi grid `#rashis` (tabs 120–124, grid 125–135) | 111–137 | ivory |
| 3 | DOB → rashi helper (form 141–173, placeholder 175–179, found card 180–194; saves `localStorage 'mka-my-rashi'`) | 139–197 | sand |

Imports: SiteChrome `active="rashifal"` 29 · SiteFooter 199.

### A.14 Rashi-Detail.dc.html (223)
helmet 10–26 · template 27–170 · script 172–221 · state 174 · didMount 175–180 (hashchange) · didUpdate 182–187 · parse 188 · renderVals 189–218 (L 191).

| # | Section | Lines | Bg |
|---|---|---|---|
| 1 | Hero (arch + mandala 36–43; copy 44–59: tabs 47–49, text 51, prev/next 55–58) | 31–62 | night |
| 2 | Area meters | 64–86 | ivory |
| 3 | Lucky trio + gemstone (ProductCard `size="row"` 105) | 87–110 | sand |
| 4 | Remedy (**diya 115**) | 112–122 | night |
| 5 | Compatible + recommended (ProductCard 148) | 124–152 | ivory |
| 6 | Kundali CTA (demo chart `chartRef` 165) | 154–167 | sand |

Imports: SiteChrome `active="rashifal"` 28 · SiteFooter 169.

### A.15 Sadhana-Courses.dc.html (197)
helmet 10–26 · template 27–158 · script 160–195 · renderVals 170–192 (L 172; yantra draw 185–186; line 188).

| # | Section | Lines | Bg |
|---|---|---|---|
| 1 | Hero (kali yantra bg 33; copy 35–48; includes 49–59) | 31–61 | night |
| 2 | Six sadhanas `#six` (cards 72–88, yantra 77) | 63–90 | ivory |
| 3 | Enrollment (track 102, `lineRef` 103, steps 104–112) | 91–115 | night |
| 4 | Serious seekers | 117–133 | sand |
| 5 | FAQ (FaqList `set="courses"` 141) | 135–143 | ivory |
| 6 | Enquire `#enquire` (InquiryForm `kind="course" preset="kali"` 153) | 145–155 | sand |

### A.16 Course-Detail.dc.html (242)
helmet 10–26 · template 27–192 · script 194–240 · state 196 · didMount 197–202 (hashchange) · parse 205 · drawY 206 · toEnquire 207 · renderVals 208–237 (L 210–211, WHEN/DEV 214–215).

| # | Section | Lines | Bg |
|---|---|---|---|
| 1 | Hero (copy 34–47, `ctaRef` 43–46; arch + yantra `yRef` 48–55) | 31–57 | night |
| 2 | Overview | 59–70 | ivory |
| 3 | What you attain | 72–84 | sand |
| 4 | Structure (sticky side 88–95; modules 96–104) | 86–106 | ivory |
| 5 | Niyam | 107–123 | night |
| 6 | Support | 125–141 | ivory |
| 7 | Fee | 143–159 | sand |
| 8 | Enquire `#enquire` (InquiryForm `preset="{{ c.key }}"` 169; other sadhanas 171–178) | 161–179 | ivory |
| – | Sticky Enquire bar | 183–191 | ivory |

Imports: SiteChrome `active="courses" tabbar="off" fab-lift="92px"` 28 · SiteFooter `tabbar="off"` 181.

### A.17 Rituals.dc.html (184)
helmet 10–26 · template 27–142 · script 144–182 · didMount 147–152 · **measure 154–160** · renderVals 162–179 (L 164).

| # | Section | Lines | Bg |
|---|---|---|---|
| 1 | Hero (copy 34–44; **diya thali 45–49**: mandala `spin:200` 46, `A.thali` 47) | 31–51 | night |
| 2 | Ethics | 53–67 | ivory |
| 3 | Ritual types (placeholder badge 76) | 69–87 | sand |
| 4 | Process `#process` (sticky side 91–95; `stepsRef` 96–105: track 97, `fillRef` 98) | 88–107 | night |
| 5 | What you receive ("to confirm" 116) | 109–127 | ivory |
| 6 | Inquiry `#inquire` (FaqList `set="rituals" open-first="no"` 135; InquiryForm `kind="ritual"` 137) | 129–139 | sand |

### A.18 About.dc.html (257)
helmet 10–27 (loads `mka-home.js` 15) · template 28–197 · script 199–255 · didMount 202–207 · **measure 210–216** · **drawArt 217–227** · renderVals 228–253 (L 230–234).

| # | Section | Lines | Bg |
|---|---|---|---|
| 1 | Hero portrait (copy 35–48; arch + chakra `spin:120/-90/60` 49–65) | 32–67 | ivory |
| 2 | Sticky 6-chapter story (desktop sticky column 77–90: dots + `railFill` 79–83, art window `winRef` 84–88; chapters `chapsRef` 91–106) | 69–109 | night |
| 3 | Pillars | 111–128 | ivory |
| 4 | Books | 130–156 | sand |
| 5 | Discourses (3 videos → Videos `#v=`) | 158–180 | ivory |
| 6 | Contact band | 182–194 | emerald |

Imports: SiteChrome `active="about"` 29 · SiteFooter 196.

### A.19 Videos.dc.html (240)
helmet 10–27 (mka-home 15) · template 28–175 · script 177–238 · state 179 · didMount 180–185 (keyboard 183) · didUpdate 187–192 · video 193 · **start 194–202** · tick 203 · pause 204 · pick 205–208 · **svOpen 209–212** · svClose 213 · renderVals 214–236 (L 216).

| # | Section | Lines | Bg |
|---|---|---|---|
| 1 | Featured player `#player` (header 36–47; player 49–67: idle 51–56, playing 57–66, bar 61, time 62; info 68–81) | 32–84 | night |
| 2 | Library (tabs 93–95; grid 97–113) | 86–115 | ivory |
| 3 | Shorts (mobile stories 126–135; rail 136–143) | 117–145 | sand |
| 4 | Subscribe band | 147–159 | emerald |
| – | Shorts viewer (segments `data-sg` 167, tap zones 168–169, close 170) | 163–174 | |

Imports: SiteChrome `active="videos"` 29 · SiteFooter 161.

---

## §B `mka-*.js` members

Tags: **DATA** → JSON via extractor · **ART-S** static SVG → `public/svg/**` (`<img>`) · **ART-A** animated/dynamic SVG → string in `src/lib/art/*.ts` (inlined by a signature component; allowed `dangerouslySetInnerHTML`) or a JSX port · **LOGIC** pure fn → TS port (same algorithm + seeds) · **RT** runtime → replaced by stores/hooks/components.
Rule for the extractor: an ART builder whose output contains `data-amb`, `data-cl`/`data-pl`/`data-d`/`data-cd`, `[data-bead]` or named groups driven by JS is **ART-A**; everything else is **ART-S**.

### B.1 mka-core.js (558) — `M` (IIFE 3–558; `M.ready` 557)

| Member | Lines | Tag | Purpose | Target |
|---|---|---|---|---|
| `C` | 8 | DATA | colour tokens em9 em7 em5 em1 n9 n8 g5 g3 g7 iv s1 s2 ink ink6 cu sin rose ok | `globals.css @theme` |
| `EASE` / `INOUT` | 9 / 10 | DATA | `cubic-bezier(.22,1,.36,1)` / `(.45,0,.55,1)` | `--ease-out` / `--ease-inout` + `components/motion/easing.ts` |
| `fmt`, `off` | 13, 14 | LOGIC | ₹ en-IN format, % off | `lib/core/format.ts` |
| `rng`, `hash`, `mix`, `M.hash` | 15–19 | LOGIC | seeded LCG, djb2→base36, colour mix | `lib/core/rng.ts` |
| `DAY MON DAYH MONH` | 20–21 | DATA | EN/HI day+month names | `lib/core/dates.ts` |
| `addDays`, `dfmt`, `dlong`, `muhurat` | 22–26 | LOGIC | dates; next Thursday ≥2 days out | `lib/core/dates.ts` |
| `hashParams` | 27 | LOGIC | `#k=v&…` | not ported (Next params) |
| `I` icon map (97 icons), `FILLED` (heartF, starF), `ICON_NAMES`, `icon(n,sw)` | 30–121 | ART | 24 grid, stroke 1.5, round | `lib/art/icons.ts` (generated) + `components/icons/Icon.tsx` |
| `EL`, `h`, `ic` | 123–136 | RT | cached innerHTML spans | not ported |
| `logo(u)` | 139–160 | ART-S | emblem (24 petals, 11 leaf pairs, ॐ, wordmark) | `public/svg/logo.svg` + `ui/Logo.tsx` |
| `mandala(R,col,sw)` | 163–170 | ART-S | `<g>` only; rings + petals + dot rings | `public/svg/ornaments/mandala-<hex>.svg` per colour used; `ui/ornaments/Mandala.tsx` |
| `stars(n,w,h,seed,col)` | 171 | ART-A | seeded circles with `data-amb="twinkle"` | JSX port `signature/Starfield.tsx` |
| `lotusRule(col)`, `corner(col)` | 172, 173 | ART-S | 240×16 rule, 48×48 corner | JSX ports `ui/ornaments/LotusRule.tsx`, `Corner.tsx` |
| `SH`, `STONES` | 176–194 | DATA | 15 stone palettes | `lib/data/stones.json` |
| `bead mala bracelet THREADS amulet cert vthumb` | 195–266 | ART-S (internal) | product art parts | via `artSvg` |
| `diya(u,noGlow)` | 267 | ART-A | `glow:3` + `flicker` | `lib/art/diya.ts` + `signature/Diya.tsx` |
| `kalash(u)` | 268 | ART-A | embeds diya | `lib/art/kalash.ts` (cart empty state) |
| `place(k)` | 269–276 | ART-S | temple/tijori/office | `public/svg/places/*.svg` (for PDP later) |
| `artSvg(p,slot,u)` | 277–289 | ART-S | product art: main / detail (vb `90 110 220 275`) / cert / video | `public/svg/products/<id>-<slot>.svg` |
| `img`, `svgEl` | 291–305 | RT | photo or art | `commerce/ProductImage.tsx` |
| `CATS` | 308–314 | DATA | 5 categories (name/hi/short/desc/deshi) | `lib/data/categories.json` (+ `slug`, §C) |
| `INTENTS` | 315–318 | DATA | 7 intents + icon | `lib/data/intents.json` |
| `HIN`, `RUD` | 319, 320–334 | DATA | Hindi numerals; mukhi 2–14 | `lib/data/rudraksha.json` |
| `P` build | 335–377 | DATA | rudraksha 336–339, malas 340–341, bracelets 342–358, amulets 359–367, havan 368, nag12 369, derived 370–377 (`href` 376) | `lib/data/products.json` (+ `slug`) |
| `P`, `byId` | 378, 379 | DATA/LOGIC | | `lib/api/catalog.ts` |
| `BADGE` | 380 | DATA | [en, hi, bg, fg] | `lib/data/badges.json` |
| `stockNote` | 381 | LOGIC | "Only N left" ≤5 | `lib/core/stock.ts` |
| `PIN`, `ST`, `pin` | 384–395 | LOGIC | delivery estimate + COD | `lib/core/pin.ts` |
| `store` | 398–443 | RT | key `mka.store.v2`; FREE 999, SHIP 79, EXPRESS 99, COD 49, GIFT 49, ENERG 251; coupons SADHANA10, FIRST100 | `stores/cart.ts`, `stores/wishlist.ts`, consts `lib/core/commerce.ts` |
| `ui` | 446–450 | RT | `mka:ui` bus: cart, search, quick, toast | `stores/ui.ts` |
| `lang` | 451 | LOGIC | | next-intl |
| `BUILT`, `ROUTE`, `soon` | 452–454 | DATA/RT | page map | `lib/routes.ts` (§C) |
| `isReduced` | 457–458 | LOGIC | | `lib/hooks/useReducedMotion.ts` |
| `ALL`, `io`, visibility, `DONE` | 459–463 | RT | amb observer (rootMargin 120px) + tab pause | `motion/AmbientRoot.tsx` |
| `fx.scan` | 465–481 | RT | `data-amb` kinds (§E.2) | `globals.css` keyframes + AmbientRoot |
| `fx.reveal` | 482–489 | RT | `data-reveal` | `motion/Reveal.tsx` |
| `fx.cartTarget fly bumpCart bump burst` | 490–507 | RT | fly-to-cart, badge bump, wishlist burst | `commerce/fx.ts` |
| `fx.roll shimmer drawIn enter stagger` | 508–512 | RT | WAAPI helpers | `components/motion/fx.ts` |
| `fx.pageIn` | 513–518 | RT | page fade + gold top line | `layout/PageTransition.tsx` |
| `bind` | 521–526 | RT | resize + store | hooks `useMedia`, `useHydrated` |
| `SERVICES` | 528–533 | DATA | 4 services (name/hi/icon/price/dur/modes) | merged into `lib/data/services.json` |
| `ARTICLES`, `TRENDING` | 534–541, 542 | DATA | journal cards, search chips | `lib/data/articles.json`, `trending.json` |
| `search(q)` | 543–552 | LOGIC | | `lib/core/search.ts` |
| `auto` + boot, `whenReady` | 554–556 | RT | | not ported |

### B.2 mka-astro.js (424) — `M.A` (IIFE 4–424; `astroReady` 423; helpers `D2R norm f1` 9)

| Member | Lines | Tag | Purpose | Target |
|---|---|---|---|---|
| `MON`, `MONL` | 10–12 | DATA | month names | `lib/astro/constants.ts` |
| `GL` → `A.GL`, `glyph(k,col,sw)` | 15–30 | DATA+ART | 12 rashi glyph paths (24 grid) | `lib/art/glyphs.ts` (paths) + `signature/RashiGlyph.tsx` (JSX `<path>`) |
| `LORD`, `RS`, `RASHI` (+ enrichment 57–61) | 33–61 | DATA | rashis, lords, remedies, `dates` (fixed year 2026), `href` 60 | `lib/data/rashi.json` |
| `rashi`, `sunRashi`, `compatible` | 62, 64, 65 | LOGIC | | `lib/astro/rashi.ts` |
| `GRAHA`, `NAK`, `CITIES` | 67–71, 72, 73 | DATA | 9 grahas, 27 nakshatras, 32 cities | `lib/data/graha.json`, `nakshatra.json`, `cities.json` |
| `placeSearch` | 74 | LOGIC | prefix then contains, max 6 | `lib/astro/place.ts` |
| `jd`, `longs`, `dms`, `kundali(o)` | 77–107 | LOGIC | approx ephemeris; noon if unknown; IST −5.5 hard-coded | `lib/astro/kundali.ts` |
| `DEMO_K` | 108 | DATA | 1986-11-12 06:40 Varanasi | `lib/data/demo-kundali.json` |
| `HC`, `SN`, `HCOLS`, `chart(K,o)` | 111–133 | ART-A (dynamic) | North-Indian chart; lines `pathLength=1 data-cl`, text `data-pl` | JSX port `signature/KundaliChart.tsx` + layout consts `lib/astro/chart.ts` |
| `prime`, `drawChart`, `onView` | 134–151 | RT | draw prep; lines 1200 ms then planets pop 420 ms +45 ms; one-shot IO (.3) | `components/motion/draw.ts` + `lib/hooks/useInView.ts` |
| `pt`, `spokes`, `dots`, `sector` | 154–157, 173–174 | ART helpers | | (extractor only) |
| `chakra(col)` | 158–170 | ART-S ×3 | {outer (12 glyphs + 72 dots), middle (27 ticks), inner (8-petal lotus + 24 spokes)}; spun by wrapper | `public/svg/chakra/{outer,middle,inner}-<hex>.svg` + `signature/Chakra.tsx` |
| `wheel()` | 175–191 | ART-A | {rashi (`g#rashi-<k>[data-seg]` with `[data-hl] [data-gl] [data-tx]`), nak, graha, center, pointer} | rashi ring → `lib/art/wheel.ts`; nak/graha/center/pointer → `public/svg/wheel/*.svg`; `signature/RashiWheel.tsx`, `RashiDial.tsx` |
| `wheelActive(root,i)` | 192–200 | RT | highlight segment | inside RashiWheel/RashiDial |
| `yb yc ytri ypet ysq BHU YAN` | 203–216 | ART internals | yantra recipes ×6 | — |
| `yantra(k,col,u,sw)` | 217 | ART-A | `data-d` strokes + `data-yg` glow; gradient `yg{u}` | `lib/art/yantras.ts` (6 keys) + `signature/Yantra.tsx` |
| `drawYantra(root,dur)` | 218–225 | RT | strokes over dur×.5 staggered; glow 0→.9→.45 1100 ms at dur×.9 | `components/motion/draw.ts` |
| `thali(u)` | 228–248 | ART-A | `glow:4`, `smoke:8:0`/`9:3`, embedded diya; rice seeded `rng('rice'+u)` | `lib/art/thali.ts` + `signature/Thali.tsx` |
| `portrait(u,part)` | 249–258 | ART | bg (seeded twinkle stars → ART-A) / fg (ART-S) / full | bg → `lib/art/portrait.ts`; fg → `public/svg/portrait/fg.svg` |
| `palmArt(col,ink,lab)` | 260–269 | ART-A | 4 lines `data-cl` + labels `data-pl` | `lib/art/palm.ts` |
| `tarotArt(u)` | 270–273 | ART-A | 3 cards, `glow:5` | `lib/art/tarot.ts` |
| `loshuArt()` | 274–279 | ART-A | Lo Shu (9,5,1,3 hard-coded) | `lib/art/loshu.ts` |
| `svcArt(k,u)` | 280 | LOGIC | picks the service art | `signature/ServiceArt.tsx` |
| `bars`, `page(kind,title,u,sub)` | 283–295 | ART-S | 3:4 report page mockups (cover chart dasha palm cards grid remedy / generic) | `public/svg/report-pages/<kind>-<n>.svg` per call site (Consultation-Detail samples, Kundali-99 pages 464–465 + samples) |
| `MODES`, `SVC` (+ merge 317), `STEPS` | 298, 299–317, 318 | DATA | modes; 4 services with tiers (k,t,price,mins,rec,inc); 4 steps | `lib/data/services.json` (SVC ⊕ SERVICES), `consult.json` |
| `SLOTS`, `slotsFor(date,mins)` | 319, 320 | DATA / LOGIC | seeded `rng('slot'+date+k)`, `R() > .34` | `lib/data/consult.json`, `lib/astro/slots.ts` |
| `t12`, `istDate` | 321, 322 | LOGIC | | `lib/astro/slots.ts` |
| `icsT`, `ics(o)`, `gcal(o)` | 323–325 | LOGIC | ICS (DTSTAMP = now), Google Calendar URL | `lib/astro/calendar.ts` |
| `TESTI`, `K99REV` | 327–333, 334–339 | DATA | 5 testimonials, 4 Kundali reviews | `lib/data/testimonials.json`, `kundali99.json` |
| `PERIODS`, `OPEN`, `AREA` | 342, 343, 344–349 | DATA | 5 periods; prediction templates | `lib/data/predict.json` |
| `monday`, `periodDate(p,now)`, `predict(r,p,now)` | 350–368 | LOGIC | seeded `r.key+p+date bucket`; yearly = `Samvat Y+57` | `lib/astro/predict.ts` (always pass `now`) |
| `AREAS` | 369 | DATA | 4 areas + icon | `lib/data/predict.json` |
| `red`, `nameNum`, `NUMP`, `FR`, `love(a,b)`, `initial` | 372–385 | LOGIC/DATA | pct clamped 52–97, seeded by sorted names | `lib/astro/love.ts` |
| `KOOTA` | 386 | DATA | 8 kootas | `lib/data/love.json` |
| `COURSES` (+ href 397), `course(k)` | 389–398 | DATA/LOGIC | 6 courses | `lib/data/courses.json` (+ `slug`) · `lib/api/content.ts` |
| `INCLUDES`, `ENROLL`, `MODULES`, `NIYAM` | 399–402 | DATA | | `lib/data/courses.json` |
| `RITUALS`, `RPROCESS`, `RECEIVE` | 405–407 | DATA | | `lib/data/rituals.json` |
| `FAQ` | 410–420 | DATA | sets home 411, consult 412, kundali99 413, courses 414, kundali 415, palm 416, tarot 417, numerology 418, rituals 419 | `lib/data/faq.json` |
| `stars5(col,n)` | 422 | ART-S | 5-star row | JSX port `ui/Rating.tsx` |

### B.3 mka-home.js (302) — `M.H` (IIFE 4–302; `homeReady` 301)

| Member | Lines | Tag | Purpose | Target |
|---|---|---|---|---|
| `strip`, `fit` | 9–11 | LOGIC | remove outer `<svg>` + all `data-amb`; fit `<g>` | extractor helper |
| `MP`, `LUT`, `MALA_N` (30), `MALA_L`, `malaAt(s)`, `malaSet(beads,off)` | 14–18 | LOGIC | mala arc-length lookup (48 samples/segment) | `lib/art/mala.ts` (LUT precomputed at extract) |
| `pandit(u)` | 22–123 | ART-A | viewBox 400×500; groups `#aura #torso #torso-front #head #eyelids #pupils #mala-beads [data-bead 0–29] #hand-thumb #legs #altar #diya-flame #smoke` (group ids NOT suffixed → one per page) | `lib/art/pandit.ts` + `signature/PanditJi.tsx` |
| `ARCH_BB`, `archClip(id)` | 126, 127 | ART | objectBoundingBox arch path | CSS `clip-path` in `signature/ArchFrame.tsx` |
| `archFrame()` | 128–134 | ART-S | gold arch frame + finial/curls | `public/svg/ornaments/arch-frame.svg` |
| `GC`, `pt`, `blob`, `GEMS` (unused) | 137–147 | internals | | — |
| `gem(k,u)` | 148–161 | ART-S | amethyst citrine quartz pyrite garnet jade rose tiger rudraksha | `public/svg/gems/<k>.svg` (wrappers animate) |
| `catArt(k,u)` | 164–184 | ART-S | havan (110 seeded grains), copper nag | `public/svg/categories/{havan,copper}.svg` |
| `VCATS`, `VCAT`, `VIDEOS` (12), `SHORTS` (6), `SUBS` | 187–211 | DATA | | `lib/data/videos.json` |
| `secs` | 212 | LOGIC | "m:ss" → s | `lib/core/format.ts` |
| `motif`, `tsize` | 214–229 | ART helpers | | — |
| `thumb(v,u,tall)` | 230–239 | ART-S | 320×180 / 180×320 | `public/svg/thumbs/<id>.svg`, `<id>-tall.svg` |
| `BOOKS`, `book(b,u)` | 242–246, 247–259 | DATA / ART-S | 3 books, 240×320 covers | `lib/data/books.json`, `public/svg/books/<key>.svg` |
| `seal(u,col,ink)` | 262–265 | ART-S | guarantee seal (textPath) | `public/svg/ornaments/seal.svg` (spun by wrapper) |
| `PHOTO_REV` | 268–272 | DATA | 3 photo reviews | `lib/data/reviews.json` |
| `TIMELINE`, `PILLARS` | 275–282, 283–287 | DATA | About chapters, pillars | `lib/data/about.json` |
| `chapter(k,u)` | 288–298 | ART-A | `[data-cd]` draw, twinkle (294), `[data-spin]` (296) | `lib/art/chapters.ts` |
| `QUOTE` | 300 | DATA | founder quote (Home 756 hard-codes it) | `lib/data/about.json` |

---

## §C Route map (design → Next)

Principle (ARCHITECTURE §Routes): resource ids → path segments; view state → query params. All under `[locale]` (`/` EN, `/hi/...` HI). Keep a `key ↔ slug` map in the generated JSON (`slug` field) and in `lib/routes.ts`.

| Design file + params | Next route | Notes |
|---|---|---|
| `Home.dc.html` | `/` | logo/Home tab scroll to top on Home |
| `Shop.dc.html` (`#c=all`) | `/shop` | |
| `Shop.dc.html#c=<cat>` | `/shop/[category]` | rudraksha → `rudraksha-malas` · bracelets → `crystal-bracelets` · amulets → `bhojpatra-amulets` · havan → `havan-samagri` · copper → `energized-copper` |
| `#sub=` `#intent=` `#sort=` (+ mukhi, stones, price, stock, rating state) | `?sub=&intent=&sort=&mukhi=&stone=&min=&max=&stock=&rating=` | Shop design writes only `c`, `sub`, single `intent`; we sync all filters |
| `Product-Rudraksha.dc.html#p=<id>` / `Product-Copper-12-Nag.dc.html` | `/product/[slug]` (coming soon) | slug = kebab of English name, e.g. nag12 → `copper-12-nag` |
| `Consultations.dc.html` | `/consultations` | `#services` anchor stays |
| `Consultation-Detail.dc.html#s=<k>` | `/consultations/[service]` | kundali → `kundali-reading` · palm → `palmistry` · tarot → `tarot-reading` · numerology → `numerology`; `#tiers` anchor |
| `Booking.dc.html#s=<k>&tier=<t>` | `/book/[service]?tier=essential\|detailed\|premium` | same service slugs; step 1–4 + done are client state (design has no step param); tier/service changes `replace` the URL |
| `Kundali-99.dc.html` (Tweaks `demoState`, `payOutcome`) | `/kundali-99` | optional QA-only `?demo=generating\|preview\|success&pay=fail` |
| `Love-Calculator.dc.html` | `/love-calculator` | |
| `Rashifal.dc.html#p=<period>` | `/rashifal?p=today\|tomorrow\|week\|month\|year` | `#rashis` anchor |
| `Rashi-Detail.dc.html#r=<k>&p=<period>` | `/rashifal/[rashi]?p=` | slugs = design keys: mesha vrishabha mithuna karka simha kanya tula vrishchika dhanu makara kumbha meena |
| `Sadhana-Courses.dc.html` | `/sadhana-courses` | `#six`, `#enquire` anchors |
| `Course-Detail.dc.html#c=<k>` | `/sadhana-courses/[slug]` | baglamukhi-sadhana · hanuman-sadhana · kali-sadhana · durga-sadhana · shiva-sadhana · bhairav-sadhana |
| `Rituals.dc.html` | `/rituals` | `#process`, `#inquire` anchors |
| `About.dc.html` | `/about` | |
| `Videos.dc.html#c=<cat>&v=<id>` | `/videos?c=all\|pravachan\|sadhana\|remedies\|qa&v=<id>` | design never writes `v`; we write both |
| `Cart.dc.html` / `Checkout.dc.html` / `Order-Success.dc.html` / `Wishlist.dc.html` / `Search.dc.html#q=` | `/cart` · `/checkout` · `/order/success` · `/wishlist` · `/search?q=` | coming soon (§G) |

`M.soon(label)` → route: 'The Home page'/'Home' → `/` · 'About Sadhak Ji' → `/about` · 'Videos' → `/videos` · 'Consultations' → `/consultations` · 'Kundali ₹99' → `/kundali-99` · 'Rashifal' → `/rashifal` · 'Rituals & Anushthan' → `/rituals` · 'Sadhana Courses' → `/sadhana-courses` · 'Account' → `/account` · 'Order tracking' / "Track your order" → `/track-order` · 'The journal' → `/blog` · 'Video testimonials' → `/videos` · footer "FAQ" → `/faq` · "Contact us" → `/contact` · Policies → `/policies/shipping|refund-returns|privacy|terms|astrology-disclaimer` · social links → external URLs `[confirm]` (placeholder `#` until then).

Outbound links inside pages to keep: Home 552/590 & Love 94/164 → `/book/kundali-reading?tier=premium`; Home 582, Kundali-99 253/315, Rashi-Detail 162 → `/consultations/kundali-reading` or `/book/kundali-reading`; Home 1220 / SiteChrome 457, 491 / footer 104 → service pages; Home 1245, SiteChrome 490 → `/shop?intent=`; Home 1439/1451, SiteChrome 98–122, footer 103 → `/shop/[category]`; SiteChrome 103–104, 120 (`#p=m5`, `#p=m7`, `#p=havan`) → `/product/[slug]`; Home 661 → `/sadhana-courses#enquire`; Home 716 → `/rituals#inquire`; About 251 → `/videos?v=`; astro 60 → `/rashifal/[rashi]`; astro 317 → service pages; astro 397 → course pages.

---

## §D Breakpoint map

Tailwind tokens (F2): base = mobile, `md` 768, `w900`, `lg` 1024, `w1100`, `nav` 1180, `xl` 1280. Rare widths use arbitrary variants (`min-[600px]:`, `max-lg:` etc.) instead of new tokens.

| px | Used in (file:line) | What changes |
|---|---|---|
| **<768 (`mob`)** | every page (flag lines below) | tab bar, quick actions, snap rails, rashi half-dial, Shorts stories row, bottom sheets, compact card size, mobile sticky bars at bottom |
| **768** (`>=`) | Course-Detail 210 · Rashi-Detail 191 · Rashifal 260 · Sadhana-Courses 172 · Shop 301 | Shop 3 cols; Rashifal grid 3 cols + card short text; Rashi-Detail compatible 4 cols / remedy row; courses step layout |
| **900** | About 233–234 · Consultation-Detail 196, 213 · Consultations 259–260, 278 · Course-Detail 210 · Home 1153, 1258 · Rashi-Detail 191 · Rashifal 258 · Rituals 164 · Videos 216 | Rashifal/Home wheel 2-col + 560px wheel (else 460); steps horizontal; tiers 3 cols; hero 2-col (Rashi-Detail); books 3 cols; newsletter 2-col |
| **980** | About 230 · Consultation-Detail 192 (its `desk`) · Consultations 257, 261, 263 | Consultations hero / credentials / FAQ 2-col; Consultation-Detail split + sticky side |
| **1024 (`desk`)** | About 229 · Booking 525–526 · Course-Detail 209–210 · Home 984, 1150, 1159, 1250, 1367, 1378 · Kundali-99 448–449 · Love 224–225 · Rashi-Detail 190–191 · Rashifal 260 · Rituals 163 · Sadhana-Courses 171–174 · Shop 300 · Videos 215–216 | hero 2-col; gaze, magnetic, mouse parallax (JS); Shop sidebar vs sheet; Booking aside; About sticky story; product grid 4 cols |
| **<1024** | Home 1038 (gaze off), 1409 (magnetic off) · Shop 252 (sheet scroll-lock) | behaviour gates |
| **1100** | Consultations 255, 262 · Home 1150 (L2 `wide`), 1256 | service rows 4 cols; tools 7fr/5fr; testimonials 3 columns |
| **1180 (`nav`)** | SiteChrome 442 (`full`) · Booking 526 · Rashifal 260 | full header + mega menus vs compact bar; Rashifal grid 4 cols; Booking slots 2-col |
| **1280** | Home 1367 (L `wide`, unused), 1380 | 12 Nag benefits 2 cols again |
| 1400 | Shop 301 (`cols`) | Shop grid 4 cols |
| 700 | Booking 526 · Home 1155, 1378 | `prod4` 3 cols; kundali mini 2-col; slots 2-col between 700–1023 |
| 640 | Booking 526 · Rashifal 260 · Sadhana-Courses 172, 174 · Videos 216 | course cards 2 cols; tabs scroll <640; videos 2 cols |
| 600 | About 233 · Course-Detail 210 · Home 1380 · Kundali-99 449 · Rashi-Detail 191 | 2-col grids; 12 Nag benefits 2 cols for 600–1023 |
| 560 | Booking 526 · Kundali-99 449 · Rashi-Detail 191 | two-column form fields; UPI apps 4 cols |
| 480 | Home 1156 · Love 225 · Rashifal 260 | love/rashi name fields 2-col |
| 420 | Kundali-99 449 | form field pairs |

Per-file flag definitions (names mean different things!): Home L 1366–1382 (`mob<768 desk≥1024 wide≥1280`), L2 1149–1161 (`wide≥1100`), L3 1249–1260 · SiteChrome 441–442 (`full≥1180`, `desk = !mob` i.e. ≥768) · SiteFooter renderVals (`mob`) · ProductCard renderVals (`mob`) · Shop 300–301 (`side≥1024`; template `mob/desk` split at **1024**; `cols≥1400`) · Consultations 256–264 (`wide≥1100`) · Consultation-Detail 193–198 (`desk≥980`, `L.desk = !mob`) · Booking 526 · Kundali-99 449 · Love 225 · Rashifal 258–260 (`wide≥900`) · Rashi-Detail 191 · Sadhana-Courses 172 (`cols≥1024`) · Course-Detail 210–211 (`L.desk = !mob`) · Rituals 164 · About 230–234 · Videos 216.

Height-dependent: Home `artDesk = clamp(400…560, (vh−170)·.8)` (L 1366–1382); Shop sidebar `max-height calc(100vh − 116px)`.

---

## §E Motion map

### E.1 Signature motions

| # | What | Design source (literal values) | Target |
|---|---|---|---|
| S1 | Blink | Home blinkLater/blink 1027–1028: every 3000+rand·3000 ms; `#eyelids` scaleY 1→.05 (@.45)→1, 160 ms ease-in-out; 20% double blink after 230 ms | `signature/PanditJi.tsx` (+ `usePanditMotion`) |
| S2 | Japa mala | initPandit 1024 (`setInterval` 1200 ms) · malaStep 1029–1036: step MALA_L/30, 300 ms easeOutCubic via rAF + `H.malaSet`; `#hand-thumb` translate(1.2px,1.8px) 460 ms (1035) · mka-home 14–18 | PanditJi + `lib/art/mala.ts` |
| S3 | Breath + aura | initPandit 1021–1023: `#torso,#torso-front` scale 1→1.012→1, 4000 ms ∞ INOUT; `#aura` opacity .5→.82, 5000 ms | PanditJi |
| S4 | Gaze (≥1024) | onMove 949 → gaze 1037–1043: eye anchor y=.3426·h, max 2.2×0.9 units, k=min(1,d/260), lerp .12, stop when Δ<.01 | PanditJi |
| S5 | Diya | `M.diya` core 267 (`glow:3`, `flicker`); Pandit `#diya-flame` (mka-home 116–118); Rashi-Detail 115; thali (astro 228–248; Home 692 halo `glow:5`, Rituals 45–49) | `signature/Diya.tsx`, `signature/Thali.tsx` |
| S6 | Incense smoke | `data-amb="smoke:8:0|9:3|10:5.5"` in Pandit `#smoke` (mka-home 115); thali `smoke:8:0|9:3` (astro 241) | CSS keyframe `amb-smoke` via AmbientRoot |
| S7 | Chakra | spin rings 120 s / −90 s / 60 s: Home 42–46, Consultations 57–61, About 54–58; Booking overlay `spin:8/-6/4` 465–469; Kundali pay `spin:6/-4` 366–375; tab bar `spin:24` SiteChrome 330–332; InquiryForm spinner `spin:1.4` 141. **Ramp mode:** Kundali-99 `genRef` (script 478): WAAPI rings 9000/7000/5000 ms (middle reversed), playbackRate .12 → +.1 every 100 ms → 2.6 | `signature/Chakra.tsx` (`mode="spin"\|"ramp"`) |
| S8 | Rashi wheel | Home 1082–1116 / Rashifal 226–247: tick 4000 ms (only playing, not held, in view IO .25, tab visible, no reduced motion); hold 12000 ms after hover/focus/click/touch; rotate 900 ms `cubic-bezier(.3,.7,.3,1)` with ±1.8° overshoot at offset .72; panel fade .15→1 300 ms; `A.wheelActive` astro 192–200. Mobile: tick smooth-scrolls rail; dial angle = −scrollLeft/step·30° | `signature/RashiWheel.tsx`, `RashiDial.tsx`, hook `useRashiCycle` |
| S9 | Floating gems / stones | Hero gems Home 50–52 (data 1395, `float` + `data-px` .16–.32; frame 982–990: mouse ±px·32 desk only + scroll −sy·px while sy<1.4vh); category hover gem 226 (`float:6:8:10`); intentions layer 623–625 (`data-depth`, stMove 1242: depth·36 px, 900 ms CSS transition; 10 desktop / 5 mobile, tables 1237–1238); Shop header stones 48–53 (`float:9:14:5:.2`; all: `float:8:12:6:.1`, `10:16:-5:.5`, `11:10:4:.8`), banner `float:9:10:4` 197 | `signature/FloatingGems.tsx` (+ `useParallax`) |
| S10 | Footer cosmos | SiteFooter 15–17, 92–94: stars 70/34 twinkle; 3 constellations `draw:18:0|4|8`; mandala `spin:180`; shooting star `shoot:12:2` | `layout/SiteFooter.tsx` + `signature/Starfield.tsx` |
| S11 | Yantra draw | Home vCourses 1307–1310 (prime + onView .35 → drawYantra 1600; hover/focus redraw, 1800 ms throttle); Sadhana-Courses 185–186 (same); Course-Detail drawY 206 (onView .3 → 1800), hover 229 (2000 throttle → 1600); astro 218–225 | `signature/Yantra.tsx` + `motion/draw.ts` |
| S12 | Kundali chart draw | astro 134–146: lines 1200 ms staggered, then planets scale .4→1.12→1 420 ms +45 ms each; Home kChartRef 1203 (onView .35), kSubmit 1127–1128 (dim .18 over 400 ms; result after 1300 ms), redraw 1092; Kundali-99 482 (onView .25); Rashi-Detail 212; Consultation-Detail drawArt 190 (onView .3; palm + Lo Shu too) | `signature/KundaliChart.tsx` + `motion/draw.ts` |
| S13 | Love result | Home lCalc 1134–1147 / Love calc 200–213: converge medallions (offset .3−drift → .112 desk / .118 mob, 700 ms CSS); +650 ms ring dashoffset 100→100−pct over 1400 ms EASE + rAF count-up 1400 ms easeOutCubic; +1450 ms result, stagger y12 420 ms step 90 | `signature/LoveMeter.tsx` |

### E.2 Ambient `data-amb` kinds (core `fx.scan` 465–481)
Parsed as `kind:n0:n1:…`; bound once; IO rootMargin 120px plays/pauses; `visibilitychange` pauses all; skipped entirely under reduced motion.

| Kind | Line | Keyframes / timing | CSS keyframe name (F2) |
|---|---|---|---|
| `spin:N` | 470 | rotate 0→±360°, \|N\| s (default 60), negative = reverse, linear ∞ | `amb-spin` (+ `--amb-dur`, direction) |
| `float:dur:y:rot:phase` | 471 | 0 → (0,−y, rot r) → 0; default 8 s / 12px / 4°; delay −phase·dur (random if absent); INOUT | `amb-float` |
| `twinkle` | 472 | opacity .2→1→.2; 2–6 s random; random negative delay; ease-in-out | `amb-twinkle` |
| `glow:N` | 473 | opacity .45→.9→.45; N s (default 3); INOUT | `amb-glow` |
| `flicker` | 474 | 7-step scale/skewX/opacity; 1.6–2.1 s; ease-in-out | `amb-flicker` |
| `smoke:dur:delay` | 475 | rise 44px, scaleX 1.7, opacity 0→.5 (25%)→0; default 8 s; negative delay; linear | `amb-smoke` |
| `pulse:N` | 476 | scale 1→1.75, opacity .55→0 by 22%, hold; default 8 s; ease-out | `amb-pulse` |
| `shoot:N:D` | 477 | on at 1.5%, translate(−280,170) + fade by 10%, hold; default 12 s; delay D s; ease-in | `amb-shoot` |
| `draw:N:D` | 478 | needs `pathLength=1`; offset 1→0 by 35%, hold to 85%, fade; default 16 s; delay D; INOUT | `amb-draw` |

Random durations/delays (twinkle, flicker, float phase) must be **seeded** at build time (deterministic SSR), not `Math.random()` on render.

### E.3 Page-level motions

| Motion | Design source | Target |
|---|---|---|
| `data-reveal` fade-up | core 482–489: IO threshold .12; elements below 92% vh start hidden; opacity 0 / translateY 24px → none, **700 ms**, delay value×80 ms, EASE, fill backwards. Used on every page except chrome/Shop/FaqList/InquiryForm | `motion/Reveal.tsx` |
| Hero mask lines + slider | Home revealSlide 1011–1015 (`data-ln` 900 ms, delay 60+i·60, EASE; `data-fade` 700 ms, delay 150+i·80, y16) · goSlide 1002–1010 (exit `data-ln` →−110%, 380 ms, i·40, `cubic-bezier(.6,0,.8,.4)`; fade 260 ms; swap at 420 ms; `% 3`) · startProg 993–1000 (progress scaleX 0→1, 6000 ms linear → next) · pause on hover (57), toggle, offscreen (IO .05 at 1019), tab hidden | `sections/home/HeroSlider.tsx` + `motion/MaskText.tsx` |
| Section heading mask | Home afterReady 966–980 + maskIn 981: IO .25; only masks with top > .9vh start hidden; `data-ln` 900 ms, i·60 ms, EASE. `data-mask` at 201 208 244 298 351 440 565 627 651 698 724 767 844 873 897 | `motion/MaskText.tsx` |
| "12" numeral parallax | Home frame 987: translateY = (centerY − vh/2)·**−0.2**, active within ±200px of viewport | `useParallax` in `sections/home/NagSpotlight.tsx` |
| Scroll-filled process lines | Home frame2 1269–1275 & Rituals measure 154–160: p = clamp((.62·vh − top)/height); fill scaleY(p); `prog = floor(p·5 + .35)`; lit steps 500 ms. About measure 210–216: active chapter = last with top < .55·vh; mobile fill (.6·vh − top)/height | `motion/ScrollLine.tsx` |
| On-view lines | Consultations `data-line` (script 278): onView .25, scaleX(0) (≥900) / scaleY(0) → none, 1400 ms EASE + stagger `[data-step]` y16 600 ms step 180 · Sadhana-Courses `lineRef` 188: IO .4, scaleX 0→1 1600 ms | `motion/ScrollLine.tsx` (`mode="onView"`) |
| Count-up | Home count 1265–1268 (IO .4, 1600 ms easeOutCubic, en-IN) · Consultations 244–253 (same) | `motion/Counter.tsx` |
| Marquee | Home 186–195, 1420–1423: translate3d 0→−50%, 56000 ms ∞, pause on hover | `motion/Marquee.tsx` |
| Magnetic CTAs | Home mag/magOut 1409–1410 (≥1024 only): ±6px x / ±4px y; hero CTAs 69 70 84 85 99 100 114 115 129 130 144 145 | `motion/Magnetic.tsx` |
| Quick-action icons | Home qaAnim 1044–1049: heart beat 2400 ms ∞, phone wiggle 4200 ms ∞; dotted ring `spin` 30/−34/26/−28 (174); kundali icon `draw:7:0` (1415) | `sections/home/QuickActions.tsx` |
| Tab / list swaps | Bestsellers switchTab 1052–1058 (out 170 ms, swap 180 ms, in 520 ms stagger 55 y14) · intent swap 1093 (520 ms, stagger 70, y14) · Videos cards 190 (y14 480 ms +50 ms) · Shop grid 251 (`stagger [data-card] y10 380 ms step 40`) | `components/motion/fx.ts` `stagger()` |
| Category arch hover | Home 223–227 CSS: fill 650 ms, lift −8px, gem 800 ms, CTA 450 ms | CSS in `commerce/CategoryArch.tsx` |
| Add-to-cart morph | ProductCard doAdd 86–98 & Home spotAdd 1068–1079: idle → loading 380 ms → added (1500 ms) → idle; `fx.fly` + toast; first add opens drawer | `commerce/AddToCartButton.tsx` |
| Fly-to-cart / bump / burst | core 490–507: clone arc 3 keyframes (mid translate(dx·.45, min(dy,0)·.45−90)), end scale max(.06, 26/w), 620 ms `cubic-bezier(.5,0,.2,1)`; badge 1→1.5→.9→1.05→1 560 ms; burst 6 gold dots 20px 520 ms + scale 1.3 380 ms | `commerce/fx.ts` |
| Qty roll / shimmer / drawIn / enter | core 508–511: roll ±70% 240 ms; shimmer 1400 ms ∞; drawIn 900 ms; enter y8 300 ms | `components/motion/fx.ts` |
| Page transition | core pageIn 513–518: `#dc-root` fade-up 12px 520 ms; 2px `#B8923A` top line scaleX over 900 ms | `layout/PageTransition.tsx` |
| Chrome motions | SiteChrome: announcement 4200 ms rotate (520 ms slide, seamless reset 560 ms); header 76→64 on y>28; tab bar hide y>160 & dy>4 (320 ms); mega `enter y-8 280` + `stagger [data-col] y10 360 step45` (485); menu `enter 260` + `stagger [data-mi] y18 520 step55` (498); search `enter y-10 300` (501); drawer 420/360 ms `cubic-bezier(.22,1,.36,1)`; free-ship bar 600 ms; toasts in 300 ms / out 220 ms, 4000 ms (6000 with undo), max 3; quick sheet 360 ms; back-to-top ring offset on scroll | `components/layout/*` |
| Video preview / Shorts | Home vStart 1283–1291 & Videos start 194–202 (WAAPI scaleX over full duration + 1 s clock); svOpen Home 1295–1298 / Videos 209–212 (segment per short, auto-advance, Esc/←/→, focus Close, scroll lock) | `sections/videos/*`, shared `ShortsViewer.tsx` |
| Course track drag | Home initTrack 1276–1282: 5px threshold, snap restored after 60 ms, prev/next ±306px | `sections/home/CourseTrack.tsx` |
| Sticky CTA bars | Consultation-Detail 224, Course-Detail 234: IO on `ctaRef` toggles bar, 380 ms slide | `ui/StickyCtaBar.tsx` |
| Kundali-99 extras | msg ticker 820 ms × 7, result after 5300 ms (gen 424–431); `genBar` 800 ms linear; locked pages blur 4.5px, filter 800 ms; sheet 380 ms (40px mob / 16px); success check drawIn 900 (d100) + 480 (d820) | `sections/kundali/*` |
| Booking extras | step fill 700 ms; radio dot spring `cubic-bezier(.34,1.56,.64,1)` 260 ms; processing 2000 ms; check drawIn 1000 (d150) + 520 (d950) | `sections/booking/*` |

**Reduced motion (HANDOFF):** no slider auto-advance, no blink/mala/breath/gaze/parallax/magnetic; charts, yantras and process lines render complete; ambient loops off; reveal just shows. **Keyboard (HANDOFF):** slider and wheel must also take arrows + pause (the prototype only has buttons); Shorts viewer Esc/←/→.

---

## §F Assets

### F.1 PNG → WebP (`scripts/optimize-images.mjs`, max 1600px, q≈80)

| Source | Used by | Target |
|---|---|---|
| `p-12-nag.png`, `p-12-nag-2.png` | core `nag12.photo/photo2` (369), Home §5 1461 | `public/images/p-12-nag.webp`, `p-12-nag-2.webp` |
| `p-12-nag-3.png`, `p-12-nag-wide.png` | Home §5 gallery 1461 | `public/images/p-12-nag-3.webp`, `p-12-nag-wide.webp` |
| `p-bitter-havan.png`, `p-bitter-havan-2.png` | core `havan.photo/photo2` (368) | `public/images/p-bitter-havan*.webp` |
| `p-tabiz.png` | core `img` alt slot for amulets (295) | `public/images/p-tabiz.webp` |
| `logo-emblem.png` | **not referenced** (the site uses the `M.logo` SVG) | don't ship; client to send an original without the Gemini watermark |

### F.2 Static SVG → `public/svg/**` (`<img>`, lazy below the fold, explicit size)
`logo.svg` · `ornaments/mandala-<hex>.svg` (one per colour used: collect call-site colours) · `ornaments/arch-frame.svg` · `ornaments/seal.svg` · `chakra/{outer,middle,inner}-<hex>.svg` · `wheel/{nak,graha,center,pointer}.svg` · `products/<id>-{main,detail,cert,video}.svg` (products without a photo) · `places/{temple,tijori,office}.svg` · `gems/<k>.svg` (9) · `categories/{havan,copper}.svg` · `thumbs/<id>.svg` (12) + `thumbs/<id>-tall.svg` (6) · `books/<key>.svg` (3) · `portrait/fg.svg` · `report-pages/*.svg`.

### F.3 Inline animated/dynamic → `src/lib/art/*.ts` (string constants) or JSX ports
Strings: `icons.ts`, `glyphs.ts` (paths), `pandit.ts`, `mala.ts` (LUT), `diya.ts`, `kalash.ts`, `thali.ts`, `wheel.ts` (rashi ring), `yantras.ts` (6), `palm.ts`, `tarot.ts`, `loshu.ts`, `portrait.ts` (bg with stars), `chapters.ts` (6).
JSX ports (parametric, no innerHTML): `Starfield` (M.stars), `KundaliChart` (A.chart), `RashiGlyph`, `LotusRule`, `Corner`, `Rating` (stars5).
All SVG `id`s get a per-instance suffix (the design's `u` param). Pandit group ids are unsuffixed → max one Pandit per page.

### F.4 Reference screenshots (`design/shots/`)
`h1.jpg`–`h4.jpg` Home · `01-chrome.png`–`03-chrome.png` header / menus · `card.png` ProductCard · `01-ab1.jpg` About hero · `02-ab1.jpg` About sticky story. Note `01-ab1` shows the header wordmark wrapping onto the tagline at ~900px — keep the wordmark on one line (`whitespace-nowrap`).

---

## §G Deferred pages (linked, not designed)

| Page | Linked from | Route (F4 = branded coming-soon) |
|---|---|---|
| Cart | `M.BUILT.cart`, drawer "View cart" 316, footer Help | `/cart` |
| Checkout | drawer Checkout 315, Home 12 Nag "Buy now" (1073) | `/checkout` |
| Order Success | `M.BUILT.success` | `/order/success` |
| Wishlist | header heart 64, menu 187–191, ProductCard toast "View", footer | `/wishlist` |
| Search results | search overlay "see all" 237 (`#q=`) | `/search?q=` |
| Product ×2 (Rudraksha template, Copper 12 Nag) | every card `p.href` (core 376), mega menu, Home 341 | `/product/[slug]` |
| Account | header 65, menu (`soon('Account')`) | `/account` |
| Order tracking | menu (`soon('Order tracking')`), footer "Track your order" | `/track-order` |
| Blog / Journal | Home §15 (`soonJournal`), search, footer "The Journal" | `/blog` (+ `/blog/[slug]` later) |
| Contact | footer "Contact us" | `/contact` |
| FAQ | footer "FAQ" | `/faq` |
| Policies | footer: Shipping, Refund & Returns, Privacy, Terms, Astrology Disclaimer | `/policies/[slug]` |

The overlay search itself is designed (SiteChrome 199–242) and is built in F4.

---

## §H Read-list per step (minimum ranges)

Always also read: the step's own block in PROGRESS.md. Docs only where listed. "INV" = this file.

**F2 — Scaffold + design system + extraction**
- Docs: TECH-STACK, ARCHITECTURE, DESIGN-TO-CODE; INV §0, §B, §D, §E.2, §F.
- `design/Home.dc.html` 10–27 (fonts + global style); `design/Shop.dc.html` 14–24.
- `design/mka-core.js` 1–27 (tokens, easings, fmt/off/rng/dates/hashParams), 28–136 (icons, `h`, `ic`), 137–173 (logo, mandala, stars, lotusRule, corner), 381–395 (stockNote, pin), 455–519 (isReduced, observers, `fx` incl. `scan` keyframes, `reveal`, `pageIn`), 543–558 (search, auto, boot).
- `design/mka-astro.js` 1–9 (boot), `design/mka-home.js` 1–11 (boot, strip, fit) — for the extractor's load order only.

**F3 — Data layer + stores + ProductCard**
- Docs: ARCHITECTURE §Data seam, §Client state; INV §A.4, §B.1.
- `design/ProductCard.dc.html` 14–139 (all).
- `design/mka-core.js` 176–194 (STONES), 277–305 (artSvg, img), 308–381 (CATS … stockNote), 396–450 (store, ui), 490–512 (fx fly/bump/burst/roll/shimmer/drawIn/enter/stagger).
- `design/SiteChrome.dc.html` 350–387 (toast host + quick-add sheet), 421–436 (onUi, toast, dismiss), 543–559 (toast + quick bindings).

**F4 — Global chrome**
- INV §A.2, §A.3, §C, §G, §E.3 (chrome row).
- `design/SiteChrome.dc.html` 14–388 (template) + 390–564 (script) — read block by block with its bindings (table in §A.2).
- `design/SiteFooter.dc.html` 14–116.
- `design/mka-core.js` 139–173 (logo, mandala, stars), 267–268 (diya, kalash), 452–454 (BUILT, soon), 490–518 (fx), 528–552 (SERVICES, ARTICLES, TRENDING, search).

**F5 — Home A (§1–5)**
- INV §A.1 (§1–5 rows), §E.1 S1–S4 S7 S9, §E.3 (hero slider, heading mask, marquee, magnetic, quick actions, tab swaps, parallax, add-to-cart).
- `design/Home.dc.html` 29–344 (template §1–5); script 941–1079 (state → spotAdd) and 1366–1479 (L, fallback, renderVals, vHero, vCats, vBest, vSpot).
- `design/mka-home.js` 12–184 (mala, pandit, arch, gems, catArt).
- `design/mka-astro.js` 158–170 (chakra), 422 (stars5).

**F6 — Home B (§6–9)**
- INV §A.1 (§6–9 rows), §E.1 S8 S9 S12 S13.
- `design/Home.dc.html` 346–645 (template §6–9); script 1081–1247 (boot → vIntent).
- `design/mka-astro.js` 9–151 (glyphs, rashi, kundali, chart, prime/draw/onView), 154–200 (chakra, sector, wheel, wheelActive), 260–280 (palm, tarot, loshu, svcArt), 298–318 (MODES, SVC, STEPS), 342–386 (PERIODS → KOOTA).
- `design/mka-home.js` 262–265 (seal). `design/mka-core.js` 528–533 (SERVICES).

**F7 — Home C (§10–17)**
- INV §A.1 (§10–17 rows), §A.6, §E.1 S11, §E.3 (scroll line, counter, video, shorts, course track).
- `design/Home.dc.html` 647–933 (template §10–17); script 1248–1365 (L3 → vNews).
- `design/FaqList.dc.html` 15–59.
- `design/mka-home.js` 185–300 (videos, thumbs, books, seal, reviews, timeline, quote).
- `design/mka-astro.js` 203–258 (yantra, drawYantra, thali, portrait), 327–333 (TESTI), 389–407 (courses, rituals), 410–420 (FAQ).
- `design/mka-core.js` 534–541 (ARTICLES).

**F8 — Shop + category**
- INV §A.5, §C (shop rows), §D (1024/1400).
- `design/Shop.dc.html` 26–384.
- `design/mka-core.js` 176–194 (STONES), 308–380 (CATS, INTENTS, RUD, P, BADGE).

**F9 — Consultations + detail + InquiryForm**
- INV §A.7, §A.8, §A.9, §C (consult rows).
- `design/Consultations.dc.html` 27–288; `design/Consultation-Detail.dc.html` 27–229; `design/InquiryForm.dc.html` 15–163.
- `design/mka-astro.js` 134–170 (prime/draw/onView, chakra), 249–295 (portrait, palm, tarot, loshu, svcArt, page), 298–318 (MODES, SVC, STEPS), 327–333 (TESTI), 389–398 (COURSES, course), 410–422 (FAQ, stars5).

**F10 — Booking**
- INV §A.10, §C (booking row).
- `design/Booking.dc.html` 28–603.
- `design/mka-astro.js` 10–12 (MON/MONL), 73–74 (CITIES, placeSearch), 158–170 (chakra), 260–269 (palmArt), 298–325 (MODES, SVC, STEPS, SLOTS, slotsFor, t12, istDate, ics, gcal).
- `design/mka-core.js` 20–24 (dates), 509–510 (shimmer, drawIn).

**F11 — Kundali ₹99 + Love Calculator**
- INV §A.11, §A.12, §E.1 S7 (ramp) S12 S13.
- `design/Kundali-99.dc.html` 28–500; `design/Love-Calculator.dc.html` 27–254.
- `design/mka-astro.js` 9–151, 158–170 (chakra), 283–295 (page), 334–339 (K99REV), 372–386 (nameNum → KOOTA), 413 (FAQ kundali99).

**F12 — Rashifal + Rashi detail**
- INV §A.13, §A.14, §E.1 S8.
- `design/Rashifal.dc.html` 28–299; `design/Rashi-Detail.dc.html` 27–221.
- `design/mka-astro.js` 9–74 (glyphs, rashi, graha, nak, cities, placeSearch), 90–151 (kundali, chart, draw), 173–200 (wheel), 342–369 (PERIODS → AREAS).
- `design/mka-core.js` 267 (diya).

**F13 — Courses + Rituals**
- INV §A.15, §A.16, §A.17, §E.1 S5 S11, §E.3 (scroll line, sticky CTA).
- `design/Sadhana-Courses.dc.html` 27–195; `design/Course-Detail.dc.html` 27–240; `design/Rituals.dc.html` 27–182.
- `design/mka-astro.js` 134–151 (prime/onView), 203–248 (yantra, drawYantra, thali), 389–407 (courses + rituals data), 414 + 419 (FAQ).
- `design/mka-core.js` 267 (diya).

**F14 — About + Videos + 404**
- INV §A.18, §A.19, §E.3 (scroll line, video, shorts).
- `design/About.dc.html` 28–255; `design/Videos.dc.html` 28–238.
- `design/mka-home.js` 185–259 (videos, thumbs, books), 273–300 (timeline, pillars, chapter, quote).
- `design/mka-astro.js` 158–170 (chakra), 218–225 (drawYantra), 249–258 (portrait).
- 404 has no design: reuse Chakra (S7) + the brand tokens.

---

## Gotchas collected in F1 (check when porting)
1. `data-reveal` duration is **700 ms** in core (not 600 ms as DESIGN-TO-CODE §3 says) — core wins.
2. `desk` means ≥768 in SiteChrome, ≥980 in Consultation-Detail, and Shop's template splits at 1024. Always check §D before using a flag.
3. ProductCard sizes are `std | compact | row` (+ `mode=wish`). First add-to-cart (cart count becomes 1) opens the drawer.
4. Shop's editorial banner shows once (index `cols*2`), not every 12 cards; "Load more" adds 12 (520 ms).
5. Mobile fly-to-cart targets the compact header cart (first visible `[data-cart-target]`), not the tab bar.
6. Booking: between 768 and 1023px there is no summary at all (mobile summary needs `<768`, aside needs `≥1024`). Keep 1:1 but note it for the client review.
7. Kundali-99 "Download" saves a single-page SVG (prototype); the full PDF is phase B. `demoState=generating` loops forever.
8. Love Calculator accepts Devanagari names, but `nameNum` only reads Latin letters (hash fallback); the breakdown falls back to the Priya/Arjun example.
9. Home video testimonials: `x.q = x.q` no-op at 1351 overwrites the dark palette set at 1349, so the cards render light. Match the rendered (light) result.
10. Home `bChart` (577) and `tileYantra` (261) look drawable but are never primed: render them complete and static.
11. Home heading masks: the prototype's `[data-orn]` observer (973–976) is dead code; `_it`, state `vt`, `H.GEMS`, `M.BUILT` (unreferenced), `M.reduced` are unused.
12. Home Rashifal tabs expose only today/week/month; the Rashifal page has all five periods.
13. `A.kundali` assumes IST for every city (Kathmandu is +5:45) — approximate; Swiss Ephemeris in phase B.
14. `ics()` uses `new Date()` for DTSTAMP and `predict`/`periodDate` default `now` to `new Date()` — pass `now` explicitly so SSR and client agree.
15. `M.h` caches SVG by key forever — irrelevant in React, but it means the prototype never re-colours keyed art; don't "fix" colours that look static.
