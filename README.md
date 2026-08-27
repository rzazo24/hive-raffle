# hive-raffle

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Last Commit](https://img.shields.io/github/last-commit/rzazo24/hive-raffle)
![Issues](https://img.shields.io/github/issues/rzazo24/hive-raffle)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Hive](https://img.shields.io/badge/blockchain-Hive-red)
![Status](https://img.shields.io/badge/status-in%20development-yellow)

Sorteos verificables usando la blockchain de Hive como fuente de aleatoriedad.

En vez de confiar en un `Math.random()` que nadie puede comprobar, este
proyecto usa el `block_id` de un bloque futuro de Hive como semilla: nadie
puede predecirlo de antemano, así que nadie puede manipular el resultado —
y cualquiera puede recalcularlo después para comprobar que es legítimo.

## Cómo funciona

1. **Participantes**: se toman los autores de los comentarios de primer
   nivel a un post de Hive (`author` + `permlink`).
2. **Semilla**: se fija un número de bloque futuro de Hive y se anuncia
   públicamente antes de que ese bloque exista.
3. **Ganador**: cuando el bloque ya existe, se aplica SHA-256 sobre su
   `block_id` y el resultado (interpretado como número) decide el índice
   ganador dentro de la lista de participantes.
4. **Verificación**: cualquiera puede introducir el mismo `author`,
   `permlink` y número de bloque en la pestaña "Verificar sorteo" y
   comprobar que obtiene el mismo ganador.

## Desarrollo local

Este proyecto no tiene build step, pero usa módulos ES
(`<script type="module">`), que **no funcionan abriendo `index.html` con
doble clic**. Sirve el directorio con un servidor local, por ejemplo:

```bash
python -m http.server 8000
```

y abre `http://localhost:8000`.

## Despliegue

Sitio 100% estático: se puede desplegar directamente en GitHub Pages o
Netlify sin configuración adicional.

## Stack

- HTML / CSS / JavaScript vanilla (sin frameworks, sin bundler).
- API RPC pública de Hive (`https://api.hive.blog`, con fallback).
- Web Crypto API nativa del navegador para SHA-256.
