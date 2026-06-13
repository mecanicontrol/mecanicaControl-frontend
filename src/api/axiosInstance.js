import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
});

// ── Cache de GET en vuelo (deduplicación de peticiones idénticas) ──────────────
// Si la misma URL GET ya está en curso, devuelve la misma promesa.
// Si ya se resolvió hace menos de CACHE_TTL ms, devuelve el resultado cacheado.
const CACHE_TTL = 30_000  // 30 segundos
const pendientes = new Map()   // url → Promise en vuelo
const cache      = new Map()   // url → { data, ts }

function cacheKey(config) {
  return config.method === 'get' ? config.url : null
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? ''
    if (error.response?.status === 401 && !url.includes('/api/auth/')) {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
      if (usuario?.rol !== 'ADMIN') {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        window.dispatchEvent(new Event('auth:logout'))
      }
    }
    return Promise.reject(error)
  }
);

// Wrapper que deduplica GETs concurrentes y cachea respuestas 30s
const _get = api.get.bind(api)
api.get = (url, config = {}) => {
  const key = url

  // Resultado cacheado aún vigente
  const hit = cache.get(key)
  if (hit && Date.now() - hit.ts < CACHE_TTL) {
    return Promise.resolve(hit.data)
  }

  // Petición ya en vuelo — devuelve la misma promesa
  if (pendientes.has(key)) {
    return pendientes.get(key)
  }

  const promesa = _get(url, config)
    .then((res) => {
      cache.set(key, { data: res, ts: Date.now() })
      pendientes.delete(key)
      return res
    })
    .catch((err) => {
      pendientes.delete(key)
      cache.delete(key)
      return Promise.reject(err)
    })

  pendientes.set(key, promesa)
  return promesa
}

// Invalida la cache de una URL específica (llamar tras mutaciones)
api.invalidar = (url) => {
  cache.delete(url)
  pendientes.delete(url)
}

export default api;