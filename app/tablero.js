/* Doña Cecilia — tablero de madres (pedido de Tomás el 28/10/2026, idea sacada de HorseBook y Polo HQ).
   En Madres y partos, cada preñada tiene una barra con los días de preñez y la VENTANA de parto marcada
   (entre el día 320 y el 360 desde el servicio), con la fecha más probable y una rayita roja en el día de hoy.
   El cartelito de la tarjeta avisa cuándo entra en la ventana. */
const VENTANA=[320,360],ESCALA=365;
function ventanaParto(s){
  if(s.fecha)return{desde:addDays(s.fecha,VENTANA[0]),hasta:addDays(s.fecha,VENTANA[1]),prob:s.fpp||addDays(s.fecha,GEST),dia:diff(hoy(),s.fecha)};
  if(s.fpp)return{desde:addDays(s.fpp,-10),hasta:addDays(s.fpp,30),prob:s.fpp,dia:GEST-diff(s.fpp,hoy())};
  return null}
{const er0=estadoRepro;estadoRepro=function(s){const st=er0(s);
  if(st&&st.k==='pre'&&s){const v=ventanaParto(s);if(v){st.v=v;
    const a=diff(v.desde,hoy());
    if(st.d===null||st.d>=0){ // si ya pasó la fecha probable, queda el "Pasó X d" de siempre
      if(a<=0){st.cuenta=diff(v.hasta,hoy())<0?'Pasó la ventana':'En ventana de parto';st.cpill='p-bad'}
      else if(a<=30){st.cuenta=`Entra en ventana en ${a} d`;st.cpill='p-warn'}}}}
  return st}}
barraGest=function(st){if(st.k!=='pre'||!st.v)return '';const v=st.v,pc=d=>Math.max(0,Math.min(100,d/ESCALA*100)).toFixed(1);
  const dia=Math.max(0,v.dia),corto=f=>fmt(f).slice(0,5);
  return `<div class="tg" title="${dia} días de preñez"><div class="tg-ven" style="left:${pc(VENTANA[0])}%;width:${(pc(VENTANA[1])-pc(VENTANA[0])).toFixed(1)}%"></div>
    <div class="tg-fill" style="width:${pc(dia)}%"></div><div class="tg-prob" style="left:${pc(VENTANA[0]+diff(v.prob,v.desde))}%"></div><div class="tg-hoy" style="left:${pc(dia)}%"></div></div>
    <div class="sub"><b>Día ${dia}</b> de preñez · ventana de parto <b>${corto(v.desde)} → ${corto(v.hasta)}</b> · más probable ${corto(v.prob)}</div>`};
/* Referencia de colores arriba de las tarjetas */
{const vm0=vMadres;vMadres=function(){const h=vm0();if(!h.includes('class="tg"'))return h;
  return h.replace('<div class="mcards">',`<div class="tg-ley"><span><i style="background:var(--campo)"></i>Preñez</span><span><i class="tg-ray"></i>Ventana de parto (día ${VENTANA[0]}–${VENTANA[1]})</span><span><i style="background:var(--bad)"></i>Hoy</span></div><div class="mcards">`)}}
{const st=document.createElement('style');st.textContent=`
.tg{position:relative;height:14px;margin:10px 0 6px;background:var(--surface);border:1px solid var(--line);border-radius:8px}
.tg-fill{position:absolute;left:0;top:0;bottom:0;background:var(--campo);opacity:.85;border-radius:7px 0 0 7px}
.tg-ven,.tg-ray{background:repeating-linear-gradient(45deg,#F3D27A,#F3D27A 4px,#F7E3A8 4px,#F7E3A8 8px)}
.tg-ven{position:absolute;top:-3px;bottom:-3px;border-radius:4px}
.tg-prob{position:absolute;top:-3px;width:2px;height:20px;margin-left:-1px;background:#5A4300}
.tg-hoy{position:absolute;top:-6px;width:4px;height:26px;margin-left:-2px;background:var(--bad);border-radius:2px}
.tg-ley{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:12px;color:var(--muted);margin:0 0 10px}
.tg-ley i{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-2px;margin-right:4px}`;document.head.appendChild(st)}
