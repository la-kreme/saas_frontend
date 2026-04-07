#!/bin/sh
# Génère /usr/share/nginx/html/env-config.js au démarrage du container
# Railway injecte les variables d'environnement à ce moment-là.
cat > /usr/share/nginx/html/env-config.js << EOF
window.__ENV = {
  VITE_SUPABASE_URL: "${VITE_SUPABASE_URL:-}",
  VITE_SUPABASE_ANON_KEY: "${VITE_SUPABASE_ANON_KEY:-}",
  VITE_API_URL: "${VITE_API_URL:-https://api.lakreme.app}",
  VITE_WIDGET_BASE_URL: "${VITE_WIDGET_BASE_URL:-https://api.lakreme.app}"
};
EOF

exec nginx -g "daemon off;"
