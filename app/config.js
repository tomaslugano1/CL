/* Datos de conexión con Supabase (la base de datos en la nube).
   Se sacan de: Supabase → tu proyecto → Project Settings → API.
   La "anon key" es pública a propósito: la seguridad la dan los usuarios y contraseñas. */
window.DC_CONFIG={
  url:'https://rqmibapllqfvxgsawyox.supabase.co',        // ej: https://abcdefgh.supabase.co
  anonKey:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbWliYXBsbHFmdnhnc2F3eW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MTc2NTMsImV4cCI6MjEwNjI5MzY1M30.QH3vsZUmp2MXFq-2rPLgDmvoTGsRz4NojyGeGxvSRH0',       // una clave larga que empieza con eyJ...
  vapidPublic:'BEaTe68loZY4Q1LaL8LYt17nC75a4R_KwIVY1Z3vlSx4o1jonBKJA9a-H1iRiwIi6nVW0_RfNc9nu4Ay-pE6-S0' // clave pública de las notificaciones (la privada está solo en Netlify)
};
