import React, { useEffect, useRef, useState } from "react";
import { Check, CircleUserRound, DoorOpen, Gamepad2, House, LogIn, LogOut, Save, Shirt, Wifi, WifiOff } from "lucide-react";
import V2World from "./V2World.jsx";
import { api, connectRoom, getToken, loadProgress, login, register, saveProgress, setToken } from "./api.js";

const catalog = [
  { id:"plant",name:"Растение",icon:"🪴",price:75 },
  { id:"lamp",name:"Лампа «Луна»",icon:"🌙",price:95 },
  { id:"pillow",name:"Подушка",icon:"🛋️",price:45 }
];
const defaults = { outfit:"#7256d8", skin:"#d99a72", hair:"#392a2b", style:"casual" };
export default function V2Playground() {
  const [room,setRoom] = useState("city");
  const [pos,setPos] = useState({x:0,z:.4});
  const [stick,setStick] = useState({x:0,y:0});
  const [avatar,setAvatar] = useState(()=>({...defaults}));
  const [coins,setCoins] = useState(350);
  const [inventory,setInventory] = useState(["hoodie"]);
  const [house,setHouse] = useState([]);
  const [user,setUser] = useState(null);
  const [authMode,setAuthMode] = useState("login");
  const [form,setForm] = useState({email:"",password:"",username:""});
  const [showAuth,setShowAuth] = useState(false);
  const [message,setMessage] = useState("");
  const [busy,setBusy] = useState(false);
  const [connected,setConnected] = useState(false);
  const socket = useRef(null);
  const stickRef = useRef(null);
  const [players,setPlayers] = useState([]);
  const [chat,setChat] = useState([]);
  const [chatText,setChatText] = useState("");

  const hydrate = async () => {
    const me = await api("/api/me");
    const progress = await loadProgress();
    setUser(me.user); setAvatar({...defaults,...(progress.avatar || me.user.avatar || {})});
    setCoins(progress.coins); setInventory(progress.inventory || ["hoodie"]); setHouse(progress.house || []);
  };
  useEffect(()=>{ if(getToken()) hydrate().catch(()=>setToken("")); },[]);
  useEffect(()=>{
    const timer = setInterval(()=>{
      const s = stickRef.current;
      if(!s || (!s.x && !s.y)) return;
      setPos(old=>({x:Math.max(-4.8,Math.min(4.8,old.x+s.x*.11)),z:Math.max(-4.5,Math.min(4.5,old.z-s.y*.11))}));
    },40);
    return ()=>clearInterval(timer);
  },[]);
  useEffect(()=>{
    if(!user) { if(socket.current) socket.current.close(); socket.current=null; setConnected(false); return; }
    try {
      const ws=connectRoom(room==="home"?"my-home":"dream-square",{
        onOpen:()=>setConnected(true),onClose:()=>setConnected(false),
        onMessage:m=>{if(m.type==="presence")setPlayers(m.players||[]);if(m.type==="chat")setChat(old=>[...old,m].slice(-30));}
      });
      socket.current=ws;
      return ()=>{ws.close();if(socket.current===ws)socket.current=null;};
    } catch { setConnected(false); }
  },[user,room]);
  useEffect(()=>{
    if(!user) return;
    const timer=setTimeout(()=>saveProgress({coins,inventory,house,avatar}).catch(e=>setMessage("Сохранение: "+e.message)),700);
    return ()=>clearTimeout(timer);
  },[user,coins,inventory,house,avatar]);

  const submitAuth=async e=>{
    e.preventDefault();setBusy(true);setMessage("");
    try {
      const account=authMode==="register"?await register(form):await login(form);
      setUser(account);setShowAuth(false);
      const p=await loadProgress();setAvatar({...defaults,...(p.avatar||account.avatar||{})});setCoins(p.coins);setInventory(p.inventory||["hoodie"]);setHouse(p.house||[]);
      setMessage("Вход выполнен. Прогресс синхронизируется с сервером.");
    } catch(err){setMessage(err.message);}
    finally{setBusy(false);}
  };
  const buy=item=>{
    if(inventory.includes(item.id)){setRoom("home");setMessage("Предмет уже в коллекции — дом открыт.");return;}
    if(coins<item.price){setMessage("Не хватает монет.");return;}
    setCoins(c=>c-item.price);setInventory(v=>[...v,item.id]);setHouse(v=>[...v,{id:item.id}]);setRoom("home");setMessage(item.name+" добавлен в дом.");
  };
  const moveStick=e=>{
    const el=stickRef.current;if(!el)return;
    const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
    let x=(e.clientX-cx)/(r.width*.35),y=(e.clientY-cy)/(r.height*.35);
    const len=Math.hypot(x,y);if(len>1){x/=len;y/=len;}
    setStick({x,y});
  };
  const endStick=()=>setStick({x:0,y:0});
  const sendChat=e=>{e.preventDefault();const text=chatText.trim();if(text&&socket.current&&socket.current.readyState===WebSocket.OPEN){socket.current.send(JSON.stringify({type:"chat",text}));setChatText("");}};
  const sendPosition=()=>{if(socket.current&&socket.current.readyState===WebSocket.OPEN)socket.current.send(JSON.stringify({type:"move",x:pos.x,z:pos.z}));};

  return <div className="v2-page">
    <div className="v2-title-row"><div><div className="v2-kicker"><span/> QAZWORLD · V2</div><h1>Твой игровой мир</h1><p>Управляй персонажем, создай аватар и обустрой собственный дом.</p></div><div className={"v2-status "+(connected?"online":"")}>{connected?<Wifi size={15}/>:<WifiOff size={15}/>} {connected?"Комната подключена":"Одиночный режим"}</div></div>
    <div className="v2-layout">
      <section className="v2-game-card">
        <div className="v2-game-top"><div><b>{room==="home"?"Мой уютный дом":"Площадь мечты"}</b><small>{room==="home"?"Личное пространство":"Общая игровая комната"}</small></div><div className="v2-room-actions"><button className={room==="city"?"selected":""} onClick={()=>setRoom("city")}><Gamepad2 size={15}/> Мир</button><button className={room==="home"?"selected":""} onClick={()=>setRoom("home")}><House size={15}/> Дом</button></div></div>
        <div className="v2-canvas"><V2World room={room} x={pos.x} z={pos.z} avatar={avatar} furniture={house}/><div className="v2-canvas-label">3D · {room==="home"?"HOME / 01":"QAZ CITY / 01"}</div><div className="v2-joystick" ref={stickRef} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);moveStick(e);}} onPointerMove={e=>{if(e.buttons)moveStick(e);}} onPointerUp={endStick} onPointerCancel={endStick}><div className="v2-stick-base"/><div className="v2-stick-knob" style={{transform:"translate("+stick.x*24+"px,"+stick.y*24+"px)"}}/><span>MOVE</span></div><button className="v2-action-button" onClick={sendPosition}>↗ Отправить позицию</button></div>
        <div className="v2-game-footer"><span>Персонаж: <b>{user?.username||"Гость"}</b></span><span>Координаты: {pos.x.toFixed(1)}, {pos.z.toFixed(1)}</span><span>Игроков в комнате: {players.length|| (user?1:0)}</span></div>
      </section>
      <aside className="v2-controls">
        <section className="v2-panel"><div className="v2-panel-title"><CircleUserRound size={17}/><div><b>Кастомизация аватара</b><small>Измени внешний вид</small></div></div>
          <label>Одежда</label><div className="v2-swatches">{["#7256d8","#42bba5","#f18c68","#e0b65d","#5e9de2","#e66a9a"].map(c=><button key={c} aria-label={"Цвет одежды "+c} className={avatar.outfit===c?"active":""} style={{background:c}} onClick={()=>setAvatar(a=>({...a,outfit:c}))}/>)}</div>
          <label>Цвет кожи</label><div className="v2-swatches">{["#f2c7a5","#d99a72","#a96748","#70452f"].map(c=><button key={c} aria-label={"Цвет кожи "+c} className={avatar.skin===c?"active":""} style={{background:c}} onClick={()=>setAvatar(a=>({...a,skin:c}))}/>)}</div>
          <label>Волосы</label><div className="v2-swatches">{["#392a2b","#161719","#a56b38","#d7bd7a","#a85b68"].map(c=><button key={c} aria-label={"Цвет волос "+c} className={avatar.hair===c?"active":""} style={{background:c}} onClick={()=>setAvatar(a=>({...a,hair:c}))}/>)}</div>
          <button className="v2-wide-button" onClick={()=>setAvatar({...defaults})}>Сбросить образ</button>
        </section>
        <section className="v2-panel"><div className="v2-panel-title"><House size={17}/><div><b>Мебель для дома</b><small>Баланс: ◈ {coins}</small></div></div><div className="v2-furniture-list">{catalog.map(item=><div className="v2-furniture" key={item.id}><span>{item.icon}</span><div><b>{item.name}</b><small>{inventory.includes(item.id)?"Уже есть":"◈ "+item.price}</small></div><button disabled={inventory.includes(item.id)} onClick={()=>buy(item)}>{inventory.includes(item.id)?<Check size={15}/>: "Купить"}</button></div>)}</div><button className="v2-wide-button" onClick={()=>setRoom("home")}><DoorOpen size={15}/> Зайти в дом и расставить мебель</button></section>
        <section className="v2-panel v2-account"><div className="v2-panel-title"><LogIn size={17}/><div><b>Аккаунт и сохранение</b><small>{user?"Прогресс синхронизируется":"Войди, чтобы сохранить прогресс"}</small></div></div>{user?<><div className="v2-account-name"><span>👤</span><div><b>{user.username}</b><small>{user.createdAt?"Аккаунт создан":"Аккаунт QazWorld"}</small></div></div><button className="v2-wide-button" onClick={()=>saveProgress({coins,inventory,house,avatar}).then(()=>setMessage("Прогресс сохранён в D1.")).catch(e=>setMessage(e.message))}><Save size={15}/> Сохранить сейчас</button><button className="v2-logout" onClick={()=>{setToken("");setUser(null);setMessage("Ты вышел из аккаунта.");}}><LogOut size={14}/> Выйти</button></>:<button className="v2-wide-button" onClick={()=>{setShowAuth(true);setMessage("");}}>Регистрация / Вход</button>}</section>
        <section className="v2-panel v2-chat"><div className="v2-panel-title"><Wifi size={17}/><div><b>Комната</b><small>WebSocket · {connected?"подключён":"ожидает входа"}</small></div></div><div className="v2-chat-log">{chat.length?chat.slice(-5).map((m,i)=><p key={i}><b>{m.username}:</b> {m.text}</p>):<p className="v2-muted">После входа чат будет готов принимать сообщения комнаты.</p>}</div>{user&&<form onSubmit={sendChat}><input value={chatText} onChange={e=>setChatText(e.target.value)} maxLength={240} placeholder="Сообщение..."/><button disabled={!connected||!chatText.trim()}>↗</button></form>}</section>
      </aside>
    </div>
    {message&&<div className="v2-message" role="status">{message}<button onClick={()=>setMessage("")}>×</button></div>}
    {showAuth&&<div className="v2-modal-backdrop" onClick={()=>setShowAuth(false)}><form className="v2-auth-modal" onSubmit={submitAuth} onClick={e=>e.stopPropagation()}><button type="button" className="v2-modal-close" onClick={()=>setShowAuth(false)}>×</button><div className="v2-kicker"><span/> QAZWORLD ACCOUNT</div><h2>{authMode==="register"?"Создать аккаунт":"С возвращением"}</h2><p>Аккаунт нужен для сохранения прогресса в Cloudflare D1.</p><div className="v2-auth-switch"><button type="button" className={authMode==="login"?"active":""} onClick={()=>setAuthMode("login")}>Вход</button><button type="button" className={authMode==="register"?"active":""} onClick={()=>setAuthMode("register")}>Регистрация</button></div>{authMode==="register"&&<label>Имя игрока<input required minLength={2} maxLength={18} value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value}))} placeholder="Nomad"/></label>}<label>Email<input required type="email" autoComplete="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="you@example.com"/></label><label>Пароль<input required type="password" minLength={8} maxLength={128} autoComplete={authMode==="register"?"new-password":"current-password"} value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="Минимум 8 символов"/></label><button className="v2-submit" disabled={busy}>{busy?"Подключение...":authMode==="register"?"Создать аккаунт":"Войти в игру"}</button>{message&&<p className="v2-auth-error">{message}</p>}<small>Используется серверная авторизация. Не используй пароль от других сервисов.</small></form></div>}
  </div>;
}