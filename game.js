/* НЕЙРОГЛИФ — мини-тамагочи.
   Каст -> дорога домой -> уход (дом / улица), тренировки, инвентарь,
   смена дня и ночи. Управление только мышью/касанием. */

(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const ui = document.getElementById('ui');
  const tctx = ui.getContext('2d');
  const W = 480, H = 300, FLOOR_Y = 230;
  canvas.width = W;
  canvas.height = H;
  ctx.imageSmoothingEnabled = false;

  function resizeUI() {
    const r = ui.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ui.width = Math.max(1, Math.round(r.width * dpr));
    ui.height = Math.max(1, Math.round(r.height * dpr));
    tctx.setTransform(ui.width / W, 0, 0, ui.height / H, 0, 0);
    tctx.textBaseline = 'top';
  }
  window.addEventListener('resize', resizeUI);
  resizeUI();

  const FONT = 'Pixelify, "Courier New", monospace';
  function font(scale) { return Math.round(9 * scale) + 'px ' + FONT; }
  function textWidth(str, scale) {
    tctx.font = font(scale);
    return tctx.measureText(String(str)).width;
  }
  function drawText(str, x, y, scale, color, align) {
    str = String(str);
    tctx.font = font(scale);
    tctx.textBaseline = 'top';
    tctx.textAlign = align || 'left';
    tctx.fillStyle = color;
    tctx.fillText(str, Math.round(x), Math.round(y));
  }
  if (document.fonts) document.fonts.load('18px Pixelify').catch(() => {});

  /* ------------------------------------------------------------------ */
  /* Спрайты                                                              */
  /* ------------------------------------------------------------------ */
  const SPRITES = {
    rostok: {
      palette: { M:'#e373ff', P:'#ffb3ff', W:'#fff4ff', D:'#a343e0' },
      rows: [
        '....................','..........D.........','.........D.D........',
        '........D...D.......','.........DDD........','..........D.........',
        '.........DD.........','.......MMMMM........','.....MMPPPPMM.......',
        '....MPPWWWPPMM......','...MPPWWWWWPPM......','...MPWWWWWWWPM......',
        '...MPWWWWWWWPM......','...MPPWWWWWPPM......','....MPPWWWPPMM......',
        '.....MMPPPPMM.......','.......MMMMM........','....................',
        '....................','....................'
      ]
    },
    bit: {
      palette: { Y:'#ffd97a', C:'#8ff6ff', W:'#eaffff', B:'#3ec8ff', D:'#1e6fd9', K:'#0d3a8f' },
      rows: [
        '....................','....................','....YYYYYYYYYYYY....',
        '...YCCCCCCCCCCCCY...','...YCWWWWWWWWWWCY...','...YCWWWWWWWWWWCY...',
        '...YCWWBBBBBBWWCY...','...YCWWBBBBBBWWCY...','...YCWWBBBBBBWWCY...',
        '...YCWWBBBBBBWWCY...','...YCWWWWWWWWWWCY...','...YCWWWWWWWWWWCY...',
        '...YCCWWWWWWWWCCY...','...YCCCCCCCCCCCCY...','....YDDDDDDDDDDY....',
        '.....YKKKKKKKKY.....','......YKKKKKKY......','....................',
        '....................','....................'
      ]
    },
    pushinka: {
      palette: { L:'#f7c6e6', W:'#ffffff', P:'#ffe3f4', E:'#fff0f8' },
      rows: [
        '....................','......LL....LL......','....LWWLL..LLWWL....',
        '...LWPPPWWWWPPWL....','..LWPPPPWWPPPPWLL...','.LWPPPPPPPPPPPPWL...',
        '.LWPPPEEEEEPPPPWL...','LWPPPEEEEEEEPPPPWL..','LWPPPEEWWEEEEPPPPWL.',
        'LWPPPEEWWEWEEEPPPPWL','LWPPPEEEEEEPPPPWL...','.LWPPPEEEEEPPPPWL...',
        '.LWPPPPEEEPPPPPPWL..','..LWWPPPPPPPPWWL....','...LLWPPPPPPWLL.....',
        '.....LLWWWWLL.......','.......LLLL.........','....................',
        '....................','....................'
      ]
    },
    iskra: {
      palette: { W:'#fffbd0', Y:'#ffd15c', O:'#ff8a2b' },
      rows: [
        '....................','.........W..........','........WYW.........',
        '.........W..........','....W....O....W.....','.....W..OYO..W......',
        '......WOYYOW........','....W.OYYYYO.W......','.....WOYYYYOW.......',
        '..W.OOYYYYYYOO.W....','...WOYYYYYYYYOW.....','..WOYYYYWWYYYYOW....',
        '.WOYYYYYWWYYYYYOW...','.WOYYYYYYYYYYYYOW...','..WOYYYYYYYYYYOW....',
        '...WOYYYYYYYYOW.....','....WOYYYYYYOW......','.....WOOYYOOW.......',
        '.......WOOOW........','........WW..........'
      ]
    },
    carrot: {
      palette: { O:'#ff9438', D:'#e06b1f', G:'#6fd05a' },
      rows: [
        '..G.G.....','...GG.....','..OOOO....','.OOODDO...','.OOODDO...',
        '..OOODO...','...OOD....','....OO....','.....O....','..........'
      ]
    },
    fish: {
      palette: { B:'#6fd8ff', T:'#4bb8e8', E:'#16324f' },
      rows: [
        '..........','..BBBBB...','.BBBBBBB..','BBBBBBBBT.',
        'BBBEBBBTT.','BBBBBBBBT.','.BBBBBBB..','..BBBBB...',
        '..........','..........'
      ]
    },
    log: {
      palette: { B:'#a0643c', L:'#d69a63', R:'#e0b07a' },
      rows: [
        '..........','.BBBBBBBB.','BLBBBBBBR.','BBBBBBBBR.',
        'BBBBBBBBR.','BBBBBBBBR.','BLBBBBBBR.','.BBBBBBBB.',
        '..........','..........'
      ]
    },
    battery: {
      palette: { K:'#33334a', Y:'#ffd35c', W:'#fff3c0' },
      rows: [
        '...KK.....','..KKKK....','..KYYYYK..','..KYWWYK..','..KYYWYK..',
        '..KYYYYK..','..KYWWYK..','..KYYWYK..','..KYYYYK..','..KKKKKK..'
      ]
    },
    ball: {
      palette: { W:'#f4f4ff', B:'#e0505a', Y:'#ffd166' },
      rows: [
        '...YYYY...','.YYWWWWYY.','YWWBBBBWWY','YWWBBBBWWY','YBBBBBBBBY',
        'YBBBBBBBBY','YWWBBBBWWY','.YYWWWWYY.','...YYYY...','..........'
      ]
    },
    house: {
      palette: { R:'#9a4f42', W:'#d9c7a3', Y:'#ffe6a0', D:'#6a4a3a', B:'#3a2820' },
      rows: [
        '.....RRRRRR.....','...RRRRRRRRRR...','.RRRRRRRRRRRRRR.','RRRRRRRRRRRRRRRR',
        'WWWWWWWWWWWWWWWW','WWWYYYYWWYYYYWWW','WWWYYYYWWYYYYWWW','WWWWWWWWWWWWWWWW',
        'WWWWWWDDDDWWWWWW','WWWWWWDBBDWWWWWW','WWWWWWDBBDWWWWWW','WWWWWWDBBDWWWWWW',
        'WWWWWWDBBDWWWWWW','DDDDDDDDDDDDDDDD'
      ]
    }
  };

  const CREATURES = [
    { id:'rostok',   name:'РОСТОК',   kind:'ЗАЯЦ',   sprite:'rostok',   glow:'255,120,255', accent:'#ff9dff', food:'carrot',   foodName:'МОРКОВЬ' },
    { id:'bit',      name:'БИТ',      kind:'РОБОТ',  sprite:'bit',      glow:'90,190,255',  accent:'#7fe0ff', food:'battery',  foodName:'ЗАРЯДКА' },
    { id:'pushinka', name:'ПУШИНКА',  kind:'КОТ',    sprite:'pushinka', glow:'255,170,220', accent:'#ffc2e8', food:'fish',     foodName:'РЫБА' },
    { id:'iskra',    name:'ИСКРА',    kind:'ДРАКОН', sprite:'iskra',    glow:'255,140,50',  accent:'#ffab5e', food:'log',      foodName:'БРЁВНО' }
  ];

  function drawSprite(id, cx, bottomY, scale, bob) {
    const s = SPRITES[id];
    const w = s.rows[0].length * scale;
    const h = s.rows.length * scale;
    const x = Math.round(cx - w / 2);
    const y = Math.round(bottomY - h + (bob || 0));
    for (let r = 0; r < s.rows.length; r++) {
      const row = s.rows[r];
      for (let c = 0; c < row.length; c++) {
        const color = s.palette[row[c]];
        if (color) { ctx.fillStyle = color; ctx.fillRect(x + c * scale, y + r * scale, scale, scale); }
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* Примитивы и цвета                                                    */
  /* ------------------------------------------------------------------ */
  function fillBoth(x, y, w, h, color) {
    ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
    tctx.fillStyle = color; tctx.fillRect(x, y, w, h);
  }
  function overlayBoth(color) { fillBoth(-12, -12, W + 24, H + 24, color); }
  function rectBoth(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x,y,w,2); ctx.fillRect(x,y+h-2,w,2);
    ctx.fillRect(x,y,2,h); ctx.fillRect(x+w-2,y,2,h);
    tctx.fillStyle = color;
    tctx.fillRect(x,y,w,2); tctx.fillRect(x,y+h-2,w,2);
    tctx.fillRect(x,y,2,h); tctx.fillRect(x+w-2,y,2,h);
  }
  function mix(a, b, k) {
    const ca = [1,3,5].map(i => parseInt(a.slice(i, i+2), 16));
    const cb = [1,3,5].map(i => parseInt(b.slice(i, i+2), 16));
    return 'rgb(' + ca.map((v,i) => Math.round(v + (cb[i]-v)*k)).join(',') + ')';
  }
  function skyColors(t) {
    const sun = Math.sin((t - 0.25) * Math.PI * 2);
    const k = (sun + 1) / 2;
    return { k, sun, top: mix('#090e2a', '#4b9fe4', k), bottom: mix('#162049', '#b6e2ff', k) };
  }
  function timeLabel() {
    if (dayTime < 0.22 || dayTime >= 0.78) return 'НОЧЬ';
    if (dayTime < 0.32) return 'УТРО';
    if (dayTime < 0.68) return 'ДЕНЬ';
    return 'ВЕЧЕР';
  }
  function glow(cx, cy, radius, rgb, alpha) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    g.addColorStop(0, 'rgba(' + rgb + ',' + alpha + ')');
    g.addColorStop(0.45, 'rgba(' + rgb + ',' + (alpha * 0.35) + ')');
    g.addColorStop(1, 'rgba(' + rgb + ',0)');
    ctx.fillStyle = g;
    ctx.fillRect(Math.round(cx - radius), Math.round(cy - radius), radius * 2, radius * 2);
  }
  function disc(cx, cy, r, color) {
    ctx.fillStyle = color;
    const rr = Math.ceil(r);
    for (let y = -rr; y <= rr; y++) for (let x = -rr; x <= rr; x++) {
      if (x*x + y*y <= r*r) ctx.fillRect(Math.round(cx+x), Math.round(cy+y), 1, 1);
    }
  }
  function ring(cx, cy, r, color) {
    ctx.fillStyle = color;
    const rr = Math.ceil(r + 1);
    for (let y = -rr; y <= rr; y++) for (let x = -rr; x <= rr; x++) {
      const d = Math.sqrt(x*x + y*y);
      if (d >= r-1 && d <= r) ctx.fillRect(Math.round(cx+x), Math.round(cy+y), 1, 1);
    }
  }
  function heart(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x+1,y,2,1); ctx.fillRect(x,y+1,4,1);
    ctx.fillRect(x+1,y+2,2,1); ctx.fillRect(x+2,y+3,1,1);
  }
  function inside(b, p) { return p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h; }
  function button(b, hovered, disabled) {
    const border = disabled ? '#44456a' : (hovered ? '#ffe0a0' : '#8d83cf');
    const fill = disabled ? '#11132a' : (hovered ? '#46367e' : '#1d1d46');
    fillBoth(b.x, b.y, b.w, b.h, 'rgba(5,8,22,0.85)');
    fillBoth(b.x+2, b.y+2, b.w-4, b.h-4, fill);
    rectBoth(b.x, b.y, b.w, b.h, border);
    const scale = b.scale || 1;
    drawText(b.label, b.x+b.w/2, b.y+(b.h-9*scale)/2-1, scale,
      disabled ? '#5c5d84' : (hovered ? '#fff5d8' : '#d6d0ff'), 'center');
  }
  function statBar(x, label, value, color) {
    drawText(label, x, 50, 1, '#b6b0e0', 'left');
    ctx.fillStyle = '#0a0c22'; ctx.fillRect(x, 63, 110, 9);
    ctx.fillStyle = color; ctx.fillRect(x+1, 64, Math.round(108 * Math.max(0, Math.min(100, value)) / 100), 7);
    ctx.fillStyle = '#4d4a78';
    ctx.fillRect(x, 63, 110, 1); ctx.fillRect(x, 71, 110, 1);
  }
  function bubble(text, accent) {
    const w = Math.max(90, textWidth(text, 1) + 26);
    const x = W/2 - w/2, by = 92;
    ctx.fillStyle = 'rgba(8,10,28,0.92)'; ctx.fillRect(x, by, w, 26);
    ctx.fillStyle = accent || '#8d83cf';
    ctx.fillRect(x, by, w, 1); ctx.fillRect(x+w/2-4, by+26, 8, 4);
    drawText(text, W/2, by+9, 1, '#eae6ff', 'center');
  }

  /* ------------------------------------------------------------------ */
  /* Состояние                                                            */
  /* ------------------------------------------------------------------ */
  let scene = 'menu';   // menu | cutscene | road | care
  let sceneTime = 0;
  let creature = null;
  let infoOpen = false, inventoryOpen = false;
  let muted = false;
  let flash = 0, shake = 0;
  let particles = [];
  let action = null;
  let sleeping = false, sleepTime = 0, levelUpTimer = 0;
  let location = 'home';       // home | outside
  let dayTime = 0.30;          // 0..1, полный цикл ~60 секунд
  let stage = 1, exp = 0;
  let stats = { food:75, mood:75, energy:85 };
  let collection = [];         // { id, stage, exp, stats }
  let statTimer = 0;
  let mouse = { x:-999, y:-999 };
  let audio = null, musicTimer = null, noteIndex = 0;

  const stars = [];
  for (let i = 0; i < 100; i++) stars.push({
    x: Math.random()*W, y: Math.random()*(FLOOR_Y-8),
    s: Math.random() < 0.8 ? 1 : 2,
    p: Math.random()*Math.PI*2, speed: 0.001 + Math.random()*0.0025
  });
  const grass = [];
  for (let x = 0; x < W; x++) grass.push({
    h: 3 + ((x*7919+13)%6),
    c: ['#397a38','#4a9440','#2f6631','#55a247'][(x*31+7)%4]
  });

  const menuButtons = [
    { label:'НОВАЯ ИГРА',  x:130, y:84,  w:220, h:24, scale:2, action:'new' },
    { label:'ПРОДОЛЖИТЬ',  x:130, y:114, w:220, h:24, scale:2, action:'continue' },
    { label:'ПРАВИЛА',     x:130, y:144, w:220, h:24, scale:2, action:'info' },
    { label:'ЗВУК: ВКЛ',   x:130, y:174, w:220, h:24, scale:2, action:'sound' },
    { label:'СБРОС ИГРЫ',  x:130, y:204, w:220, h:24, scale:2, action:'reset' }
  ];
  const cutButtons = [
    { label:'ЗАБРАТЬ ДОМОЙ', x:46,  y:276, w:210, h:19, scale:1, action:'road' },
    { label:'ЕЩЁ РАЗ',       x:264, y:276, w:170, h:19, scale:1, action:'again' }
  ];
  const roadButton = { label:'ЗАЙТИ В ДОМ', x:150, y:272, w:180, h:20, scale:1, action:'enterHome' };
  const careButtons = [
    { label:'КОРМИТЬ',    x:8,   y:242, w:110, h:26, scale:1, action:'feed' },
    { label:'ИГРАТЬ',     x:125, y:242, w:110, h:26, scale:1, action:'play' },
    { label:'ТРЕНИРОВКА', x:242, y:242, w:110, h:26, scale:1, action:'train' },
    { label:'СПАТЬ',      x:359, y:242, w:110, h:26, scale:1, action:'sleep' }
  ];
  const wakeButton = { label:'ПРОСНУТЬСЯ', x:125, y:242, w:230, h:26, scale:1, action:'wake' };
  const locationButton = { label:'НА УЛИЦУ',   x:12,  y:272, w:150, h:20, scale:1, action:'toggleLocation' };
  const inventoryButton = { label:'ИНВЕНТАРЬ', x:165, y:272, w:150, h:20, scale:1, action:'inventory' };
  const menuButton = { label:'В МЕНЮ',        x:318, y:272, w:150, h:20, scale:1, action:'menu' };
  const infoButton = { label:'ПОНЯТНО', x:190, y:224, w:100, h:20, scale:1, action:'closeInfo' };
  const invCloseButton = { label:'ЗАКРЫТЬ', x:246, y:232, w:196, h:22, scale:1, action:'closeInventory' };
  const invNewButton = { label:'ЗАВЕСТИ НОВОГО', x:34, y:232, w:196, h:22, scale:1, action:'newFromInventory' };

  function inventoryButtons() {
    const list = [];
    for (let i = 0; i < Math.min(4, collection.length); i++) {
      const e = collection[i];
      const c = CREATURES.find(x => x.id === e.id);
      list.push({
        label: c.name + ' - СТАДИЯ ' + e.stage,
        x: 210, y: 74 + i * 34, w: 234, h: 26, scale: 1,
        action: 'select:' + e.id
      });
    }
    return list.concat([invNewButton, invCloseButton]);
  }
  function activeButtons() {
    if (inventoryOpen) return inventoryButtons();
    if (infoOpen) return [infoButton];
    if (scene === 'menu') return menuButtons;
    if (scene === 'cutscene') return sceneTime >= 3100 ? cutButtons : [];
    if (scene === 'road') return sceneTime >= 1200 ? [roadButton] : [];
    if (sleeping) return [wakeButton, inventoryButton, menuButton];
    const list = careButtons.concat([inventoryButton, menuButton]);
    list.splice(0, 0, locationButton);
    return list;
  }
  function disabled(b) { return b.action === 'continue' && !creature; }

  /* ------------------------------------------------------------------ */
  /* Музыка и звук                                                        */
  /* ------------------------------------------------------------------ */
  const MELODY = [69,null,72,76,74,null,72,69, 67,null,69,72,71,null,69,null,
                  64,null,67,69,72,71,null,69,67, 66,null,64,null,67,null,null];
  function hz(m) { return 440 * Math.pow(2, (m-69)/12); }
  function ensureAudio() {
    if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    return audio;
  }
  function note(freq, dur, type, vol, slideTo) {
    if (muted) return;
    try {
      const a = ensureAudio();
      const o = a.createOscillator(), g = a.createGain();
      const now = a.currentTime;
      o.type = type || 'square';
      o.frequency.setValueAtTime(freq, now);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, now+dur);
      g.gain.setValueAtTime(vol || 0.04, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now+dur);
      o.connect(g); g.connect(a.destination);
      o.start(now); o.stop(now+dur);
    } catch (e) { /* без звука тоже играем */ }
  }
  function beep(f, d, t, v, s) { note(f, d, t, v, s); }
  function startMusic() {
    if (musicTimer) return;
    try { ensureAudio(); } catch (e) { return; }
    musicTimer = setInterval(() => {
      if (muted || !audio || audio.state !== 'running') return;
      const m = MELODY[noteIndex % MELODY.length];
      if (m !== null) note(hz(m), 0.22, 'triangle', 0.016);
      if (noteIndex % 8 === 0) note(hz(45), 0.42, 'sine', 0.022);
      noteIndex++;
    }, 265);
  }
  function fanfare() {
    beep(660, 0.12, 'square', 0.05);
    setTimeout(() => beep(880, 0.12, 'square', 0.05), 120);
    setTimeout(() => beep(1180, 0.3, 'triangle', 0.05), 240);
  }

  /* ------------------------------------------------------------------ */
  /* Коллекция и переходы                                                 */
  /* ------------------------------------------------------------------ */
  function saveCurrent() {
    if (!creature || (scene !== 'care' && scene !== 'road')) return;
    const i = collection.findIndex(e => e.id === creature.id);
    const entry = { id:creature.id, stage:stage, exp:exp, stats:{ ...stats } };
    if (i >= 0) collection[i] = entry;
    else collection.push(entry);
  }
  function selectCreature(id) {
    saveCurrent();
    const e = collection.find(x => x.id === id);
    if (!e) return;
    creature = CREATURES.find(c => c.id === id);
    stage = e.stage; exp = e.exp; stats = { ...e.stats };
    scene = 'care'; sceneTime = 0; action = null;
    sleeping = false; levelUpTimer = 0; particles = [];
    inventoryOpen = false;
    beep(700, 0.12, 'triangle', 0.04, 1000);
  }
  function startCutscene() {
    saveCurrent();
    creature = CREATURES[Math.floor(Math.random() * CREATURES.length)];
    scene = 'cutscene'; sceneTime = 0; particles = [];
    flash = 0; shake = 0; action = null; sleeping = false;
    location = 'home'; stage = 1; exp = 0; levelUpTimer = 0;
    stats = { food:75, mood:75, energy:85 };
    inventoryOpen = false; infoOpen = false;
    beep(180, 0.5, 'sine', 0.05, 520);
  }
  function enterRoad() {
    scene = 'road'; sceneTime = 0; particles = []; action = null; sleeping = false;
    beep(520, 0.12, 'triangle', 0.04, 780);
  }
  function enterCare() {
    scene = 'care'; sceneTime = 0; particles = []; action = null;
    sleeping = false; sleepTime = 0; statTimer = 0;
    saveCurrent();
    beep(660, 0.14, 'triangle', 0.045, 990);
  }
  function toMenu() {
    saveCurrent();
    scene = 'menu'; sceneTime = 0; particles = []; action = null;
    sleeping = false; flash = 0; inventoryOpen = false;
  }
  function startAction(type) {
    action = { type: type, t: 0 };
    particles = [];
    beep(type === 'feed' ? 640 : (type === 'train' ? 500 : 880), 0.09, 'square', 0.035);
    if (type === 'feed') {
      stats.food = Math.min(100, stats.food + 26);
      stats.mood = Math.min(100, stats.mood + 4);
      stats.energy = Math.max(0, stats.energy - 3);
    } else if (type === 'play') {
      stats.mood = Math.min(100, stats.mood + 24);
      stats.energy = Math.max(0, stats.energy - 12);
      stats.food = Math.max(0, stats.food - 5);
    } else {
      exp += 34;
      stats.energy = Math.max(0, stats.energy - 10);
      stats.food = Math.max(0, stats.food - 4);
      stats.mood = Math.min(100, stats.mood + 3);
    }
  }
  function click(a) {
    beep(540, 0.06, 'square', 0.03);
    if (a === 'new' || a === 'again' || a === 'newFromInventory') startCutscene();
    else if (a.startsWith('select:')) selectCreature(a.slice(7));
    else if (a === 'continue') { if (creature) enterCare(); }
    else if (a === 'road') enterRoad();
    else if (a === 'enterHome') enterCare();
    else if (a === 'menu') toMenu();
    else if (a === 'info') infoOpen = true;
    else if (a === 'closeInfo') infoOpen = false;
    else if (a === 'inventory') { inventoryOpen = true; saveCurrent(); }
    else if (a === 'closeInventory') inventoryOpen = false;
    else if (a === 'toggleLocation') {
      location = location === 'home' ? 'outside' : 'home';
      beep(location === 'outside' ? 760 : 480, 0.12, 'triangle', 0.04);
    } else if (a === 'sound') {
      muted = !muted;
      menuButtons[3].label = 'ЗВУК: ' + (muted ? 'ВЫКЛ' : 'ВКЛ');
      beep(660, 0.1, 'square', 0.04);
    } else if (a === 'reset') { creature = null; collection = []; toMenu(); }
    else if (a === 'feed' || a === 'play' || a === 'train') startAction(a);
    else if (a === 'sleep') { sleeping = true; sleepTime = 0; action = null; beep(330, 0.3, 'sine', 0.04, 180); }
    else if (a === 'wake') { sleeping = false; sleepTime = 0; beep(720, 0.1, 'triangle', 0.04, 1100); }
  }

  /* ------------------------------------------------------------------ */
  /* Ввод: только мышь / касание                                          */
  /* ------------------------------------------------------------------ */
  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left)*W/r.width, y: (e.clientY - r.top)*H/r.height };
  }
  canvas.addEventListener('pointermove', e => { mouse = pos(e); });
  canvas.addEventListener('pointerleave', () => { mouse = { x:-999, y:-999 }; });
  canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    startMusic();
    mouse = pos(e);
    for (const b of activeButtons()) {
      if (inside(b, mouse)) { if (!disabled(b)) click(b.action); return; }
    }
    if (inventoryOpen) inventoryOpen = false;
    else if (infoOpen) infoOpen = false;
  });

  /* ------------------------------------------------------------------ */
  /* Обновление                                                           */
  /* ------------------------------------------------------------------ */
  function update(dt) {
    dayTime = (dayTime + dt / 60000) % 1;
    if (scene === 'cutscene') {
      const prev = sceneTime;
      sceneTime += dt;
      if (sceneTime > 700 && sceneTime < 2700 && Math.random() < 0.75) {
        const a = Math.random()*Math.PI*2, d = 62 + Math.random()*55;
        particles.push({
          x: W/2 + Math.cos(a)*d, y: 178 + Math.sin(a)*d*0.75,
          vx: -Math.cos(a)*(55+Math.random()*55), vy: -Math.sin(a)*(45+Math.random()*45),
          life: 1100, max: 1100, color: creature.accent, size: 1
        });
      }
      if (prev < 2700 && sceneTime >= 2700) {
        flash = 1; shake = 5;
        beep(880, 0.18, 'triangle', 0.06, 1400);
        beep(1320, 0.3, 'sine', 0.035);
        for (let i = 0; i < 46; i++) {
          const a = Math.random()*Math.PI*2, sp = 45 + Math.random()*95;
          particles.push({
            x: W/2, y: 178, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp - 20,
            life: 700+Math.random()*600, max: 1300,
            color: i%3 === 0 ? '#ffffff' : creature.accent,
            size: i%4 === 0 ? 2 : 1, gravity: 55
          });
        }
      }
      flash = Math.max(0, flash - dt/420);
      shake = Math.max(0, shake - dt/45);
    }
    if (scene === 'road') {
      sceneTime += dt;
      if (sceneTime < 1300 && Math.random() < 0.3) particles.push({
        x: 60 + (sceneTime/1300)*250 + (Math.random()-0.5)*18,
        y: FLOOR_Y-2, vx: -12, vy: -12, life: 400, max: 400, color: '#8a8a6a', size: 1
      });
      if (sceneTime > 3600) enterCare();
    }
    if (scene === 'care') {
      flash = Math.max(0, flash - dt/500);
      levelUpTimer = Math.max(0, levelUpTimer - dt);
      statTimer += dt;
      while (statTimer >= 1000) {
        statTimer -= 1000;
        if (sleeping) {
          stats.energy = Math.min(100, stats.energy + 9);
          stats.food = Math.max(0, stats.food - 0.25);
        } else {
          stats.food = Math.max(0, stats.food - 0.7);
          stats.mood = Math.max(0, stats.mood - 0.4);
          stats.energy = Math.max(0, stats.energy - 0.25);
        }
      }
      if (sleeping && Math.random() < 0.015) particles.push({
        x: 250+Math.random()*14, y: 168, vx: 3, vy: -14,
        life: 1700, max: 1700, color: '#bcd4ff', size: 1, z: true
      });
      if (action) {
        action.t += dt;
        const t = action.t;
        if (action.type === 'feed' && t > 650 && t < 1900 && Math.random() < 0.05) particles.push({
          x: 240+(Math.random()-0.5)*34, y: 196, vx: (Math.random()-0.5)*12, vy: -26,
          life: 900, max: 900, color: '#ff9ec6', size: 1, heart: true
        });
        if (action.type === 'train' && Math.random() < 0.16) particles.push({
          x: 240+(Math.random()-0.5)*70, y: 190+(Math.random()-0.5)*40,
          vx: 0, vy: -30, life: 500, max: 500, color: '#ffe066', size: 1
        });
        const dur = action.type === 'train' ? 2300 : (action.type === 'feed' ? 2400 : 2700);
        if (t > dur) {
          if (action.type === 'train' && exp >= 100 && stage < 4) {
            exp -= 100;
            stage++;
            flash = 0.6;
            levelUpTimer = 1700;
            fanfare();
            for (let i = 0; i < 40; i++) {
              const a = Math.random()*Math.PI*2, sp = 40+Math.random()*80;
              particles.push({ x:240, y:190, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp,
                life:900, max:900, color: i%2 ? creature.accent : '#fff6c0', size: i%3?1:2 });
            }
          }
          action = null;
        }
      }
    }
    for (let i = particles.length-1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx*dt/1000; p.y += p.vy*dt/1000;
      if (p.gravity) p.vy += p.gravity*dt/1000;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Фоны                                                                 */
  /* ------------------------------------------------------------------ */
  function nightSky() {
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#070b20'); g.addColorStop(0.62,'#0d1638'); g.addColorStop(1,'#0a1226');
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    for (const s of stars) {
      const a = 0.28+0.72*(0.5+0.5*Math.sin(performance.now()*s.speed+s.p));
      ctx.fillStyle = 'rgba(226,232,255,'+a.toFixed(2)+')';
      ctx.fillRect(s.x,s.y,s.s,s.s);
    }
  }
  function drawGrass(now) {
    ctx.fillStyle = '#0a1420'; ctx.fillRect(0,FLOOR_Y+10,W,H-FLOOR_Y);
    for (let x = 0; x < W; x++) {
      const sw = Math.round(Math.sin(now/700+x/13)*0.6);
      ctx.fillStyle = grass[x].c;
      ctx.fillRect(x, FLOOR_Y-grass[x].h+sw, 1, grass[x].h+11);
    }
    ctx.fillStyle = '#1e3a24'; ctx.fillRect(0,FLOOR_Y+9,W,3);
  }
  function drawTree(x) {
    ctx.fillStyle = '#5a3b28'; ctx.fillRect(x-3, FLOOR_Y-34, 6, 34);
    disc(x, FLOOR_Y-42, 16, '#2f6b36');
    disc(x-9, FLOOR_Y-35, 12, '#3b7d3e');
    disc(x+9, FLOOR_Y-36, 12, '#397a3a');
    disc(x, FLOOR_Y-49, 11, '#468c43');
  }
  function drawOutside(now) {
    const sky = skyColors(dayTime);
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0, sky.top); g.addColorStop(1, sky.bottom);
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    const dark = 1 - sky.k;
    for (const s of stars) {
      const a = dark * (0.3+0.7*(0.5+0.5*Math.sin(now*s.speed+s.p)));
      ctx.fillStyle = 'rgba(235,240,255,'+a.toFixed(2)+')';
      ctx.fillRect(s.x,s.y,s.s,s.s);
    }
    const ang = (dayTime-0.25)*Math.PI*2;
    if (sky.sun > 0) {
      const sx = 330+Math.cos(ang)*170, sy = 170-Math.sin(ang)*130;
      glow(sx, sy, 44, '255,220,120', 0.35*sky.k);
      disc(sx, sy, 13, '#fff2b0');
    } else {
      const mx = 330-Math.cos(ang)*170, my = 170+Math.sin(ang)*130;
      glow(mx, my, 40, '200,220,255', 0.2);
      disc(mx, my, 12, '#f2e9bd');
      disc(mx-4, my-3, 2, '#d7ceA0');
    }
    if (sky.k > 0.45) {
      ctx.fillStyle = 'rgba(255,255,255,'+((sky.k-0.45)*0.5).toFixed(2)+')';
      ctx.fillRect(70+((now/90)%300), 62, 34, 7);
      ctx.fillRect(84+((now/90)%300), 56, 22, 7);
      ctx.fillRect(250+((now/120)%200), 88, 28, 6);
    }
    ctx.fillStyle = mix('#16243a','#3b7a48',sky.k);
    ctx.fillRect(0, 168, W, 62);
    ctx.fillStyle = mix('#101d30','#2f6b3e',sky.k);
    ctx.fillRect(0, 190, W, 40);
    drawGrass(now);
    if (dark > 0.05) {
      ctx.fillStyle = 'rgba(2,6,22,'+(dark*0.35).toFixed(2)+')';
      ctx.fillRect(0, FLOOR_Y-8, W, H-FLOOR_Y+8);
    }
    drawTree(58); drawTree(422);
    drawText('УЛИЦА - ' + timeLabel(), 8, 6, 1, '#e8e6ff', 'left');
  }
  function drawRoom(now) {
    const sky = skyColors(dayTime);
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#1b1633'); g.addColorStop(0.7,'#2a1f3d'); g.addColorStop(1,'#241a33');
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    ctx.fillStyle = mix('#0a1030','#6fb8ef',sky.k); ctx.fillRect(34,92,88,84);
    if (sky.k < 0.6) {
      for (let i = 0; i < 14; i++) {
        ctx.fillStyle = 'rgba(235,240,255,'+((1-sky.k)*0.9).toFixed(2)+')';
        ctx.fillRect(38+((i*37)%80), 96+((i*53)%76), 1, 1);
      }
    }
    if (sky.sun > 0) disc(104, 116, 8, '#fff2b0');
    else disc(104, 116, 8, '#f2e9bd');
    ctx.fillStyle = '#6a4a8a';
    ctx.fillRect(32,90,92,4); ctx.fillRect(32,174,92,5);
    ctx.fillRect(32,90,4,89); ctx.fillRect(120,90,4,89);
    ctx.fillRect(75,90,4,89); ctx.fillRect(32,130,92,4);
    ctx.fillStyle = '#4a3326'; ctx.fillRect(0,214,W,26);
    ctx.fillStyle = '#5c4030'; ctx.fillRect(0,214,W,3);
    for (let x = 0; x < W; x += 24) { ctx.fillStyle = '#3d2a20'; ctx.fillRect(x,220,1,20); }
    ctx.fillStyle = '#6b3f66'; ctx.fillRect(160,222,160,9);
    ctx.fillStyle = '#8a5590'; ctx.fillRect(166,224,148,5);
    glow(410,80,46,'255,190,110',0.16);
    ctx.fillStyle = '#ffd99a'; ctx.fillRect(404,62,12,8);
    ctx.fillStyle = '#7a5a40'; ctx.fillRect(409,70,2,28);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0,240,W,H-240);
    drawText('ДОМ - ' + timeLabel(), 8, 6, 1, '#cfc8f5', 'left');
  }
  function drawParticles() {
    for (const p of particles) {
      const a = Math.max(0, Math.min(1, p.life/p.max));
      ctx.globalAlpha = a; tctx.globalAlpha = a;
      if (p.heart) heart(Math.round(p.x), Math.round(p.y), p.color);
      else if (p.z) drawText('Z', p.x, p.y, 1, p.color, 'center');
      else { ctx.fillStyle = p.color; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size); }
    }
    ctx.globalAlpha = 1; tctx.globalAlpha = 1;
  }

  /* ------------------------------------------------------------------ */
  /* Меню                                                                 */
  /* ------------------------------------------------------------------ */
  function drawMenu(now) {
    nightSky();
    ctx.fillStyle = '#0a1420'; ctx.fillRect(0,FLOOR_Y+10,W,H-FLOOR_Y);
    for (let x = 0; x < W; x++) {
      ctx.fillStyle = grass[x].c;
      ctx.fillRect(x, FLOOR_Y-grass[x].h, 1, grass[x].h+11);
    }
    glow(74,62,46,'150,170,255',0.12);
    disc(74,60,17,'#e9e4c8');
    disc(69,55,3,'#cfc9a8'); disc(80,66,2,'#cfc9a8');
    glow(408,128,30,'180,120,255',0.16);
    for (let i = 0; i < 5; i++) {
      const a = now/900 + i*1.25;
      ctx.fillStyle = i%2 ? '#c9b6ff' : '#fff2c0';
      ctx.fillRect(Math.round(408+Math.cos(a)*20), Math.round(128+Math.sin(a)*26), 2, 2);
    }
    tctx.shadowColor = 'rgba(255,205,120,0.55)'; tctx.shadowBlur = 10;
    drawText('НЕЙРОГЛИФ', W/2, 16, 3, '#ffd88a', 'center');
    tctx.shadowBlur = 0;
    drawText('ТАМАГОЧИ - УХОД ЗА СУЩЕСТВОМ', W/2, 52, 1, '#a99bff', 'center');
    ctx.fillStyle = '#5b5690';
    for (let x = W/2-80; x < W/2+80; x += 6) ctx.fillRect(x,68,3,1);
    for (const b of menuButtons) button(b, inside(b,mouse), disabled(b));
    drawText('v0.4 - DEMO', W-6, H-13, 1, '#4a4f80', 'right');
  }

  /* ------------------------------------------------------------------ */
  /* Каст сцена                                                           */
  /* ------------------------------------------------------------------ */
  function drawSummon(now) {
    const cx = W/2, cy = 178, t = sceneTime, c = creature;
    glow(cx,cy,58,c.glow,0.22+0.1*Math.sin(t/150));
    const pulse = 1+0.07*Math.sin(t/110);
    ring(cx,cy,26*pulse,c.accent);
    ring(cx,cy,19*pulse,c.accent);
    ring(cx,cy,12*pulse,'rgba(255,255,255,0.85)');
    disc(cx,cy,6+1.5*Math.sin(t/90),'#ffffff');
    for (let i = 0; i < 12; i++) {
      const a = t/380+i*Math.PI/6, d = 34+5*Math.sin(t/220+i);
      ctx.fillStyle = i%2 ? c.accent : '#ffffff';
      ctx.fillRect(Math.round(cx+Math.cos(a)*d), Math.round(cy+Math.sin(a)*d*0.8), 2, 2);
    }
  }
  function drawCutscene(now) {
    nightSky(); drawGrass(now); drawParticles();
    const c = creature;
    if (sceneTime < 700) drawText('...', W/2, 40, 2, '#6f6aa8', 'center');
    else if (sceneTime < 3100) {
      drawText('ЧТО-ТО ПРОСЫПАЕТСЯ', W/2, 34, 2, '#b9b2ff', 'center');
      if (sceneTime < 2700) drawSummon(now);
    } else {
      const since = sceneTime-3100;
      const bounce = since < 520 ? -Math.abs(Math.sin(since/95))*16*(1-since/520) : Math.sin(now/420)*2;
      glow(W/2,198,52,c.glow,0.28+0.06*Math.sin(now/260));
      ctx.fillStyle = 'rgba('+c.glow+',0.22)'; ctx.fillRect(W/2-30,FLOOR_Y+1,60,3);
      drawSprite(c.sprite, W/2, FLOOR_Y, 3, bounce);
      drawText('ТВОЙ НЕЙРОГЛИФ!', W/2, 22, 2, '#ffe1a0', 'center');
      const nw = textWidth(c.name,2)+24;
      ctx.fillStyle = 'rgba(6,9,24,0.9)'; ctx.fillRect(W/2-nw/2,240,nw,22);
      ctx.fillStyle = c.accent;
      ctx.fillRect(W/2-nw/2,240,nw,1); ctx.fillRect(W/2-nw/2,261,nw,1);
      drawText(c.name, W/2, 243, 2, '#fff2d6', 'center');
      drawText(c.kind+' - СТАДИЯ 1', W/2, 266, 1, '#9a96cf', 'center');
      for (const b of cutButtons) button(b, inside(b,mouse), false);
    }
    if (flash > 0) overlayBoth('rgba(255,250,240,'+Math.min(0.92,flash).toFixed(2)+')');
    if (sceneTime < 400) overlayBoth('rgba(2,4,12,'+(1-sceneTime/400).toFixed(2)+')');
  }

  /* ------------------------------------------------------------------ */
  /* Дорога домой                                                         */
  /* ------------------------------------------------------------------ */
  function drawRoad(now) {
    nightSky(); drawGrass(now); drawParticles();
    const t = sceneTime, k = Math.min(1, t/1300), x = 62+258*k;
    drawText('НЕСЁМ ДОМОЙ', W/2, 26, 2, '#ffe1a0', 'center');
    glow(x,196,34,creature.glow,0.18);
    drawSprite(creature.sprite, x, FLOOR_Y, 3, -Math.abs(Math.sin(t/105))*4);
    drawSprite('house', 390, FLOOR_Y+8, 3, 0);
    if (t > 1250) {
      bubble('ВОТ И ДОМ!', creature.accent);
      button(roadButton, inside(roadButton,mouse), false);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Уход (дом / улица)                                                   */
  /* ------------------------------------------------------------------ */
  function drawCare(now) {
    const c = creature;
    if (location === 'home') drawRoom(now); else drawOutside(now);
    if (sleeping) overlayBoth('rgba(3,6,24,0.42)');
    drawParticles();

    drawText(c.name, W/2, 6, 3, '#ffe1a0', 'center');
    drawText(c.kind+' - СТАДИЯ '+stage, W/2, 36, 1, '#9a96cf', 'center');
    statBar(12, 'СЫТОСТЬ', stats.food, '#ff9d5c');
    statBar(126, ' НАСТРОЕНИЕ', stats.mood, '#ff8fc8');
    statBar(240, ' ЭНЕРГИЯ', stats.energy, '#7fc9ff');
    statBar(354, ' ОПЫТ', exp, '#ffe07a');

    glow(W/2, 200, 50+stage*6, c.glow, sleeping ? 0.1 : 0.16+stage*0.03);
    const size = [0,3,4,4,5][stage] || 3;
    let phrase;
    if (sleeping) {
      drawSprite(c.sprite, W/2, FLOOR_Y, size, Math.sin(sleepTime/520)*1.5);
      ctx.fillStyle = '#241a35';
      ctx.fillRect(W/2-18,198,10,2); ctx.fillRect(W/2+8,198,10,2);
      phrase = 'СЛАДКИХ СНОВ';
    } else if (action && action.type === 'feed') {
      const t = action.t;
      drawSprite(c.sprite, W/2, FLOOR_Y, size,
        t > 650 && t < 1900 ? Math.sin(t/65)*2 : Math.sin(now/400)*2);
      if (t < 900) {
        const k = Math.min(1, t/650);
        drawSprite(c.food, 330-90*k, 96+100*k*k, 2, 0);
      }
      phrase = t < 650 ? 'СМОТРИ: '+c.foodName : (t < 1900 ? 'НЯМ-НЯМ!' : 'ВКУСНО!');
    } else if (action && action.type === 'play') {
      const t = action.t, k = Math.min(1, t/2500);
      const bx = 34+412*k, by = 150-Math.abs(Math.sin(k*Math.PI*7))*52;
      const near = bx > 190 && bx < 290;
      drawSprite(c.sprite, W/2, FLOOR_Y, size, near ? -Math.abs(Math.sin(t/75))*12 : Math.sin(now/400)*2);
      drawSprite('ball', bx, by+10, 2, 0);
      if (near && Math.random() < 0.3) particles.push({
        x:240+(Math.random()-0.5)*50, y:190,
        vx:(Math.random()-0.5)*30, vy:-35, life:500, max:500, color:'#ffe066', size:2
      });
      phrase = near ? 'ПОЙМАЛ!' : 'ИГРАЕМ!';
    } else if (action && action.type === 'train') {
      const t = action.t, lift = Math.abs(Math.sin(t/125))*12;
      drawSprite(c.sprite, W/2, FLOOR_Y, size, -lift);
      ring(W/2, 194, 40+Math.sin(t/110)*4, c.accent);
      ctx.fillStyle = '#c8d0e0';
      ctx.fillRect(W/2-15, 156-lift, 9, 6);
      ctx.fillRect(W/2+6, 156-lift, 9, 6);
      ctx.fillRect(W/2-6, 158-lift, 12, 2);
      phrase = t < 1300 ? 'ТРЕНИРУЮСЬ!' : 'СТАНОВЛЮСЬ СИЛЬНЕЕ!';
    } else {
      drawSprite(c.sprite, W/2, FLOOR_Y, size, Math.sin(now/420)*2);
      if (levelUpTimer > 0) phrase = 'УРОВЕНЬ '+stage+'!';
      else if (stats.food < 25) phrase = 'Я ГОЛОДНЫЙ...';
      else if (stats.energy < 25) phrase = 'ХОЧУ СПАТЬ...';
      else if (stats.mood < 25) phrase = 'МНЕ СКУЧНО...';
      else phrase = 'ЧТО БУДЕМ ДЕЛАТЬ?';
    }
    // орбитальные искры — признак прокачки
    if (stage >= 2 && !sleeping) {
      for (let i = 0; i < stage-1; i++) {
        const a = now/600 + i*2.1;
        ctx.fillStyle = i%2 ? c.accent : '#fff3c0';
        ctx.fillRect(Math.round(W/2+Math.cos(a)*50), Math.round(190+Math.sin(a)*22), 2, 2);
      }
    }
    bubble(phrase, sleeping ? '#7f8fd0' : c.accent);
    for (const b of (sleeping ? [wakeButton] : careButtons)) button(b, inside(b,mouse), false);
    locationButton.label = location === 'home' ? 'НА УЛИЦУ' : 'ДОМОЙ';
    if (!sleeping) button(locationButton, inside(locationButton,mouse), false);
    button(inventoryButton, inside(inventoryButton,mouse), false);
    button(menuButton, inside(menuButton,mouse), false);
    if (flash > 0) overlayBoth('rgba(255,245,210,'+(flash*0.7).toFixed(2)+')');
  }

  /* ------------------------------------------------------------------ */
  /* Окна                                                                 */
  /* ------------------------------------------------------------------ */
  function drawInfo() {
    overlayBoth('rgba(3,5,16,0.92)');
    const x = 38, y = 24, w = W-76, h = 252;
    fillBoth(x,y,w,h,'#10163a'); rectBoth(x,y,w,h,'#b6a6ff');
    drawText('НЕЙРОГЛИФ', W/2, y+10, 3, '#ffd88a', 'center');
    drawText('ПРАВИЛА ИГРЫ', W/2, y+42, 1, '#9a92d8', 'center');
    const lines = [
      'СЛУЧАЙНОЕ СУЩЕСТВО ПОЯВЛЯЕТСЯ,',
      'ТЫ ЗАБИРАЕШЬ ЕГО ДОМОЙ И',
      'УХАЖИВАЕШЬ ЗА НИМ.',
      '',
      'У КАЖДОГО СВОЯ ЛЮБИМАЯ ЕДА:',
      'ЗАЯЦ - МОРКОВЬ, КОТ - РЫБА,',
      'РОБОТ - ЗАРЯДКА, ДРАКОН - БРЁВНО.',
      '',
      'ТРЕНИРОВКИ ПОВЫШАЮТ СТАДИЮ.',
      'НА УЛИЦЕ МЕНЯЕТСЯ ДЕНЬ И НОЧЬ.',
      'В ИНВЕНТАРЕ МОЖНО ВЫБРАТЬ',
      'ДРУГОГО ИЛИ ЗАВЕСТИ НОВОГО.'
    ];
    for (let i = 0; i < lines.length; i++) drawText(lines[i], W/2, y+56+i*13, 1, '#d2ceff', 'center');
    button(infoButton, inside(infoButton,mouse), false);
  }
  function drawInventory(now) {
    overlayBoth('rgba(3,5,16,0.92)');
    const x = 26, y = 20, w = W-52, h = 260;
    fillBoth(x,y,w,h,'#141a3d'); rectBoth(x,y,w,h,'#b6a6ff');
    drawText('ИНВЕНТАРЬ', W/2, y+8, 3, '#ffd88a', 'center');
    drawText('МОИ ТАМАГОЧИ', x+22, y+46, 1, '#a99bff', 'left');
    if (creature) {
      glow(x+70, y+164, 40, creature.glow, 0.2);
      drawSprite(creature.sprite, x+70, y+166, 2, Math.sin(now/400)*2);
      drawText(creature.name, x+70, y+174, 1, '#eae6ff', 'center');
    }
    if (collection.length === 0) {
      drawText('ПОКА НИКОГО НЕТ', 320, y+110, 1, '#7d7aa8', 'center');
    }
    for (const b of inventoryButtons()) button(b, inside(b,mouse), false);
  }

  function render(now) {
    tctx.clearRect(0,0,W,H);
    const sx = shake > 0 ? Math.round((Math.random()-0.5)*shake) : 0;
    const sy = shake > 0 ? Math.round((Math.random()-0.5)*shake) : 0;
    ctx.save(); tctx.save();
    if (shake > 0) { ctx.translate(sx,sy); tctx.translate(sx,sy); }
    if (scene === 'menu') drawMenu(now);
    else if (scene === 'cutscene') drawCutscene(now);
    else if (scene === 'road') drawRoad(now);
    else drawCare(now);
    ctx.restore(); tctx.restore();
    if (inventoryOpen) {
      tctx.clearRect(0,0,W,H);
      drawInventory(now);
    } else if (infoOpen) {
      tctx.clearRect(0,0,W,H);
      drawInfo();
    }
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(now-last, 50);
    last = now;
    update(dt);
    render(now);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
