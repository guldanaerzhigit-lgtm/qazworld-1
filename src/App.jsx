import React, { Suspense, useEffect, useState } from 'react';
import {
  Bell, Compass, House, ShoppingBag, Users, UserRound, Coins, Star, Gamepad2,
  Settings, Search, Plus, ChevronRight, Sparkles, MessageCircle, Gift,
  Trophy, Shirt, X, Check, Menu, Volume2, Map, Heart, LockKeyhole
} from 'lucide-react';
import World from './World.jsx';
import V2Playground from './V2Playground.jsx';

const starterItems = [
  { id: 'hoodie', name: 'Фиолетовый худи', type: 'Одежда', price: 0, color: '#7256d8', owned: true, icon: '👕' },
  { id: 'mint', name: 'Мятный образ', type: 'Одежда', price: 120, color: '#42bba5', icon: '🧥' },
  { id: 'sunset', name: 'Закатный стиль', type: 'Одежда', price: 180, color: '#f18c68', icon: '🧡' },
  { id: 'plant', name: 'Комнатное растение', type: 'Для дома', price: 75, icon: '🪴' },
  { id: 'lamp', name: 'Лампа «Луна»', type: 'Для дома', price: 95, icon: '🌙' },
  { id: 'pillow', name: 'Мягкая подушка', type: 'Для дома', price: 45, icon: '🛋️' }
];

const navItems = [
  { id: 'home', label: 'Главная', icon: House },
  { id: 'world', label: 'Мир', icon: Compass },
  { id: 'v2', label: 'Играть V2', icon: Gamepad2 },
  { id: 'friends', label: 'Друзья', icon: Users },
  { id: 'shop', label: 'Магазин', icon: ShoppingBag },
  { id: 'profile', label: 'Профиль', icon: UserRound }
];

function AvatarBadge({ color = '#7256d8', small = false, face = '🙂' }) {
  return <div className={`avatar-badge ${small ? 'small' : ''}`} style={{ '--avatar-color': color }}><span>{face}</span></div>;
}

function Toast({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2600); return () => clearTimeout(t); }, [onClose]);
  return <div className="toast"><Check size={16} />{message}<button onClick={onClose} aria-label="Закрыть"><X size={15} /></button></div>;
}

export default function App() {
  const [tab, setTab] = useState('home');
  const [coins, setCoins] = useState(() => Number(localStorage.getItem('qazworld-coins') || 350));
  const [name, setName] = useState(() => localStorage.getItem('qazworld-name') || 'Nomad');
  const [outfit, setOutfit] = useState(() => localStorage.getItem('qazworld-outfit') || '#7256d8');
  const [owned, setOwned] = useState(() => JSON.parse(localStorage.getItem('qazworld-owned') || '["hoodie"]'));
  const [items, setItems] = useState(starterItems);
  const [toast, setToast] = useState('');
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [nameDraft, setNameDraft] = useState(name);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [room, setRoom] = useState('Площадь мечты');

  useEffect(() => localStorage.setItem('qazworld-coins', String(coins)), [coins]);
  useEffect(() => localStorage.setItem('qazworld-name', name), [name]);
  useEffect(() => localStorage.setItem('qazworld-outfit', outfit), [outfit]);
  useEffect(() => localStorage.setItem('qazworld-owned', JSON.stringify(owned)), [owned]);

  const notify = (message) => setToast(message);
  const buyItem = (item) => {
    if (owned.includes(item.id)) {
      if (item.color) { setOutfit(item.color); notify('Образ надет!'); }
      else notify('Уже в твоём инвентаре');
      return;
    }
    if (coins < item.price) { notify('Не хватает монет — выполни задание!'); return; }
    setCoins(c => c - item.price);
    setOwned(list => [...list, item.id]);
    if (item.color) setOutfit(item.color);
    notify(`«${item.name}» добавлен в коллекцию`);
  };
  const claimDaily = () => { setCoins(c => c + 50); notify('Получено 50 монет за вход!'); };
  const changeTab = (id) => { setTab(id); setMobileMenu(false); };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
      <button className="brand" onClick={() => changeTab('home')}><span className="brand-mark"><Sparkles size={21} /></span><span>Qaz<span className="brand-light">World</span><small>ТВОЯ ВСЕЛЕННАЯ</small></span></button>
      <div className="side-label">ПРОСТРАНСТВО</div>
      <nav>{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${tab === id ? 'active' : ''}`} onClick={() => changeTab(id)}><Icon size={19} strokeWidth={1.9} /><span>{label}</span>{id === 'friends' && <span className="nav-count">2</span>}</button>)}</nav>
      <div className="side-divider" />
      <div className="side-label">ТВОЙ МИР</div>
      <button className="world-link" onClick={() => { setRoom('Мой уютный дом'); changeTab('world'); }}><span className="room-icon">🏡</span><span><b>Мой дом</b><small>Личное пространство</small></span><ChevronRight size={16} /></button>
      <button className="world-link" onClick={() => { setRoom('Площадь мечты'); changeTab('world'); }}><span className="room-icon">🌿</span><span><b>Площадь мечты</b><small>Общественная зона</small></span><ChevronRight size={16} /></button>
      <div className="sidebar-bottom">
        <div className="season-card"><div className="season-art">🌙</div><div><b>Мир начинается с тебя</b><p>Исследуй. Создавай. Дружи.</p></div></div>
        <button className="nav-item muted" onClick={() => notify('Настройки скоро появятся')}><Settings size={18} /><span>Настройки</span></button>
        <div className="sidebar-user"><AvatarBadge color={outfit} small /><div className="user-copy"><b>{name}</b><small>Уровень 3 · Путешественник</small></div><button className="icon-button" onClick={() => setShowProfileEdit(true)} aria-label="Редактировать профиль"><Settings size={17} /></button></div>
      </div>
    </aside>

    {mobileMenu && <button className="menu-scrim" onClick={() => setMobileMenu(false)} aria-label="Закрыть меню" />}

    <main className="main-area">
      <header className="topbar">
        <button className="mobile-menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Открыть меню"><Menu /></button>
        <div className="breadcrumb"><span>QazWorld</span><span className="crumb-slash">/</span><b>{navItems.find(n => n.id === tab)?.label || 'Мир'}</b></div>
        <div className="top-actions"><button className="search-button" onClick={() => notify('Поиск игроков скоро появится')}><Search size={17} /><span>Найти друзей</span><kbd>⌘ K</kbd></button><button className="notification-button" onClick={() => notify('Пока новых уведомлений нет')} aria-label="Уведомления"><Bell size={19} /><i /></button><div className="coin-pill"><span className="coin-icon">◈</span><b>{coins}</b><span>монет</span><button onClick={claimDaily} title="Получить ежедневный бонус"><Plus size={15} /></button></div></div>
      </header>

      {tab === 'v2' && <V2Playground />}

      {tab === 'home' && <div className="page-content">
        <section className="welcome-row"><div><div className="eyebrow"><span className="live-dot" /> ТВОЙ МИР УЖЕ ЖДЁТ</div><h1>С возвращением, <span>{name}</span> <span className="wave">✦</span></h1><p>В твоей вселенной всегда есть место новым открытиям.</p></div><button className="daily-button" onClick={claimDaily}><Gift size={17} /><span>Бонус дня</span><b>+50 ◈</b></button></section>
        <section className="world-hero">
          <div className="world-heading"><div><div className="world-kicker"><span className="live-dot" /> ЦЕНТРАЛЬНАЯ ЛОКАЦИЯ</div><h2>Площадь мечты</h2><p>Место, где начинаются истории</p></div><div className="online-chip"><span className="online-dot" /> Твой мир</div></div>
          <div className="canvas-wrap"><Suspense fallback={<div className="world-loading"><Sparkles /> Создаём твой мир...</div>}><World outfit={outfit} /></Suspense><div className="scene-badge"><Map size={14} /><span>Qaz City · Район 01</span></div><div className="scene-hint"><span>🖱</span> Перетаскивай, чтобы осмотреть мир</div></div>
          <div className="world-footer"><div className="location-info"><span className="location-icon">☀️</span><span><b>Спокойный день</b><small>Лёгкий ветер · 22°</small></span></div><div className="world-stats"><span><Users size={15} /> Социальная площадь</span><span><span className="tiny-sparkle">✦</span> Исследуй вокруг</span></div><button className="primary-button" onClick={() => changeTab('world')}>Войти в мир <ChevronRight size={17} /></button></div>
        </section>
        <section className="section-block"><div className="section-title"><div><h3>Твоя история продолжается</h3><p>Небольшие шаги к большой вселенной</p></div><button className="text-button" onClick={() => changeTab('profile')}>Мой профиль <ChevronRight size={15} /></button></div>
          <div className="feature-grid">
            <button className="feature-card home-feature" onClick={() => { setRoom('Мой уютный дом'); changeTab('world'); }}><div className="feature-art home-art">🏡<span>✦</span></div><div className="feature-copy"><span className="feature-tag">ЛИЧНОЕ ПРОСТРАНСТВО</span><h4>Мой уютный дом</h4><p>Создай место, которое отражает тебя.</p><span className="feature-link">Обустроить дом <ChevronRight size={14} /></span></div></button>
            <button className="feature-card shop-feature" onClick={() => changeTab('shop')}><div className="feature-art shop-art">🧥<span>✧</span></div><div className="feature-copy"><span className="feature-tag">ТВОЙ СТИЛЬ</span><h4>Обнови образ</h4><p>Найди вещи, которые подходят именно тебе.</p><span className="feature-link">Открыть гардероб <ChevronRight size={14} /></span></div></button>
            <button className="feature-card friends-feature" onClick={() => changeTab('friends')}><div className="feature-art friends-art">🌌<span>✦</span></div><div className="feature-copy"><span className="feature-tag">ВМЕСТЕ ИНТЕРЕСНЕЕ</span><h4>Новые знакомства</h4><p>Скоро твоя вселенная станет ещё больше.</p><span className="feature-link">К друзьям <ChevronRight size={14} /></span></div></button>
          </div>
        </section>
      </div>}

      {tab === 'world' && <div className="page-content subpage"><div className="subpage-title"><div><div className="eyebrow"><span className="live-dot" /> ИССЛЕДОВАНИЕ</div><h1>{room}</h1><p>Осмотрись вокруг — это только начало твоей вселенной.</p></div><button className="secondary-button" onClick={() => setRoom(room === 'Мой уютный дом' ? 'Площадь мечты' : 'Мой уютный дом')}><House size={16} />{room === 'Мой уютный дом' ? 'На площадь' : 'В мой дом'}</button></div><section className="world-hero standalone-world"><div className="canvas-wrap large-canvas"><Suspense fallback={<div className="world-loading">Загружаем локацию...</div>}><World outfit={outfit} /></Suspense><div className="scene-badge"><Map size={14} /> Qaz City · Район 01</div></div><div className="world-footer"><div className="location-info"><span className="location-icon">🌱</span><span><b>Ты здесь</b><small>Исследуй свой мир</small></span></div><div className="world-stats"><span><Compass size={15} /> 1 открытая локация</span></div><button className="primary-button" onClick={() => notify('Новые локации появятся в следующем обновлении')}>Найти локацию <Compass size={16} /></button></div></section><div className="tip-card"><Sparkles size={18} /><div><b>Мир создаётся вместе с тобой</b><p>Это первая локация QazWorld. В следующих обновлениях появятся другие игроки, интерактивные объекты и редактор пространств.</p></div></div></div>}

      {tab === 'friends' && <div className="page-content subpage"><div className="subpage-title"><div><div className="eyebrow">ТВОЁ СООБЩЕСТВО</div><h1>Друзья <span className="title-count">02</span></h1><p>Любая вселенная лучше, когда есть с кем её разделить.</p></div><button className="primary-button" onClick={() => notify('Поиск игроков подключим в следующем этапе')}><Plus size={17} /> Найти друзей</button></div><div className="friends-empty"><div className="empty-orbit"><span>🌠</span><i>✦</i><b>✧</b></div><h3>Твоя история только начинается</h3><p>Когда подключим аккаунты и мультиплеер, здесь появятся настоящие игроки, заявки и статусы онлайн.</p><button className="secondary-button" onClick={() => changeTab('world')}><Compass size={16} /> Исследовать мир</button></div><div className="tip-card"><LockKeyhole size={18} /><div><b>Приватность прежде всего</b><p>Профили, заявки в друзья и личные сообщения будут доступны после подключения серверной авторизации.</p></div></div></div>}

      {tab === 'shop' && <div className="page-content subpage"><div className="subpage-title"><div><div className="eyebrow"><Sparkles size={13} /> QAZ MARKET</div><h1>Магазин <span className="wave">✦</span></h1><p>Собери образ и укрась свой уголок вселенной.</p></div><div className="shop-balance"><span>ТВОЙ БАЛАНС</span><b>◈ {coins}</b></div></div><div className="shop-tabs"><span className="shop-tab active"><Shirt size={15} /> Всё</span><span className="shop-tab"><UserRound size={15} /> Одежда</span><span className="shop-tab"><House size={15} /> Для дома</span></div><div className="shop-grid">{items.map(item => <article className="product-card" key={item.id}><div className={`product-art ${item.color ? 'wearable' : 'decor-item'}`} style={{'--product-color': item.color || '#e8e6f4'}}><span>{item.icon}</span>{owned.includes(item.id) && <span className="owned-label"><Check size={12} /> Есть</span>}</div><div className="product-details"><span className="product-type">{item.type}</span><h3>{item.name}</h3><div className="product-buy"><b>{item.price === 0 ? 'Бесплатно' : `◈ ${item.price}`}</b><button className={owned.includes(item.id) ? 'owned-button' : 'buy-button'} onClick={() => buyItem(item)}>{owned.includes(item.id) ? item.color ? 'Надеть' : 'Есть' : 'Купить'}</button></div></div></article>)}</div><div className="tip-card"><Coins size={18} /><div><b>Как получить больше монет?</b><p>Забирай ежедневный бонус +50 монет. В дальнейшем добавим задания, достижения и награды за исследование мира.</p></div></div></div>}

      {tab === 'profile' && <div className="page-content subpage"><div className="subpage-title"><div><div className="eyebrow">ТВОЯ ИСТОРИЯ</div><h1>Профиль игрока</h1><p>Это твой маленький уголок в большой вселенной.</p></div><button className="secondary-button" onClick={() => { setNameDraft(name); setShowProfileEdit(true); }}><Settings size={16} /> Изменить профиль</button></div><section className="profile-hero"><div className="profile-avatar"><AvatarBadge color={outfit} face="🙂" /></div><div className="profile-info"><span className="level-tag"><Star size={13} /> УРОВЕНЬ 3</span><h2>{name}</h2><p>Путешественник QazWorld · с самого начала</p><div className="profile-progress"><span style={{width:'38%'}} /></div><small>380 / 1000 XP до следующего уровня</small></div><div className="profile-coins"><span>БАЛАНС</span><b>◈ {coins}</b><small>Игровые монеты</small></div></section><div className="stats-grid"><div className="stat-card"><span className="stat-icon purple"><Compass size={18} /></span><span>Локации</span><b>1</b><small>Мир открыт</small></div><div className="stat-card"><span className="stat-icon green"><Shirt size={18} /></span><span>Предметы</span><b>{owned.length}</b><small>В коллекции</small></div><div className="stat-card"><span className="stat-icon orange"><Trophy size={18} /></span><span>Достижения</span><b>2</b><small>Из 12 доступных</small></div><div className="stat-card"><span className="stat-icon pink"><Heart size={18} /></span><span>Друзья</span><b>0</b><small>Знакомься с миром</small></div></div><div className="tip-card"><UserRound size={18} /><div><b>Твой аватар — твоя история</b><p>Выбирай стиль в магазине, собирай предметы и создавай уникальный образ.</p></div><button className="text-button" onClick={() => changeTab('shop')}>В гардероб <ChevronRight size={15} /></button></div></div>}

      <footer className="app-footer"><span>✦ QazWorld <i>V1.0 · DEMO</i></span><span>Создано для новых историй <span className="footer-star">✧</span></span></footer>
    </main>

    {showProfileEdit && <div className="modal-backdrop" onClick={() => setShowProfileEdit(false)}><section className="edit-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setShowProfileEdit(false)}><X size={18} /></button><div className="modal-symbol"><UserRound size={23} /></div><h2>Твой профиль</h2><p>Как тебя будут видеть в QazWorld?</p><label htmlFor="player-name">Имя игрока</label><input id="player-name" maxLength={18} value={nameDraft} onChange={e => setNameDraft(e.target.value)} placeholder="Введи имя" /><button className="primary-button modal-save" onClick={() => { const n = nameDraft.trim(); if (!n) { notify('Введи имя игрока'); return; } setName(n); setShowProfileEdit(false); notify('Профиль обновлён'); }}>Сохранить изменения <Check size={16} /></button><small>Демо-профиль сохраняется в этом браузере.</small></section></div>}
    {toast && <Toast message={toast} onClose={() => setToast('')} />}
  </div>;
}