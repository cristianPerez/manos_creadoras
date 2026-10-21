#!/usr/bin/env bash
# Copia una plantilla de correo al portapapeles PARA PEGARLA EN SUPABASE.
#
# ⚠️ EXISTE POR UN FALLO QUE COSTÓ DÍAS. Esta terminal tiene LC_CTYPE="C" (no
# UTF-8), así que un `pbcopy` normal marca el texto como Latin-1: al pegarlo en
# el panel de Supabase los acentos y las ñ se destrozan —"⚠️ POR QUÉ ESTÁ" se
# convierte en ",ÕfÕJ¤ POR QUé/Á ESTÁ"— y el correo sale con basura.
#
# Lo peor es que se guarda SIN AVISAR: el panel dice "Successfully updated" y
# parece que todo fue bien. Se descubrió porque las alumnas recibían correos
# raros, no porque algo fallara.
#
# Uso:  npm run correo:copiar magic-link
#       npm run correo:copiar confirmar-registro
set -euo pipefail

nombre="${1:-}"
if [[ -z "$nombre" ]]; then
  echo "Falta el nombre. Disponibles:"
  ls supabase/templates/*.html | xargs -n1 basename | sed 's/\.html$//' | sed 's/^/  /'
  exit 1
fi

archivo="supabase/templates/${nombre}.html"
[[ -f "$archivo" ]] || { echo "❌ No existe $archivo"; exit 1; }

LC_CTYPE=UTF-8 LANG=es_ES.UTF-8 pbcopy < "$archivo"

# Comprobar que lo que quedó en el portapapeles conserva los acentos.
if LC_CTYPE=UTF-8 pbpaste | grep -q "ó\|é\|ñ\|⚠️"; then
  echo "✅ $nombre copiado ($(wc -c < "$archivo" | tr -d ' ') bytes), acentos intactos."
  echo "   Pégalo en: Supabase → Authentication → Emails → la plantilla que toque."
  echo "   Y MIRA EL PREVIEW antes de guardar: si ves símbolos raros, algo falló."
else
  echo "⚠️  El portapapeles perdió los acentos. NO lo pegues — avisa."
  exit 1
fi
