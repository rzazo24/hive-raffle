# hive-raffle — Contexto para Claude Code

## Qué es este proyecto

Web estática (sin backend, sin build step) para hacer **sorteos verificables**
usando la blockchain de Hive. Los participantes son los autores de los
comentarios a un post de Hive; el ganador se elige de forma determinista a
partir del `block_id` de un bloque de Hive, usando SHA-256.

Es el tercer proyecto del usuario en el ecosistema Hive, después de:
- **Hive Scope** (hivescope.xyz) — explorador de estadísticas, consume la API RPC de Hive.
- **hive-clicker** — clicker game con React + Vite, Hive Keychain y Hive Engine.

A diferencia de esos dos, este proyecto es **JavaScript vanilla puro**: sin
frameworks, sin bundler. El usuario es un desarrollador principiante que
prefiere mantener el código simple y bien explicado.

## Estética

Reutiliza el sistema de diseño de **hive-scope** (proyecto hermano en
`../hive-scope`), para que ambas webs se sientan de la misma familia: tema
oscuro con degradado radial, tarjetas "de cristal" (`backdrop-filter: blur`),
rojo (`#ef4444`) como color primario y cian (`#38bdf8`) como acento,
tipografía Inter (texto) + JetBrains Mono (valores/hashes/números), botones
en forma de píldora, y efectos de resplandor (`box-shadow` con el color en
`rgba`) en hover/focus. Los tokens están en `:root` al principio de
`style.css` — si hive-scope cambia su paleta, replicar los mismos valores
aquí para mantener la coherencia. El logo (SVG inline en `index.html`)
reutiliza el diamante de Hive de hive-scope, pero cambia la lupa por un dado
cian, y el texto "SCOPE" por "RAFFLE".

## Stack

- HTML + CSS + JavaScript vanilla. Sin React/Vue/build tools.
- Módulos ES nativos (`<script type="module">`) — **requiere servir el sitio
  por HTTP** (no funciona con `file://`). Para desarrollo local: extensión
  "Live Server" de VS Code, o `python -m http.server`.
- API RPC pública de Hive vía `fetch()`. Nodo principal: `https://api.hive.blog`,
  con fallback a `https://anyx.io` (ver `NODES` en `js/hive-api.js`).
- Hashing: Web Crypto API nativa (`crypto.subtle.digest`), sin librerías externas.
- Despliegue objetivo: GitHub Pages o Netlify (sitio 100% estático).

## Estructura de archivos

```
hive-raffle/
├── index.html       # Página única, dos pestañas: Crear sorteo / Verificar sorteo
├── style.css
├── js/
│   ├── hive-api.js   # Toda la comunicación con la API de Hive (fetch). Sin lógica de negocio.
│   ├── raffle.js      # Lógica pura del sorteo: extraer participantes, SHA-256, elegir ganador.
│   ├── i18n.js         # Diccionario de traducciones (en/es) y utilidades para aplicarlas.
│   └── app.js            # Pegamento de UI: eventos, formularios, renderizado de resultados.
├── CLAUDE.md
└── README.md
```

## Idiomas (i18n)

Inglés es el idioma por defecto, con un botón en la cabecera para cambiar a
español. Sistema propio y muy simple, sin librerías:

- `js/i18n.js` tiene el diccionario `translations.en` / `translations.es` y
  las funciones `t(clave, variables)`, `getLang()`, `setLang()` y
  `applyStaticTranslations()`.
- El texto estático del HTML usa `data-i18n="clave"` (y
  `data-i18n-placeholder="clave"` para placeholders de inputs).
- Buena parte del contenido de esta web se genera dinámicamente en `app.js`
  (mensajes de estado, resultados del sorteo, texto de compromiso del
  bloque) — ese contenido NO puede traducirse solo con `data-i18n` porque no
  existe en el HTML hasta que se calcula. Por eso `app.js` guarda los
  últimos datos calculados en variables de estado (`ultimoEstadoBloque`,
  `ultimoResultado`) y, al cambiar de idioma, los "repinta" con `t()` sin
  volver a llamar a la API de Hive.
- La preferencia de idioma se guarda en `localStorage` para recordarla entre
  visitas.
- `raffle.js` NO importa `i18n.js` a propósito: es lógica pura y debe seguir
  siendo independiente de la UI. Su único mensaje de error queda en inglés.

## Decisión de diseño clave: esquema "commit-reveal" contra manipulación

Usar simplemente "el último bloque irreversible ahora mismo" como semilla es
inseguro: el organizador podría ejecutar el cálculo varias veces en distintos
momentos (distintos bloques) y publicar solo el resultado que le convenga
("grinding"). Para evitarlo, el flujo de creación de sorteo tiene dos pasos:

1. **Configurar**: el organizador fija un **número de bloque futuro** (por
   defecto, bloque actual + 1200 ≈ 1 hora) y lo anuncia públicamente
   *antes* de que ese bloque exista (p. ej. como comentario en el propio post).
2. **Sortear/Revelar**: cuando el bloque objetivo ya existe y es irreversible
   (`last_irreversible_block_num >= blockNum`), se calcula el ganador.

Como nadie puede predecir el `block_id` de un bloque que aún no se ha minado,
nadie —ni el propio organizador— puede elegir el resultado de antemano.

**Importante**: `computeRaffle()` en `raffle.js` es la única función que
decide el ganador, y la usan tanto el flujo de creación como el de
verificación (ver `ejecutarSorteo()` en `app.js`). No debe haber dos
implementaciones distintas del cálculo — eso rompería la garantía de que
"verificar" y "crear" siempre dan el mismo resultado.

## Filtro de fecha límite de participación (deadline)

Opcional: el organizador puede fijar una fecha/hora límite (`config-deadline`
/ `verify-deadline`, inputs `datetime-local`) para que los comentarios
publicados después no cuenten como participantes. Sin esto, alguien podría
comentar justo antes de que llegue el bloque objetivo para intentar colarse.

- `filterRepliesByDeadline(replies, deadlineIso)` en `raffle.js` es pura: filtra
  por `reply.created` (que Hive devuelve en UTC pero sin sufijo `Z`, hay que
  añadirlo antes de parsear con `Date`).
- El valor del `<input type="datetime-local">` se trata como **UTC directo**,
  NO como hora local del navegador (ver `deadlineInputToIso()` en `app.js`):
  así la fecha límite significa el mismo instante exacto para el organizador
  y para cualquier verificador, sin depender de la zona horaria de cada uno.
- Si no se rellena, no se filtra nada (comportamiento por defecto, igual que
  antes de añadir esta función).
- El texto de compromiso (`commitText`) añade una línea extra
  (`commitDeadlineLine`) solo si hay fecha límite.

## Filtro opcional: exigir voto en el post

Checkbox `config-require-voter` / `verify-require-voter`. Si está activo:

- `ejecutarSorteo()` en `app.js` llama también a `getActiveVotes(author,
  permlink)` (nueva función en `hive-api.js`).
- `filterRepliesByVoters(replies, votes)` en `raffle.js` (pura) se queda
  solo con los comentarios cuyo autor también aparece entre los votos con
  `percent > 0` — un **downvote no cuenta** como apoyo al post.
- Se aplica DESPUÉS del filtro de fecha límite (`filterRepliesByDeadline`),
  no antes: primero se descartan comentarios tardíos, luego se exige el voto
  sobre los que quedan.
- Como con la fecha límite, hay que marcar la misma casilla al verificar
  para reproducir la misma lista de participantes.

Se descartó explícitamente pedir además una palabra clave concreta en el
comentario (p. ej. "raffle"): añade fricción y disputas ("¿contaba mi
comentario o no?") sin aportar mucho valor real de verificación.

## Alcance de la v1

**Dentro de v1:**
- Obtener participantes de `condenser_api.get_content_replies` (solo
  comentarios de primer nivel al post, no respuestas anidadas).
- Flujo commit-reveal completo (configurar bloque futuro → sortear).
- Modo verificación independiente (introducir author/permlink/bloque y
  recalcular).
- Filtro opcional de fecha límite de participación.
- Filtro opcional de "debe haber votado el post".

**Fuera de v1 (nice-to-have, decidido explícitamente con el usuario):**
- Filtro por reputación mínima.

## Repositorio y despliegue

- GitHub: https://github.com/rzazo24/hive-raffle (repo privado, licencia MIT
  en `LICENSE.md`). `CLAUDE.md` está trackeado en el repo (ya no está en
  `.gitignore`).
- Producción: https://hive-raffle.vercel.app/ (Vercel, auto-deploy en cada
  push a `main`, igual que hive-scope).
- El README (en inglés) y los comentarios del código (en inglés) son
  el contenido de cara al público; este archivo `CLAUDE.md` se queda en
  español a propósito porque es contexto de conversación con el usuario,
  no código.

## Convenciones de trabajo con el usuario

- Es principiante en JS/blockchain: el código debe llevar comentarios que
  expliquen el *porqué*, no solo el qué, y evitar dar por hechos conceptos
  avanzados sin una breve explicación.
- Para cambios sobre archivos ya existentes, el usuario prefiere que se le
  muestren **diffs**, no el archivo completo reescrito.
- Antes de escribir código para una funcionalidad nueva no trivial, proponer
  primero la estructura/plan y preguntar las decisiones de diseño abiertas.
