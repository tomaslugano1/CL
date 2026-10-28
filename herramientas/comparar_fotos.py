# Compara dos fotos de foto_app.cjs. Uso: python3 herramientas/comparar_fotos.py antes.json despues.json
import json,sys
a=json.load(open(sys.argv[1]));b=json.load(open(sys.argv[2]));n=0
for sec in ['out','asis']:
  ks=set(a[sec])|set(b[sec])
  for k in sorted(ks):
    x,y=str(a[sec].get(k,"<FALTA>")),str(b[sec].get(k,"<FALTA>"))
    if x!=y:
      n+=1
      if n<=15:
        i=0
        while i<min(len(x),len(y)) and x[i]==y[i]:i+=1
        print(sec,k,'\n   A:',repr(x[max(0,i-100):i+100]),'\n   B:',repr(y[max(0,i-100):i+100]))
print('DIFERENCIAS',n,'de',len(a['out'])+len(a['asis']),'| errs',a['errs'],b['errs'])
