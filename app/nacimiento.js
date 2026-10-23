/* Doña Cecilia — "Cargar nacimiento" (pedido de Tomás el 16/10/2026).
   Un formulario corto, solo con lo del nacimiento: nombre, fecha, sexo, pelaje, padre, madre, RP, chip,
   si nació vivo o muerto y señas. El padre y la madre vienen del servicio y los abuelos se completan solos.
   Al guardar: se da de alta el potrillo (o queda como muerto en su camada), el servicio pasa a "Parida"
   con el potrillo enlazado, y queda la parición en el historial de la madre. */
function formNacimiento(s,madreNombre){
  const madre=s?s.madre:madreNombre,m=findByName(madre),hoyD=hoy();
  form('Nacimiento · '+madre,[
    {k:'nombre',l:'Nombre del potrillo',v:'DC ('+norm(madre)+') ',req:1,full:1},
    {k:'nac',l:'Fecha de nacimiento',type:'date',v:hoyD,req:1},
    {k:'sexo',l:'Sexo',type:'select',opts:['Elegí…','Macho','Hembra'],v:'Elegí…'},
    {k:'pelaje',l:'Pelaje',v:''},
    {k:'padre',l:'Padre',v:s?.padrillo||'',list:'dl-pad'},
    {k:'madre',l:'Madre',v:madre||'',list:'dl-hembras',req:1},
    {k:'rp',l:'RP'},{k:'chip',l:'N° chip'},
    {k:'como',l:'¿Cómo nació?',type:'select',opts:['Vivo','Nació muerto'],v:'Vivo'},
    {k:'obs',l:'Señas / observaciones (ej: cara blanca, pata blanca)',type:'area'}],
   async v=>{
     if(v.sexo==='Elegí…'){toast('Elegí el sexo del potrillo');const b=$('#f button[type=submit]');if(b)b.disabled=false;return}
     const nombre=v.nombre.toUpperCase().replace(/\s+/g,' ').trim(),muerto=v.como==='Nació muerto';
     if(S.caballos.some(c=>norm(c.nombre)===norm(nombre))){toast('Ya hay un caballo con ese nombre');const b=$('#f button[type=submit]');if(b)b.disabled=false;return}
     const gp=padresDe(v.padre)||{},gm=padresDe(v.madre)||{};
     const camada=s&&+s.temporada?+s.temporada:+v.nac.slice(0,4);
     const id=slugId('c');
     const cria={nombre,categoria:'Potrillos',nac:v.nac,camada,sexo:v.sexo,pelaje:v.pelaje,padre:v.padre,madre:v.madre,
       abueloP:gp.padre||'',abuelaP:gp.madre||'',abueloM:gm.padre||'',abuelaM:gm.madre||'',rp:v.rp,chip:v.chip,obs:v.obs,
       lugar:m?.lugar||'Doña Cecilia',fotos:[],estado:muerto?'Muerto':'Activo',
       ...(muerto?{bajaFecha:v.nac,bajaObs:'Nació muerto'+(v.obs?'. '+v.obs:''),catPrevia:'Potrillos'}:{})};
     await db.collection('caballos').doc(id).set(cria);
     if(s)await db.collection('servicios').doc(s.id).update({estado:'Parida',criaId:id,
       obs:[s.obs,'Parió '+fmt(v.nac)+': '+nombre+(muerto?' (nació muerto)':'')].filter(Boolean).join(' · ')});
     if(m)await db.collection('eventos').doc(slugId('e')).set({fecha:v.nac,caballoId:m.id,caballo:m.nombre,tipo:'Parición',
       detalle:'Parición: '+v.sexo.toLowerCase()+(v.pelaje?' '+v.pelaje.toLowerCase():'')+' · '+nombre+(muerto?' (nació muerto)':''),obs:'',por:uid||''});
     if(muerto)await db.collection('eventos').doc(slugId('e')).set({fecha:v.nac,caballoId:id,caballo:nombre,tipo:'Otro',detalle:'Baja: Muerto (nació muerto)',obs:'Madre '+v.madre,por:uid||''});
     toast(muerto?nombre+' quedó registrado en la camada '+camada:nombre+' dado de alta');
     UI.ficha=id;renderFicha()},
   datalists());
  conectarGenealogia();
  const nm=document.getElementById('f-nombre');if(nm){nm.focus();nm.setSelectionRange(nm.value.length,nm.value.length)}}

/* Todos los caminos al nacimiento usan este formulario */
partoForm=s=>formNacimiento(s);
EXTRA_ACTS.nacimiento=d=>{const s=d.s&&S.servicios.find(x=>x.id===d.s);formNacimiento(s||null,d.m)};

/* La cría de un servicio parido (enlazada al cargar el nacimiento, o buscada por madre y camada) */
function criaDeServicio(s){if(s.criaId)return byId(s.criaId);
  return S.caballos.find(c=>norm(c.madre)===norm(s.madre)&&+c.camada===+s.temporada)||null}

/* Al dar de alta un caballo, la app pedía abrir su ficha un instante antes de tenerlo en memoria,
   no lo encontraba y cerraba la pantalla. Ahora espera (hasta 2 segundos) y la abre. */
{const rf0=renderFicha;let intentos=0;
  renderFicha=function(){
    if(UI.ficha&&!byId(UI.ficha)&&intentos<20){intentos++;const id=UI.ficha;setTimeout(()=>{if(UI.ficha===id)renderFicha()},100);return}
    intentos=0;return rf0.apply(this,arguments)}}
