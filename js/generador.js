'use strict';
/* Generador de biblioteca de guiones.
   Todo se guarda en el navegador (localStorage) y se respalda en un .json.
   "Generar HTML" arma con js/visor.js el archivo único que se entrega a los agentes. */

const $ = s => document.querySelector(s);
const CLAVE = 'generador_biblioteca_v1';

const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm = s => String(s).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
const uid = () => (crypto.randomUUID ? crypto.randomUUID().replace(/-/g,'') : Date.now().toString(36)+Math.random().toString(36).slice(2)).slice(0,16);
const soloDigitos = s => String(s||'').replace(/\D/g,'');
const fmtCedula = c => c ? c.replace(/\B(?=(\d{3})+(?!\d))/g,'.') : '';
const bonito = n => n.toLowerCase().replace(/(^|\s)\S/g,m=>m.toUpperCase());
// Los nombres escritos todo en mayúsculas se muestran con mayúscula inicial
const visible = n => n===n.toUpperCase() ? bonito(n) : n;
const primerNombre = n => visible(n).trim().split(/\s+/)[0] || '';
// Una línea en blanco separa párrafos
const parrafos = t => String(t||'').replace(/\r/g,'').split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean);
const plural = (n,uno,varios) => n+' '+(n===1?uno:varios);

async function sha256(t){
  const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
const fechaLarga = d => new Intl.DateTimeFormat('es-CO',{day:'numeric',month:'long',year:'numeric',hour:'numeric',minute:'2-digit'}).format(d);
const fechaCorta = iso => new Intl.DateTimeFormat('es-CO',{dateStyle:'medium',timeStyle:'short'}).format(new Date(iso));

/* ---------- Proyecto ---------- */
function proyectoVacio(){
  return {tipo:'generador-biblioteca-guiones',version:1,salt:'gb-'+uid()+'|',marca:'Contact Center',
    agentes:[],categorias:[],guiones:[],modificado:null,respaldo:null,generado:null};
}
const esProyecto = p => p && Array.isArray(p.agentes) && Array.isArray(p.guiones);
function completar(p){
  const base=proyectoVacio();
  return Object.assign(base,p,{categorias:Array.isArray(p.categorias)?p.categorias:[],salt:p.salt||base.salt});
}
function cargar(){
  try{ const t=localStorage.getItem(CLAVE); if(t){ const p=JSON.parse(t); if(esProyecto(p)) return completar(p) } }catch(e){}
  return proyectoVacio();
}
let P = cargar();
let sel = null;              // id del agente abierto, o '__todos'
let abiertos = new Set();
let qGuion = '', catFiltro = '';

function guardar(cambio=true){
  if(cambio) P.modificado=new Date().toISOString();
  try{ localStorage.setItem(CLAVE,JSON.stringify(P)) }
  catch(e){ aviso('No se pudo guardar en este navegador. Descarga un respaldo ahora.',5000) }
  pintar();
}
const agente = id => P.agentes.find(a=>a.id===id);
const ordenados = () => [...P.agentes].sort((a,b)=>norm(visible(a.nombre)).localeCompare(norm(visible(b.nombre))));
const guionesDe = id => P.guiones.filter(g=>g.agentes.includes(id));
const posCat = c => { const i=P.categorias.indexOf(c); return i<0?999:i };
function ordenarGuiones(lista){
  return lista.map(g=>[g,P.guiones.indexOf(g)]).sort((x,y)=>posCat(x[0].categoria)-posCat(y[0].categoria)||x[1]-y[1]).map(x=>x[0]);
}
function asegurarCategoria(c){ if(c && !P.categorias.includes(c)) P.categorias.push(c) }

/* ---------- Avisos ---------- */
function aviso(msg,ms=1800){
  const av=$('#aviso'); av.textContent=msg; av.classList.add('ver');
  clearTimeout(av._t); av._t=setTimeout(()=>av.classList.remove('ver'),ms);
}
// Diálogo de confirmación: botones = [{texto, clase, accion}]
function confirmar(titulo,html,botones){
  const d=$('#dlgConfirmar');
  $('#cfTitulo').textContent=titulo; $('#cfTexto').innerHTML='<p>'+html+'</p>';
  const pie=$('#cfBotones'); pie.innerHTML='';
  botones.concat([{texto:botones.length?'Cancelar':'Entendido',clase:'btn-sec'}]).forEach(b=>{
    const el=document.createElement('button'); el.type='button'; el.className='btn '+(b.clase||'btn-sec'); el.textContent=b.texto;
    el.addEventListener('click',()=>{ d.close(); if(b.accion) b.accion() });
    pie.appendChild(el);
  });
  d.showModal();
}
document.addEventListener('click',e=>{ const c=e.target.closest('[data-cerrar]'); if(c) c.closest('dialog').close() });

/* ---------- Pintar ---------- */
function pintar(){ pintarResumen(); pintarFranja(); pintarAgentes(); pintarVista() }

function pintarResumen(){
  const sinCed=P.agentes.filter(a=>!a.cedula).length;
  let t=plural(P.agentes.length,'agente','agentes')+' · '+plural(P.guiones.length,'guion','guiones');
  if(sinCed) t+=' · '+sinCed+' sin cédula';
  if(P.generado) t+=' · último HTML: '+fechaCorta(P.generado);
  $('#resumen').textContent=t;
}
function pintarFranja(){
  const hayDatos=P.agentes.length||P.guiones.length;
  const pendiente=hayDatos && P.modificado && (!P.respaldo || P.modificado>P.respaldo);
  $('#franjaRespaldo').hidden=!pendiente;
  if(pendiente) $('#franjaTexto').textContent=P.respaldo
    ? 'Hay cambios desde tu último respaldo ('+fechaCorta(P.respaldo)+'). Si se borran los datos del navegador, se pierden.'
    : 'Todo está guardado solo en este navegador. Descarga un respaldo para no perder tu trabajo.';
}

function pintarAgentes(){
  const q=norm($('#qAgentes').value.trim());
  const lista=ordenados().filter(a=>!q||norm(a.nombre+' '+a.cedula+' '+(a.corto||'')).includes(q));
  let h=`<button type="button" data-ag="__todos" aria-current="${sel==='__todos'}"><span class="nom">Todos los guiones</span><small>${P.guiones.length}</small></button><div class="sep-nav"></div>`;
  if(!P.agentes.length) h+='<p class="nav-vacio">Aún no hay agentes. Agrega el primero arriba.</p>';
  else if(!lista.length) h+='<p class="nav-vacio">Ningún agente coincide con la búsqueda.</p>';
  h+=lista.map(a=>`<button type="button" data-ag="${a.id}" aria-current="${sel===a.id}"><span class="nom">${esc(visible(a.nombre))}</span>${a.cedula?`<small>${guionesDe(a.id).length}</small>`:'<small class="falta">sin cédula</small>'}</button>`).join('');
  $('#listaAgentes').innerHTML=h;
}
$('#qAgentes').addEventListener('input',pintarAgentes);
$('#listaAgentes').addEventListener('click',e=>{
  const b=e.target.closest('[data-ag]'); if(!b) return;
  abrirVista(b.dataset.ag);
});
function abrirVista(id){
  if(sel!==id){ qGuion=''; catFiltro=''; abiertos=new Set() }
  sel=id; pintarAgentes(); pintarVista(); window.scrollTo({top:0});
}

const ICONO_BUSCAR='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

function pintarVista(){
  const v=$('#vista');
  if(sel!=='__todos' && !agente(sel)) sel=null;
  if(!sel){
    if(!P.agentes.length && !P.guiones.length){ v.innerHTML=bienvenida(); return }
    sel=P.agentes.length?ordenados()[0].id:'__todos'; pintarAgentes();
  }
  let cabeza, base;
  if(sel==='__todos'){
    base=P.guiones;
    const sinAsig=base.filter(g=>!g.agentes.length).length;
    cabeza=`<div class="cabeza"><div><h1>Todos los guiones</h1><p>${plural(base.length,'guion','guiones')}${sinAsig?' · '+sinAsig+' sin asignar (no salen en el HTML)':''}</p></div>
      <div class="acciones"><button class="btn btn-principal" type="button" data-acc="nuevo">+ Nuevo guion</button></div></div>`;
  }else{
    const a=agente(sel); base=guionesDe(a.id);
    cabeza=`<div class="cabeza"><div><h1>${esc(visible(a.nombre))}</h1>
        <p>${a.cedula?'Cédula '+fmtCedula(a.cedula)+' · ':''}${plural(base.length,'guion','guiones')} · saludo: “Hola, ${esc(a.corto||primerNombre(a.nombre))}”</p>
        ${a.cedula?'':'<span class="aviso-falta">Falta la cédula: no entrará en el HTML hasta que la agregues</span>'}</div>
      <div class="acciones">
        <button class="btn btn-sec" type="button" data-acc="editar-agente">Editar agente</button>
        <button class="btn btn-sec" type="button" data-acc="ver-como"${a.cedula?'':' disabled title="Agrega la cédula primero"'}>Ver como este agente</button>
        <button class="btn btn-principal" type="button" data-acc="nuevo">+ Nuevo guion</button>
      </div></div>`;
  }
  const cats=[...new Set(ordenarGuiones(base).map(g=>g.categoria))];
  if(catFiltro && catFiltro!=='__sin' && !cats.includes(catFiltro)) catFiltro='';
  const opciones=`<option value="">Todas las categorías</option>${sel==='__todos'?`<option value="__sin"${catFiltro==='__sin'?' selected':''}>Sin asignar a nadie</option>`:''}`
    +cats.map(c=>`<option value="${esc(c)}"${catFiltro===c?' selected':''}>${esc(c)}</option>`).join('');
  v.innerHTML=cabeza+(base.length?`<div class="filtro">
      <div class="buscar">${ICONO_BUSCAR}<input id="qGuion" type="search" placeholder="Buscar en estos guiones" aria-label="Buscar guiones" value="${esc(qGuion)}"></div>
      <select id="catFiltro" aria-label="Filtrar por categoría">${opciones}</select>
    </div>`:'')+'<div id="listaGuiones"></div>';
  pintarLista();
}

function bienvenida(){
  return `<div class="vacio"><h2>Arma la biblioteca de tu equipo</h2>
    <p>Tú creas y editas los guiones aquí. Tus agentes solo reciben el HTML final para consultar y copiar.</p>
    <div class="pasos">
      <div><b>1. Agrega a tus agentes</b>Nombre completo y cédula, en el panel de la izquierda.</div>
      <div><b>2. Crea sus guiones</b>Título, categoría y el texto que van a copiar.</div>
      <div><b>3. Genera el HTML</b>Un solo archivo con la biblioteca de todos. Cada uno entra con su cédula.</div>
    </div>
    <div class="acciones">
      <button class="btn btn-sec" type="button" data-menu="anterior">Importar biblioteca anterior</button>
      <button class="btn btn-sec" type="button" data-menu="restaurar">Restaurar un respaldo</button>
    </div></div>`;
}

function formatear(texto,q){
  let s=esc(texto);
  s=s.replace(/(https?:\/\/[^\s<]+[^\s<.,;:)"'])/g,'<a href="$1" target="_blank" rel="noopener">$1</a>');
  s=s.replace(/(x{4,}|\*{3,}|_{4,})/gi,'<mark class="dato" title="El agente completa este dato">$1</mark>');
  s=s.replace(/\{(nombre|nombre_completo)\}/gi,'<mark class="var" title="Se cambia por el nombre de cada agente">{$1}</mark>');
  if(q){
    const partes=s.split(/(<[^>]+>)/), nq=norm(q);
    s=partes.map(p=>{ if(p.startsWith('<')) return p;
      const np=norm(p); let out='',i=0,j;
      while((j=np.indexOf(nq,i))!==-1){out+=p.slice(i,j)+'<mark class="hl">'+p.slice(j,j+nq.length)+'</mark>';i=j+nq.length}
      return out+p.slice(i);}).join('');
  }
  return s;
}

function pintarLista(){
  const caja=$('#listaGuiones'); if(!caja) return;
  let lista=sel==='__todos'?P.guiones:guionesDe(sel);
  const total=lista.length;
  if(catFiltro==='__sin') lista=lista.filter(g=>!g.agentes.length);
  else if(catFiltro) lista=lista.filter(g=>g.categoria===catFiltro);
  const q=qGuion.trim(), nq=norm(q);
  if(nq) lista=lista.filter(g=>norm(g.titulo+' '+g.categoria+' '+g.bloques.map(b=>b.texto).join(' ')).includes(nq));
  lista=ordenarGuiones(lista);

  if(!total){
    caja.innerHTML=`<div class="vacio"><h3>${sel==='__todos'?'Todavía no hay guiones':'Este agente aún no tiene guiones'}</h3>
      Crea el primero con <b>+ Nuevo guion</b>. Puedes asignar un mismo guion a varios agentes a la vez.</div>`;
    return;
  }
  if(!lista.length){ caja.innerHTML=`<div class="vacio"><h3>Ningún guion coincide</h3>Prueba con otra palabra o quita el filtro de categoría.</div>`; return }

  let html='', catPrev=null;
  lista.forEach(g=>{
    if(g.categoria!==catPrev){ html+=`<h3 class="grupo-cat">${esc(g.categoria)}</h3>`; catPrev=g.categoria }
    const open=!!nq||abiertos.has(g.id);
    const canal=g.canal==='R'?'<span class="etq etq-r">Redes</span>':g.canal==='C'?'<span class="etq etq-c">Chat</span>':'';
    const sinAsig=!g.agentes.length?'<span class="etq etq-x">Sin asignar</span>':(sel==='__todos'?`<span class="etq">${plural(g.agentes.length,'agente','agentes')}</span>`:'');
    html+=`<article class="guion${open?' abierto':''}" data-id="${g.id}">
      <div class="tit">
        <button class="abrir" type="button" aria-expanded="${open}"><svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg><span>${formatear(g.titulo,q)}</span>${canal}${sinAsig}</button>
        <div class="herr">
          <button type="button" data-g="editar">Editar</button>
          <button type="button" data-g="duplicar">Duplicar</button>
          <button type="button" data-g="eliminar" class="rojo">Eliminar</button>
        </div>
      </div>
      ${open?cuerpo(g,q):''}
    </article>`;
  });
  caja.innerHTML=html;
}

function cuerpo(g,q){
  const bl=g.bloques.map(b=>({tipo:b.tipo,p:parrafos(b.texto)}));
  const nCli=bl.filter(b=>b.tipo!=='i').length;
  let idxCli=0;
  const quienes=g.agentes.map(agente).filter(Boolean).map(a=>visible(a.nombre));
  return `<div class="cuerpo">${bl.map((b,bi)=>{
    const esInt=b.tipo==='i'; if(!esInt) idxCli++;
    const radicar=esInt&&/^(ID\s*:|PQR\s*:|AGENTE)/i.test(b.p[0]||'');
    return `<div class="bloque${esInt?' bloque-int':''}" data-bi="${bi}">
      <div class="bloque-acc"><span>${esInt?(radicar?'🔒 Plantilla para radicar · no se envía al cliente':'🔒 Nota interna · no se envía al cliente'):(nCli>1?'Opción '+idxCli+' de '+nCli:'Toca un párrafo para copiarlo solo')}</span>
      <button class="btn copiar${esInt?' copiar-int':''}" type="button" data-accion="bloque">${esInt?(radicar?'Copiar plantilla':'Copiar nota'):'Copiar '+(nCli>1?'esta opción':'guion completo')}</button></div>
      ${b.p.map((p,pi)=>`<p class="p" data-pi="${pi}" tabindex="0" title="Clic para copiar este párrafo">${formatear(p,q)}</p>`).join('')}
    </div>`;}).join('')}
    <p class="asignados">${quienes.length?'Lo tienen ('+quienes.length+'): '+esc(quienes.join(', ')):'Sin asignar: no aparecerá en el HTML hasta que lo asignes a un agente.'}</p>
  </div>`;
}

/* ---------- Eventos de la vista ---------- */
$('#vista').addEventListener('input',e=>{
  if(e.target.id==='qGuion'){ qGuion=e.target.value; pintarLista() }
});
$('#vista').addEventListener('change',e=>{
  if(e.target.id==='catFiltro'){ catFiltro=e.target.value; pintarLista() }
});
$('#vista').addEventListener('click',e=>{
  if(e.target.closest('a')) return;
  const acc=e.target.closest('[data-acc]');
  if(acc){
    if(acc.dataset.acc==='nuevo') abrirEditor(null);
    else if(acc.dataset.acc==='editar-agente') abrirEditarAgente(sel);
    else if(acc.dataset.acc==='ver-como') vistaPrevia(sel);
    return;
  }
  const art=e.target.closest('.guion'); if(!art) return;
  const g=P.guiones.find(x=>x.id===art.dataset.id); if(!g) return;
  const herr=e.target.closest('[data-g]');
  if(herr){
    if(herr.dataset.g==='editar') abrirEditor(g.id);
    else if(herr.dataset.g==='duplicar') duplicarGuion(g);
    else eliminarGuion(g);
    return;
  }
  if(e.target.closest('.abrir')){
    const open=!art.classList.contains('abierto');
    open?abiertos.add(g.id):abiertos.delete(g.id);
    art.classList.toggle('abierto',open);
    art.querySelector('.abrir').setAttribute('aria-expanded',open);
    const c=art.querySelector('.cuerpo'); if(c) c.remove();
    if(open) art.insertAdjacentHTML('beforeend',cuerpo(g,qGuion.trim()));
    return;
  }
  const bl=e.target.closest('.bloque'); if(!bl) return;
  const ps=parrafos(g.bloques[+bl.dataset.bi].texto);
  if(e.target.closest('[data-accion="bloque"]')){ copiar(ps.join('\n\n'),[...bl.querySelectorAll('.p')],'Guion copiado'); return }
  const p=e.target.closest('.p'); if(p) copiar(ps[+p.dataset.pi],[p],'Párrafo copiado');
});
$('#vista').addEventListener('keydown',e=>{ if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('p')){ e.preventDefault(); e.target.click() } });

async function copiar(texto,els,msg){
  let ok=false;
  try{ await navigator.clipboard.writeText(texto); ok=true }catch(e){
    const t=document.createElement('textarea'); t.value=texto; t.style.position='fixed'; t.style.opacity='0'; document.body.appendChild(t); t.select();
    try{ ok=document.execCommand('copy') }catch(_){}
    t.remove();
  }
  aviso(ok?msg:'No se pudo copiar. Selecciona el texto y usa Ctrl+C.');
  if(ok) els.forEach(el=>{ el.classList.add('copiado'); setTimeout(()=>el.classList.remove('copiado'),900) });
}

/* ---------- Agentes ---------- */
function validarAgente(nombre,cedula,idActual){
  if(nombre.length<3 || !/\p{L}/u.test(nombre)) return 'Escribe el nombre completo del agente.';
  if(cedula && (cedula.length<5 || cedula.length>15)) return 'La cédula debe tener entre 5 y 15 dígitos.';
  const otro=cedula && P.agentes.find(a=>a.cedula===cedula && a.id!==idActual);
  if(otro) return 'Esa cédula ya pertenece a '+visible(otro.nombre)+'.';
  return '';
}
$('#formAgente').addEventListener('submit',e=>{
  e.preventDefault();
  const nombre=$('#agNombre').value.trim().replace(/\s+/g,' ');
  const cedula=soloDigitos($('#agCedula').value);
  let err=validarAgente(nombre,cedula,null);
  if(!err && !cedula) err='Escribe la cédula: es con lo que el agente entra a su biblioteca.';
  $('#agError').textContent=err; if(err) return;
  const a={id:uid(),nombre,cedula,corto:primerNombre(nombre),creado:new Date().toISOString()};
  P.agentes.push(a);
  $('#agNombre').value=''; $('#agCedula').value='';
  sel=a.id; qGuion=''; catFiltro=''; abiertos=new Set();
  guardar(); aviso('Agente agregado. Ahora créale sus guiones.',2600);
  $('#agNombre').focus();
});
['#agNombre','#agCedula'].forEach(s=>$(s).addEventListener('input',()=>$('#agError').textContent=''));

let editAgente=null, avisoHash=false;
function abrirEditarAgente(id){
  const a=agente(id); if(!a) return;
  editAgente=a.id; avisoHash=false;
  $('#eaNombre').value=a.nombre; $('#eaCedula').value=a.cedula; $('#eaCorto').value=a.corto||primerNombre(a.nombre);
  $('#eaError').textContent='';
  $('#dlgAgente').showModal();
  (a.cedula?$('#eaNombre'):$('#eaCedula')).focus();
}
['#eaNombre','#eaCedula','#eaCorto'].forEach(s=>$(s).addEventListener('input',()=>{ $('#eaError').textContent=''; avisoHash=false }));
$('#formEditarAgente').addEventListener('submit',async e=>{
  e.preventDefault();
  const a=agente(editAgente); if(!a) return;
  const nombre=$('#eaNombre').value.trim().replace(/\s+/g,' ');
  const cedula=soloDigitos($('#eaCedula').value);
  const corto=$('#eaCorto').value.trim()||primerNombre(nombre);
  let err=validarAgente(nombre,cedula,a.id);
  if(!err && !cedula) err='Escribe la cédula: es con lo que el agente entra a su biblioteca.';
  if(err){ $('#eaError').textContent=err; return }
  // Agentes importados: se compara con la cédula protegida de la biblioteca anterior
  if(a.hashAnterior && cedula!==a.cedula && !avisoHash){
    if(await sha256(a.saltAnterior+cedula)!==a.hashAnterior){
      avisoHash=true;
      $('#eaError').textContent='Esta cédula no coincide con la que tenía en la biblioteca anterior. Revísala; si es correcta, pulsa Guardar otra vez.';
      return;
    }
  }
  Object.assign(a,{nombre,cedula,corto});
  $('#dlgAgente').close(); guardar(); aviso('Agente actualizado');
});
$('#eaEliminar').addEventListener('click',()=>{
  const a=agente(editAgente); if(!a) return;
  $('#dlgAgente').close();
  const suyos=guionesDe(a.id), exclusivos=suyos.filter(g=>g.agentes.length===1);
  const quitar=borrarExclusivos=>{
    P.guiones.forEach(g=>{ g.agentes=g.agentes.filter(x=>x!==a.id) });
    if(borrarExclusivos) P.guiones=P.guiones.filter(g=>!exclusivos.includes(g));
    P.agentes=P.agentes.filter(x=>x!==a); sel=null;
    guardar(); aviso('Agente eliminado');
  };
  const nom=esc(visible(a.nombre));
  if(!exclusivos.length){
    confirmar('Eliminar agente',`¿Eliminar a <b>${nom}</b>? Dejará de poder entrar en el próximo HTML que generes.`,
      [{texto:'Eliminar agente',clase:'btn-peligro',accion:()=>quitar(false)}]);
  }else{
    confirmar('Eliminar agente',`<b>${nom}</b> tiene ${plural(exclusivos.length,'guion que solo es suyo','guiones que solo son suyos')}. ¿Qué hacemos con ${exclusivos.length===1?'él':'ellos'}?`,
      [{texto:'Conservarlos sin asignar',clase:'btn-sec',accion:()=>quitar(false)},
       {texto:'Eliminarlos también',clase:'btn-peligro',accion:()=>quitar(true)}]);
  }
});

/* ---------- Editor de guion ---------- */
let editando=null, bloquesEd=[];
function abrirEditor(id){
  const g=id?P.guiones.find(x=>x.id===id):null;
  editando=g?g.id:null;
  $('#dlgGuionTitulo').textContent=g?'Editar guion':'Nuevo guion';
  $('#gTitulo').value=g?g.titulo:'';
  $('#gCategoria').value=g?g.categoria:(catFiltro&&catFiltro!=='__sin'?catFiltro:'');
  document.querySelector(`input[name="gCanal"][value="${g?g.canal:'A'}"]`).checked=true;
  bloquesEd=g?g.bloques.map(b=>({tipo:b.tipo,texto:b.texto})):[{tipo:'c',texto:''}];
  $('#listaCategorias').innerHTML=P.categorias.map(c=>`<option value="${esc(c)}">`).join('');
  const marcados=new Set(g?g.agentes:(sel&&sel!=='__todos'?[sel]:[]));
  $('#gAgentes').innerHTML=P.agentes.length
    ? ordenados().map(a=>`<label><input type="checkbox" value="${a.id}"${marcados.has(a.id)?' checked':''}><span>${esc(visible(a.nombre))}${a.cedula?'':' · sin cédula'}</span></label>`).join('')
    : '<span class="nada">Aún no hay agentes. El guion quedará sin asignar hasta que agregues uno.</span>';
  sincronizarTodos();
  $('#gError').textContent='';
  pintarBloques();
  $('#dlgGuion').showModal();
  $('#gTitulo').focus();
}
function pintarBloques(){
  const nCli=bloquesEd.filter(b=>b.tipo!=='i').length; let k=0;
  $('#gBloques').innerHTML=bloquesEd.map((b,i)=>{
    const esInt=b.tipo==='i'; if(!esInt) k++;
    const nombre=esInt?'Nota interna':(nCli>1?'Opción '+k:'Mensaje al cliente');
    return `<div class="ed-bloque${esInt?' int':''}" data-i="${i}">
      <div class="ed-cab"><b>${nombre}</b>
        <select data-tipo aria-label="Tipo de bloque"><option value="c"${esInt?'':' selected'}>Para el cliente</option><option value="i"${esInt?' selected':''}>Nota interna (no se envía)</option></select>
        <span class="espacio"></span>
        <button type="button" data-mover="-1" aria-label="Subir"${i===0?' disabled':''}>↑</button>
        <button type="button" data-mover="1" aria-label="Bajar"${i===bloquesEd.length-1?' disabled':''}>↓</button>
        <button type="button" data-quitar${bloquesEd.length===1?' disabled':''}>Quitar</button>
      </div>
      <textarea data-texto rows="${Math.min(14,Math.max(5,b.texto.split('\n').length+1))}" placeholder="${esInt?'Indicaciones para el agente: qué revisar, a dónde escalar…':'Hola, {nombre} te saluda…\n\nEscribe aquí el texto. Deja una línea en blanco entre párrafos.'}">${esc(b.texto)}</textarea>
    </div>`;
  }).join('');
}
$('#gBloques').addEventListener('input',e=>{
  const caja=e.target.closest('.ed-bloque'); if(!caja) return;
  if(e.target.matches('[data-texto]')) bloquesEd[+caja.dataset.i].texto=e.target.value;
});
$('#gBloques').addEventListener('change',e=>{
  const caja=e.target.closest('.ed-bloque'); if(!caja) return;
  if(e.target.matches('[data-tipo]')){ bloquesEd[+caja.dataset.i].tipo=e.target.value; pintarBloques() }
});
$('#gBloques').addEventListener('click',e=>{
  const caja=e.target.closest('.ed-bloque'); if(!caja) return;
  const i=+caja.dataset.i;
  const mv=e.target.closest('[data-mover]');
  if(mv){ const j=i+(+mv.dataset.mover); [bloquesEd[i],bloquesEd[j]]=[bloquesEd[j],bloquesEd[i]]; pintarBloques(); return }
  if(e.target.closest('[data-quitar]')){ bloquesEd.splice(i,1); pintarBloques() }
});
document.querySelectorAll('[data-agregar]').forEach(b=>b.addEventListener('click',()=>{
  bloquesEd.push({tipo:b.dataset.agregar,texto:''}); pintarBloques();
  const ts=$('#gBloques').querySelectorAll('textarea'); ts[ts.length-1].focus();
}));
function sincronizarTodos(){
  const cs=[...$('#gAgentes').querySelectorAll('input')], n=cs.filter(c=>c.checked).length;
  const t=$('#gTodos'); t.disabled=!cs.length; t.checked=cs.length>0&&n===cs.length; t.indeterminate=n>0&&n<cs.length;
}
$('#gAgentes').addEventListener('change',sincronizarTodos);
$('#gTodos').addEventListener('change',e=>{ $('#gAgentes').querySelectorAll('input').forEach(c=>c.checked=e.target.checked); sincronizarTodos() });

$('#formGuion').addEventListener('submit',e=>{
  e.preventDefault();
  const titulo=$('#gTitulo').value.trim();
  const categoria=$('#gCategoria').value.trim().replace(/\s+/g,' ');
  const canal=document.querySelector('input[name="gCanal"]:checked').value;
  const bloques=bloquesEd.map(b=>({tipo:b.tipo,texto:b.texto.replace(/\r/g,'').trim()})).filter(b=>parrafos(b.texto).length);
  const agentes=[...$('#gAgentes').querySelectorAll('input:checked')].map(c=>c.value);
  let err='';
  if(!titulo) err='Escribe el título del guion.';
  else if(!categoria) err='Escribe o elige una categoría.';
  else if(!bloques.length) err='Escribe el contenido del guion.';
  else if(!bloques.some(b=>b.tipo!=='i')) err='Agrega al menos un bloque para el cliente; las notas internas no se envían.';
  $('#gError').textContent=err; if(err) return;
  asegurarCategoria(categoria);
  const ahora=new Date().toISOString();
  let g=editando&&P.guiones.find(x=>x.id===editando);
  if(g) Object.assign(g,{titulo,categoria,canal,bloques,agentes,actualizado:ahora});
  else{ g={id:uid(),titulo,categoria,canal,bloques,agentes,creado:ahora,actualizado:ahora}; P.guiones.push(g) }
  abiertos.add(g.id);
  $('#dlgGuion').close(); guardar();
  aviso(agentes.length?'Guion guardado · '+plural(agentes.length,'agente','agentes'):'Guion guardado sin asignar',2200);
});

function duplicarGuion(g){
  const copia=JSON.parse(JSON.stringify(g));
  Object.assign(copia,{id:uid(),titulo:g.titulo+' (copia)',creado:new Date().toISOString(),actualizado:new Date().toISOString()});
  P.guiones.splice(P.guiones.indexOf(g)+1,0,copia);
  guardar(); abrirEditor(copia.id);
}
function eliminarGuion(g){
  const tit=esc(g.titulo);
  const borrar=()=>{ P.guiones=P.guiones.filter(x=>x!==g); guardar(); aviso('Guion eliminado') };
  if(sel!=='__todos' && g.agentes.length>1){
    const a=agente(sel);
    confirmar('Eliminar guion',`<b>${tit}</b> lo tienen ${g.agentes.length} agentes. ¿Lo quitas solo a ${esc(visible(a.nombre))} o lo eliminas para todos?`,
      [{texto:'Quitar solo a '+(a.corto||primerNombre(a.nombre)),clase:'btn-sec',accion:()=>{ g.agentes=g.agentes.filter(x=>x!==sel); guardar(); aviso('Guion quitado a este agente') }},
       {texto:'Eliminar para todos',clase:'btn-peligro',accion:borrar}]);
  }else{
    confirmar('Eliminar guion',`¿Eliminar <b>${tit}</b>${g.agentes.length>1?' para los '+g.agentes.length+' agentes que lo tienen':''}? No se puede deshacer.`,
      [{texto:'Eliminar guion',clase:'btn-peligro',accion:borrar}]);
  }
}

/* ---------- Generar HTML ---------- */
async function armarDatos(previaId){
  const incluidos=P.agentes.filter(a=>a.cedula);
  const ids=new Set(incluidos.map(a=>a.id));
  const usados=ordenarGuiones(P.guiones.filter(g=>g.agentes.some(id=>ids.has(id))));
  const idx=new Map(usados.map((g,i)=>[g.id,i]));
  const gs=usados.map(g=>({i:g.id,t:g.titulo,c:g.categoria,n:g.canal,
    b:g.bloques.map(b=>parrafos(b.texto)),bt:g.bloques.map(b=>b.tipo==='i'?'i':'c')}));
  const as=[];
  for(const a of incluidos){
    as.push({h:await sha256(P.salt+a.cedula),n:visible(a.nombre),s:a.corto||primerNombre(a.nombre),
      g:usados.filter(g=>g.agentes.includes(a.id)).map(g=>idx.get(g.id))});
  }
  const cats=[...new Set(gs.map(g=>g.c))];
  const datos={v:fechaLarga(new Date()),marca:P.marca||'Contact Center',salt:P.salt,cats,gs,as};
  if(previaId){ const a=agente(previaId); if(a&&a.cedula) datos.pv=await sha256(P.salt+a.cedula) }
  return {datos,incluidos,usados};
}
function descargar(nombre,contenido,tipo){
  const url=URL.createObjectURL(new Blob([contenido],{type:tipo}));
  const a=document.createElement('a'); a.href=url; a.download=nombre; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),5000);
}
$('#btnGenerar').addEventListener('click',async()=>{
  const sinCed=P.agentes.filter(a=>!a.cedula);
  if(!P.agentes.length || sinCed.length===P.agentes.length){
    confirmar('Aún no se puede generar',P.agentes.length?'Ningún agente tiene cédula. Agrégala para que puedan entrar.':'Primero agrega al menos un agente con su cédula y créale guiones.',[]);
    return;
  }
  const {datos,incluidos,usados}=await armarDatos(null);
  descargar('biblioteca_guiones.html',construirVisorHTML(datos),'text/html;charset=utf-8');
  P.generado=new Date().toISOString(); guardar(false);
  const vacios=incluidos.filter(a=>!guionesDe(a.id).length);
  let html=`Se descargó <b>biblioteca_guiones.html</b>, versión del ${esc(datos.v)}, con ${plural(incluidos.length,'agente','agentes')} y ${plural(usados.length,'guion','guiones')}.</p>
    <p>Envíaselo a tus agentes y pídeles que <b>cierren el HTML anterior</b> y abran este. Cada uno entra con su cédula y en la parte de arriba verá la fecha de la versión.`;
  const notas=[];
  if(sinCed.length) notas.push(`No se incluyeron por no tener cédula: ${esc(sinCed.map(a=>visible(a.nombre)).join(', '))}.`);
  if(vacios.length) notas.push(`Entran pero aún no tienen guiones: ${esc(vacios.map(a=>visible(a.nombre)).join(', '))}.`);
  if(notas.length) html+=`</p><ul class="cf-lista">${notas.map(n=>'<li>'+n+'</li>').join('')}</ul><p>`;
  const pendiente=P.modificado && (!P.respaldo || P.modificado>P.respaldo);
  confirmar('Biblioteca generada',html,pendiente?[{texto:'Descargar respaldo también',clase:'btn-principal',accion:descargarRespaldo}]:[]);
  $('#cfBotones').lastChild.textContent='Listo';
});

async function vistaPrevia(agenteId){
  const {datos}=await armarDatos(agenteId);
  if(!datos.as.length && !agenteId){ aviso('Agrega al menos un agente con cédula para ver la vista previa.',2600); return }
  const url=URL.createObjectURL(new Blob([construirVisorHTML(datos)],{type:'text/html;charset=utf-8'}));
  const w=window.open(url,'_blank');
  if(!w) aviso('El navegador bloqueó la ventana. Permite ventanas emergentes para esta página.',3500);
  setTimeout(()=>URL.revokeObjectURL(url),60000);
}
$('#btnVista').addEventListener('click',()=>vistaPrevia(sel&&sel!=='__todos'?sel:null));

/* ---------- Respaldo, importación y ajustes ---------- */
function descargarRespaldo(){
  const d=new Date(), f=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  P.respaldo=d.toISOString();
  descargar('respaldo_biblioteca_'+f+'.json',JSON.stringify(P,null,1),'application/json');
  guardar(false); aviso('Respaldo descargado. Guárdalo en un lugar seguro: contiene las cédulas.',3200);
}
const menu=$('#menu');
document.addEventListener('click',e=>{
  if(menu.open && !menu.contains(e.target)) menu.open=false;
  const m=e.target.closest('[data-menu]'); if(!m) return;
  menu.open=false;
  const acc=m.dataset.menu;
  if(acc==='respaldo') descargarRespaldo();
  else if(acc==='restaurar') $('#fileRespaldo').click();
  else if(acc==='anterior') $('#fileAnterior').click();
  else if(acc==='ajustes'){ $('#ajMarca').value=P.marca||''; $('#dlgAjustes').showModal() }
});
$('#formAjustes').addEventListener('submit',e=>{
  e.preventDefault(); P.marca=$('#ajMarca').value.trim()||'Contact Center';
  $('#dlgAjustes').close(); guardar(); aviso('Guardado. Se verá en el próximo HTML.');
});

function leerArchivo(input,fn){
  input.addEventListener('change',()=>{
    const f=input.files[0]; input.value=''; if(!f) return;
    const r=new FileReader(); r.onload=()=>fn(String(r.result),f.name); r.onerror=()=>aviso('No se pudo leer el archivo.');
    r.readAsText(f,'utf-8');
  });
}
leerArchivo($('#fileRespaldo'),texto=>{
  let p; try{ p=JSON.parse(texto) }catch(e){ p=null }
  if(!esProyecto(p)){ confirmar('Archivo no válido','Ese archivo no es un respaldo de este generador.',[]); return }
  const cuando=p.respaldo?' del '+esc(fechaCorta(p.respaldo)):'';
  const hay=P.agentes.length||P.guiones.length;
  const aplicar=()=>{ P=completar(p); sel=null; abiertos=new Set(); guardar(false); aviso('Respaldo restaurado') };
  if(!hay){ aplicar(); return }
  confirmar('Restaurar respaldo',`El respaldo${cuando} tiene ${plural(p.agentes.length,'agente','agentes')} y ${plural(p.guiones.length,'guion','guiones')}. <b>Reemplazará todo lo que tienes ahora</b> (${plural(P.agentes.length,'agente','agentes')} y ${plural(P.guiones.length,'guion','guiones')}).`,
    [{texto:'Reemplazar con el respaldo',clase:'btn-peligro',accion:aplicar}]);
});

// Lee el "const DATA = {...};" de la biblioteca anterior (la versión hecha a mano)
leerArchivo($('#fileAnterior'),texto=>{
  let D=null;
  const i=texto.indexOf('const DATA = ');
  if(i>=0){
    const fin=texto.indexOf('\n',i), linea=texto.slice(i,fin<0?undefined:fin);
    try{ D=JSON.parse(linea.slice(linea.indexOf('{'),linea.lastIndexOf('}')+1)) }catch(e){ D=null }
  }
  if(!D || !Array.isArray(D.asesores)){ confirmar('Archivo no reconocido','No se encontraron datos de una biblioteca anterior en ese archivo.',[]); return }
  const propios=D.asesores.reduce((n,a)=>n+(a.guiones||[]).length,0);
  const generales=(D.refx||[]).length;
  const texto1=`Se encontraron <b>${plural(D.asesores.length,'agente','agentes')}</b> con ${plural(propios,'guion propio','guiones propios')}${generales?` y <b>${plural(generales,'guion general','guiones generales')}</b> del equipo`:''}.</p>
    <p>Las cédulas del archivo anterior están protegidas y no se pueden leer: después de importar, abre cada agente con <b>Editar agente</b> y escribe su cédula. El generador te avisará si no coincide con la anterior.`
    +(generales?`</p><p>¿Qué hacemos con los guiones generales del equipo?`:'');
  const botones=generales
    ? [{texto:'Importar sin los generales',clase:'btn-sec',accion:()=>importarAnterior(D,false)},
       {texto:'Importar y dar los generales a todos',clase:'btn-principal',accion:()=>importarAnterior(D,true)}]
    : [{texto:'Importar',clase:'btn-principal',accion:()=>importarAnterior(D,false)}];
  confirmar('Importar biblioteca anterior',texto1,botones);
});
function importarAnterior(D,conGenerales){
  (D.cats||[]).forEach(asegurarCategoria);
  const nuevosAg=[], porClave=new Map();
  const claveG=g=>[g.c,g.t,g.n||'A',JSON.stringify(g.b),JSON.stringify(g.bt||[])].join('|');
  const ahora=new Date().toISOString();
  const agregarGuion=(g,agIds)=>{
    const k=claveG(g);
    let x=porClave.get(k);
    if(!x){
      x={id:uid(),titulo:g.t,categoria:g.c||'General',canal:['A','C','R'].includes(g.n)?g.n:'A',
        bloques:(g.b||[]).map((bl,bi)=>({tipo:(g.bt||[])[bi]==='i'?'i':'c',texto:bl.join('\n\n')})),
        agentes:[],creado:ahora,actualizado:ahora};
      asegurarCategoria(x.categoria); porClave.set(k,x); P.guiones.push(x);
    }
    agIds.forEach(id=>{ if(!x.agentes.includes(id)) x.agentes.push(id) });
  };
  D.asesores.forEach(o=>{
    let a=P.agentes.find(x=>norm(x.nombre)===norm(o.n));
    if(!a){
      a={id:uid(),nombre:visible(o.n),cedula:'',corto:o.s||primerNombre(o.n),hashAnterior:o.h,saltAnterior:D.salt,creado:ahora};
      P.agentes.push(a); nuevosAg.push(a);
    }
    (o.guiones||[]).forEach(g=>agregarGuion(g,[a.id]));
  });
  if(conGenerales){
    const todos=D.asesores.map(o=>P.agentes.find(x=>norm(x.nombre)===norm(o.n))).filter(Boolean).map(a=>a.id);
    (D.refx||[]).forEach(g=>agregarGuion(g,todos));
  }else (D.refx||[]).forEach(g=>agregarGuion(g,[]));
  sel=nuevosAg[0]?nuevosAg[0].id:sel; abiertos=new Set();
  guardar();
  confirmar('Importación lista',`Se agregaron ${plural(nuevosAg.length,'agente','agentes')} y ${plural(porClave.size,'guion','guiones')}. Ahora escribe la cédula de cada agente marcado como <b>sin cédula</b> en la lista de la izquierda, y descarga un respaldo.`,
    [{texto:'Descargar respaldo',clase:'btn-principal',accion:descargarRespaldo}]);
  $('#cfBotones').lastChild.textContent='Cerrar';
}

/* ---------- Inicio ---------- */
window.addEventListener('storage',e=>{ if(e.key===CLAVE){ P=cargar(); pintar() } });
pintar();
