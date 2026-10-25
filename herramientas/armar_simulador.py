import json,base64,re,sys
APP='/home/user/CL/app'; S=sys.argv[1]
rd=lambda f:open(f'{APP}/{f}',encoding='utf-8').read()
b64=lambda p,t:f'data:{t};base64,'+base64.b64encode(open(p,'rb').read()).decode()
html=rd('index.html')
# sacar la estructura de documento y los íconos (la página los pone sola)
html=re.sub(r'<!doctype[^>]*>|</?html[^>]*>|</?head>|</?body>','',html,flags=re.I)
html=re.sub(r'<link rel="(manifest|apple-touch-icon|icon)"[^>]*>','',html)
html=re.sub(r'<meta name="(theme-color|apple-mobile[^"]*|mobile-web[^"]*)"[^>]*>','',html)
html=re.sub(r'<title>[^<]*</title>','',html)
# datos de prueba: la app como queda el 29
rows=json.load(open(f'{S}/app29.json'));D={}
for r in rows:
  d=dict(r['data'])
  if r['coleccion']=='caballos':
    d['fotos']={'DC S/N BAYA 26':['fb'],'DC S/N COLORADA POTRA 26':['fc']}.get(d['nombre'],[])
  D.setdefault(r['coleccion'],{})[r['id']]=d
blobs={'c067518b1364657d0cbe25a5f091243a':b64(f'{APP}/logo.jpg','image/jpeg'),'fb':b64(f'{S}/demo/fb.jpg','image/jpeg'),'fc':b64(f'{S}/demo/fc.jpg','image/jpeg')}
nube=rd('nube.js')
for a,b in [("let D=leer(LS_DATOS)||{};","let D=leer(LS_DATOS)||JSON.parse(JSON.stringify(window.DC_DEMO||{}));"),
            ("let yo=leer(LS_YO);","let yo=leer(LS_YO)||{id:'prueba',email:'prueba@donacecilia',nombre:'Prueba'};"),
            ("'serviceWorker' in navigator&&","false&&"),
            ("window.claude={use:","window.DCAPP={use:")]:
  assert a in nube,a; nube=nube.replace(a,b)
stub="const nunca=()=>new Promise(()=>{});const px=()=>new Proxy(function(){},{get:(t,k)=>k==='then'?undefined:px(),apply:()=>px()});window.supabase={createClient:()=>({auth:{getSession:nunca,signOut:nunca,signInWithPassword:nunca},from:()=>px(),rpc:nunca,storage:{from:()=>px()}})};"
demo=("window.DC_DEMO="+json.dumps(D,ensure_ascii=False)+";window.DC_NUBE_LISTA=true;"
  "window.confirm=function(m){try{setTimeout(function(){window.toast&&toast('En la app real acá te pregunta: '+String(m).slice(0,60))},50)}catch(e){}return true};"
  "window.alert=function(){};window.prompt=function(m,v){return v||null};")
scripts={'config.js':"window.DC_CONFIG={url:'https://prueba.invalid',anonKey:'prueba'};",'supabase.js':stub,'nube.js':nube}
def inl(m):
  f=m.group(1)
  js=scripts.get(f) or rd(f)
  return '<script>'+js+'</script>'
html=re.sub(r'<script src="([^"]+)"></script>',inl,html)
html=html.replace('claude.use(','DCAPP.use(')
html=re.sub(r'<script>window\.DC_BLOBS=.*?</script>','<script>window.DC_BLOBS='+json.dumps(blobs)+';'+demo+'</script>',html,count=1,flags=re.S)
# Excel adentro (la app lo carga aparte)
banner='''<style>#dc-estado{display:none!important}
#prueba{position:fixed;left:0;right:0;bottom:0;z-index:99;display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;
 padding:8px 12px calc(8px + env(safe-area-inset-bottom,0px));background:#B8860B;color:#fff;font:600 13px/1.3 Inter,system-ui,sans-serif;text-align:center}
#prueba button{font:700 12px Inter,system-ui,sans-serif;border:1.5px solid #fff;background:transparent;color:#fff;border-radius:8px;padding:5px 10px;cursor:pointer}
body{padding-bottom:56px}</style>
<div id="prueba"><span>MODO PRUEBA · lo que cargues acá no llega a la app real</span><button type="button" id="prueba-reset">Empezar de nuevo</button></div>
<script>document.getElementById('prueba-reset').onclick=function(){try{for(const k of Object.keys(localStorage))if(/^dc/.test(k))localStorage.removeItem(k)}catch(e){}location.reload()}</script>'''
html='<title>Simulador Doña Cecilia</title>\n'+html+banner+'<script>'+rd('xlsx.mini.min.js')+'</script>'
open(f'{S}/demo/simulador.html','w',encoding='utf-8').write(html)
print(len(html)//1024,'KB')
