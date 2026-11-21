(() => {
  'use strict';

  // ---------- Data ----------
  const PET_TYPES = [
    { id: 'cat', name: 'Котик', avatar: '🐱', desc: 'Ласковый и игривый. Быстрее поднимает настроение.', trait: '+счастье, -энергия', mods: { hunger: 1, happy: 1.15, energy: 0.95, hygiene: 1, health: 1 } },
    { id: 'dragon', name: 'Дракончик', avatar: '🐲', desc: 'Выносливый малыш. Реже болеет, но любит поесть.', trait: '+здоровье, +аппетит', mods: { hunger: 1.15, happy: 1, energy: 1.05, hygiene: 0.95, health: 1.15 } },
    { id: 'bunny', name: 'Зайка', avatar: '🐰', desc: 'Нежный и чистоплотный. Любит уход и игры.', trait: '+чистота, +настроение', mods: { hunger: 1, happy: 1.1, energy: 1, hygiene: 1.15, health: 1 } },
    { id: 'robot', name: 'Робо-пэт', avatar: '🤖', desc: 'Стабильный и экономичный. Медленнее теряет статы.', trait: 'медленный decay', mods: { hunger: 0.9, happy: 0.95, energy: 0.95, hygiene: 0.9, health: 1.05 } },
  ];

  const SHOP_ITEMS = [
    { id:'apple', cat:'food', name:'Яблоко', icon:'🍎', price:12, desc:'Лёгкий перекус. +12 сытость.', effect:{ hunger:12, happy:2 } },
    { id:'fish', cat:'food', name:'Рыбка', icon:'🐟', price:20, desc:'Сытная еда. +20 сытость.', effect:{ hunger:20, happy:3 } },
    { id:'cake', cat:'food', name:'Тортик', icon:'🍰', price:35, desc:'Очень вкусно. +28 сытость, +8 счастье.', effect:{ hunger:28, happy:8, hygiene:-2 } },
    { id:'premium', cat:'food', name:'Премиум-корм', icon:'🥩', price:55, desc:'Лучший корм. +40 сытость, +5 здоровье.', effect:{ hunger:40, health:5, happy:4 } },
    { id:'syrup', cat:'medicine', name:'Сироп', icon:'🧴', price:30, desc:'Лечит простуду и даёт +10 здоровье.', effect:{ health:10 }, cures:['cold'] },
    { id:'pills', cat:'medicine', name:'Таблетки', icon:'💊', price:45, desc:'Лечат отравление и дают +15 здоровье.', effect:{ health:15 }, cures:['poison'] },
    { id:'kit', cat:'medicine', name:'Аптечка', icon:'🧰', price:80, desc:'Универсальное лечение. +25 здоровье.', effect:{ health:25 }, cures:['cold','poison','rash'] },
    { id:'soap', cat:'care', name:'Мыло', icon:'🧼', price:15, desc:'+25 чистота.', effect:{ hygiene:25 } },
    { id:'shampoo', cat:'care', name:'Шампунь', icon:'🫧', price:28, desc:'+40 чистота, +4 счастье.', effect:{ hygiene:40, happy:4 } },
    { id:'ball', cat:'toy', name:'Мячик', icon:'⚽', price:25, desc:'+15 счастье, -5 энергия.', effect:{ happy:15, energy:-5 } },
    { id:'duck', cat:'toy', name:'Уточка', icon:'🦆', price:40, desc:'+22 счастье, -8 энергия.', effect:{ happy:22, energy:-8 } },
    { id:'gamepad', cat:'toy', name:'Игровая консоль', icon:'🎮', price:70, desc:'+30 счастье, -10 энергия.', effect:{ happy:30, energy:-10 } },
  ];

  const SHOP_CATS = [
    { id:'all', name:'Все' },
    { id:'food', name:'Еда' },
    { id:'medicine', name:'Лекарства' },
    { id:'care', name:'Уход' },
    { id:'toy', name:'Игрушки' },
  ];

  const ILLNESSES = {
    cold: { id:'cold', name:'Простуда', icon:'🤧', desc:'Питомец чихает и теряет здоровье.', healthDrain: 0.9, moodDrain: 0.4 },
    poison: { id:'poison', name:'Отравление', icon:'🤢', desc:'Болезнь от плохой гигиены/еды. Сильно бьёт по здоровью.', healthDrain: 1.3, moodDrain: 0.6 },
    rash: { id:'rash', name:'Сыпь', icon:'🫠', desc:'Появляется при плохой чистоте. Снижает счастье.', healthDrain: 0.5, moodDrain: 0.9 },
  };

  const SAVE_KEY = 'tamagotchi-v2-save';

  // ---------- State ----------
  let state = null;
  let selectedPetType = 'cat';
  let tickTimer = null;
  let lastTs = Date.now();
  let activeMiniGame = null;
  let audioCtx = null;

  // ---------- DOM ----------
  const $ = id => document.getElementById(id);
  const dom = {
    dayLabel: $('dayLabel'), coinsValue: $('coinsValue'), clockPill: $('clockPill'),
    petStage: $('petStage'), pet: $('pet'), petBubble: $('petBubble'), petMouth: $('petMouth'),
    petName: $('petName'), petNameplate: $('petNameplate'), petMeta: $('petMeta'), moodChip: $('moodChip'),
    xpFill: $('xpFill'), xpText: $('xpText'),
    hungerVal: $('hungerVal'), happyVal: $('happyVal'), energyVal: $('energyVal'), healthVal: $('healthVal'), hygieneVal: $('hygieneVal'),
    hungerBar: $('hungerBar'), happyBar: $('happyBar'), energyBar: $('energyBar'), healthBar: $('healthBar'), hygieneBar: $('hygieneBar'),
    shopCats: $('shopCats'), shopGrid: $('shopGrid'), gamesList: $('gamesList'), gameHost: $('gameHost'),
    inventoryGrid: $('inventoryGrid'), careStatus: $('careStatus'), log: $('log'),
    petSelectModal: $('petSelectModal'), petChoices: $('petChoices'), petNameInput: $('petNameInput'), startGameBtn: $('startGameBtn'),
    settingsModal: $('settingsModal'), settingsBtn: $('settingsBtn'), closeSettingsBtn: $('closeSettingsBtn'),
    soundSetting: $('soundSetting'), speedSetting: $('speedSetting'), autoSleepSetting: $('autoSleepSetting'), tipsSetting: $('tipsSetting'),
    resetGameBtn: $('resetGameBtn'), saveSettingsBtn: $('saveSettingsBtn'),
    toastWrap: $('toastWrap'),
  };

  // ---------- Utils ----------
  const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
  const rnd = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  const fmtClock = mins => `${String(Math.floor(mins/60)%24).padStart(2,'0')}:${String(Math.floor(mins%60)).padStart(2,'0')}`;
  const now = ()=>Date.now();
  const uid = ()=>Math.random().toString(36).slice(2,10);

  function defaultState() {
    return {
      version: 2,
      started: false,
      petType: 'cat',
      name: 'Пушок',
      coins: 60,
      xp: 0,
      level: 1,
      day: 1,
      minutes: 8 * 60,
      stats: { hunger: 80, happy: 80, energy: 80, health: 100, hygiene: 80 },
      sleeping: false,
      illness: null, // {id, since}
      inventory: { apple: 2, soap: 1 },
      settings: { sound: true, speed: 1, autoSleep: true, tips: true },
      log: [],
      lastSaved: now(),
      totalCare: 0,
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return defaultState();
      const s = { ...defaultState(), ...JSON.parse(raw) };
      s.stats = { ...defaultState().stats, ...(s.stats||{}) };
      s.settings = { ...defaultState().settings, ...(s.settings||{}) };
      s.inventory = { ...(s.inventory||{}) };
      s.log = Array.isArray(s.log) ? s.log.slice(-80) : [];
      return s;
    } catch { return defaultState(); }
  }
  function save() { try { state.lastSaved = now(); localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch {} }
  function reset() { localStorage.removeItem(SAVE_KEY); state = defaultState(); selectedPetType = 'cat'; }

  function addLog(text, kind='') {
    state.log.push({ t: now(), text, kind });
    if (state.log.length > 80) state.log.shift();
    renderLog(); save();
  }
  function toast(text, kind='') {
    const el = document.createElement('div');
    el.className = `toast ${kind}`.trim();
    el.textContent = text;
    dom.toastWrap.appendChild(el);
    setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateY(-8px)'; setTimeout(()=>el.remove(),200); }, 2600);
  }
  function sound(freq=520, dur=0.12, vol=0.03) {
    if (!state?.settings?.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
      const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
      o.type='sine'; o.frequency.value=freq; g.gain.value=vol;
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime+dur);
      o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime+dur);
    } catch {}
  }

  function petDef() { return PET_TYPES.find(p=>p.id===state.petType) || PET_TYPES[0]; }
  function stat(key) { return state.stats[key]; }
  function setStat(key, val) { state.stats[key] = clamp(Math.round(val), 0, 100); }
  function addStat(key, delta) { setStat(key, stat(key) + delta); }
  function addCoins(amount) { state.coins = Math.max(0, state.coins + amount); }
  function addXp(amount) {
    state.xp += amount;
    let needed = xpNeeded();
    while (state.xp >= needed) {
      state.xp -= needed;
      state.level++;
      addCoins(20 + state.level * 5);
      toast(`Новый уровень: ${state.level}!`, 'good');
      addLog(`Питомец достиг ${state.level} уровня. Награда: ${20+state.level*5} монет.`, 'good');
      needed = xpNeeded();
    }
  }
  function xpNeeded() { return 100 + (state.level-1)*35; }

  // ---------- Emotion / Illness ----------
  function currentEmotion() {
    const s = state.stats;
    if (state.sleeping) return { id:'sleeping', label:'😴 Спит', cls:'sleeping', msg:'Zzz... питомец отдыхает.' };
    if (state.illness) return { id:'sick', label:'🤒 Болен', cls:'sick sad', msg:`Питомцу плохо: ${ILLNESSES[state.illness.id].name}.` };
    if (s.hunger < 25) return { id:'hungry', label:'🍗 Голоден', cls:'hungry sad', msg:'Я голоден! Покорми меня.' };
    if (s.energy < 20) return { id:'tired', label:'🥱 Устал', cls:'sad', msg:'Я очень устал...' };
    if (s.hygiene < 25) return { id:'dirty', label:'🫧 Грязный', cls:'sad', msg:'Мне нужно помыться.' };
    if (s.happy < 25) return { id:'sad', label:'😢 Грустит', cls:'sad', msg:'Мне скучно и грустно.' };
    if (s.health < 30) return { id:'weak', label:'💔 Слабый', cls:'sick sad', msg:'Я чувствую себя слабо.' };
    if (s.hunger > 70 && s.happy > 70 && s.energy > 60) return { id:'happy', label:'😊 Счастлив', cls:'happy', msg:'Мне так хорошо!' };
    if (s.happy > 60) return { id:'playful', label:'😄 Игривый', cls:'happy', msg:'Давай играть!' };
    return { id:'ok', label:'🙂 Нормально', cls:'', msg:'Я рядом с тобой.' };
  }

  function maybeGetIllness() {
    if (state.illness || state.sleeping) return;
    const s = state.stats;
    let chance = 0;
    if (s.hygiene < 30) chance += 0.015;
    if (s.hunger < 20) chance += 0.01;
    if (s.health < 35) chance += 0.01;
    if (s.hygiene < 15) chance += 0.02;
    chance *= petDef().mods.health < 1 ? 1.1 : 0.9;
    if (Math.random() < chance) {
      const pool = [];
      if (s.hygiene < 35) pool.push('rash','poison');
      if (s.hunger < 25 || s.energy < 25) pool.push('cold');
      if (!pool.length) pool.push('cold');
      const id = pick(pool);
      state.illness = { id, since: now() };
      addLog(`Питомец заболел: ${ILLNESSES[id].name}. Нужна забота!`, 'bad');
      toast(`Болезнь: ${ILLNESSES[id].name}`, 'bad');
    }
  }

  function cureIllness(byItem) {
    if (!state.illness) return false;
    const ill = ILLNESSES[state.illness.id];
    state.illness = null;
    addStat('health', 8);
    addStat('happy', 6);
    addXp(10);
    addLog(`Болезнь вылечена${byItem ? ` (${byItem})` : ''}: ${ill.name}.`, 'good');
    toast(`${ill.name} вылечена!`, 'good');
    return true;
  }

  // ---------- Time / Day-Night ----------
  function isNightHour(h) { return h >= 22 || h < 7; }
  function isEveningHour(h) { return h >= 19 && h < 22; }
  function dayPhase() {
    const h = Math.floor(state.minutes / 60) % 24;
    if (h < 7) return 'Ночь';
    if (h < 12) return 'Утро';
    if (h < 18) return 'День';
    if (h < 22) return 'Вечер';
    return 'Ночь';
  }
  function applyDayNightClass() {
    const h = Math.floor(state.minutes / 60) % 24;
    document.body.classList.toggle('night', isNightHour(h));
    document.body.classList.toggle('evening', !isNightHour(h) && isEveningHour(h));
  }

  // ---------- Core actions ----------
  function feedWithItem(itemId) {
    const item = SHOP_ITEMS.find(i=>i.id===itemId);
    if (!item || item.cat !== 'food') return;
    if ((state.inventory[itemId]||0) <= 0) { toast('Нет этого предмета в инвентаре', 'bad'); return; }
    if (state.sleeping) { toast('Питомец спит', 'bad'); return; }
    state.inventory[itemId]--;
    applyItemEffect(item);
    addXp(8);
    state.totalCare++;
    addLog(`Покормлен: ${item.name}.`, 'good');
    toast(`Ням! ${item.name}`, 'good');
    sound(660, .12, .03);
    bubble('Вкусно! 😋');
    floatEmoji(item.icon);
    renderAll();
  }

  function applyItemEffect(item) {
    const eff = item.effect || {};
    for (const k of ['hunger','happy','energy','health','hygiene']) if (eff[k]) addStat(k, eff[k]);
    if (item.cures && state.illness && item.cures.includes(state.illness.id)) cureIllness(item.name);
  }

  function useItem(itemId) {
    const item = SHOP_ITEMS.find(i=>i.id===itemId);
    if (!item) return;
    if ((state.inventory[itemId]||0) <= 0) return;
    if (state.sleeping && item.cat !== 'medicine') { toast('Питомец спит', 'bad'); return; }
    if (item.cat === 'food') { feedWithItem(itemId); return; }
    state.inventory[itemId]--;
    applyItemEffect(item);
    addXp(6);
    state.totalCare++;
    addLog(`Использован предмет: ${item.name}.`, 'good');
    toast(`${item.name} использован`, 'good');
    sound(520, .1, .03);
    floatEmoji(item.icon);
    renderAll();
  }

  function quickAction(action) {
    if (!state.started) return;
    sound(500, .08, .02);
    const s = state.stats;
    switch(action) {
      case 'feed': {
        // use best available food
        const foods = SHOP_ITEMS.filter(i=>i.cat==='food' && (state.inventory[i.id]||0)>0).sort((a,b)=>b.effect.hunger-a.effect.hunger);
        if (!foods.length) { toast('Нет еды. Сыграй в мини-игру или купи в магазине!', 'bad'); switchTab('games'); return; }
        feedWithItem(foods[0].id);
        return;
      }
      case 'play': {
        if (state.sleeping) { toast('Сначала разбуди питомца', 'bad'); return; }
        if (s.energy < 15) { toast('Слишком мало энергии для игр', 'bad'); return; }
        addStat('happy', 12); addStat('energy', -10); addStat('hunger', -4); addXp(7);
        state.totalCare++; bubble('Ура! Играем! 🎾'); floatEmoji('🎾');
        addLog('Ты поиграл с питомцем.', 'good');
        break;
      }
      case 'sleep': {
        if (state.sleeping) {
          state.sleeping = false;
          addLog('Питомец проснулся.', '');
          bubble('Я проснулся!'); toast('Питомец проснулся');
        } else {
          state.sleeping = true;
          addLog('Питомец лёг спать.', '');
          bubble('Спокойной ночи...'); toast('Питомец уснул');
        }
        break;
      }
      case 'wash': {
        if (state.sleeping) { toast('Питомец спит', 'bad'); return; }
        const soaps = SHOP_ITEMS.filter(i=>i.cat==='care' && (state.inventory[i.id]||0)>0).sort((a,b)=>(b.effect.hygiene||0)-(a.effect.hygiene||0));
        if (soaps.length) { useItem(soaps[0].id); return; }
        // basic wash
        addStat('hygiene', 12); addStat('happy', -1); addXp(3); state.totalCare++;
        addLog('Быстрое умывание: +12 чистота.', 'good'); bubble('Чистенький!'); floatEmoji('🫧');
        break;
      }
      case 'heal': {
        if (!state.illness) { toast('Питомец здоров!', 'good'); return; }
        const meds = SHOP_ITEMS.filter(i=>i.cat==='medicine' && (state.inventory[i.id]||0)>0 && i.cures?.includes(state.illness.id));
        const anyMed = SHOP_ITEMS.filter(i=>i.cat==='medicine' && (state.inventory[i.id]||0)>0);
        const med = meds[0] || anyMed[0];
        if (!med) { toast('Нет лекарств. Купи в магазине!', 'bad'); switchTab('shop', 'medicine'); return; }
        useItem(med.id);
        return;
      }
    }
    renderAll(); save();
  }

  function buyItem(itemId) {
    const item = SHOP_ITEMS.find(i=>i.id===itemId);
    if (!item) return;
    if (state.coins < item.price) { toast('Недостаточно монет', 'bad'); sound(220,.12,.03); return; }
    addCoins(-item.price);
    state.inventory[itemId] = (state.inventory[itemId]||0) + 1;
    addLog(`Покупка: ${item.name} за ${item.price} монет.`, '');
    toast(`Куплено: ${item.name}`, 'good');
    sound(760,.1,.03);
    renderShop(); renderInventory(); renderTop(); save();
  }

  // ---------- Mini games ----------
  const MINI_GAMES = [
    { id:'catch', name:'Лови еду', icon:'🍓', desc:'Лови полезную еду и избегай мусора. Награда: монеты и еда.', reward:'до 40 монет + еда' },
    { id:'reaction', name:'Реакция повара', icon:'👨‍🍳', desc:'Нажми вовремя, когда блюдо готово. Награда: монеты.', reward:'до 35 монет' },
    { id:'memory', name:'Парочки продуктов', icon:'🧠', desc:'Найди пары карточек. Награда: монеты и премиум-корм.', reward:'до 50 монет + еда' },
  ];

  function renderGamesList() {
    dom.gamesList.innerHTML = MINI_GAMES.map(g => `
      <div class="game-card">
        <div class="item-icon">${g.icon}</div>
        <div class="item-title">${g.name}</div>
        <div class="item-desc">${g.desc}</div>
        <div class="item-meta"><span class="own">${g.reward}</span></div>
        <button class="btn primary small" data-game="${g.id}">Играть</button>
      </div>
    `).join('');
    dom.gamesList.querySelectorAll('[data-game]').forEach(btn => btn.addEventListener('click', () => startMiniGame(btn.dataset.game)));
  }

  function endMiniGame() { if (activeMiniGame?.cleanup) activeMiniGame.cleanup(); activeMiniGame = null; dom.gameHost.innerHTML = ''; }

  function startMiniGame(id) {
    endMiniGame();
    if (state.sleeping) { toast('Питомец спит — мини-игра позже', 'bad'); return; }
    if (id === 'catch') startCatchGame();
    if (id === 'reaction') startReactionGame();
    if (id === 'memory') startMemoryGame();
  }

  function miniShell(title) {
    dom.gameHost.innerHTML = `
      <div class="game-shell">
        <div class="game-shell-head">
          <h4>${title}</h4>
          <div class="game-stats" id="mgStats"></div>
          <button class="btn small" id="mgClose">Закрыть</button>
        </div>
        <div class="game-area" id="mgArea"></div>
      </div>`;
    dom.gameHost.querySelector('#mgClose').onclick = endMiniGame;
    return { area: dom.gameHost.querySelector('#mgArea'), stats: dom.gameHost.querySelector('#mgStats') };
  }

  function awardMiniGame(coins, foodId=null, foodQty=0, xp=15) {
    addCoins(coins);
    addXp(xp);
    addStat('happy', 6);
    addStat('energy', -8);
    addStat('hunger', -5);
    if (foodId && foodQty>0) state.inventory[foodId] = (state.inventory[foodId]||0)+foodQty;
    const foodText = foodId ? ` + ${SHOP_ITEMS.find(i=>i.id===foodId)?.name || foodId} x${foodQty}` : '';
    addLog(`Мини-игра завершена: +${coins} монет${foodText}.`, 'good');
    toast(`Награда: +${coins} монет${foodText}`, 'good');
    renderAll(); save();
  }

  function startCatchGame() {
    const { area, stats } = miniShell('🍓 Лови еду');
    let score=0, lives=3, time=30, spawned=0;
    let timer=null, spawnTimer=null, fallers=[];
    const goods = ['🍎','🍌','🍓','🥕','🐟','🍇'];
    const bads = ['🗑️','🪨'];
    stats.innerHTML = `<span>Очки: <b id="mgScore">0</b></span><span>Жизни: <b id="mgLives">3</b></span><span>Время: <b id="mgTime">30</b></span>`;
    const overlay = document.createElement('div'); overlay.className='game-overlay';
    overlay.innerHTML = `<div><div class="big">Лови еду!</div><div>Кликай по еде, избегай мусора.<br><br><button class="btn primary" id="mgStart">Старт</button></div></div>`;
    area.appendChild(overlay);
    const update = ()=>{ stats.querySelector('#mgScore').textContent=score; stats.querySelector('#mgLives').textContent=lives; stats.querySelector('#mgTime').textContent=time; };
    function finish() {
      clearInterval(timer); clearInterval(spawnTimer); fallers.forEach(f=>f.el.remove()); fallers=[];
      const coins = Math.max(5, Math.min(40, score*2));
      const foodQty = score >= 10 ? 2 : score >= 5 ? 1 : 0;
      overlay.style.display='grid';
      overlay.innerHTML = `<div><div class="big">Игра окончена</div><div>Очки: ${score}<br>Награда: ${coins} монет${foodQty?` + Яблоко x${foodQty}`:''}</div><br><button class="btn primary" id="mgAgain">Играть снова</button></div>`;
      overlay.querySelector('#mgAgain').onclick = ()=>startCatchGame();
      awardMiniGame(coins, foodQty?'apple':null, foodQty, 12 + score);
    }
    function spawn() {
      const good = Math.random() < 0.78;
      const icon = good ? pick(goods) : pick(bads);
      const el = document.createElement('div'); el.className='catch-item'; el.textContent=icon;
      const x = rnd(10,90); let y = -10; el.style.left=x+'%'; el.style.top=y+'%';
      const speed = 0.35 + Math.random()*0.45;
      el.onclick = () => {
        if (el._hit) return; el._hit=true;
        if (good) { score++; sound(700,.07,.02); } else { lives--; score=Math.max(0,score-2); sound(220,.08,.03); }
        el.remove(); fallers = fallers.filter(f=>f.el!==el); update();
        if (lives<=0) finish();
      };
      area.appendChild(el); fallers.push({el, y, speed, good}); spawned++;
    }
    function loop() {
      for (const f of [...fallers]) {
        f.y += f.speed * 2.2;
        f.el.style.top = f.y + '%';
        if (f.y > 110) { f.el.remove(); fallers = fallers.filter(x=>x!==f); if (f.good) { lives--; update(); if (lives<=0) return finish(); } }
      }
    }
    overlay.querySelector('#mgStart').onclick = () => {
      overlay.style.display='none';
      timer = setInterval(()=>{ time--; update(); if (time<=0) finish(); },1000);
      spawnTimer = setInterval(spawn, 650);
      activeMiniGame = { cleanup(){ clearInterval(timer); clearInterval(spawnTimer); cancelAnimationFrame(raf); } };
      let raf; const frame=()=>{ loop(); raf=requestAnimationFrame(frame); if(activeMiniGame) activeMiniGame._raf=raf; }; frame();
      activeMiniGame._raf = raf;
    };
  }

  function startReactionGame() {
    const { area, stats } = miniShell('👨‍🍳 Реакция повара');
    let round=0, total=5, points=0, waiting=null, startAt=0;
    stats.innerHTML = `<span>Раунд: <b id="mgRound">0/${total}</b></span><span>Очки: <b id="mgScore">0</b></span>`;
    const pad = document.createElement('div'); pad.className='reaction-pad'; pad.textContent='Нажми "Старт"';
    const overlay = document.createElement('div'); overlay.className='game-overlay';
    overlay.innerHTML = `<div><div class="big">Реакция повара</div><div>Жди зелёный сигнал и кликай как можно быстрее.<br><br><button class="btn primary" id="mgStart">Старт</button></div></div>`;
    area.append(pad, overlay);
    function update(){ stats.querySelector('#mgRound').textContent=`${Math.min(round,total)}/${total}`; stats.querySelector('#mgScore').textContent=points; }
    function nextRound() {
      if (round >= total) return finish();
      round++; update();
      pad.className='reaction-pad ready'; pad.textContent='Жди...';
      const delay = rnd(900, 2600);
      waiting = setTimeout(()=>{ pad.className='reaction-pad go'; pad.textContent='ЖМИ!'; startAt = performance.now(); waiting = 'go'; }, delay);
    }
    function finish() {
      pad.className='reaction-pad'; pad.textContent='Готово!';
      const coins = Math.max(8, Math.min(35, points*3));
      overlay.style.display='grid';
      overlay.innerHTML = `<div><div class="big">Отлично!</div><div>Очки: ${points}/${total}<br>Награда: ${coins} монет</div><br><button class="btn primary" id="mgAgain">Играть снова</button></div>`;
      overlay.querySelector('#mgAgain').onclick=()=>startReactionGame();
      awardMiniGame(coins, null, 0, 10 + points*2);
    }
    pad.onclick = () => {
      if (overlay.style.display !== 'none') return;
      if (waiting && waiting !== 'go') { clearTimeout(waiting); waiting=null; pad.textContent='Слишком рано!'; pad.className='reaction-pad'; sound(220,.1,.03); setTimeout(nextRound, 700); return; }
      if (waiting === 'go') {
        const ms = performance.now() - startAt;
        waiting = null;
        if (ms < 500) { points++; pad.textContent=`Отлично! ${Math.round(ms)} мс`; sound(760,.08,.03); }
        else { pad.textContent=`Медленно: ${Math.round(ms)} мс`; sound(320,.08,.02); }
        pad.className='reaction-pad'; update(); setTimeout(nextRound, 700);
      }
    };
    overlay.querySelector('#mgStart').onclick = ()=>{ overlay.style.display='none'; round=0; points=0; update(); nextRound(); };
    activeMiniGame = { cleanup(){ if (waiting && waiting!=='go') clearTimeout(waiting); } };
  }

  function startMemoryGame() {
    const { area, stats } = miniShell('🧠 Парочки продуктов');
    const icons = ['🍎','🐟','🍰','🥕','🍇','🍓','🥩','🧀'];
    let deck = [...icons,...icons].sort(()=>Math.random()-0.5).map((icon,i)=>({id:i,icon,open:false,matched:false}));
    let open=[]; let moves=0; let matched=0; let lock=false; let sec=0; let timer=null;
    stats.innerHTML = `<span>Ходы: <b id="mgMoves">0</b></span><span>Пары: <b id="mgPairs">0/8</b></span><span>Время: <b id="mgTime">0</b></span>`;
    area.innerHTML = `<div class="memory-grid" id="memGrid"></div>`;
    const grid = area.querySelector('#memGrid');
    function renderGrid() {
      grid.innerHTML = deck.map(c=>`<div class="memory-card ${c.open||c.matched?'open':''} ${c.matched?'matched':''}" data-id="${c.id}">${c.open||c.matched?c.icon:'?'}</div>`).join('');
      grid.querySelectorAll('.memory-card').forEach(el=>el.onclick=()=>flip(Number(el.dataset.id)));
      stats.querySelector('#mgMoves').textContent=moves; stats.querySelector('#mgPairs').textContent=`${matched}/8`; stats.querySelector('#mgTime').textContent=sec;
    }
    function finish() {
      clearInterval(timer);
      const coins = Math.max(15, 50 - moves*1.5 - Math.floor(sec/5));
      const finalCoins = Math.round(clamp(coins, 15, 50));
      const foodQty = matched===8 ? 1 : 0;
      const over = document.createElement('div'); over.className='game-overlay'; over.style.display='grid';
      over.innerHTML = `<div><div class="big">Победа!</div><div>Ходы: ${moves}, время: ${sec}с<br>Награда: ${finalCoins} монет${foodQty?' + Премиум-корм x1':''}</div><br><button class="btn primary" id="mgAgain">Играть снова</button></div>`;
      area.appendChild(over); over.querySelector('#mgAgain').onclick=()=>startMemoryGame();
      awardMiniGame(finalCoins, foodQty?'premium':null, foodQty, 20);
    }
    function flip(id) {
      if (lock) return;
      const c = deck.find(x=>x.id===id); if (!c || c.open || c.matched) return;
      c.open=true; open.push(c); renderGrid();
      if (open.length===2) {
        moves++; lock=true;
        const [a,b]=open;
        if (a.icon===b.icon) {
          a.matched=b.matched=true; a.open=b.open=false; open=[]; matched++; lock=false; sound(720,.08,.03);
          renderGrid(); if (matched===8) finish();
        } else {
          sound(260,.06,.02);
          setTimeout(()=>{ a.open=b.open=false; open=[]; lock=false; renderGrid(); }, 650);
        }
      }
    }
    timer = setInterval(()=>{ sec++; const t=stats.querySelector('#mgTime'); if(t) t.textContent=sec; },1000);
    activeMiniGame = { cleanup(){ clearInterval(timer); } };
    renderGrid();
  }

  // ---------- UI rendering ----------
  function switchTab(tab, cat) {
    document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('active', p.id===`tab-${tab}`));
    if (tab==='shop' && cat) { state._shopCat=cat; renderShop(); }
  }

  function renderTop() {
    dom.coinsValue.textContent = state.coins;
    dom.clockPill.textContent = fmtClock(state.minutes);
    dom.dayLabel.textContent = `День ${state.day} · ${dayPhase()}`;
  }

  function renderPet() {
    const def = petDef();
    const emo = currentEmotion();
    dom.pet.className = `pet type-${def.id} ${emo.cls}`;
    dom.petName.textContent = state.name;
    dom.petNameplate.textContent = state.name;
    dom.petMeta.textContent = `Уровень ${state.level} · ${def.name}`;
    dom.moodChip.textContent = emo.label;
    dom.petBubble.textContent = emo.msg;
    const need = xpNeeded();
    dom.xpFill.style.width = `${clamp((state.xp/need)*100,0,100)}%`;
    dom.xpText.textContent = `${state.xp}/${need}`;
    applyDayNightClass();
  }

  function renderStats() {
    const map = [['hunger','hunger'],['happy','happy'],['energy','energy'],['health','health'],['hygiene','hygiene']];
    for (const [k,bar] of map) {
      const v = stat(k);
      $(bar+'Val').textContent = v;
      const fill = $(bar+'Bar');
      fill.style.width = v+'%';
      fill.classList.toggle('low', v < 25);
    }
  }

  function renderShop() {
    const cat = state._shopCat || 'all';
    dom.shopCats.innerHTML = SHOP_CATS.map(c=>`<button class="cat-btn ${c.id===cat?'active':''}" data-cat="${c.id}">${c.name}</button>`).join('');
    dom.shopCats.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{ state._shopCat=b.dataset.cat; renderShop(); });
    const items = SHOP_ITEMS.filter(i=>cat==='all'||i.cat===cat);
    dom.shopGrid.innerHTML = items.map(i=>{
      const own = state.inventory[i.id]||0;
      return `<div class="item-card">
        <div class="item-icon">${i.icon}</div>
        <div class="item-title">${i.name}</div>
        <div class="item-desc">${i.desc}</div>
        <div class="item-meta"><span class="price">🪙 ${i.price}</span><span class="own">В наличии: ${own}</span></div>
        <button class="btn small primary" data-buy="${i.id}" ${state.coins<i.price?'disabled':''}>Купить</button>
      </div>`;
    }).join('');
    dom.shopGrid.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buyItem(b.dataset.buy));
  }

  function renderInventory() {
    const entries = SHOP_ITEMS.filter(i=>(state.inventory[i.id]||0)>0);
    if (!entries.length) { dom.inventoryGrid.innerHTML = `<div class="log-item">Инвентарь пуст. Купи предметы в магазине или выиграй их в мини-играх.</div>`; return; }
    dom.inventoryGrid.innerHTML = entries.map(i=>`
      <div class="item-card">
        <div class="item-icon">${i.icon}</div>
        <div class="item-title">${i.name}</div>
        <div class="item-desc">${i.desc}</div>
        <div class="item-meta"><span class="own">Количество: ${state.inventory[i.id]}</span></div>
        <button class="btn small primary" data-use="${i.id}">Использовать</button>
      </div>
    `).join('');
    dom.inventoryGrid.querySelectorAll('[data-use]').forEach(b=>b.onclick=()=>useItem(b.dataset.use));
  }

  function renderCare() {
    const emo = currentEmotion();
    const ill = state.illness ? ILLNESSES[state.illness.id] : null;
    dom.careStatus.innerHTML = `
      <div class="care-box"><div class="label">Эмоция</div><div class="value">${emo.label}</div></div>
      <div class="care-box"><div class="label">Болезнь</div><div class="value">${ill ? `${ill.icon} ${ill.name}` : '✅ Нет'}</div></div>
      <div class="care-box"><div class="label">Сон</div><div class="value">${state.sleeping ? '🌙 Спит' : '☀️ Бодрствует'}</div></div>
      <div class="care-box"><div class="label">Уровень ухода</div><div class="value">⭐ ${state.level} / XP ${state.xp}</div></div>
    `;
    if (ill) {
      dom.careStatus.innerHTML += `<div class="care-box" style="grid-column:1/-1"><div class="label">Рекомендация</div><div class="value">${ill.desc} Купи подходящее лекарство в магазине.</div></div>`;
    }
  }

  function renderLog() {
    dom.log.innerHTML = state.log.slice().reverse().map(e=>{
      const d = new Date(e.t);
      const tm = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
      return `<div class="log-item ${e.kind||''}"><div class="time">${tm}</div>${e.text}</div>`;
    }).join('') || `<div class="log-item">Пока событий нет.</div>`;
  }

  function renderAll() {
    renderTop(); renderPet(); renderStats(); renderShop(); renderInventory(); renderCare(); renderLog();
  }

  function bubble(text) { dom.petBubble.textContent = text; }
  function floatEmoji(icon) {
    const el = document.createElement('div');
    el.className='floater'; el.textContent=icon;
    el.style.left = (30 + Math.random()*40)+'%'; el.style.top = (30+Math.random()*20)+'%';
    $('statusFloaters').appendChild(el); setTimeout(()=>el.remove(),1600);
  }

  // ---------- Game tick ----------
  function gameTick(dtMs) {
    if (!state.started) return;
    const speed = Number(state.settings.speed || 1);
    const minutesAdd = (dtMs / 1000) * 0.8 * speed; // 0.8 game min / real sec at x1
    const prevDay = state.day;
    state.minutes += minutesAdd;
    while (state.minutes >= 1440) { state.minutes -= 1440; state.day++; addCoins(25); addLog(`Новый день ${state.day}! Ежедневный бонус: 25 монет.`, 'good'); toast(`День ${state.day}! +25 монет`, 'good'); }
    if (prevDay !== state.day) renderTop();

    const mins = minutesAdd;
    const m = petDef().mods;
    const hour = Math.floor(state.minutes/60)%24;

    if (state.sleeping) {
      addStat('energy', 0.12 * mins * speed);
      addStat('hunger', -0.02 * mins * m.hunger);
      addStat('health', state.illness ? -0.01*mins : 0.015*mins);
      if (hour >= 8 && hour < 22 && Math.random() < 0.002*mins) state.sleeping = false;
    } else {
      addStat('hunger', -0.05 * mins * m.hunger);
      addStat('happy', -0.03 * mins / m.happy);
      addStat('energy', -0.035 * mins / m.energy);
      addStat('hygiene', -0.025 * mins * m.hygiene);
      if (state.stats.hunger < 20) addStat('happy', -0.03*mins);
      if (state.stats.hygiene < 20) addStat('happy', -0.02*mins);
      if (state.settings.autoSleep && isNightHour(hour) && state.stats.energy < 45) {
        state.sleeping = true; addLog('Питомец уснул сам — ночь.', ''); bubble('Спокойной ночи...');
      }
    }

    if (state.illness) {
      const ill = ILLNESSES[state.illness.id];
      addStat('health', -ill.healthDrain * 0.03 * mins);
      addStat('happy', -ill.moodDrain * 0.02 * mins);
    } else {
      if (state.stats.hunger > 60 && state.stats.hygiene > 50) addStat('health', 0.01*mins);
      maybeGetIllness();
    }

    // critical
    if (state.stats.hunger <= 0) addStat('health', -0.08*mins);
    if (state.stats.health <= 0) {
      state.stats.health = 30; state.stats.hunger = 40; state.stats.happy = 35; state.stats.energy = 40; state.stats.hygiene = 40;
      state.illness = null; state.sleeping = true;
      addCoins(-Math.min(20, state.coins));
      addLog('Питомцу стало очень плохо! Он отдохнул, но ты потерял немного монет.', 'bad');
      toast('Питомцу нужен уход! -монеты', 'bad');
    }

    applyDayNightClass();
    renderTop(); renderPet(); renderStats(); renderCare();
    // periodic save
    if (!gameTick._saveAcc) gameTick._saveAcc=0;
    gameTick._saveAcc += dtMs;
    if (gameTick._saveAcc > 5000) { gameTick._saveAcc=0; save(); }
  }

  function loop(ts) {
    const dt = Math.min(2000, ts - lastTs);
    lastTs = ts;
    gameTick(dt);
    requestAnimationFrame(loop);
  }

  // ---------- Setup / events ----------
  function bindEvents() {
    document.querySelectorAll('.action-btn').forEach(b=>b.addEventListener('click', ()=>quickAction(b.dataset.action)));
    document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click', ()=>switchTab(b.dataset.tab)));
    dom.settingsBtn.onclick = ()=>{ openSettings(true); };
    dom.closeSettingsBtn.onclick = ()=>openSettings(false);
    dom.saveSettingsBtn.onclick = ()=>{ saveSettingsFromUI(); openSettings(false); toast('Настройки сохранены','good'); };
    dom.resetGameBtn.onclick = ()=>{
      if (!confirm('Сбросить игру? Весь прогресс будет удалён.')) return;
      endMiniGame(); reset(); openSettings(false); showPetSelect(); renderAll();
    };
    dom.startGameBtn.onclick = startNewGame;
    dom.settingsModal.addEventListener('click', e=>{ if (e.target===dom.settingsModal) openSettings(false); });
  }

  function openSettings(show) {
    dom.settingsModal.classList.toggle('show', !!show);
    dom.settingsModal.setAttribute('aria-hidden', show?'false':'true');
    if (show) {
      dom.soundSetting.checked = !!state.settings.sound;
      dom.speedSetting.value = String(state.settings.speed || 1);
      dom.autoSleepSetting.checked = !!state.settings.autoSleep;
      dom.tipsSetting.checked = !!state.settings.tips;
    }
  }
  function saveSettingsFromUI() {
    state.settings.sound = dom.soundSetting.checked;
    state.settings.speed = Number(dom.speedSetting.value);
    state.settings.autoSleep = dom.autoSleepSetting.checked;
    state.settings.tips = dom.tipsSetting.checked;
    save();
  }

  function renderPetChoices() {
    dom.petChoices.innerHTML = PET_TYPES.map(p=>`
      <div class="pet-choice ${p.id===selectedPetType?'selected':''}" data-pet="${p.id}">
        <div class="avatar">${p.avatar}</div>
        <div class="name">${p.name}</div>
        <div class="desc">${p.desc}</div>
        <div class="trait">${p.trait}</div>
      </div>
    `).join('');
    dom.petChoices.querySelectorAll('[data-pet]').forEach(el=>el.onclick=()=>{
      selectedPetType = el.dataset.pet; renderPetChoices();
      const def = PET_TYPES.find(p=>p.id===selectedPetType);
      if (def && !dom.petNameInput.value) dom.petNameInput.placeholder = def.name;
    });
  }

  function showPetSelect() {
    renderPetChoices();
    dom.petNameInput.value = '';
    dom.petSelectModal.classList.add('show');
  }

  function startNewGame() {
    const def = PET_TYPES.find(p=>p.id===selectedPetType) || PET_TYPES[0];
    state = defaultState();
    state.petType = def.id;
    state.name = dom.petNameInput.value.trim().slice(0,16) || def.name;
    state.started = true;
    state.log = [];
    addLog(`Ты выбрал питомца: ${def.name}. Добро пожаловать!`, 'good');
    dom.petSelectModal.classList.remove('show');
    renderAll(); save();
    toast(`Привет, ${state.name}!`, 'good');
  }

  function init() {
    state = load();
    bindEvents();
    renderGamesList();
    if (!state.started) {
      showPetSelect();
    } else {
      dom.petSelectModal.classList.remove('show');
      // offline progression cap
      const elapsed = clamp(now() - (state.lastSaved||now()), 0, 1000*60*60*4);
      if (elapsed > 60000) {
        gameTick(elapsed);
        addLog(`Пока тебя не было, прошло немного времени. Питомец соскучился!`, '');
      }
    }
    renderAll();
    lastTs = performance.now();
    requestAnimationFrame(loop);
  }

  // expose for debug
  window.Tamagotchi = { get state(){return state;}, addCoins:(n)=>{addCoins(n);renderAll();}, reset };

  init();
})();