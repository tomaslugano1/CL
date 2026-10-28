/* Doña Cecilia — biblioteca de genealogías conocidas.
   Pedigríes de padrillos y sus ancestros, sacados de la app Polo Argentino y del catálogo de
   padrillos 2023 de Genética Santa Agueda (capturas que mandó Tomás el 16/10/2026).
   Cada caballo guarda solo su padre y su madre: con eso la app arma el árbol hasta donde haya datos.
   - Al escribir el Padre o la Madre de un caballo, la app sugiere estos nombres y completa los abuelos;
     los bisabuelos salen solos en el Pedigree.
   - Lo que se cargue en la app (fichas y Padrillos) tiene prioridad sobre esta lista.
   Para sumar un caballo: agregar una línea NOMBRE:[padre, madre, nacimiento, sexo, pelaje, criador]. */
const PEDIGRIS={
  // ---- Padrillos de Doña Cecilia ----
  'IRENITA PORRON':['LOSMACHITOS LIBANO','IRENITA CERVEZA','2020-02-23','Macho','Zaino','La Irenita S.A.'],
  'MACHITOS MERCENARIO':['OPEN ESPACIAL','MACHITOS MECHERA','2009-02-19','Macho','Alazán','Los Machitos S.R.L.'],
  'ESPI PULPERO':['MECHA UNIMOG','ESPI PULPERA','2016-11-25','Macho','Alazán','Genética Santa Agueda S.R.L.'],
  'ESPI EXPLOSIVO':['VAN DUCATI','ESPI EXPLOSIVA','','Macho','Zaino colorado','Genética Santa Agueda'],
  'DOLFINA HULK':['LUHUK','HAZEL','2013-01-13','Macho','Alazán','La Dolfina S.A.'],
  'DON URBANO MEREQUETENGE':['RENGO LUISITO','CUMBIA II','','Macho','Zaino oscuro','Genética Santa Agueda'],
  'IRENITA MAÑOSO':['ENIGMA PETRUS','IRENITA DESTREZA','2022-11-17','Macho','Alazán','La Irenita S.A.'],
  'OPEN ESPACIAL':['SPORTIVO','LA LUNA','1999','Macho','',''],
  'SANTA TERESA SPORT':['SPORTIVO','ELLERSTINA PORTUARIA','','Macho','',''],
  'SPORTIVO':['LODE','SPORT FASHION','2000-01-01','Macho','Alazán','Ellerstina S.A.'],
  // ---- Ancestros ----
  'LOSMACHITOS LIBANO':['DURAZNO','LAMBADA','2005','Macho','Zaino negro',''],
  'DURAZNO':['PUCARA','GUINDA','1994','Macho','Zaino colorado',''],
  'LAMBADA':['SEQUITO','CUMBIA','2000','Hembra','Zaino',''],
  'SEQUITO':['SHEET ANCHOR','LADING','1974','Macho','Zaino',''],
  'CUMBIA':['TOP SECRET','RANCHERA','2000','Hembra','Alazán',''],
  'IRENITA CERVEZA':['OPEN ESPACIAL','IRENITA CERTERA','2008','Hembra','Alazán',''],
  'IRENITA CERTERA':['IRENITA LUNATICO','VERDAD','2001','Hembra','Zaino colorado',''],
  'LA LUNA':['TOP SECRET','GAUCHA ACHA','','Hembra','Alazán',''],
  'TOP SECRET':['GANELON','PAGODA','1972','Macho','Alazán',''],
  'GAUCHA ACHA':['APRICOT','CARREVI','1973','Hembra','',''],
  'MACHITOS MECHERA':['MICHAEL','PLEGARIA','1998','Hembra','Zaino',''],
  'LODE':['MR PROSPECTOR','GRAND LUXE','1986','Macho','',''],
  'MR PROSPECTOR':['RAISE A NATIVE (USA)','GOLD DIGGER (USA)','1970','Macho','',''],
  'GRAND LUXE':['SIR IVOR (USA)','FANFRELUCHE','1974','Hembra','',''],
  'SPORT FASHION':['RINGARO','SPORT LADY','1986','Hembra','',''],
  'RINGARO':['CARO (IRE)','GUANAJIBENA','1979','Macho','',''],
  'SPORT LADY':['BANNER SPORT','PERUSA','1979','Hembra','',''],
  'MECHA UNIMOG':['RAINBOW CORNER','MECHA','2010','Macho','Alazán',''],
  'RAINBOW CORNER':['RAINBOW QUEST','KINGSCOTE','2000','Macho','Zaino',''],
  'MECHA':['LODE','BLESS MY WAY','','Hembra','Alazán',''],
  'ESPI PULPERA':['OPEN XENON','ESPI PLUSMANIA','2012','Hembra','Zaino',''],
  'OPEN XENON':['SPORTIVO','OPEN XELENE','2005','Macho','Alazán',''],
  'ESPI PLUSMANIA':['DON URBANO MEREQUETENGE','ESPI PLUMERA','2007','Hembra','Zaino',''],
  'VAN DUCATI':['VAN SISMO','VAN KAWASAKI','','Macho','',''],
  'VAN SISMO':['SPORTIVO','OPEN XELENE','','Macho','',''],
  'VAN KAWASAKI':['ELLERSTINA PICARO','KARENZA','','Hembra','',''],
  'ESPI EXPLOSIVA':['MECHA UNIMOG','ESPI POLVORA','','Hembra','Alazán',''],
  'ESPI POLVORA':['SIGNO','CHALO PORTEÑA','','Hembra','',''],
  'LUHUK':['FORTY NINER (USA)','ROYAL STANCE','1991','Macho','Alazán tostado',''],
  'FORTY NINER (USA)':['MR PROSPECTOR','FILE','1985','Macho','',''],
  'ROYAL STANCE':['DR. FAGER (USA)','ROYAL STATUTE','1977','Hembra','',''],
  'RENGO LUISITO':['TIME FOR DRINKS','LUISA','','Macho','',''],
  'CUMBIA II':['SOBORNADO','CUMBIA','','Hembra','',''],
  'ENIGMA PETRUS':['SPORTIVO','CLARET','2011','Macho','Alazán tostado',''],
  'CLARET':['MONTY','PINKY','','Hembra','Alazán tostado',''],
  'IRENITA DESTREZA':['LOSMACHITOS LIBANO','IRENITA SUTILEZA','2014','Hembra','Zaino',''],
  'IRENITA SUTILEZA':['CLARIN','SUGERENCIA','2004','Hembra','Alazán tostado',''],
  'ELLERSTINA PORTUARIA':['EL SOL','LAMBADA','1996-01-06','Hembra','Alazán','Ellerstina S.A.'],
  'EL SOL':['TOP SECRET','GAUCHA ACHA','1987','Macho','Alazán',''],
};
/* Otras formas de escribir el mismo caballo (como aparece en las fichas o en las planillas) */
const ALIAS_PEDIGRI={'HULK':'DOLFINA HULK','DON URBANO MEREQUETENGUE':'DON URBANO MEREQUETENGE','D.U. MEREQUETENGE':'DON URBANO MEREQUETENGE',
  'D. U. MEREQUETENGE':'DON URBANO MEREQUETENGE','MEREQUETENGUE':'DON URBANO MEREQUETENGE','MEREQUETENGE':'DON URBANO MEREQUETENGE',
  'I. PORRON':'IRENITA PORRON','PORRON':'IRENITA PORRON','PULPERO':'ESPI PULPERO','EXPLOSIVO':'ESPI EXPLOSIVO','MERCENARIO':'MACHITOS MERCENARIO',
  'LOS MACHITOS LIBANO':'LOSMACHITOS LIBANO','RENGO LUICITO':'RENGO LUISITO','SANTATERESA SPORT':'SANTA TERESA SPORT','STA. TERESA SPORT':'SANTA TERESA SPORT'};

/* La biblioteca, por nombre (y por sus otras formas de escribirlo). La usan padresDe, indiceGenealogia y datalists. */
const PED_LIB=new Map();
for(const [n,[padre,madre,nac,sexo,pelaje,criador]] of Object.entries(PEDIGRIS))PED_LIB.set(norm(n),{nombre:n,padre,madre,nac,sexo,pelaje,criador});
function pedigriConocido(n){const k=norm(n);if(!k)return null;return PED_LIB.get(k)||PED_LIB.get(norm(ALIAS_PEDIGRI[k]||''))||null}
