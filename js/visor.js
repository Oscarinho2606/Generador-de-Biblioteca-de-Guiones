/* Visor: es el HTML que reciben los agentes.
   El generador lo arma con VISOR_CSS + VISOR_BODY + visorApp.toString() y los datos.
   visorApp no puede usar nada de fuera de su propio cuerpo. */

const VISOR_CSS = String.raw`
:root{
  --campo:#1E4A2C; --hoja:#2F7A45; --brote:#DDEBD9; --cosecha:#F2C14E; --cosecha-suave:#FCF0CC;
  --papel:#F5F7F2; --tarjeta:#FFFFFF; --tinta:#17231B; --tenue:#5B6A60; --linea:#D5DDD2;
  --sombra:0 1px 0 rgba(30,74,44,.08);
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --campo:#9FD3A9; --hoja:#7CC38D; --brote:#23382A; --cosecha:#F2C14E; --cosecha-suave:#3A3218;
  --papel:#121A15; --tarjeta:#1A241E; --tinta:#E6EDE7; --tenue:#9AA89E; --linea:#2C3A31; --sombra:none;}}
:root[data-theme="dark"]{
  --campo:#9FD3A9; --hoja:#7CC38D; --brote:#23382A; --cosecha:#F2C14E; --cosecha-suave:#3A3218;
  --papel:#121A15; --tarjeta:#1A241E; --tinta:#E6EDE7; --tenue:#9AA89E; --linea:#2C3A31; --sombra:none;}
*{box-sizing:border-box}
html,body{margin:0}
body{background:var(--papel);color:var(--tinta);font:16px/1.55 "Atkinson Hyperlegible",system-ui,-apple-system,"Segoe UI",sans-serif}
h1,h2,h3{font-family:"Bricolage Grotesque","Atkinson Hyperlegible",system-ui,sans-serif;margin:0;line-height:1.15}
button,input{font:inherit;color:inherit}
:focus-visible{outline:3px solid var(--cosecha);outline-offset:2px}
.oculto{display:none!important}

/* ---------- Ingreso ---------- */
#ingreso{min-height:100vh;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr)}
.surcos{background:var(--campo);color:#F5F7F2;padding:clamp(28px,6vw,72px);display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden}
:root[data-theme="dark"] .surcos{background:#16301F}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .surcos{background:#16301F}}
.surcos::after{content:"";position:absolute;inset:auto -10% -30% -10%;height:70%;
  background:repeating-linear-gradient(-8deg,transparent 0 22px,rgba(242,193,78,.16) 22px 24px);transform:skewY(-4deg)}
.surcos h1{font-size:clamp(2.4rem,5.2vw,4.4rem);font-weight:700;max-width:12ch;letter-spacing:-.02em;position:relative;z-index:1}
.surcos p{max-width:38ch;opacity:.85;position:relative;z-index:1;margin:18px 0 0}
.marca{font-weight:700;display:flex;gap:10px;align-items:center;position:relative;z-index:1}
.marca i{width:14px;height:14px;border-radius:50% 0;background:var(--cosecha);display:inline-block}
.puerta{display:flex;align-items:center;justify-content:center;padding:32px}
.puerta form{width:min(360px,100%)}
.puerta h2{font-size:1.6rem;margin-bottom:6px}
.puerta .ayuda{color:var(--tenue);margin:0 0 24px}
.puerta .version{display:block;margin-top:22px;color:var(--tenue);font-size:.85rem}
label.campo{display:block;font-weight:700;margin-bottom:8px}
#cedula{width:100%;font-size:1.9rem;letter-spacing:.08em;padding:14px 16px;border:2px solid var(--linea);border-radius:10px;background:var(--tarjeta);font-variant-numeric:tabular-nums}
#cedula:focus{border-color:var(--hoja);outline:none;box-shadow:0 0 0 4px var(--brote)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:10px;padding:12px 18px;font-weight:700;cursor:pointer}
.btn-principal{background:var(--hoja);color:#fff;width:100%;margin-top:14px;font-size:1.05rem}
:root[data-theme="dark"] .btn-principal{color:#0E1A12}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .btn-principal{color:#0E1A12}}
.btn-principal:hover{filter:brightness(1.08)}
.error{color:#B3261E;margin-top:12px;min-height:1.5em;font-size:.95rem}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .error{color:#FFB4AB}}
:root[data-theme="dark"] .error{color:#FFB4AB}
@media (max-width:760px){#ingreso{grid-template-columns:1fr}.surcos{min-height:auto;gap:40px}}

/* ---------- Biblioteca ---------- */
#biblioteca{min-height:100vh}
header.barra{position:sticky;top:0;z-index:5;background:var(--tarjeta);border-bottom:1px solid var(--linea);display:flex;align-items:center;gap:16px;padding:12px clamp(16px,3vw,32px)}
.saludo{display:flex;flex-direction:column;min-width:0}
.saludo strong{font-family:"Bricolage Grotesque",sans-serif;font-size:1.25rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.saludo span{color:var(--tenue);font-size:.88rem}
.grupo{background:var(--cosecha-suave);color:var(--tinta);border:1px solid var(--cosecha);border-radius:999px;padding:2px 10px;font-size:.82rem;font-weight:700;white-space:nowrap}
.espacio{flex:1}
.btn-sec{background:transparent;border:1px solid var(--linea);color:var(--tinta)}
.btn-sec:hover{background:var(--brote)}
.layout{display:grid;grid-template-columns:270px minmax(0,1fr);gap:clamp(16px,3vw,40px);padding:24px clamp(16px,3vw,32px);max-width:1280px;margin:0 auto}
aside{position:sticky;top:84px;align-self:start;max-height:calc(100vh - 100px);overflow:auto;padding-right:4px}
.buscar{position:relative;margin-bottom:18px}
.buscar input{width:100%;padding:11px 12px 11px 38px;border:1px solid var(--linea);border-radius:10px;background:var(--tarjeta)}
.buscar input:focus{outline:none;border-color:var(--hoja);box-shadow:0 0 0 3px var(--brote)}
.buscar svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--tenue)}
.buscar kbd{position:absolute;right:10px;top:50%;transform:translateY(-50%);font:12px/1 system-ui;border:1px solid var(--linea);border-radius:5px;padding:3px 6px;color:var(--tenue)}
nav.cats{display:flex;flex-direction:column;gap:2px}
nav.cats button{display:flex;justify-content:space-between;gap:8px;text-align:left;background:none;border:0;border-left:3px solid transparent;padding:8px 10px;border-radius:0 8px 8px 0;cursor:pointer;color:var(--tinta)}
nav.cats button:hover{background:var(--brote)}
nav.cats button[aria-pressed="true"]{border-left-color:var(--hoja);background:var(--brote);font-weight:700}
nav.cats small{color:var(--tenue);font-variant-numeric:tabular-nums}
.sep-nav{height:1px;background:var(--linea);margin:8px 0}
main{min-width:0}
.cabeza-lista{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:14px;flex-wrap:wrap}
.cabeza-lista h2{font-size:1.7rem}
.cabeza-lista p{margin:0;color:var(--tenue)}
.grupo-cat{margin:28px 0 10px;font-size:1rem;color:var(--hoja);display:flex;align-items:center;gap:10px}
.grupo-cat::after{content:"";flex:1;height:1px;background:var(--linea)}
.guion{background:var(--tarjeta);border:1px solid var(--linea);border-radius:12px;margin-bottom:8px;box-shadow:var(--sombra)}
.guion>.tit{display:flex;align-items:center;gap:10px;padding:4px 6px 4px 14px}
.guion>.tit button.abrir{flex:1;display:flex;align-items:center;gap:10px;background:none;border:0;padding:10px 0;text-align:left;cursor:pointer;font-weight:700;font-size:1.02rem;min-width:0}
.chev{transition:transform .18s;color:var(--tenue);flex:none}
.guion.abierto .chev{transform:rotate(90deg)}
.estrella{background:none;border:0;cursor:pointer;padding:8px;border-radius:8px;color:var(--tenue);line-height:0}
.estrella:hover{background:var(--brote)}
.estrella[aria-pressed="true"]{color:#C99419}
.cuerpo{padding:0 16px 16px 16px;border-top:1px dashed var(--linea)}
.bloque{margin-top:14px;border-left:3px solid var(--brote);padding-left:14px}
/* despues de .bloque: el shorthand border-left de arriba pisaria el color */
.bloque-int{border-left-color:var(--cosecha);background:var(--cosecha-suave);border-radius:0 10px 10px 0;padding:10px 14px;margin-top:16px}
.bloque-int .p{max-width:none;font-size:.95rem}
.copiar-int{background:transparent;color:var(--tinta);border:1px solid var(--cosecha)}
.bloque-acc{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:8px}
.bloque-acc span{font-size:.85rem;color:var(--tenue)}
.copiar{background:var(--campo);color:var(--papel);padding:7px 12px;font-size:.9rem;border-radius:8px}
.copiar:hover{filter:brightness(1.1)}
.p{white-space:pre-wrap;margin:0 0 6px;padding:8px 10px;border-radius:8px;cursor:copy;transition:background .25s;max-width:78ch;overflow-wrap:anywhere}
.p:hover{background:var(--brote)}
.p.copiado{background:var(--cosecha-suave);box-shadow:inset 0 0 0 2px var(--cosecha)}
mark.dato{background:var(--cosecha-suave);color:inherit;border-bottom:2px solid var(--cosecha);padding:0 2px;border-radius:3px}
mark.hl{background:var(--cosecha);color:#17231B;border-radius:2px}
.p a{color:var(--hoja);text-decoration-thickness:1px;text-underline-offset:2px}
.etq{font-weight:400;font-size:.78rem;color:var(--tenue);border:1px solid var(--linea);border-radius:999px;padding:1px 8px;white-space:nowrap;flex:none}
/* despues de .etq: el shorthand border y el color de arriba pisarian estos */
.etq-r{border-color:var(--cosecha);background:var(--cosecha-suave);color:var(--tinta)}
.etq-c{border-color:var(--hoja);color:var(--hoja)}
.guion>.tit button.abrir>span:nth-child(2){min-width:0}
.vacio{background:var(--tarjeta);border:1px dashed var(--linea);border-radius:12px;padding:32px;text-align:center;color:var(--tenue)}
.vacio h3{color:var(--tinta);margin-bottom:6px;font-size:1.2rem}
#aviso{position:fixed;left:50%;bottom:24px;transform:translate(-50%,20px);opacity:0;background:var(--campo);color:var(--papel);padding:10px 18px;border-radius:999px;font-weight:700;pointer-events:none;transition:.2s;z-index:10}
#aviso.ver{opacity:1;transform:translate(-50%,0)}
.franja-previa{background:var(--cosecha);color:#17231B;text-align:center;font-weight:700;font-size:.9rem;padding:6px 12px}
@media (max-width:880px){
  .layout{grid-template-columns:1fr}
  aside{position:static;max-height:none}
  nav.cats{flex-direction:row;overflow-x:auto;gap:6px;padding-bottom:6px}
  nav.cats button{border-left:0;border:1px solid var(--linea);border-radius:999px;white-space:nowrap;padding:6px 12px}
  nav.cats button[aria-pressed="true"]{border-color:var(--hoja)}
  .sep-nav{display:none}
  .saludo span{display:none}
}
@media (max-width:560px){.grupo{display:none}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

const VISOR_BODY = String.raw`
<div class="franja-previa oculto" id="franjaPrevia">Vista previa · así verá la biblioteca este agente</div>
<section id="ingreso">
  <div class="surcos">
    <div class="marca"><i></i> <span id="marca"></span></div>
    <div>
      <h1>Tus guiones, listos para copiar.</h1>
      <p>Cada asesor tiene su propia biblioteca de plantillas para chat y redes sociales. Busca, copia y responde sin salir de la conversación.</p>
    </div>
  </div>
  <div class="puerta">
    <form id="formIngreso" autocomplete="off" novalidate>
      <h2>Entrar a mi biblioteca</h2>
      <p class="ayuda">Escribe tu número de cédula, sin puntos ni espacios.</p>
      <label class="campo" for="cedula">Cédula</label>
      <input id="cedula" inputmode="numeric" maxlength="20" placeholder="Ej. 1012345678" required>
      <button class="btn btn-principal" type="submit">Entrar</button>
      <div class="error" id="error" role="alert"></div>
      <small class="version"></small>
    </form>
  </div>
</section>

<section id="biblioteca" class="oculto">
  <header class="barra">
    <div class="saludo"><strong id="nombreCorto"></strong><span id="nombreLargo"></span></div>
    <span class="grupo version" title="Si te avisan de una versión nueva, cierra este archivo y abre el nuevo"></span>
    <div class="espacio"></div>
    <button class="btn btn-sec" id="salir" type="button">Salir</button>
  </header>
  <div class="layout">
    <aside>
      <div class="buscar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input id="q" type="search" placeholder="Buscar guion o palabra" aria-label="Buscar guiones">
        <kbd>/</kbd>
      </div>
      <nav class="cats" id="cats" aria-label="Categorías"></nav>
    </aside>
    <main>
      <div class="cabeza-lista"><h2 id="tituloLista">Todos los guiones</h2><p id="conteo"></p></div>
      <div id="lista"></div>
    </main>
  </div>
</section>
<div id="aviso" role="status" aria-live="polite">Copiado</div>
`;

function visorApp(DATA){
const $ = s => document.querySelector(s);
const store = {
  get(k){try{return localStorage.getItem(k)}catch(e){return null}},
  set(k,v){try{localStorage.setItem(k,v)}catch(e){}},
  sget(k){try{return sessionStorage.getItem(k)}catch(e){return null}},
  sset(k,v){try{sessionStorage.setItem(k,v)}catch(e){}},
  sdel(k){try{sessionStorage.removeItem(k)}catch(e){}}
};
let yo=null, filtroCat='__todos', favs=new Set(), abiertos=new Set();

async function sha256(t){
  const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const esc = s => s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

$('#marca').textContent=DATA.marca;
document.querySelectorAll('.version').forEach(el=>el.textContent='Versión del '+DATA.v);

$('#cedula').addEventListener('input',()=>{$('#error').textContent=''});
$('#formIngreso').addEventListener('submit',async e=>{
  e.preventDefault();
  const c=$('#cedula').value.replace(/\D/g,'');
  if(!c){$('#error').textContent='Escribe tu número de cédula para entrar.';return}
  const h=await sha256(DATA.salt+c);
  const a=DATA.as.find(x=>x.h===h);
  if(!a){$('#error').textContent='Esa cédula no está registrada en esta biblioteca. Revisa el número o habla con tu supervisor.';return}
  store.sset('bib_sesion',h); entrar(a);
});
function pantallaIngreso(){
  yo=null; $('#cedula').value='';
  $('#biblioteca').classList.add('oculto');
  $('#ingreso').classList.remove('oculto'); $('#cedula').focus();
}
$('#salir').addEventListener('click',()=>{store.sdel('bib_sesion');pantallaIngreso()});

// {nombre} y {nombre_completo} se cambian por los datos del agente que entra
function armarLista(a){
  const sub=s=>s.replace(/\{nombre\}/gi,a.s).replace(/\{nombre_completo\}/gi,a.n);
  const pos=c=>{const i=DATA.cats.indexOf(c);return i<0?999:i};
  return a.g.map((gi,i)=>[DATA.gs[gi],i])
    .sort((x,y)=>pos(x[0].c)-pos(y[0].c)||x[1]-y[1])
    .map(([g])=>({id:g.i,t:sub(g.t),c:g.c,n:g.n,bt:g.bt,b:g.b.map(bl=>bl.map(sub))}));
}
function entrar(a){
  yo=a; yo.lista=armarLista(a); filtroCat='__todos'; abiertos=new Set(); $('#q').value='';
  try{favs=new Set(JSON.parse(store.get('bib_favs_'+a.h.slice(0,16))||'[]'))}catch(e){favs=new Set()}
  $('#nombreCorto').textContent='Hola, '+a.s;
  $('#nombreLargo').textContent=a.n;
  $('#ingreso').classList.add('oculto'); $('#biblioteca').classList.remove('oculto');
  $('#salir').classList.toggle('oculto',!!DATA.pv);
  window.scrollTo(0,0); pintarCats(); pintar();
}
function guardarFavs(){store.set('bib_favs_'+yo.h.slice(0,16),JSON.stringify([...favs]))}
// g.n: 'C'=solo chat, 'R'=solo redes, 'A'=sirve para ambos
const idG = g => g.id;

function pintarCats(){
  const conteo={}; yo.lista.forEach(g=>conteo[g.c]=(conteo[g.c]||0)+1);
  const cats=Object.keys(conteo);
  let html=`<button data-c="__todos" aria-pressed="${filtroCat==='__todos'}">Todos <small>${yo.lista.length}</small></button>`;
  html+=`<button data-c="__favs" aria-pressed="${filtroCat==='__favs'}">Favoritos <small>${[...favs].filter(f=>yo.lista.some(g=>idG(g)===f)).length}</small></button>`;
  const nC=yo.lista.filter(g=>g.n==='C').length, nR=yo.lista.filter(g=>g.n==='R').length;
  if(nC) html+=`<button data-c="__chat" aria-pressed="${filtroCat==='__chat'}">Para chat <small>${nC}</small></button>`;
  if(nR) html+=`<button data-c="__redes" aria-pressed="${filtroCat==='__redes'}">Para redes <small>${nR}</small></button>`;
  if(cats.length) html+='<div class="sep-nav"></div>';
  html+=cats.map(c=>`<button data-c="${esc(c)}" aria-pressed="${filtroCat===c}">${esc(c)} <small>${conteo[c]}</small></button>`).join('');
  $('#cats').innerHTML=html;
}
$('#cats').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;filtroCat=b.dataset.c;pintarCats();pintar();window.scrollTo({top:0})});
$('#q').addEventListener('input',()=>pintar());
document.addEventListener('keydown',e=>{
  if(e.key==='/'&&yo&&document.activeElement!==$('#q')){e.preventDefault();$('#q').focus()}
  if(e.key==='Escape'&&document.activeElement===$('#q')){$('#q').value='';pintar()}
});

function formatear(texto,q){
  let s=esc(texto);
  s=s.replace(/(https?:\/\/[^\s<]+[^\s<.,;:)"'])/g,'<a href="$1" target="_blank" rel="noopener">$1</a>');
  s=s.replace(/(x{4,}|\*{3,}|_{4,})/gi,'<mark class="dato" title="Completa este dato">$1</mark>');
  if(q){
    // resaltar coincidencias fuera de etiquetas
    const partes=s.split(/(<[^>]+>)/);
    const nq=norm(q);
    s=partes.map(p=>{ if(p.startsWith('<'))return p;
      const np=norm(p); let out='',i=0,j;
      while((j=np.indexOf(nq,i))!==-1){out+=p.slice(i,j)+'<mark class="hl">'+p.slice(j,j+nq.length)+'</mark>';i=j+nq.length}
      return out+p.slice(i);}).join('');
  }
  return s;
}

function pintar(){
  const q=$('#q').value.trim(); const nq=norm(q);
  let lista=yo.lista;
  if(filtroCat==='__favs') lista=lista.filter(g=>favs.has(idG(g)));
  else if(filtroCat==='__chat') lista=lista.filter(g=>g.n==='C');
  else if(filtroCat==='__redes') lista=lista.filter(g=>g.n==='R');
  else if(filtroCat!=='__todos') lista=lista.filter(g=>g.c===filtroCat);
  if(nq) lista=lista.filter(g=>norm(g.t+' '+g.c+' '+g.b.flat().join(' ')).includes(nq));
  $('#tituloLista').textContent = filtroCat==='__todos'?'Todos los guiones':filtroCat==='__favs'?'Favoritos':filtroCat==='__chat'?'Guiones escritos para chat':filtroCat==='__redes'?'Guiones escritos para redes sociales':filtroCat;
  $('#conteo').textContent = lista.length===1?'1 guion':lista.length+' guiones';

  if(!yo.lista.length){
    $('#lista').innerHTML=`<div class="vacio"><h3>Tu biblioteca todavía está vacía</h3>Cuando tu supervisor cargue tus plantillas, aparecerán aquí organizadas por tema.</div>`;return}
  if(!lista.length){
    $('#lista').innerHTML = filtroCat==='__favs'&&!nq
      ? `<div class="vacio"><h3>Aún no tienes favoritos</h3>Marca la estrella de los guiones que más usas para tenerlos a un clic.</div>`
      : `<div class="vacio"><h3>Ningún guion coincide con “${esc(q)}”</h3>Prueba con otra palabra o vuelve a Todos.</div>`;return}

  const abrirTodo=!!nq;
  let html='', catPrev=null;
  lista.forEach(g=>{
    const id=idG(g), ix=yo.lista.indexOf(g);
    if(filtroCat==='__todos'||filtroCat==='__favs'){ if(g.c!==catPrev){html+=`<h3 class="grupo-cat">${esc(g.c)}</h3>`;catPrev=g.c} }
    const open=abrirTodo||abiertos.has(id);
    html+=`<article class="guion${open?' abierto':''}" data-ix="${ix}">
      <div class="tit">
        <button class="abrir" aria-expanded="${open}"><svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg><span>${formatear(g.t,q)}</span>${g.n==='R'?'<span class="etq etq-r" title="Redactado para redes sociales (muros y comentarios)">Redes</span>':g.n==='C'?'<span class="etq etq-c" title="Redactado para chat">Chat</span>':''}</button>
        <button class="estrella" aria-pressed="${favs.has(id)}" aria-label="${favs.has(id)?'Quitar de favoritos':'Agregar a favoritos'}"><svg width="20" height="20" viewBox="0 0 24 24" fill="${favs.has(id)?'currentColor':'none'}" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg></button>
      </div>
      ${open?cuerpo(g,q):''}
    </article>`;
  });
  $('#lista').innerHTML=html;
}
function cuerpo(g,q){
  const tipos=g.bt||[], nCli=g.b.filter((b,i)=>tipos[i]!=='i').length;
  return `<div class="cuerpo">${g.b.map((b,bi)=>{
    const esInt=tipos[bi]==='i';
    const idxCli=g.b.slice(0,bi+1).filter((x,i)=>tipos[i]!=='i').length;
    return `
    <div class="bloque${esInt?' bloque-int':''}" data-bi="${bi}">
      <div class="bloque-acc"><span>${esInt?(/^(ID\s*:|PQR\s*:|AGENTE)/i.test(b[0]||'')?'🔒 Plantilla para radicar · no se envía al cliente':'🔒 Nota interna · no se envía al cliente'):(nCli>1?'Opción '+idxCli+' de '+nCli:'Toca un párrafo para copiarlo solo')}</span>
      <button class="btn copiar${esInt?' copiar-int':''}" data-accion="bloque">${esInt?(/^(ID\s*:|PQR\s*:|AGENTE)/i.test(b[0]||'')?'Copiar plantilla':'Copiar nota'):'Copiar '+(nCli>1?'esta opción':'guion completo')}</button></div>
      ${b.map((p,pi)=>`<p class="p" data-pi="${pi}" tabindex="0" title="Clic para copiar este párrafo">${formatear(p,q)}</p>`).join('')}
    </div>`;}).join('')}</div>`;
}

$('#lista').addEventListener('click',e=>{
  if(e.target.closest('a'))return;
  const art=e.target.closest('.guion'); if(!art)return;
  const g=yo.lista[+art.dataset.ix], id=idG(g);
  if(e.target.closest('.abrir')){
    const open=!art.classList.contains('abierto');
    open?abiertos.add(id):abiertos.delete(id);
    art.classList.toggle('abierto',open);
    art.querySelector('.abrir').setAttribute('aria-expanded',open);
    const c=art.querySelector('.cuerpo'); if(c)c.remove();
    if(open)art.insertAdjacentHTML('beforeend',cuerpo(g,$('#q').value.trim()));
    return;
  }
  if(e.target.closest('.estrella')){
    favs.has(id)?favs.delete(id):favs.add(id); guardarFavs(); pintarCats(); pintar(); return;
  }
  const bl=e.target.closest('.bloque'); if(!bl)return;
  const b=g.b[+bl.dataset.bi];
  if(e.target.closest('[data-accion="bloque"]')){copiar(b.join('\n\n'),[...bl.querySelectorAll('.p')],'Guion copiado');return}
  const p=e.target.closest('.p'); if(p)copiar(b[+p.dataset.pi],[p],'Párrafo copiado');
});
$('#lista').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('p')){e.preventDefault();e.target.click()}});

async function copiar(texto,els,msg){
  let ok=false;
  try{await navigator.clipboard.writeText(texto);ok=true}catch(e){
    const t=document.createElement('textarea');t.value=texto;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();
    try{ok=document.execCommand('copy')}catch(_){}
    t.remove();
  }
  const av=$('#aviso'); av.textContent= ok?msg:'No se pudo copiar. Selecciona el texto y usa Ctrl+C.';
  av.classList.add('ver'); clearTimeout(av._t); av._t=setTimeout(()=>av.classList.remove('ver'),1600);
  if(ok) els.forEach(el=>{el.classList.add('copiado');setTimeout(()=>el.classList.remove('copiado'),900)});
}

if(DATA.pv){
  const a=DATA.as.find(x=>x.h===DATA.pv);
  $('#franjaPrevia').classList.remove('oculto');
  if(a){ entrar(a); return }
}
const h=store.sget('bib_sesion');
const a=h&&DATA.as.find(x=>x.h===h);
if(a) entrar(a); else $('#cedula').focus();
}

// Arma el archivo HTML completo que se entrega a los agentes
function construirVisorHTML(data){
  const json=JSON.stringify(data).replace(/</g,'\\u003c');
  const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Biblioteca de guiones · ${esc(data.marca)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<style>${VISOR_CSS}</style>
</head>
<body>
${VISOR_BODY}
<script>
const DATA = ${json};
(${visorApp.toString()})(DATA);
<\/script>
</body>
</html>
`;
}
