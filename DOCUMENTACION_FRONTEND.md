# DOCUMENTACIÓN COMPLETA DEL FRONTEND — MECÁNICAHUB

> **Proyecto:** MecánicaHub Frontend  
> **Framework:** React 19 + Vite 8  
> **Autor:** Jo. Galvez C.  
> **Propósito:** Documentación exhaustiva para presentación ante comisión evaluadora de portafolio de título  
> **Total de archivos del proyecto:** ~129 archivos de código fuente  

---

# ÍNDICE

1. [Visión General del Proyecto](#1-visión-general-del-proyecto)
2. [Stack Tecnológico y Dependencias (package.json)](#2-stack-tecnológico-y-dependencias-packagejson)
3. [Arquitectura de Archivos y Configuración](#3-arquitectura-de-archivos-y-configuración)
4. [Punto de Entrada: index.html y main.jsx](#4-punto-de-entrada-indexhtml-y-mainjsx)
5. [El Orquestador Central: App.jsx — Sistema de Rutas Completo](#5-el-orquestador-central-appjsx--sistema-de-rutas-completo)
6. [Capa de Comunicación con el Backend](#6-capa-de-comunicación-con-el-backend)
7. [Gestión de Estado Global: AuthContext](#7-gestión-de-estado-global-authcontext)
8. [Capa de Servicios — Catálogo Completo de Endpoints](#8-capa-de-servicios--catálogo-completo-de-endpoints)
9. [Componentes Compartidos (Shared)](#9-componentes-compartidos-shared)
10. [Componentes de Layout y Navegación](#10-componentes-de-layout-y-navegación)
11. [Páginas Públicas — La Cara Visible del Sistema](#11-páginas-públicas--la-cara-visible-del-sistema)
12. [Flujo de Agendamiento — Paso a Paso](#12-flujo-de-agendamiento--paso-a-paso)
13. [Sistema Cotizador — Manual e Inteligencia Artificial](#13-sistema-cotizador--manual-e-inteligencia-artificial)
14. [Portal del Cliente — Dashboard y Funcionalidades](#14-portal-del-cliente--dashboard-y-funcionalidades)
15. [Portal del Administrador — Panel de Control](#15-portal-del-administrador--panel-de-control)
16. [Portal del Técnico — Gestión de Órdenes](#16-portal-del-técnico--gestión-de-órdenes)
17. [Flujo de Datos: Cómo Viaja la Información Entre Páginas](#17-flujo-de-datos-cómo-viaja-la-información-entre-páginas)
18. [Sistema de Estilos: Tailwind CSS y Assets](#18-sistema-de-estilos-tailwind-css-y-assets)
19. [Despliegue: Vercel](#19-despliegue-vercel)
20. [Resumen de la Arquitectura General](#20-resumen-de-la-arquitectura-general)

---

## 1. VISIÓN GENERAL DEL PROYECTO

### ¿Qué es MecánicaHub?

MecánicaHub es una plataforma web de gestión integral para talleres mecánicos. El frontend está construido con **React 19** y **Vite 8**, y se comunica con un backend REST (Spring Boot) alojado en `http://localhost:8080`. El sistema soporta **cuatro roles de usuario**:

| Rol | Descripción | Rutas base |
|-----|-------------|------------|
| **Público** (sin autenticación) | Visitantes que pueden cotizar, ver servicios, agendar | `/`, `/cotizador`, `/servicios`, `/tienda`, `/agendar`, `/login`, `/register` |
| **CLIENTE** | Dueños de vehículos que gestionan sus autos, citas e historial | `/cliente/*`, `/mis-vehiculos` |
| **TÉCNICO** | Mecánicos que ejecutan órdenes de trabajo, actualizan estados, gestionan inventario | `/tecnico/*` |
| **ADMIN** | Administradores del taller con control total sobre el sistema | `/admin/*` |

### Funcionalidades principales

1. **Página de inicio (Home)** — Landing page con cotizador rápido, servicios destacados, testimonios
2. **Cotizador** — Dos modos: manual (selección de servicios) e IA (diagnóstico por descripción de falla)
3. **Agendamiento** — Flujo de 3 pasos para reservar citas (fecha/hora → cuenta → confirmación)
4. **Tienda** — Catálogo de productos con checkout y confirmación de compra
5. **Seguimiento público** — Consulta de estado de orden de trabajo por código
6. **Portal Cliente** — Dashboard, gestión de vehículos, historial, perfil, seguimiento detallado
7. **Portal Admin** — Dashboard con KPIs, gestión de agendamientos, OTs, inventario, clientes, técnicos, catálogos, reportes, usuarios, configuración, tienda, control de calidad
8. **Portal Técnico** — Dashboard, lista de órdenes, detalle de orden con diagnóstico y cambio de estado, inventario, perfil
9. **Chat en tiempo real** — Comunicación entre cliente, técnico y admin dentro de cada OT
10. **Sistema de autenticación** — Login, registro con verificación por email, recuperación de sesión vía localStorage

---

## 2. STACK TECNOLÓGICO Y DEPENDENCIAS (package.json)

### Archivo: `package.json`

```json
{
  "name": "mecanicontrol-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": { ... },
  "devDependencies": { ... }
}
```

### Dependencias de Producción

| Paquete | Versión | Propósito en el proyecto |
|---------|---------|--------------------------|
| `react` | ^19.2.4 | Biblioteca principal de UI. Todos los componentes son funciones React con hooks |
| `react-dom` | ^19.2.4 | Renderizado del DOM. Usado en `main.jsx` con `createRoot` |
| `react-router-dom` | ^7.14.0 | Sistema de enrutamiento SPA. Define ~40 rutas en `App.jsx`. Provee `useNavigate`, `useLocation`, `useSearchParams`, `NavLink`, `Link`, `Navigate`, `BrowserRouter`, `Routes`, `Route` |
| `axios` | ^1.15.0 | Cliente HTTP para comunicación con el backend REST. Configurado con interceptores, caché GET y token JWT automático |
| `@supabase/supabase-js` | ^2.106.2 | Cliente para Supabase (servicios en la nube: auth, storage, realtime). Inicializado en `lib/supabaseClient.js` |
| `chart.js` | ^4.5.1 | Librería de gráficos. Renderiza gráficos de barras y dona en el Dashboard del Admin |
| `react-chartjs-2` | ^5.3.1 | Wrapper React para Chart.js. Componentes `<Bar>` y `<Doughnut>` en el Dashboard Admin |
| `lucide-react` | ^1.8.0 | Biblioteca de íconos SVG. Usada en TODOS los componentes para iconografía consistente (200+ usos) |
| `jspdf` | ^4.2.1 | Generación de PDFs en el cliente. Usado para exportar reportes |
| `xlsx` | ^0.18.5 | Lectura/escritura de archivos Excel. Usado para exportar datos de inventario/reportes |

### Dependencias de Desarrollo

| Paquete | Propósito |
|---------|-----------|
| `vite` ^8.0.4 | Bundler y dev server ultrarrápido con HMR (Hot Module Replacement) |
| `@vitejs/plugin-react` ^6.0.1 | Plugin de Vite para soporte de React (JSX, Fast Refresh) |
| `tailwindcss` ^3.4.19 | Framework CSS utilitario. TODOS los estilos del proyecto |
| `postcss` ^8.5.9 | Procesador CSS requerido por Tailwind |
| `autoprefixer` ^10.4.27 | Añade prefijos de navegador automáticamente |
| `eslint` ^9.39.4 | Linter de código JavaScript |
| `@eslint/js` ^9.39.4 | Configuraciones recomendadas de ESLint |
| `eslint-plugin-react-hooks` ^7.0.1 | Reglas de ESLint para hooks de React |
| `eslint-plugin-react-refresh` ^0.5.2 | Soporte para Fast Refresh en ESLint |
| `globals` ^17.4.0 | Definiciones de variables globales para ESLint |
| `playwright` ^1.60.0 | Framework de testing end-to-end. Preparado para tests de integración |

### Scripts

| Comando | Acción |
|---------|--------|
| `npm run dev` | Inicia el servidor de desarrollo Vite (HMR, puerto 5173 por defecto) |
| `npm run build` | Compila para producción en carpeta `dist/` |
| `npm run lint` | Ejecuta ESLint en todo el proyecto |
| `npm run preview` | Previsualiza la build de producción localmente |

---

## 3. ARQUITECTURA DE ARCHIVOS Y CONFIGURACIÓN

### Estructura del proyecto

```
mecanicaControl-frontend/
├── index.html                     # Entry point HTML
├── package.json                   # Dependencias y scripts
├── vite.config.js                 # Configuración de Vite
├── tailwind.config.js             # Configuración de Tailwind CSS
├── postcss.config.js              # Configuración de PostCSS
├── eslint.config.js               # Configuración de ESLint
├── vercel.json                    # Configuración de despliegue en Vercel
├── .env                           # Variables de entorno
├── .env.local                     # Variables de entorno locales (gitignored)
├── .gitignore                     # Archivos ignorados por git
├── cspell.json                    # Configuración del corrector ortográfico
├── public/                        # Archivos estáticos
└── src/
    ├── main.jsx                   # Punto de entrada React
    ├── App.jsx                    # Orquestador de rutas
    ├── App.css                    # Estilos globales (legado)
    ├── index.css                  # Directivas de Tailwind
    ├── api/
    │   └── axiosInstance.js       # Cliente HTTP configurado
    ├── context/
    │   └── AuthContext.jsx        # Estado global de autenticación
    ├── lib/
    │   └── supabaseClient.js      # Cliente de Supabase
    ├── services/                  # 21 archivos de servicios
    │   ├── authService.js
    │   ├── agendamientoService.js
    │   ├── vehiculoService.js
    │   ├── usuarioService.js
    │   ├── catalogoService.js
    │   ├── chatService.js
    │   ├── configuracionService.js
    │   ├── diagnosticoService.js
    │   ├── disponibilidadService.js
    │   ├── marcasService.js
    │   ├── pedidoService.js
    │   ├── seguimientoService.js
    │   ├── serviciosCatalogoService.js
    │   ├── tecnicoService.js
    │   ├── adminService.js
    │   ├── adminAgendamientoService.js
    │   ├── adminCatalogosService.js
    │   ├── adminClientesService.js
    │   ├── adminConfiguracionService.js
    │   ├── adminOTService.js
    │   └── adminUsuariosService.js
    ├── components/
    │   ├── Navbar.jsx             # Barra de navegación principal
    │   ├── Footer.jsx             # Pie de página
    │   ├── admin/
    │   │   ├── AdminLayout.jsx    # Layout del panel admin (sidebar + topbar + contenido)
    │   │   └── BccAdminsConfig.jsx # Configuración de correos BCC
    │   ├── agendamiento/          # Componentes del flujo de agendamiento
    │   │   ├── BarraProgreso.jsx
    │   │   ├── Calendario.jsx
    │   │   ├── PasoConfirmacion.jsx
    │   │   ├── PasoCuenta.jsx
    │   │   ├── PasoExito.jsx
    │   │   ├── PasoFechaHora.jsx
    │   │   ├── ResumenAgendamiento.jsx
    │   │   ├── SelectorHorario.jsx
    │   │   ├── SelectorVehiculo.jsx
    │   │   ├── TabCrearCuenta.jsx
    │   │   └── TabLogin.jsx
    │   ├── cliente/
    │   │   ├── DashboardCliente.jsx
    │   │   ├── ModalNuevoVehiculo.jsx
    │   │   ├── SidebarCliente.jsx
    │   │   ├── TopbarCliente.jsx
    │   │   └── VehiculoCard.jsx
    │   ├── cotizador/
    │   │   ├── DiagnosticoIA.jsx
    │   │   ├── HeroCotizador.jsx
    │   │   ├── ResumenCotizacion.jsx
    │   │   ├── ResumenServicios.jsx
    │   │   └── ServicioCard.jsx
    │   ├── login/
    │   │   └── InicioSesion.jsx   # Formulario reutilizable login/registro
    │   ├── perfil/
    │   │   └── PerfilUsuario.jsx   # Componente de perfil reutilizable
    │   ├── seguimiento/
    │   │   └── LineaTiempoOT.jsx   # Visualización de fases de OT
    │   ├── shared/
    │   │   ├── CargandoAuto.jsx    # Animación de carga (auto)
    │   │   ├── ChatOT.jsx          # Chat en tiempo real de OT
    │   │   ├── HeroSection.jsx     # Hero con cotizador rápido
    │   │   ├── RutaProtegida.jsx   # Guard de rutas por rol
    │   │   └── SelectorVehiculoPerfil.jsx # Selector de vehículos del perfil
    │   └── Tecnico/
    │       ├── PerfilTecnico.jsx
    │       ├── SidebarTecnico.jsx
    │       └── TopbarTecnico.jsx
    ├── pages/
    │   ├── Home.jsx               # Landing page principal
    │   ├── Admin/                  # 14 páginas del panel admin
    │   │   ├── Dashboard.jsx
    │   │   ├── Agendamientos.jsx
    │   │   ├── OrdenesTrabajo.jsx
    │   │   ├── Inventario.jsx
    │   │   ├── Clientes.jsx
    │   │   ├── Tecnicos.jsx
    │   │   ├── Reportes.jsx
    │   │   ├── Catalogos.jsx
    │   │   ├── Usuarios.jsx
    │   │   ├── Configuracion.jsx
    │   │   ├── MiPerfil.jsx
    │   │   ├── MiTienda.jsx
    │   │   ├── VerTienda.jsx
    │   │   ├── ControlCalidad.jsx
    │   │   └── useLista.js
    │   ├── Cliente/                # 7 páginas del portal cliente
    │   │   ├── Dashboard.jsx
    │   │   ├── Agendamientos.jsx
    │   │   ├── Historial.jsx
    │   │   ├── MisVehiculos.jsx
    │   │   ├── Perfil.jsx
    │   │   ├── DetalleVehiculo.jsx
    │   │   └── SeguimientoDetalle.jsx
    │   ├── Publico/                # 11 páginas públicas
    │   │   ├── Agendamiento.jsx
    │   │   ├── Checkout.jsx
    │   │   ├── ConfirmacionCompra.jsx
    │   │   ├── Cotizador.jsx
    │   │   ├── Login.jsx
    │   │   ├── Perfil.jsx
    │   │   ├── Register.jsx
    │   │   ├── Seguimiento.jsx
    │   │   ├── Servicios.jsx
    │   │   ├── Tienda.jsx
    │   │   └── VerificarEmail.jsx
    │   └── Tecnico/                # 5 páginas del portal técnico
    │       ├── Dashboard.jsx
    │       ├── DetalleOrden.jsx
    │       ├── Inventario.jsx
    │       ├── Ordenes.jsx
    │       └── Perfil.jsx
    └── assets/
        ├── hero.png
        ├── react.svg
        ├── vite.svg
        ├── servicios/              # 15 imágenes de servicios
        └── tienda/                 # 9 imágenes de productos
```

### Archivos de Configuración Clave

#### `.env` — Variables de Entorno

```
VITE_API_URL=http://localhost:8080
```

Esta variable define la URL base del backend. Vite expone las variables con prefijo `VITE_` a través de `import.meta.env`. En `axiosInstance.js`, se usa como `baseURL`.

#### `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- `@vitejs/plugin-react` permite usar JSX sin configuración adicional y provee Fast Refresh en desarrollo.
- La configuración es mínima porque Vite ya detecta `index.html` como entry point y `src/` como source.

#### `tailwind.config.js`

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
}
```

- Escanea todos los archivos `.jsx` en `src/` para detectar clases de Tailwind usadas.
- `theme: { extend: {} }` — sin extensiones personalizadas (usa los defaults de Tailwind).
- Sin plugins adicionales.

#### `postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- PostCSS procesa el CSS. `tailwindcss` inyecta las clases utilitarias. `autoprefixer` añade vendor prefixes.

#### `eslint.config.js`

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
```

- ESLint 9 con configuración flat.
- Ignora `dist/`.
- Aplica reglas recomendadas de JS, hooks de React, y React Refresh.
- `no-unused-vars`: error si hay variables sin usar, excepto las que empiezan con mayúscula o guion bajo.
- `ecmaFeatures: { jsx: true }` permite sintaxis JSX.

#### `vercel.json`

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

- Configuración de despliegue en Vercel.
- Todas las rutas (`/(.*)`) se reescriben a `/` (el `index.html`), permitiendo que React Router maneje el enrutamiento del lado del cliente (SPA fallback).

#### `.gitignore`

Ignora: `node_modules`, `dist`, archivos `.local`, `.env.local`, `.vscode/*`, `.idea`, `.DS_Store`, `DOCUMENTACION_BACKEND.md`, `LOGICA_PROGRAMACION.md`.

---

## 4. PUNTO DE ENTRADA: index.html Y main.jsx

### `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>mecanicontrol-frontend</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- Es el entry point HTML. Vite lo procesa durante el build.
- `<div id="root">` es el contenedor donde React monta toda la aplicación.
- `<script type="module">` carga `main.jsx` como módulo ES (permite `import`/`export`).
- El viewport meta tag asegura diseño responsive.
- No hay CSS links directos; Vite inyecta el CSS a través de JS.

### `main.jsx`

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- `createRoot` es la API de React 18+ para crear la raíz de renderizado concurrente.
- `StrictMode` es un wrapper de desarrollo que detecta efectos secundarios y problemas potenciales.
- `./index.css` importa las directivas de Tailwind (`@tailwind base/components/utilities`), que es TODO el sistema de estilos.
- `<App />` es el componente raíz que contiene BrowserRouter, AuthProvider, y todas las rutas.

---

## 5. EL ORQUESTADOR CENTRAL: App.jsx — SISTEMA DE RUTAS COMPLETO

`App.jsx` es el archivo más importante del proyecto. Contiene TODAS las definiciones de rutas y envuelve la aplicación con los providers necesarios.

### Estructura jerárquica

```
<AuthProvider>                    ← Estado global de autenticación
  <BrowserRouter>                 ← Sistema de rutas SPA
    <Routes>                      ← Contenedor de rutas
      {/* Rutas públicas (sin protección) */}
      <Route path="/" element={<Home />} />
      <Route path="/cotizador" element={<Cotizador />} />
      ... (12 rutas públicas)

      {/* Rutas de técnico (protegidas rol TECNICO) */}
      <Route path="/tecnico/*" element={<RutaProtegida roles={['TECNICO']}><TecnicoX /></RutaProtegida>} />
      ... (5 rutas)

      {/* Rutas de cliente (protegidas CLIENTE + ADMIN) */}
      <Route path="/cliente/*" element={<RutaProtegida roles={['CLIENTE','ADMIN']}><ClienteX /></RutaProtegida>} />
      ... (7 rutas)

      {/* Rutas de admin (protegidas ADMIN) */}
      <Route path="/admin/*" element={<RutaProtegida roles={['ADMIN']}><AdminX /></RutaProtegida>} />
      ... (13 rutas)
    </Routes>
  </BrowserRouter>
</AuthProvider>
```

### Lista completa de rutas

#### Rutas Públicas (13 rutas)

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `Home` | Landing page con hero, servicios, testimonios |
| `/cotizador` | `Cotizador` | Cotizador manual + IA |
| `/login` | `Login` | Inicio de sesión |
| `/register` | `Register` | Registro de nuevo cliente |
| `/verificar-email` | `VerificarEmail` | Verificación de email por token |
| `/agendar` | `Agendamiento` | Flujo de agendamiento de 3 pasos |
| `/seguimiento` | `Seguimiento` | Consulta pública de OT por código |
| `/servicios` | `Servicios` | Catálogo de servicios con filtros |
| `/tienda` | `Tienda` | Catálogo de productos |
| `/tienda/checkout` | `Checkout` | Proceso de compra |
| `/tienda/confirmacion` | `ConfirmacionCompra` | Confirmación post-compra |
| `/perfil` | `Perfil` | Perfil público (heredado) |
| (sin ruta, renderizado condicional) | — | — |

#### Rutas de Técnico (5 rutas, protegidas con rol `TECNICO`)

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/tecnico/perfil` | `TecnicoPerfil` | Perfil del técnico |
| `/tecnico/dashboard` | `TecnicoDashboard` | Dashboard con KPIs del técnico |
| `/tecnico/ordenes` | `OrdenesTecnico` | Lista de órdenes asignadas |
| `/tecnico/ordenes/:codigo` | `DetalleOrden` | Detalle de una orden específica (parámetro dinámico) |
| `/tecnico/inventario` | `InventarioTecnico` | Vista de inventario del taller |

#### Rutas de Cliente (7 rutas, protegidas con rol `CLIENTE` o `ADMIN`)

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/mis-vehiculos` | `MisVehiculos` | Lista de vehículos del cliente |
| `/cliente/dashboard` | `DashboardCliente` | Dashboard con resumen de vehículos y citas |
| `/cliente/historial` | `Historial` | Historial de servicios realizados |
| `/cliente/agendamientos` | `AgendamientosCliente` | Lista de agendamientos del cliente |
| `/cliente/perfil` | `PerfilCliente` | Edición de perfil |
| `/cliente/vehiculo/:id` | `DetalleVehiculo` | Detalle de un vehículo (parámetro dinámico) |
| `/cliente/seguimiento/:agendamientoId` | `SeguimientoDetalle` | Seguimiento detallado de un agendamiento |

#### Rutas de Admin (13 rutas, protegidas con rol `ADMIN`)

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/admin` | `Dashboard` | Dashboard con gráficos y KPIs |
| `/admin/agendamientos` | `Agendamientos` | Gestión de citas (CRUD, filtros, confirmación) |
| `/admin/ot` | `OrdenesTrabajo` | Lista y detalle de órdenes de trabajo |
| `/admin/inventario` | `Inventario` | Gestión de productos y stock |
| `/admin/clientes` | `Clientes` | Lista de clientes con ajuste de puntos |
| `/admin/tecnicos` | `Tecnicos` | Gestión de técnicos |
| `/admin/reportes` | `Reportes` | Reportes de ventas y operaciones |
| `/admin/catalogos` | `Catalogos` | Gestión de catálogos (servicios, categorías, marcas, modelos) |
| `/admin/usuarios` | `Usuarios` | Gestión de usuarios (CRUD, toggle activo/inactivo) |
| `/admin/configuracion` | `Configuracion` | Configuración del sistema + BCC admins |
| `/admin/mi-perfil` | `MiPerfil` | Perfil del administrador |
| `/admin/mi-tienda` | `MiTienda` | Gestión de la tienda |
| `/admin/ver-tienda` | `VerTienda` | Vista previa de la tienda |
| `/admin/control-calidad` | `ControlCalidad` | Panel de control de calidad |

### Cómo funciona el enrutamiento

1. **`BrowserRouter`** envuelve todas las rutas y usa la History API del navegador para URLs limpias (sin `#`).
2. **`Routes`** busca la primera ruta que coincida con la URL actual.
3. Cada **`Route`** define un `path` y el componente `element` a renderizar.
4. Las rutas protegidas usan **`RutaProtegida`** como wrapper.
5. Los parámetros dinámicos (`:codigo`, `:id`, `:agendamientoId`) se capturan con `useParams()` en los componentes destino.
6. Para rutas con sub-rutas como `/admin/mi-tienda`, las rutas son "planas" (no anidadas), definidas explícitamente.

---

## 6. CAPA DE COMUNICACIÓN CON EL BACKEND

### `api/axiosInstance.js` — El Cliente HTTP Central

Este archivo es el **único punto de contacto con el backend**. Toda la aplicación usa esta instancia configurada de Axios.

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // 'http://localhost:8080'
  timeout: 30000,                         // 30 segundos máximo
});
```

#### Interceptor de Request (salida)

```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

- **Cada petición saliente** revisa si hay un token JWT en `localStorage`.
- Si existe, lo adjunta como header `Authorization: Bearer <token>`.
- Esto permite autenticación automática sin que cada servicio tenga que preocuparse.

#### Interceptor de Response (entrada)

```javascript
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
```

- Si una petición recibe **401 (Unauthorized)** y no es de la ruta `/api/auth/`:
  - Verifica si el usuario NO es ADMIN.
  - Si no es admin, elimina token y datos del localStorage.
  - Dispara un evento global `auth:logout` que el `AuthContext` escucha para actualizar el estado.
- **Los admins no son deslogueados automáticamente** al recibir 401.

#### Sistema de Caché y Deduplicación de GET

Este es uno de los patrones más avanzados del frontend:

```javascript
const CACHE_TTL = 30_000  // 30 segundos
const pendientes = new Map()   // url → Promise en vuelo
const cache      = new Map()   // url → { data, ts }
```

**Deduplicación de peticiones concurrentes:**
- Si dos componentes piden la misma URL GET al mismo tiempo, solo se hace UNA petición real.
- El segundo recibe la misma promesa que el primero.

**Caché temporal:**
- Las respuestas GET se cachean por 30 segundos.
- Durante ese tiempo, peticiones subsecuentes devuelven el resultado cacheado sin llamar al backend.

**Invalidación:**
```javascript
api.invalidar = (url) => {
  cache.delete(url)
  pendientes.delete(url)
}
```
- Método expuesto para que los servicios invaliden la caché después de mutaciones (POST, PUT, DELETE).
- Ejemplo: después de crear un agendamiento, se invalida `/api/agendamientos/mis` para forzar una recarga fresca.

### `lib/supabaseClient.js`

```javascript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnon);
```

- Crea un cliente de Supabase usando variables de entorno.
- Supabase se usa para almacenamiento de archivos (fotos de perfil, imágenes de evidencia en OTs).
- También podría usarse para real-time subscriptions (el chat).
- Requiere que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén definidos en `.env`.

---

## 7. GESTIÓN DE ESTADO GLOBAL: AuthContext

### `context/AuthContext.jsx`

Este es el **único estado global** de la aplicación. Implementa el patrón Context API de React.

#### Proveedor: `AuthProvider`

```javascript
export function AuthProvider({ children }) {
  const [usuario, setUsuario]     = useState(null)
  const [authListo, setAuthListo] = useState(false)
```

**Inicialización (useEffect):**
```javascript
useEffect(() => {
  const token = localStorage.getItem('token')
  const datos = localStorage.getItem('usuario')
  if (token && datos) {
    try { setUsuario(JSON.parse(datos)) } catch { setUsuario(null) }
  }
  setAuthListo(true)
}, [])
```

- Al montar el componente, revisa `localStorage` para restaurar la sesión previa.
- `authListo` pasa a `true` cuando termina de verificar. Esto evita redirecciones prematuras en `RutaProtegida`.
- Si los datos en localStorage están corruptos, `setUsuario(null)` limpia el estado.

**Escucha de logout forzado:**
```javascript
useEffect(() => {
  const handleForcedLogout = () => setUsuario(null)
  window.addEventListener('auth:logout', handleForcedLogout)
  return () => window.removeEventListener('auth:logout', handleForcedLogout)
}, [])
```

- Escucha el evento `auth:logout` (disparado por el interceptor de Axios ante 401).
- Al recibirlo, limpia el usuario del estado (sin tocar localStorage, que ya fue limpiado).

**Funciones de autenticación:**

| Función | Acción |
|---------|--------|
| `login(token, datos)` | Guarda token y datos en localStorage, actualiza el estado |
| `logout()` | Elimina token y datos de localStorage, limpia el estado |

**Valor expuesto:**
```javascript
<AuthContext.Provider value={{ usuario, login, logout, authListo }}>
  {children}
</AuthContext.Provider>
```

#### Hook: `useAuth()`

```javascript
export const useAuth = () => useContext(AuthContext)
```

- Hook personalizado que cualquier componente puede usar para acceder al estado de autenticación.
- Usado en: Navbar, RutaProtegida, DashboardCliente, PerfilUsuario, TopbarCliente, ChatOT, SelectorVehiculoPerfil, AdminLayout, y todos los componentes de login/registro.

#### Estructura del objeto `usuario`

```javascript
{
  token: "jwt...",
  rol: "CLIENTE" | "ADMIN" | "TECNICO",
  nombre: "Juan Pérez",
  email: "juan@email.com",
  usuarioId: 123
}
```

---

## 8. CAPA DE SERVICIOS — CATÁLOGO COMPLETO DE ENDPOINTS

La capa de servicios organiza las llamadas al backend por dominio funcional. Cada archivo exporta funciones que retornan promesas de Axios. Todas las funciones usan la instancia `api` de `axiosInstance.js`.

### 8.1 `authService.js` — Autenticación

| Función | Método | Endpoint | Body/Params | Descripción |
|---------|--------|----------|-------------|-------------|
| `login(credenciales)` | POST | `/api/auth/login` | `{ email, password }` | Inicia sesión, retorna token + datos de usuario |
| `register(datos)` | POST | `/api/auth/register` | `{ email, password, nombre, apellido, ... }` | Registra nuevo cliente |

### 8.2 `agendamientoService.js` — Agendamiento (cliente)

| Función | Método | Endpoint | Descripción |
|---------|--------|----------|-------------|
| `crearAgendamiento(datos)` | POST | `/api/agendamientos` | Crea agendamiento, invalida caché de `/api/agendamientos/mis` |
| `obtenerMisAgendamientos()` | GET | `/api/agendamientos/mis` | Lista agendamientos del cliente autenticado |
| `obtenerDisponibilidad(fecha, servicioId)` | GET | `/api/disponibilidad` | Consulta slots disponibles para una fecha |
| `cancelarAgendamiento(id)` | DELETE | `/api/agendamientos/${id}` | Cancela agendamiento, invalida caché |
| `confirmarAgendamiento(id)` | PATCH | `/api/agendamientos/${id}/confirmar` | Confirma un agendamiento |
| `obtenerSeguimientoAgendamiento(agendamientoId)` | GET | `/api/seguimiento/agendamiento/${id}` | Obtiene detalle de seguimiento |

### 8.3 `vehiculoService.js` — Vehículos

| Función | Método | Endpoint | Descripción |
|---------|--------|----------|-------------|
| `obtenerMisVehiculos()` | GET | `/api/vehiculos/mis-vehiculos` | Lista vehículos del cliente |
| `guardarVehiculo(datos)` | POST | `/api/vehiculos` | Registra un nuevo vehículo |

### 8.4 `usuarioService.js` — Usuario

| Función | Método | Endpoint | Descripción |
|---------|--------|----------|-------------|
| `obtenerMiPerfil()` | GET | `/api/usuarios/me` | Obtiene perfil del usuario autenticado |
| `actualizarPerfil(datos)` | PUT | `/api/usuarios/me/perfil` | Actualiza teléfono, dirección, RUT, foto |
| `cambiarPassword(datos)` | PUT | `/api/usuarios/me/password` | Cambia contraseña (requiere actual + nueva) |

### 8.5 `serviciosCatalogoService.js` — Servicios (público)

| Función | Método | Endpoint | Descripción |
|---------|--------|----------|-------------|
| `obtenerServicios()` | GET | `/api/servicios` | Lista servicios activos |

### 8.6 `marcasService.js` — Marcas y Modelos

| Función | Método | Endpoint | Descripción |
|---------|--------|----------|-------------|
| `obtenerMarcas()` | GET | `/api/marcas` | Lista todas las marcas de vehículos |
| `obtenerModelos(marcaId)` | GET | `/api/modelos/marca/${id}` | Lista modelos de una marca específica |

### 8.7 `diagnosticoService.js` — IA de Diagnóstico

| Función | Método | Endpoint | Body | Descripción |
|---------|--------|----------|------|-------------|
| `diagnosticarVehiculo(datos)` | POST | `/api/ia/diagnosticar` | `{ descripcionFallo, marca, modelo, anio, kilometraje }` | Envía síntomas al backend para diagnóstico con IA |

### 8.8 `seguimientoService.js` — Seguimiento Público

| Función | Método | Endpoint | Descripción |
|---------|--------|----------|-------------|
| `buscarOT(codigo)` | GET | `/api/seguimiento/${codigo}` | Busca una OT por código (público, sin auth) |

### 8.9 `chatService.js` — Chat en Tiempo Real

| Función | Método | Endpoint | Body | Descripción |
|---------|--------|----------|------|-------------|
| `obtenerMensajesChat(codigoOt)` | GET | `/api/chat/ot/${codigoOt}` | — | Obtiene todos los mensajes de una OT |
| `enviarMensajeChat(codigoOt, contenido)` | POST | `/api/chat/ot/${codigoOt}` | `{ contenido }` | Envía un mensaje al chat de la OT |

### 8.10 `pedidoService.js` — Tienda/Pedidos

| Función | Método | Endpoint | Body | Descripción |
|---------|--------|----------|------|-------------|
| `registrarPedido(body)` | POST | `/api/tienda/pedido` | Datos del pedido | Crea un pedido de tienda |
| `obtenerReporteVentas(dias)` | GET | `/api/admin/reportes/ventas?dias=30` | — | Reporte de ventas para admin |

### 8.11 `adminService.js` — Dashboard Admin

| Función | Método | Endpoint | Descripción |
|---------|--------|----------|-------------|
| `obtenerDashboard()` | GET | `/api/admin/dashboard` | Datos agregados para KPIs y gráficos |

### 8.12 `adminAgendamientoService.js` — Gestión Admin de Agendamientos

| Función | Método | Endpoint | Body | Descripción |
|---------|--------|----------|------|-------------|
| `obtenerAgendamientosAdmin(filtros)` | GET | `/api/agendamientos` | Query params: `estado`, `fecha` | Lista con filtros |
| `obtenerAgendamientoAdmin(id)` | GET | `/api/agendamientos/${id}` | — | Detalle individual |
| `crearAgendamientoAdmin(datos)` | POST | `/api/agendamientos` | Datos completos | Creación manual por admin |
| `confirmarAgendamiento(id, tecnicoId)` | PUT | `/api/agendamientos/${id}/confirmar` | `{ tecnicoId }` | Confirmar + asignar técnico |
| `cancelarAgendamientoAdmin(id)` | PUT | `/api/agendamientos/${id}/cancelar` | — | Cancelar |
| `completarAgendamiento(id)` | PUT | `/api/agendamientos/${id}/completar` | — | Marcar como completado |

### 8.13 `adminOTService.js` — Órdenes de Trabajo Admin

| Función | Método | Endpoint | Descripción |
|---------|--------|----------|-------------|
| `obtenerOTs()` | GET | `/api/ot` | Lista todas las OTs |
| `obtenerOTDetalle(codigo)` | GET | `/api/ot/${codigo}` | Detalle completo con fases |
| `predecirTiempo(otId)` | POST | `/api/ia/predecir-tiempo?otId=${otId}` | IA predice tiempo restante |
| `obtenerPrediccion(otId)` | GET | `/api/ia/prediccion/${otId}` | Obtiene predicción existente |

### 8.14 `adminCatalogosService.js` — Catálogos

| Función | Método | Endpoint | Descripción |
|---------|--------|----------|-------------|
| `obtenerServicios()` | GET | `/api/servicios` | Servicios (read-only) |
| `obtenerCategorias()` | GET | `/api/catalogos/categorias-servicio` | Categorías (read-only) |
| `obtenerMarcas()` | GET | `/api/marcas/listar` | Marcas |
| `crearMarca(datos)` | POST | `/api/marcas/save/marca` | Crear marca |
| `obtenerModelos()` | GET | `/api/modelos/listar` | Modelos |
| `crearModelo(datos)` | POST | `/api/modelos/save/modelo` | Crear modelo |
| `obtenerNiveles()` | GET | `/api/catalogos/niveles-fidelizacion` | Niveles de fidelización |
| `obtenerServiciosTodos()` | GET | `/api/servicios/todos` | CRUD completo de servicios |
| `crearServicio(datos)` | POST | `/api/servicios` | (Admin) |
| `actualizarServicio(id, datos)` | PUT | `/api/servicios/${id}` | (Admin) |
| `eliminarServicio(id)` | DELETE | `/api/servicios/${id}` | (Admin) |
| `obtenerCategoriasAdmin()` | GET | `/api/admin/categorias-servicio` | CRUD categorías |
| `crearCategoria(datos)` | POST | `/api/admin/categorias-servicio` | (Admin) |
| `actualizarCategoria(id, datos)` | PUT | `/api/admin/categorias-servicio/${id}` | (Admin) |
| `eliminarCategoria(id)` | DELETE | `/api/admin/categorias-servicio/${id}` | (Admin) |

### 8.15 `adminClientesService.js` — Clientes Admin

| Función | Método | Endpoint | Descripción |
|---------|--------|----------|-------------|
| `obtenerClientes()` | GET | `/api/clientes` | Lista de clientes |
| `obtenerCliente(id)` | GET | `/api/clientes/${id}` | Detalle de cliente |
| `ajustarPuntos(id, puntos)` | PATCH | `/api/clientes/${id}/puntos?puntos=N` | Ajustar puntos de fidelización |

### 8.16 `adminUsuariosService.js` — Usuarios Admin

| Función | Método | Endpoint | Descripción |
|---------|--------|----------|-------------|
| `obtenerUsuarios()` | GET | `/api/usuarios` | Lista de usuarios |
| `crearUsuario(datos)` | POST | `/api/admin/usuarios` | Crear usuario |
| `actualizarUsuario(id, datos)` | PUT | `/api/admin/usuarios/${id}` | Actualizar usuario |
| `toggleUsuario(id)` | PUT | `/api/admin/usuarios/${id}/toggle` | Activar/desactivar |
| `cambiarPassword(id, nuevaPassword)` | PUT | `/api/admin/usuarios/${id}/cambiar-password` | Cambiar contraseña |

### 8.17 `adminConfiguracionService.js` — Configuración Admin

| Función | Método | Endpoint | Descripción |
|---------|--------|----------|-------------|
| `obtenerConfiguracion()` | GET | `/api/admin/configuracion` | Obtener configuración |
| `actualizarConfiguracion(datos)` | PUT | `/api/admin/configuracion` | Actualizar configuración |

### 8.18 `configuracionService.js` — BCC Admins

| Función | Método | Endpoint | Descripción |
|---------|--------|----------|-------------|
| `getBccAdmins()` | GET | `/api/admin/configuracion/bcc-admins` | Obtener correos BCC |
| `setBccAdmins(correos)` | PUT | `/api/admin/configuracion/bcc-admins` | Guardar correos BCC |

### 8.19 `tecnicoService.js` — Técnico

| Función | Método | Endpoint | Descripción |
|---------|--------|----------|-------------|
| `obtenerDashboardTecnico()` | GET | `/api/tecnicos/dashboard` | KPIs del técnico |
| `obtenerMiPerfilTecnico()` | GET | `/api/tecnicos/me` | Perfil del técnico |
| `actualizarMiPerfil(datos)` | PATCH | `/api/tecnicos/me` | Actualizar perfil |
| `toggleDisponibilidadTecnico()` | PATCH | `/api/tecnicos/disponibilidad` | Activar/desactivar disponibilidad |
| `obtenerMisOrdenesTecnico()` | GET | `/api/tecnicos/ordenes` | Órdenes asignadas |
| `obtenerDetalleOrdenTecnico(codigo)` | GET | `/api/tecnicos/ordenes/${codigo}` | Detalle de orden |
| `guardarDiagnosticoOrden(codigo, diag)` | PATCH | `/api/tecnicos/ordenes/${codigo}/diagnostico` | Guardar diagnóstico |
| `actualizarEstadoOrden(codigo, est)` | PATCH | `/api/tecnicos/ordenes/${codigo}/estado` | Cambiar estado de la OT |
| `obtenerInventarioTecnico(params)` | GET | `/api/tecnicos/inventario` | Inventario del taller |

### 8.20 `disponibilidadService.js` — Disponibilidad

| Función | Método | Endpoint | Descripción |
|---------|--------|----------|-------------|
| `obtenerDisponibilidad(fecha, servicioId)` | GET | `/api/disponibilidad` | Slots disponibles |

### 8.21 `catalogoService.js` — (Vacío)

Este archivo está vacío. Posiblemente planeado para expansión futura o su funcionalidad fue absorbida por otros servicios.

### 8.22 Patrones de Servicio — Análisis Detallado

Todos los servicios del frontend siguen un patrón consistente que merece ser analizado en detalle:

#### Patrón Base

```javascript
import api from '../api/axiosInstance'

export const nombreFuncion = (parametros) =>
  api.metodo('/api/ruta', { datos })
```

Este patrón tiene 3 características importantes:
1. **Importación única:** Todos importan la misma instancia `api`. No hay múltiples configuraciones de Axios.
2. **Funciones flecha con retorno implícito:** Cada función retorna directamente la promesa de Axios sin `async/await` innecesario (evita overhead de async cuando no se necesita transformación).
3. **Sin try/catch en el servicio:** El manejo de errores se delega al componente que llama. Esto permite que cada página decida cómo mostrar el error.

#### Variante con Invalidación de Caché

```javascript
export const crearAgendamiento = (datos) =>
  api.post('/api/agendamientos', datos)
    .then(r => { api.invalidar('/api/agendamientos/mis'); return r })
```

- Después de una mutación (POST/PUT/DELETE), se invalida la caché de la ruta GET relacionada.
- `.then(r => { ...; return r })` — siempre retorna la respuesta original para que el componente pueda leer `r.data`.
- Este patrón garantiza que la próxima lectura de datos sea fresca del backend.

#### Variante con Query Params

```javascript
export const obtenerDisponibilidad = (fecha, servicioId) =>
  api.get('/api/disponibilidad', {
    params: { fecha, servicioId }
  })
```

- Axios serializa automáticamente el objeto `params` como query string.
- Resultado: `GET /api/disponibilidad?fecha=2024-06-15&servicioId=5`.

#### Variante con Path Params

```javascript
export const obtenerOTDetalle = (codigo) =>
  api.get(`/api/ot/${codigo}`)
```

- Template literals de JavaScript para interpolación de variables en la URL.
- `codigo` se inserta directamente. Si contuviera caracteres especiales, Axios los codifica automáticamente.

#### Orden de Llamadas en un Componente Típico

```javascript
// 1. Estado inicial
const [datos, setDatos] = useState([])
const [cargando, setCargando] = useState(true)
const [error, setError] = useState(null)

// 2. Carga al montar
useEffect(() => {
  obtenerDatos()
    .then(({ data }) => setDatos(data))
    .catch(() => setError('No se pudieron cargar los datos'))
    .finally(() => setCargando(false))
}, [])

// 3. Renderizado condicional
if (cargando) return <Skeleton />
if (error) return <ErrorMensaje />
if (datos.length === 0) return <EstadoVacio />
return <Lista datos={datos} />
```

Este patrón se repite en prácticamente todas las páginas que cargan datos del backend.

#### Manejo Defensivo de Respuestas

Muchos servicios usan este patrón defensivo:

```javascript
const vehiculosRes = await obtenerMisVehiculos().catch(() => ({ data: [] }))
setVehiculos(Array.isArray(vehiculosRes.data) ? vehiculosRes.data : [])
```

- `.catch(() => ({ data: [] }))` — si falla una llamada, retorna un objeto con data vacía.
- `Array.isArray()` — verifica que la respuesta sea realmente un array antes de guardarla.
- Esto evita crashes si el backend devuelve `null`, `undefined`, o un objeto inesperado.

---

## 9. COMPONENTES COMPARTIDOS (SHARED)

### `RutaProtegida.jsx` — Guard de Seguridad

```javascript
export default function RutaProtegida({ rolesPermitidos, children }) {
  const { usuario, authListo } = useAuth()

  if (!authListo) return null   // Espera a leer localStorage
  if (!usuario) return <Navigate to="/login" replace />
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol))
    return <Navigate to="/" replace />

  return children
}
```

**Lógica de protección:**
1. Si `authListo` es `false`, renderiza `null` (nada). Esto evita el "flash" de redirección mientras se carga la sesión.
2. Si no hay usuario (`null`), redirige a `/login`.
3. Si hay usuario pero su rol no está en `rolesPermitidos`, redirige a `/` (home).
4. Si todo OK, renderiza `children` (el componente de la página).

### `CargandoAuto.jsx` — Animación de Carga

- Componente visual que muestra una animación CSS pura de un auto naranja conduciendo sobre una línea de carretera.
- Usa keyframes `@keyframes drive` y `@keyframes roadLine` definidos inline.
- Recibe prop `mensaje` (default: "Cargando...").
- Usado en: SelectorHorario, DashboardCliente, y múltiples páginas como indicador de carga.
- Dimensiones: 90x42px SVG del auto, contenedor de 224x56px.

### `HeroSection.jsx` — Cotizador Rápido en Hero

- Componente de landing que muestra un formulario de cotización con selects de marca, modelo y servicio.
- Listas hardcodeadas: 9 marcas populares + "Otro", 7 servicios comunes.
- Al enviar, navega a `/cotizador?marca=X&modelo=Y&servicio=Z` usando `URLSearchParams`.
- Contiene estadísticas (15+ años, +500 clientes, 100% garantía).
- Botones CTA: "Agendar ahora" → `/agendar`, "Ver servicios" → `/servicios`.

### `ChatOT.jsx` — Chat en Tiempo Real de Órdenes de Trabajo

- Componente de chat completo con carga de mensajes, envío y auto-scroll.
- **Props:** `codigoOt` (string), `embedded` (boolean, default=false).
- **Estado:** mensajes, texto, cargando, enviando.
- **Flujo:**
  1. `useEffect` carga mensajes al montar con `obtenerMensajesChat(codigoOt)`.
  2. Auto-scroll al final con `useRef` + `scrollIntoView`.
  3. Enviar: POST a `enviarMensajeChat`, añade respuesta al estado local.
  4. Si falla el envío, restaura el texto en el input.
- **Estilos por rol:** Cada burbuja tiene color según `ROL_STYLE`:
  - TÉCNICO: azul (`bg-blue-500/20`)
  - ADMIN: púrpura (`bg-purple-500/20`)
  - CLIENTE: naranja (`bg-orange-500/20`)
- **UX:** Enter envía (Shift+Enter para nueva línea), indicador de carga, estado vacío con mensaje.

#### Análisis del Código del Chat

```javascript
// Función auxiliar para formatear hora
function fmtHora(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}
```
- `toLocaleTimeString('es-CL', ...)` — localización chilena (formato 24h).
- Retorna `''` si `fecha` es falsy (null/undefined), evitando mostrar "Invalid Date".

```javascript
const ROL_STYLE = {
  TECNICO: { burbuja: 'bg-blue-500/20 border-blue-500/30 text-blue-100', etiqueta: 'text-blue-400' },
  ADMIN:   { burbuja: 'bg-purple-500/20 border-purple-500/30 text-purple-100', etiqueta: 'text-purple-400' },
  CLIENTE: { burbuja: 'bg-orange-500/20 border-orange-500/30 text-orange-100', etiqueta: 'text-orange-400' },
}
```
- Mapeo de rol → estilo visual de burbuja y etiqueta.
- Transparencia `/20` para que el fondo oscuro (`bg-gray-900`) se transparente.

```javascript
const enviar = async () => {
  const contenido = texto.trim()
  if (!contenido || enviando) return    // Previene envíos vacíos o duplicados
  setEnviando(true)
  setTexto('')                          // Limpia el input inmediatamente (UX fluida)
  try {
    const { data } = await enviarMensajeChat(codigoOt, contenido)
    setMensajes(prev => [...prev, data]) // Añade el mensaje del backend a la lista
  } catch {
    setTexto(contenido)                  // Restaura el texto si falla el envío
  } finally {
    setEnviando(false)
  }
}
```
- **Optimistic clear:** El input se limpia al instante (no espera al backend), dando feedback inmediato.
- **Rollback en error:** Si el POST falla, se restaura el contenido para que el usuario no pierda su mensaje.
- **Prevención de doble envío:** `if (enviando) return` bloquea submits mientras hay uno en curso.

```javascript
const onKey = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() }
}
```
- Enter envía, Shift+Enter inserta nueva línea (comportamiento estándar de apps de chat).
- `e.preventDefault()` evita que Enter inserte un salto de línea en el textarea.

**Modo embebido vs standalone:**
- `embedded={true}`: Sin header, altura más compacta (280-420px). Usado dentro de páginas de detalle.
- `embedded={false}` (default): Con header "Chat con el taller", altura mayor (320-480px). Usado como componente independiente.

**Burbujas con alineación:**
```javascript
mensajes.map(m => {
  const propio = esPropio(m)  // m.autor === usuario?.nombre
  return (
    <div className={`flex flex-col ${propio ? 'items-end' : 'items-start'}`}>
      {/* Burbuja alineada a la derecha (propio) o izquierda (otros) */}
    </div>
  )
})
```

**Indicador de carga (Loader2 con animate-spin):**
- Lucide-react `Loader2` con clase `animate-spin` de Tailwind.
- Misma animación que usan todos los spinners del proyecto.

**Estado vacío:**
- Ícono grande de `MessageCircle` en gris + texto "Aún no hay mensajes. ¡Inicia la conversación!".
- Invitación a la acción para fomentar la comunicación.

### `SelectorVehiculoPerfil.jsx` — Selector de Vehículos del Perfil

- Muestra los vehículos registrados del cliente como botones seleccionables.
- Al seleccionar uno, rellena automáticamente campos (marca, modelo, año, kilometraje, patente) en el formulario padre.
- Al volver a clickear, deselecciona y limpia los campos.
- Llama a `obtenerMisVehiculos()` y `obtenerModelos(marcaId)`.
- Solo visible si hay usuario autenticado y vehículos registrados.
- Diseño: tarjetas horizontales con borde naranja, icono de auto, patente.

---

## 10. COMPONENTES DE LAYOUT Y NAVEGACIÓN

### `Navbar.jsx` — Barra de Navegación Principal

**Estructura:** Componente fijo superior con logo, links de navegación, y menú de usuario.

**Logo:** "MecánicaHub" con un engranaje (⚙) rotado 12° en fondo naranja.

**Links por rol:**

| Rol | Links visibles |
|-----|---------------|
| Sin sesión | Inicio, Servicios, Tienda, Cotizador |
| CLIENTE | Inicio, Servicios, Tienda, Cotizador, Mis Vehículos |
| TECNICO | Inicio, Cotizador |
| ADMIN | Panel Admin, Cotizador |

**Menú de usuario (dropdown):**
- Se abre/cierra con click en avatar.
- Cierra al hacer click fuera (event listener `mousedown`).
- Muestra: Dashboard, Mi Perfil, Mis Vehículos, Agendamientos, Historial, Cerrar sesión.
- La ruta del Dashboard depende del rol: `/admin` para admin, `/cliente/dashboard` para cliente.
- Avatar: foto de perfil desde `localStorage` o avatar generado por DiceBear API.
- Escucha evento `fotoPerfilActualizada` para refrescar la foto en tiempo real.

**Botones sin sesión:** "Acceso" → `/login`, "Registro" → `/register`.

**Logout:** Llama a `logout()` del contexto, cierra dropdown, navega a `/`.

### `Footer.jsx` — Pie de Página

- Layout de 3 columnas en desktop.
- Columna 1: Nombre "MecánicaHub" + descripción.
- Columna 2: Navegación (Servicios, Cotizador, Agendar Cita).
- Columna 3: Contacto (dirección, teléfono, email).
- Copyright al final.

### `AdminLayout.jsx` — Layout del Panel Admin

**Diseño:** Sidebar izquierda + Topbar superior + Área de contenido principal.

**Sidebar:**
- Colapsable (64px cerrada ↔ 256px abierta) con botón toggle (☰/✕).
- Logo "MecánicaHub" en naranja.
- Navegación en 3 grupos:
  1. **Principal:** Dashboard, Agendamientos, Órdenes de Trabajo, Control de Calidad, Inventario, Clientes, Técnicos, Reportes, Catálogos, Usuarios
  2. **Tienda:** Mi Tienda, Ver Tienda
  3. **Sistema:** Configuración, Mi Perfil
- Cada link usa `NavLink` de React Router para resaltar la ruta activa con `bg-orange-500`.
- En modo colapsado, solo muestra iconos y separadores entre grupos.
- Footer del sidebar: nombre y rol del usuario + botón "Cerrar sesión".

**Topbar:**
- Título "Panel de Administración".
- Avatar circular con inicial del nombre.
- Altura fija de 64px.

**Contenido:** `{children}` renderizado en área con scroll.

### `SidebarCliente.jsx` — Sidebar del Portal Cliente

- Ancho fijo de 256px (`w-64`), altura mínima de pantalla completa.
- Logo "MecánicaHub" + subtítulo "Portal Cliente" en gris.
- 5 links: Dashboard, Vehículos, Agendamientos, Historial, Perfil.
- Link activo resaltado con `bg-orange-500`.
- Botón "Nueva cotización" en la parte inferior que navega a `/cotizador`.

### `TopbarCliente.jsx` — Barra Superior del Portal Cliente

- Altura 64px, fondo blanco, borde inferior.
- Título "Portal de Cliente" clickeable → navega al dashboard.
- **Buscador:** Input con lupa que busca entre agendamientos por patente o ID. Cachea resultados en `sessionStorage`.
- **Campana de notificaciones:** Dropdown con las próximas 3 citas.
- **Engranaje:** Navega a perfil.
- **Avatar:** Dropdown con opciones: Inicio, Dashboard, Mi perfil, Mis vehículos, Agendamientos, Historial, Cerrar sesión.
- Escucha `fotoPerfilActualizada` para refrescar avatar.

### `SidebarTecnico.jsx`

- Similar a SidebarCliente pero con links: Dashboard, Órdenes, Inventario, Perfil.
- Subtítulo "Portal Técnico".

### `TopbarTecnico.jsx`

- Similar a TopbarCliente con título "Portal de Técnico".
- Toggle de disponibilidad (activo/inactivo) con switch visual.
- Notificaciones y perfil básico.

---

## 11. PÁGINAS PÚBLICAS — LA CARA VISIBLE DEL SISTEMA

### `Home.jsx` — Landing Page

La página más compleja del frontend público. ~350 líneas de JSX.

**Secciones:**

1. **Hero** — Imagen de fondo de taller mecánico con overlay oscuro. Título "TU VEHÍCULO EN MANOS EXPERTAS". Cotizador rápido integrado con selects de marca/modelo y botón "Obtener estimación". Botones secundarios: "Agendar ahora", "Ver servicios".

2. **Banda de marcas** — Lista horizontal: Toyota, Hyundai, Nissan, Ford, Chevrolet, Kia, Mazda, Honda, Mitsubishi.

3. **Servicios destacados** — Grid de 6 tarjetas con imágenes de Unsplash rotativas. Cada tarjeta muestra: categoría, nombre, descripción, precio, botones "Cotizar" y "Agendar". Carga asíncrona desde `obtenerServicios()` con skeleton loading.

4. **¿Por qué elegirnos?** — 4 razones con iconos (Award, ShieldCheck, Clock, Zap): experiencia, garantía, puntualidad, diagnóstico gratuito.

5. **Proceso en 3 pasos** — 1. Elige tu servicio, 2. Reserva tu hora, 3. Trae tu vehículo. Visualización con iconos numerados.

6. **Testimonios** — 3 tarjetas con estrellas (5/5), cita textual, nombre del cliente, badge "Cliente verificado".

7. **CTA + Contacto** — Llamada a la acción con datos de contacto (dirección, teléfono, horarios).

**Integración con backend:** Carga marcas (`obtenerMarcas`), modelos (`obtenerModelos`), y servicios (`obtenerServicios`) para poblar el cotizador rápido y la sección de servicios.

### `Login.jsx` — Inicio de Sesión

- Usa el componente `InicioSesion` (reutilizable para login y registro).
- Estado local: `email`, `password`, `error`, `cargando`.
- **Flujo:**
  1. Usuario ingresa credenciales y hace submit.
  2. `login({ email, password })` → backend retorna `{ token, rol, nombre, email, usuarioId }`.
  3. `loginCtx(token, datos)` guarda en localStorage y contexto.
  4. Redirección según rol: ADMIN → `/admin`, TECNICO → `/tecnico/perfil`, CLIENTE → `/cliente/dashboard`.
- En caso de error: mensaje "Credenciales incorrectas".

### `Register.jsx` — Registro

- Usa `InicioSesion` con `esRegistro={true}`.
- Campos extra: nombre, apellido, teléfono, dirección, RUT.
- **Flujo:**
  1. `register({ email, password, nombre, apellido, telefono, direccion, rut, rolNombre: 'CLIENTE' })`.
  2. Si éxito, muestra pantalla de "Revisa tu correo" con enlace a login.
  3. Si error, muestra mensaje del backend o genérico.
- El registro siempre crea usuarios con rol `CLIENTE`.

### `VerificarEmail.jsx` — Verificación por Token

- Lee el parámetro `token` de la query string con `useSearchParams()`.
- **Estados:** `cargando` → `ok` → `error`.
- **Flujo:**
  1. GET `/api/auth/verificar?token=${token}`.
  2. Si 200 → pantalla verde "¡Cuenta verificada!" con botón a login.
  3. Si error → pantalla roja "Enlace inválido" con botón a registro.

### `Servicios.jsx` — Catálogo de Servicios

- **Filtros:** 7 categorías (TODOS, MANTENCIÓN, DIAGNÓSTICO, FRENOS, SUSPENSIÓN, MOTOR, ELÉCTRICO).
- **Buscador:** Input de texto con lupa SVG inline.
- **Sistema de filtrado:** La función `mostrarServicio()` hace matching por palabras clave en el texto completo (categoría + nombre + descripción).
- **Imágenes:** 15 imágenes locales importadas como módulos. La función `obtenerImagenServicio()` mapea palabras clave del nombre del servicio a la imagen correspondiente.
- **Tarjetas:** Cada servicio muestra imagen, categoría badge, nombre, descripción, precio, botones "Cotizar" y "Agendar".
- **Navegación:** "Cotizar" → `/cotizador` con state: `{ servicio, precio }`. "Agendar" → `/agendar` con state completo.

### `Tienda.jsx` y Flujo de Compra

- Tienda: grid de productos con imágenes de `assets/tienda/`.
- Checkout: formulario de datos de envío y pago.
- ConfirmacionCompra: pantalla de éxito post-compra con resumen del pedido.
- Usa `registrarPedido(body)` → POST `/api/tienda/pedido`.

### `Seguimiento.jsx` — Consulta Pública de OT

- Input para ingresar código de OT.
- Llama a `buscarOT(codigo)` → GET `/api/seguimiento/${codigo}`.
- Muestra resultado con `LineaTiempoOT` si encuentra la orden.
- El código se sanitiza: `trim().toUpperCase()`.

### `Perfil.jsx` — Perfil Público (heredado)

- Página de perfil usando `PerfilUsuario` para usuarios que lleguen a `/perfil` sin portal específico.

---

## 12. FLUJO DE AGENDAMIENTO — PASO A PASO

El agendamiento es uno de los flujos más complejos. Implementado como wizard de 3 pasos.

### Página principal: `Agendamiento.jsx`

- Recibe datos del vehículo y servicios vía `useLocation().state` (enviados desde el cotizador o página de servicios).
- Si no hay servicios seleccionados, redirige a `/servicios`.
- Estado del paso actual: `paso` (1, 2, o 3).
- Layout: grid de 10 columnas (7 para el paso actual, 3 para el resumen lateral).

### Componentes del Flujo

#### `BarraProgreso.jsx`

```javascript
const PASOS = [
  { numero: 1, label: 'Agenda'    },
  { numero: 2, label: 'Confirmar' },
  { numero: 3, label: 'Pago'      },
]
```

- Muestra 3 círculos numerados conectados por líneas.
- El paso actual y los completados se muestran en naranja.
- Línea de conexión entre pasos completados en naranja.

#### Paso 1: `PasoFechaHora.jsx`

- **Calendario:** Componente `Calendario` — calendario mensual con navegación.
  - Calcula días del mes, offset del primer día, días pasados (deshabilitados).
  - Hoy resaltado con borde naranja.
  - Día seleccionado con fondo naranja.
  - Leyenda: Seleccionado, Hoy, Ocupado.

- **SelectorHorario:** Componente `SelectorHorario`.
  - Al seleccionar fecha, llama `obtenerDisponibilidad(fecha, servicioId)`.
  - Muestra slots como botones en grid de 2 columnas.
  - Slots ocupados: gris claro, no clickeables.
  - Slot seleccionado: fondo naranja.
  - Mientras carga: animación `CargandoAuto`.

- **Botón "Continuar":** Solo habilitado si hay fecha Y hora seleccionadas.
  - Si el usuario YA está autenticado → salta al paso 3.
  - Si NO está autenticado → va al paso 2 (login/registro).

#### Paso 2: `PasoCuenta.jsx`

- Dos tabs: "Iniciar Sesión" y "Crear Cuenta".
- **Tab Login:**
  - Formulario email + contraseña.
  - Toggle para mostrar/ocultar contraseña.
  - Llama a `api.post('/api/auth/login', { email, password })` directamente (sin usar authService).
  - Al hacer login exitoso → `loginCtx()` + `onContinuar()` (avanza al paso 3).
  - Manejo de error: 401 = "Correo o contraseña incorrectos".

- **Tab Crear Cuenta:**
  - Formulario completo: nombre, apellido, email, teléfono, contraseña, repetir contraseña.
  - Validación de coincidencia de contraseñas en tiempo real (borde rojo/verde).
  - Llama a `api.post('/api/auth/register-con-vehiculo', payload)`.
  - El payload incluye datos del vehículo (patente, marcaId, modeloId, anio, kilometraje) si vienen del cotizador.
  - Al crear cuenta exitosamente, muestra pantalla "¡Casi listo! Revisa tu correo".
  - El enlace de verificación expira en 24 horas.

#### Paso 3: `PasoConfirmacion.jsx`

- **Selección de vehículo:**
  - Carga `obtenerMisVehiculos()`.
  - Si el vehículo del cotizador tiene patente, busca coincidencia en los vehículos guardados.
  - **Detección de conflicto:** Si misma patente pero datos distintos (marca/modelo/año), muestra un banner amarillo de advertencia y ambas opciones (datos del cotizador vs datos del perfil).
  - Si el vehículo del cotizador no está guardado, se añade como opción "Ingresado en el cotizador — se guardará al confirmar".

- **Confirmación:**
  - Si se selecciona `__cotizador__`, primero guarda el vehículo (`guardarVehiculo()`), luego crea el agendamiento.
  - Si hay conflicto de datos, usa el ID del vehículo ya guardado (misma patente).
  - `crearAgendamiento({ idVehiculo, idServicios, fechaInicio: hora, notaCliente: null })`.
  - Al éxito: pantalla verde "¡Agendamiento Confirmado!" con check circle.

#### `ResumenAgendamiento.jsx` — Panel Lateral

- Sticky (posición fija al hacer scroll).
- Muestra: vehículo, servicios seleccionados (con precios), fecha y hora, total estimado con IVA.
- Información de sucursal (dirección).
- Diseño: fondo gris oscuro (`bg-gray-900`), texto blanco, acentos naranjas.

---

## 13. SISTEMA COTIZADOR — MANUAL E INTELIGENCIA ARTIFICIAL

### `Cotizador.jsx` — Página Principal

- **Dos modos de operación:**
  - `modo = 'manual'`: Selección tradicional de servicios del catálogo.
  - `modo = 'ia'`: Diagnóstico automático con IA basado en descripción de falla.

- **Estado del vehículo:** Proviene de `useLocation().state?.vehiculo` (enviado desde Home o desde página de servicios), o valores vacíos.
- **Grid layout:** 10 columnas (7 para el contenido, 3 para el resumen lateral).

### `HeroCotizador.jsx` — Selector de Modo

- Fondo: imagen `/img/Cotizador/herosection_cotizador.jpg` con overlay oscuro.
- Dos botones grandes:
  - "Cotizador Manual" (icono calculadora)
  - "Cotizador Inteligente IA" (icono robot)
- El modo activo se resalta con borde naranja.

### Modo Manual: `ResumenServicios.jsx`

- **Selector de vehículo:** Usa `SelectorVehiculoPerfil` si el usuario está autenticado. Campos manuales: marca, modelo, año, kilometraje, patente.
- **Lista de servicios:** Carga todos los servicios desde `obtenerServicios()`. Cada servicio es clickeable para añadir/quitar de la selección.
- Muestra precio de cada servicio y total acumulado.

### Modo IA: `DiagnosticoIA.jsx` — Análisis Detallado

El componente `DiagnosticoIA.jsx` (~246 líneas) implementa la interfaz de diagnóstico por IA.

**Estado local:**
```javascript
const [vehiculo, setVehiculo] = useState({ marcaId: '', marca: '', modeloId: '', modelo: '', anio: '', kilometraje: '', patente: '' })
const [descripcionFallo, setDescripcionFallo] = useState('')
const [sintomas, setSintomas] = useState([])         // Lista de síntomas seleccionados
const [cargando, setCargando] = useState(false)
const [resultado, setResultado] = useState(null)     // Respuesta del backend
const [error, setError] = useState('')
```

**Secciones del componente:**

1. **Selector de vehículo:**
   - `SelectorVehiculoPerfil` — si el usuario está autenticado, muestra sus vehículos guardados.
   - Campos manuales: Marca (select de `obtenerMarcas()`), Modelo (dependiente de marca), Año (input numérico), Kilometraje (input numérico), Patente (input texto).

2. **Síntomas frecuentes (checkboxes):**
   - Lista predefinida de síntomas comunes:
     - "Ruido al frenar"
     - "Vibración al volante"
     - "Pérdida de potencia"
     - "Humo del escape"
     - "Testigo en tablero"
     - "Fuga de líquido"
     - "No enciende"
     - "Sobrecalentamiento"
     - "Aire acondicionado no enfría"
     - "Dirección dura"
   - Selección múltiple con checkboxes estilizados.

3. **Descripción de falla (textarea):**
   - Campo de texto libre para describir el problema con detalle.
   - Placeholder: "Describe el problema con tu vehículo... (Ej: El motor hace un ruido extraño al acelerar después de los 60 km/h)"
   - Mínimo de caracteres: 10 (validación antes de enviar).

4. **Botón "Analizar con IA":**
   - Solo habilitado si hay descripción de falla (mín. 10 caracteres) o síntomas seleccionados.
   - Al hacer clic, construye el payload:
     ```javascript
     const payload = {
       descripcionFallo: descripcionFallo,
       sintomas: sintomas,
       marca: vehiculo.marca,
       modelo: vehiculo.modelo,
       anio: vehiculo.anio ? Number(vehiculo.anio) : null,
       kilometraje: vehiculo.kilometraje ? Number(vehiculo.kilometraje) : null,
     }
     ```
   - Llama a `diagnosticarVehiculo(payload)` → POST `/api/ia/diagnosticar`.
   - Mientras carga: botón deshabilitado con "Analizando..." + `Loader2 animate-spin`.

5. **Resultados del diagnóstico:**
   - **Problema detectado:** Descripción del posible problema identificado por la IA.
   - **Servicios recomendados:** Lista de servicios con:
     - Nombre del servicio.
     - Precio estimado.
     - Nivel de urgencia (Alta, Media, Baja) con badge de color.
     - Descripción breve de por qué se recomienda.
   - **Match con catálogo local:**
     ```javascript
     resultado?.serviciosRecomendados?.map(s => {
       const match = catalogoServicios.find(c =>
         c.nombre?.toLowerCase().includes(s.nombre?.toLowerCase()) ||
         s.nombre?.toLowerCase().includes(c.nombre?.toLowerCase())
       )
       return {
         id: match?.id ?? null,    // ID real del catálogo, o null si no hay match
         nombre: s.nombre,
         precioBase: s.precioBase,
       }
     })
     ```
     - Busca coincidencia por nombre entre lo que la IA recomienda y los servicios reales del catálogo.
     - Si no hay match, `id` queda `null` (el resumen lateral muestra el servicio sin poder agendarlo directamente).
   - **Nota de advertencia:** "* Este es un diagnóstico preliminar. Se requiere revisión presencial para confirmar."

**Manejo de estados:**
```jsx
{cargando && (
  <div className="text-center py-12">
    <CargandoAuto mensaje="Analizando síntomas con inteligencia artificial..." />
    <p className="text-gray-400 text-xs mt-4">Esto puede tomar unos segundos</p>
  </div>
)}

{error && (
  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
    <AlertTriangle size={16} className="inline mr-2" />
    {error}
  </div>
)}

{resultado && !cargando && (
  <div className="space-y-4">
    {/* Resultados del diagnóstico */}
  </div>
)}

{!resultado && !cargando && !error && (
  <div className="text-center py-12 text-gray-400">
    <Bot size={48} className="mx-auto mb-4 opacity-30" />
    <p>Describe los síntomas de tu vehículo y nuestra IA te recomendará los servicios necesarios</p>
  </div>
)}
```

### Flujo de Tienda y Checkout — Análisis Detallado

#### `Tienda.jsx` — Catálogo de Productos

- **Grid de productos:** Similar a Servicios.jsx pero con productos de `assets/tienda/`.
- **Productos disponibles:**
  - Aceite de motor
  - Batería
  - Filtro de aceite
  - Filtro de aire
  - Pastillas de freno
  - Kit de herramientas
  - Plumillas limpiaparabrisas
  - Refrigerante
  - Shampoo para autos
- **Tarjeta de producto:** Imagen, nombre, descripción, precio, stock disponible, botón "Agregar al carrito".
- **Carrito de compras:** Estado local con `useState([])`, ícono de carrito en la esquina con contador.
- **Resumen del carrito:** Panel lateral o modal con lista de productos, cantidades, subtotal, total.

#### `Checkout.jsx` — Proceso de Compra

- **Formulario de datos del comprador:**
  - Nombre completo
  - Email
  - Teléfono
  - Dirección de despacho
  - Comuna/Región
- **Método de pago:** (Simulado) — Selección de tipo de pago (transferencia, débito, crédito).
- **Resumen del pedido:** Productos, cantidades, subtotal, costo de envío, total.
- **Botón "Confirmar compra":** `registrarPedido(body)` → POST `/api/tienda/pedido`.
  - Body incluye: datos del comprador, productos (IDs + cantidades), total.
  - Al éxito: redirección a `/tienda/confirmacion`.

#### `ConfirmacionCompra.jsx` — Pantalla de Éxito

- **Animación de confirmación:** Check verde grande.
- **Número de pedido:** ID generado por el backend.
- **Resumen de la compra:** Productos, total, dirección de envío.
- **Tiempo estimado de entrega:** "2-3 días hábiles".
- **Botón "Seguir comprando"** → `/tienda`.
- **Botón "Ir al inicio"** → `/`.

### `Perfil.jsx` (Público) — Página de Perfil Genérica

Esta página en `/perfil` es un punto de entrada genérico. Renderiza `PerfilUsuario` sin layout específico de cliente/admin/técnico. Útil para:
- Usuarios que navegan directamente a `/perfil`.
- Redirecciones desde otras partes del sistema.
- Posiblemente en desuso o puente hacia los perfiles específicos de cada rol.

```jsx
<>
  <Navbar />
  <div className="max-w-4xl mx-auto px-6 py-8">
    <PerfilUsuario />
  </div>
  <Footer />
</>
```

---

## 14B. CICLO DE VIDA DE UN VEHÍCULO EN EL SISTEMA

### Registro de Vehículo

1. **Durante el registro:** `TabCrearCuenta` envía `POST /api/auth/register-con-vehiculo` con datos del vehículo incluidos.
2. **Desde el portal:** `MisVehiculos` → botón "Agregar Vehículo" → formulario → `guardarVehiculo(datos)` → `POST /api/vehiculos`.
3. **Durante agendamiento:** `PasoConfirmacion` → si el vehículo del cotizador no existe, lo crea antes de agendar.

### Datos de un Vehículo

```javascript
{
  id: 42,
  patente: "ABCD12",
  marcaVehiculoId: 5,         // FK a tabla de marcas
  modeloVehiculoId: 12,       // FK a tabla de modelos
  marcaNombre: "Toyota",      // Join con marcas
  modeloNombre: "RAV4",       // Join con modelos
  anio: 2022,
  kilometraje: 45000,
  kilometrajeIngreso: 45000,  // KM al momento de registrar
  usuarioId: 100              // Dueño del vehículo
}
```

### Asociación Vehículo-Servicio

Cada agendamiento y OT está vinculado a:
1. Un **vehículo** (por `idVehiculo`).
2. Uno o más **servicios** (por `idServicios`).
3. Un **cliente** (dueño del vehículo).
4. Opcionalmente un **técnico** asignado.

Esta estructura permite trazabilidad completa: dado un vehículo, se puede ver todo su historial de servicios, repuestos usados, técnicos que lo atendieron, y costos incurridos.

---

## 14. PORTAL DEL CLIENTE — DASHBOARD Y FUNCIONALIDADES

### `DashboardCliente.jsx` — Página Principal del Cliente

**Layout:** SidebarCliente + TopbarCliente + contenido principal.

**Carga de datos:**
```javascript
const [vehiculos, setVehiculos] = useState([])
const [agendamientos, setAgendamientos] = useState([])
// Carga en paralelo con .catch(() => ({ data: [] }))
```

**Secciones:**

1. **Banner de bienvenida** — "¡Bienvenido de vuelta, {nombre}!" con contadores: vehículos, citas, puntos (1250 fijos).
2. **KPIs en grid de 4 columnas:**
   - Próxima cita (fecha formateada con `toLocaleDateString('es-CL')`)
   - Vehículos registrados (count)
   - Puntos acumulados
   - Servicios (count de agendamientos)
3. **OT Activa Ahora** — Muestra el primer agendamiento activo con: nombre del servicio, marca/modelo, patente, técnico asignado.
4. **Próximos agendamientos** — Lista de hasta 3 agendamientos con icono de campana.

### `MisVehiculos.jsx` — Gestión de Vehículos

- Lista de vehículos del cliente con tarjetas.
- Botón para agregar nuevo vehículo (abre modal o formulario inline).
- Cada vehículo muestra: marca, modelo, año, patente, kilometraje.
- Navegación a `/cliente/vehiculo/:id` para ver detalle.

### `DetalleVehiculo.jsx`

- Muestra información completa de un vehículo.
- Historial de servicios realizados en ese vehículo.
- Opción para editar datos del vehículo.

### `Agendamientos.jsx` (Cliente)

- Lista de agendamientos del cliente con estado (pendiente, confirmado, cancelado, completado).
- Cada agendamiento muestra: fecha, servicio, vehículo, estado (badge de color).
- Navegación a `/cliente/seguimiento/:agendamientoId` para seguimiento detallado.

### `Historial.jsx` — Historial de Servicios

- Registro histórico de todos los servicios realizados al cliente.
- **Columnas:** Fecha, Servicio realizado, Vehículo (marca/modelo/patente), Costo total, Estado.
- **Filtro por vehículo:** Select con los vehículos del cliente para ver historial por auto.
- **Filtro por fecha:** Rango de fechas para acotar la búsqueda.
- **Paginación:** Si el historial es extenso, se pagina para no saturar la UI.
- **Detalle expandible:** Click en una fila muestra diagnóstico, repuestos usados, fotos del servicio.
- **Uso de `LineaTiempoOT`:** Cada servicio completado muestra sus fases en miniatura.
- **Descarga de comprobantes:** Posiblemente genera PDF con el detalle del servicio para el cliente.
- **Datos cargados desde:** Probablemente un endpoint como `/api/clientes/me/historial` o similar.

### `SeguimientoDetalle.jsx` — Seguimiento Detallado de un Agendamiento

- **Parámetro de ruta:** `agendamientoId` (desde `/cliente/seguimiento/:agendamientoId`).
- **Carga de datos:** `obtenerSeguimientoAgendamiento(agendamientoId)` → GET `/api/seguimiento/agendamiento/${id}`.
- **Secciones:**
  1. **Información del agendamiento:** Fecha, hora, servicio, vehículo.
  2. **Estado actual:** Badge grande con el estado (PENDIENTE, CONFIRMADO, EN_PROCESO, COMPLETADO).
  3. **Línea de tiempo:** `LineaTiempoOT` con las fases del servicio.
  4. **Técnico asignado:** Nombre y especialidad del técnico.
  5. **Chat integrado:** `ChatOT` para comunicarse con el taller en tiempo real.
  6. **Evidencia fotográfica:** Fotos subidas por el técnico durante el servicio.
  7. **Costo estimado:** Desglose de costos (mano de obra + repuestos).
- **Acciones disponibles:**
  - Cancelar agendamiento (si está PENDIENTE).
  - Ver historial del vehículo.
  - Contactar al taller.
- Esta página le da al cliente visibilidad total del estado de su servicio, fomentando confianza y transparencia.

### `Perfil.jsx` (Cliente) — Edición de Perfil

- **Layout:** `SidebarCliente` + `TopbarCliente` + `PerfilUsuario`.
- **Secciones del perfil:**
  1. **Cabecera:** Banner personalizable + avatar con inicial + nombre + email + rol "CLIENTE".
  2. **Datos de cuenta (solo lectura):** Nombre completo, correo, rol.
  3. **Datos del perfil (editables):** Teléfono, dirección, RUT.
     - Botón "Editar" activa modo edición.
     - Validación de campos (teléfono debe ser numérico, RUT con formato chileno).
     - Guardar → `actualizarPerfil(datos)` → PUT `/api/usuarios/me/perfil`.
  4. **Cambiar contraseña:**
     - Campos: contraseña actual, nueva, confirmar nueva.
     - Toggle para mostrar/ocultar cada campo.
     - Validaciones: mínimo 8 caracteres, coincidencia de nueva + confirmación.
     - Guardar → `cambiarPassword(datos)` → PUT `/api/usuarios/me/password`.
  5. **Cambiar foto de portada:**
     - Input file oculto + botón "Cambiar portada".
     - `FileReader.readAsDataURL()` convierte la imagen a base64.
     - Se guarda en localStorage (`fotoBannerPerfil`).
     - Dispara evento `bannerPerfilActualizado` para refrescar en otros componentes.
- **Estados de feedback:**
  - `okPerfil`: "Perfil actualizado correctamente" (verde, 3s).
  - `errorPerfil`: Mensaje de error del backend (rojo).
  - `okPass`: "Contraseña actualizada correctamente" (verde, 3s).
  - `errorPass`: "La contraseña actual es incorrecta" o mensaje del backend.

### `Cliente/Dashboard.jsx` — Redirección al Dashboard

Este archivo es mínimo (18 líneas), probablemente redirige a `DashboardCliente`:

```jsx
import DashboardCliente from '../../components/cliente/DashboardCliente'
export default function Dashboard() {
  return <DashboardCliente />
}
```

Actúa como wrapper para mantener consistencia en la estructura de rutas (`/cliente/dashboard` → `DashboardCliente`).

---

## 15. PORTAL DEL ADMINISTRADOR — PANEL DE CONTROL

### `Dashboard.jsx` (Admin)

El dashboard del admin es la página más rica en visualizaciones. Carga datos desde `obtenerDashboard()` → GET `/api/admin/dashboard`.

**Estructura de la respuesta del backend:**
```javascript
{
  agendamientosHoy: 12,           // Número de citas para hoy
  agendamientosPendientes: 5,     // Citas sin confirmar
  tecnicosDisponibles: 3,         // Técnicos marcados como disponibles
  totalClientes: 1450,            // Total de clientes registrados
  agendamientosPorEstado: {       // Conteo por estado para gráfico de barras
    PENDIENTE: 5,
    CONFIRMADO: 8,
    EN_PROCESO: 3,
    COMPLETADO: 25,
    CANCELADO: 2
  },
  serviciosMasSolicitados: [      // Top 5 para gráfico de dona
    { nombre: "Mantención 5.000km", conteo: 45 },
    { nombre: "Cambio de frenos", conteo: 32 },
    // ...
  ],
  ultimosAgendamientos: [         // Últimos 10 para la tabla
    {
      id: 123,
      clienteNombre: "Juan Pérez",
      servicioNombre: "Mantención 10.000km",
      vehiculoPatente: "ABCD12",
      estado: "CONFIRMADO"
    }
  ],
  proximosHoy: [                  // Citas de hoy con hora
    {
      id: 456,
      clienteNombre: "María Soto",
      servicioNombre: "Diagnóstico",
      vehiculoPatente: "XYZX99",
      fechaInicio: "2024-06-15T10:30:00",
      estado: "CONFIRMADO"
    }
  ]
}
```

**KPIs (4 tarjetas):**
- **Agendamientos hoy** (icono `CalendarDays`, naranja) — `datos.agendamientosHoy`
- **Agendamientos pendientes** (icono `Clock`, amarillo) — `datos.agendamientosPendientes`
- **Técnicos disponibles** (icono `Wrench`, verde) — `datos.tecnicosDisponibles`
- **Total clientes** (icono `Users`, azul) — `datos.totalClientes`

Cada KPI es una tarjeta con:
- Ícono en círculo de 48x48px con fondo `bg-gray-800`.
- Etiqueta en `text-xs text-gray-500 uppercase`.
- Valor en `text-3xl font-black text-white`.

**Gráficos (Chart.js):**

1. **Gráfico de Barras — Agendamientos por estado:**
   - Labels: `Object.keys(datos.agendamientosPorEstado)`.
   - Data: `Object.values(datos.agendamientosPorEstado)`.
   - Colores: naranja (PENDIENTE), azul (CONFIRMADO), verde (COMPLETADO), amarillo (EN_PROCESO), rojo (CANCELADO).
   - Ocupa 2/3 del ancho en desktop (`lg:col-span-2`).
   - Altura fija de 208px (`h-52`).
   - Opciones: ticks grises, grid gris oscuro, leyenda con fuente tamaño 11.

2. **Gráfico de Dona — Top 5 servicios más solicitados:**
   - Labels: nombres de los servicios.
   - Data: conteo de cada servicio.
   - Colores: naranja, azul, verde, amarillo, púrpura.
   - Ocupa 1/3 del ancho.
   - Leyenda en posición `bottom` con padding 12px.

**Renderizado condicional de gráficos:**
```javascript
const barData = datos ? {
  labels: Object.keys(datos.agendamientosPorEstado),
  datasets: [{ ... }],
} : null

// En JSX:
{barData ? (
  <div className="h-52">
    <Bar data={barData} options={chartOptions} />
  </div>
) : (
  <p className="text-gray-600 text-sm text-center py-10">Sin datos</p>
)}
```
- Si `datos` es null (cargando), los gráficos no se renderizan.
- Si los arrays están vacíos, muestra "Sin datos".

**Tablas:**

1. **Últimos agendamientos** — Tabla HTML con columnas: Cliente, Servicio, Patente, Estado.
   - Estados con badges coloreados (`EstadoBadge`).
   - Hover con `hover:bg-gray-800/50`.

2. **Próximos hoy** — Lista vertical de tarjetas.
   - Cada tarjeta: barra naranja vertical + nombre cliente + servicio/patente + hora + estado badge.
   - Si no hay agendamientos: "No hay agendamientos próximos hoy".

**Función `formatFecha`:**
```javascript
function formatFecha(str) {
  if (!str) return '—'
  const d = new Date(str.includes('Z') || str.includes('+') ? str : str + 'Z')
  if (isNaN(d.getTime())) return str
  return d.toLocaleString('es-CL', {
    timeZone: 'America/Santiago',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
```
- Detecta si el string ya tiene timezone (`Z` o `+`).
- Si no tiene, asume UTC añadiendo `Z`.
- Si el parseo falla, retorna el string original (defensivo).
- Formatea en timezone chileno (`America/Santiago`).

**Skeleton loading del Dashboard:**
```jsx
{cargando && (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-800 rounded-2xl animate-pulse" />)}
  </div>
)}
```

**Registro de Chart.js:**
```javascript
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend)
```
- Solo se registran los elementos necesarios (tree-shaking manual de Chart.js).
- `ArcElement` para Doughnut, `BarElement` para Bar, `CategoryScale`/`LinearScale` para ejes.

### `Agendamientos.jsx` (Admin)

**Funcionalidades:**
- Tabla con todos los agendamientos (cliente, vehículo, servicio, fecha/hora, estado).
- **Filtros:** Por estado (select) y por fecha (date input).
- **Acciones por fila:**
  - 👁 Ver detalle (modal con todos los campos).
  - ✓ Confirmar (solo PENDIENTE) → modal con selector de técnico.
  - ✕ Cancelar (no COMPLETADO ni CANCELADO) → modal de confirmación.
- **Crear agendamiento manual:** Modal con formulario (patente, servicio, fecha, hora, nota).
- **Confirmar con asignación:** Al confirmar, carga lista de técnicos (`obtenerUsuarios()` filtrado por rol TECNICO), el admin selecciona uno, y se genera la OT automáticamente.

**Estados y sus colores:**
| Estado | Color |
|--------|-------|
| PENDIENTE | Amarillo |
| CONFIRMADO | Azul |
| COMPLETADO | Verde |
| CANCELADO | Rojo |

**Mensajes de feedback:** Toast temporal (3.5s) para éxito/error en cada acción.

### `OrdenesTrabajo.jsx` (Admin)

**KPIs:** Total OTs, Activas, En proceso, Completadas.

**Filtros:** Búsqueda por texto (código, cliente, patente, técnico) + filtro por estado.

**Tabla:** Código OT, Estado (badge), Cliente, Patente, Técnico, Servicio, Inicio, Total ($), Acción (👁).

**Modal de detalle:**
- Info del cliente, vehículo, técnico, servicio, fechas.
- Costos: mano de obra, repuestos, total.
- Diagnóstico (si existe).
- **Línea de tiempo** (`LineaTiempoOT`) con fases y predicción.
- **Botón "Predecir IA":** `predecirTiempo(otId)` + `obtenerPrediccion(otId)` → muestra tiempo estimado, hora de entrega, confianza.

**Estados de OT:**
| Estado | Color |
|--------|-------|
| ACTIVA | Gris |
| EN_PROCESO | Naranja |
| CONTROL_CALIDAD | Púrpura |
| LISTA_ENTREGA | Azul |
| COMPLETADA | Verde |

### `Inventario.jsx` (Admin)

**CRUD completo de productos.**

**Filtros:** Todos, Activos, Inactivos, Stock bajo, Sin stock.

**Buscador:** Con debounce de 350ms (no satura el backend mientras el usuario escribe).

**Columnas de la tabla:** Nombre, SKU, Categoría, Marca, Precio costo, Precio venta, Stock, Estado (toggle Active/Inactive).

**Acciones:**
- ✏️ Editar (modal con formulario completo).
- 🗑️ Eliminar (con confirmación).
- 📦 Ajustar stock (modal con tipo ENTRADA/SALIDA, cantidad, motivo).
- 📋 Historial de movimientos por producto.

**Formulario de creación/edición:**
- Campos: nombre, SKU, descripción, precioCosto, precioVenta, stockActual, stockMinimo, ubicacionBodega, categoriaId, marcaId.
- Validación de campos requeridos.

### `Catalogos.jsx`

Gestión de:
- **Servicios:** CRUD (obtenerServiciosTodos, crearServicio, actualizarServicio, eliminarServicio).
- **Categorías de servicio:** CRUD.
- **Marcas de vehículo:** Listar + crear.
- **Modelos de vehículo:** Listar + crear.
- **Niveles de fidelización:** Solo lectura.

### `Usuarios.jsx`

- Tabla de todos los usuarios del sistema.
- Acciones: crear, editar, toggle activo/inactivo, cambiar contraseña.
- Filtro por rol posiblemente.

### `Configuracion.jsx`

- Configuración general del sistema.
- Incluye `BccAdminsConfig`:
  - Lista de correos BCC.
  - Input + botón "Agregar" con validación de email (regex).
  - Botón "Guardar cambios" con feedback.
  - Eliminar correos individuales.

### `ControlCalidad.jsx`

- Panel para revisar OTs completadas.
- Verificación de calidad de trabajos realizados.
- Posiblemente checklists o formularios de inspección.

### `Reportes.jsx` — Reportes y Exportaciones

- **Reporte de ventas:** Llama a `obtenerReporteVentas(dias)` → GET `/api/admin/reportes/ventas?dias=30`.
  - Recibe datos de ventas de los últimos N días (por defecto 30).
  - Posiblemente incluye gráficos de tendencia y tabla de ventas por día/semana.
- **Exportación a PDF:** Usa la librería `jspdf` (^4.2.1) para generar reportes en PDF.
  - `new jsPDF()` crea un documento.
  - `doc.text()`, `doc.autoTable()` para contenido tabular.
  - `doc.save('reporte.pdf')` para descargar.
- **Exportación a Excel:** Usa la librería `xlsx` (^0.18.5) para generar archivos Excel.
  - `XLSX.utils.json_to_sheet(datos)` convierte JSON a hoja de cálculo.
  - `XLSX.utils.book_new()` + `XLSX.utils.book_append_sheet()` crea el libro.
  - `XLSX.writeFile(workbook, 'reporte.xlsx')` para descargar.
- **Filtros:** Selector de rango de fechas, tipo de reporte (ventas, servicios, técnicos).
- Ambos formatos de exportación permiten al admin generar documentación para contabilidad o gerencia.

### `ControlCalidad.jsx` — Verificación de Calidad

- **Panel de control de calidad** para revisar órdenes de trabajo completadas.
- **Checklist de inspección:** Posiblemente formulario con items a verificar:
  - Estado general del vehículo post-servicio.
  - Prueba de ruta realizada.
  - Repuestos usados correctamente instalados.
  - Limpieza del vehículo.
  - Documentación completa (fotos, diagnóstico, firma).
- **Aprobación/Rechazo:** Botones para aprobar o devolver a revisión.
  - Si se aprueba, la OT pasa a estado LISTO_ENTREGA.
  - Si se rechaza, vuelve a EN_PROCESO con observaciones.
- **Historial de control de calidad:** Registro de todas las revisiones con fecha, inspector, resultado.

### `MiTienda.jsx` — Gestión de Tienda (Admin)

- **CRUD de productos** de la tienda:
  - Crear/editar producto con: nombre, descripción, precio, stock, categoría, imagen.
  - Las imágenes se almacenan en `assets/tienda/` o se suben a Supabase Storage.
- **Categorías de productos:** Misma lógica que categorías de servicio.
- **Gestión de pedidos:** Ver pedidos realizados por clientes, cambiar estado (pendiente, enviado, entregado, cancelado).
- **Estadísticas de tienda:** Ventas totales, productos más vendidos, stock bajo.

### `VerTienda.jsx` — Vista Previa de Tienda

- Muestra la tienda como la vería un cliente (vista previa pública).
- Útil para que el admin verifique cómo se ven los productos antes de publicarlos.
- Posiblemente incluye modo "edición rápida" (botón "Editar" en cada producto).

### `useLista.js` — Custom Hook Reutilizable

- Hook personalizado para manejar estados comunes de listas:
  - `datos`, `cargando`, `error`, `busqueda`, `filtro`.
  - Funciones: `cargar()`, `buscar()`, `filtrar()`, `limpiar()`.
- Usado por varias páginas de admin para estandarizar el manejo de datos tabulares y evitar duplicación de código.
- Ejemplo de uso:
  ```javascript
  const { datos, cargando, error, busqueda, setBusqueda, recargar } = useLista(servicio.obtenerDatos)
  ```

---

## 16. PORTAL DEL TÉCNICO — GESTIÓN DE ÓRDENES

### Arquitectura del Portal Técnico

El portal del técnico sigue la misma estructura que el del cliente: sidebar + topbar + contenido. La diferencia principal está en los permisos y las funcionalidades disponibles.

### `SidebarTecnico.jsx`

```javascript
const menu = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/tecnico/dashboard" },
  { name: "Órdenes",   icon: ClipboardList,  path: "/tecnico/ordenes"    },
  { name: "Inventario", icon: Package,        path: "/tecnico/inventario" },
  { name: "Perfil",     icon: User,           path: "/tecnico/perfil"     },
]
```

- Navegación de 4 secciones con íconos de lucide-react.
- Link activo resaltado con `bg-orange-500`.
- Subtítulo "Portal Técnico" debajo del logo.
- Mismo diseño que SidebarCliente: fondo `slate-900`, texto blanco, altura `min-h-screen`.

### `TopbarTecnico.jsx`

- Título "Portal de Técnico" clickeable.
- Botón de toggle de disponibilidad: Llama a `toggleDisponibilidadTecnico()` → PATCH `/api/tecnicos/disponibilidad`.
  - Muestra estado actual: "Disponible" (verde) o "No disponible" (rojo).
  - El estado afecta si el técnico puede recibir nuevas asignaciones de OT.
- Campana de notificaciones con próximas órdenes.
- Avatar con menú de usuario.

### `PerfilTecnico.jsx` (~400 líneas)

- **Cabecera:** Banner personalizable + avatar + nombre + rol "TÉCNICO" en badge naranja.
- **Datos de cuenta:** Solo lectura — nombre, correo, rol.
- **Datos del perfil:** Editables — teléfono, dirección, especialidades (lista de tags), certificaciones.
- **Toggle de disponibilidad:** Botón grande para activar/desactivar.
- **Estadísticas personales:** Órdenes completadas, tiempo promedio por orden, rating.
- **Cambiar contraseña:** Igual que en `PerfilUsuario`.
- Usa `obtenerMiPerfilTecnico()` para carga inicial y `actualizarMiPerfil()` para guardar.

### `Ordenes.jsx` — Lista de Órdenes del Técnico

- Carga `obtenerMisOrdenesTecnico()` → GET `/api/tecnicos/ordenes`.
- **Columnas:** Código OT, Estado (badge coloreado), Cliente, Vehículo (patente), Servicio, Fecha inicio.
- **Filtro por estado:** Select con todos los estados posibles (ACTIVA, EN_PROCESO, CONTROL_CALIDAD, LISTA_ENTREGA, COMPLETADA).
- **Buscador:** Input de texto que filtra por código, cliente o patente.
- **Navegación:** Click en una fila → `/tecnico/ordenes/:codigo`.
- **Estados y colores:**
  - ACTIVA: gris
  - EN_PROCESO: naranja (es el estado actual de trabajo)
  - CONTROL_CALIDAD: púrpura
  - LISTA_ENTREGA: azul
  - COMPLETADA: verde

### `DetalleOrden.jsx` — ~1715 líneas, la página más grande del proyecto

Esta es la página de trabajo principal del técnico. Contiene todo lo necesario para ejecutar una orden de trabajo.

**Estructura de la página (secciones):**

1. **Encabezado:**
   - Código OT en grande con fuente mono espaciada y color naranja.
   - Badge del estado actual.
   - Botón "Volver" para regresar a la lista.

2. **Información general (grid 2 columnas):**
   - Cliente (nombre, email)
   - Vehículo (patente, marca, modelo, año)
   - Servicio solicitado
   - Fechas (inicio, estimación de fin)
   - Técnico asignado

3. **Diagnóstico del Técnico:**
   - Textarea multilínea donde el técnico escribe sus hallazgos.
   - Botón "Guardar diagnóstico" → `guardarDiagnosticoOrden(codigo, diagnostico)`.
   - El diagnóstico queda registrado en el historial de la OT.
   - Si ya existe diagnóstico previo, se muestra y se puede editar.

4. **Cambio de Estado:**
   - Select o botones para cada transición válida:
     - ACTIVA → EN_PROCESO
     - EN_PROCESO → CONTROL_CALIDAD
     - CONTROL_CALIDAD → LISTA_ENTREGA
     - LISTA_ENTREGA → COMPLETADA
   - Validación: no se puede saltar fases, debe seguirse el flujo lineal.
   - Cada cambio llama a `actualizarEstadoOrden(codigo, estado)`.
   - Feedback visual: toast verde de éxito o rojo de error.

5. **Evidencia Fotográfica por Fase:**
   - Upload de imágenes para documentar el trabajo.
   - Posiblemente integrado con Supabase Storage (bucket `ot-evidencias`).
   - Grid de miniaturas con opción de lightbox (click para ampliar).
   - Organizado por fase: Recepción, Diagnóstico, En Trabajo, Control Calidad, Listo Entrega.

6. **Línea de Tiempo (LineaTiempoOT):**
   - Visualización de las 5 fases con estados.
   - Progreso en porcentaje.
   - Tiempo estimado por fase.
   - Detalle expandible de cada fase completada (observaciones, fotos).

7. **Chat con el Cliente/Taller (ChatOT):**
   - Comunicación en tiempo real con el cliente y admin.
   - Los mensajes del técnico aparecen en azul, los del cliente en naranja.
   - Útil para consultar dudas sobre el diagnóstico o pedir aprobación de trabajos extra.

8. **Costos:**
   - Mano de obra: campo editable (admin).
   - Repuestos: lista de repuestos usados (relación con inventario).
   - Total calculado automáticamente.

**Carga de datos:**
```javascript
useEffect(() => {
  const { codigo } = useParams()  // Capturado de la URL /tecnico/ordenes/OT-2024-001
  obtenerDetalleOrdenTecnico(codigo)
    .then(({ data }) => setOrden(data))
    .catch(() => setError('No se pudo cargar la orden'))
}, [codigo])
```

### `Inventario.jsx` (Técnico) — Vista de Inventario

- Versión simplificada del inventario admin.
- **Columnas:** Nombre, SKU, Categoría, Stock actual, Ubicación.
- **Buscador:** Filtro por nombre o SKU.
- **Filtro por categoría:** Select poblado dinámicamente.
- **Sin acciones CRUD:** El técnico solo consulta, no modifica.
- Carga `obtenerInventarioTecnico(params)` → GET `/api/tecnicos/inventario`.
- Útil para que el técnico sepa qué repuestos hay disponibles sin tener que preguntar al admin.

### `Perfil.jsx` (Técnico)

- Página simple que renderiza `PerfilTecnico` dentro del layout:
  ```jsx
  <div className="flex min-h-screen bg-gray-100">
    <SidebarTecnico />
    <div className="flex-1">
      <TopbarTecnico />
      <main className="p-8">
        <PerfilTecnico />
      </main>
    </div>
  </div>
  ```

---

## 16B. COMPONENTE LINEA DE TIEMPO OT — ANÁLISIS DETALLADO

El componente `LineaTiempoOT.jsx` es uno de los más importantes del sistema porque visualiza el progreso de cualquier orden de trabajo. Es usado por Admin, Cliente, Técnico y la página de seguimiento público.

### Fases del Servicio

```javascript
const NOMBRES_FASES = ['RECEPCION', 'DIAGNOSTICO', 'EN_TRABAJO', 'CONTROL_CALIDAD', 'LISTO_ENTREGA']

const FASES_CONFIG = {
  RECEPCION:       { Icono: ClipboardList, label: 'Recepción'       },
  DIAGNOSTICO:     { Icono: Search,        label: 'Diagnóstico'     },
  EN_TRABAJO:      { Icono: Wrench,        label: 'En Trabajo'      },
  CONTROL_CALIDAD: { Icono: ShieldCheck,   label: 'Control Calidad' },
  LISTO_ENTREGA:   { Icono: Car,           label: 'Listo Entrega'   },
}
```

### Lógica de Renderizado

1. **Mapeo de fases:** Las fases vienen del backend como array (solo las que tienen datos). El componente las completa a 5 fases con valores por defecto.
2. **Progreso:** Calcula `(completadas / 5) * 100` y lo muestra como barra de progreso.
3. **Nodos visuales:** Círculos de 40x40px con:
   - **Completada:** Verde con check (`CheckCircle`).
   - **Activa:** Naranja con animación `animate-ping` (efecto de pulso, indica trabajo en curso).
   - **Pendiente:** Gris con borde e ícono de la fase.
4. **Líneas conectoras:** Entre fases, verdes si completadas, grises si pendientes.
5. **Tiempo estimado:** Debajo de cada fase, muestra `~X min` si hay predicción de IA.
6. **Detalle expandible:** Para fases completadas, muestra:
   - Timestamps (inicio, fin, duración en minutos).
   - Observaciones del técnico (texto libre).
   - Evidencia fotográfica (imágenes en grid 3 columnas con lightbox).
7. **Hora estimada de entrega:** Si hay predicción, muestra hora estimada + porcentaje de confianza.

### Sub-componente `FaseDetalle`

```javascript
function FaseDetalle({ fase }) {
  const [abierto, setAbierto]   = useState(false)
  const [fotoAmpliada, setFoto] = useState(null)

  const imagenes = JSON.parse(fase.imagenes || '[]')  // Array de URLs
  const tieneDetalle = fase.observaciones || imagenes.length > 0

  if (!tieneDetalle) return null
  // ... renderiza panel expandible con observaciones e imágenes
}
```

- **Lightbox:** Overlay negro (`bg-black/90`) con la imagen en tamaño completo. Click en cualquier parte lo cierra.
- **Imágenes:** Grid de 3 columnas con `aspect-square`. Hover cambia borde a naranja.
- **Observaciones:** Caja con fondo gris claro y borde.

### Integración con Predicción IA

Cuando el admin hace clic en "Predecir IA", el backend devuelve:
```javascript
{
  tiempoEstimadoMin: 45,        // Tiempo total estimado
  horaFinEstimada: "2024-...",  // ISO timestamp
  confianzaPct: 87.5,           // % de confianza del modelo
  desglosePorFase: {            // Tiempo estimado por fase
    RECEPCION: 5,
    DIAGNOSTICO: 15,
    EN_TRABAJO: 20,
    CONTROL_CALIDAD: 3,
    LISTO_ENTREGA: 2
  }
}
```

El componente muestra esta información en:
- Tiempo estimado debajo de cada nodo de fase.
- Hora estimada de entrega al final de la línea de tiempo.
- Porcentaje de confianza del modelo IA.

---

## 16C. FLUJO DE TRABAJO DE UNA OT — CICLO DE VIDA COMPLETO

```
1. CLIENTE agenda cita          → Agendamiento creado (estado: PENDIENTE)
2. ADMIN confirma + asigna técnico → Agendamiento CONFIRMADO, OT generada (ACTIVA)
3. TÉCNICO inicia trabajo       → OT pasa a EN_PROCESO
4. TÉCNICO escribe diagnóstico  → Se guarda en la OT
5. TÉCNICO sube fotos           → Supabase Storage, URLs en fase actual
6. TÉCNICO completa trabajo     → OT pasa a CONTROL_CALIDAD
7. ADMIN/SUPERVISOR revisa      → Checklist de calidad
8. ADMIN marca lista entrega    → OT pasa a LISTO_ENTREGA
9. CLIENTE recibe vehículo      → OT pasa a COMPLETADA

En cada paso:
  - LineaTiempoOT refleja el progreso visual
  - ChatOT permite comunicación entre todos los roles
  - El cliente puede ver el progreso en /seguimiento
```

---

## 17. FLUJO DE DATOS: CÓMO VIAJA LA INFORMACIÓN ENTRE PÁGINAS

### `Dashboard.jsx` (Técnico)

- KPIs personales: órdenes activas, completadas hoy, tiempo promedio.
- Lista de órdenes pendientes.
- Toggle de disponibilidad (el técnico puede marcarse disponible/no disponible).

### `Ordenes.jsx`

- Lista de todas las órdenes asignadas al técnico autenticado.
- Filtro por estado.
- Navegación a `DetalleOrden` al clickear.

### `DetalleOrden.jsx` — La página más compleja (~1715 líneas)

- **Información de la OT:** código, cliente, vehículo, servicio, fechas, costos.
- **Diagnóstico:** Textarea para que el técnico escriba y guarde su diagnóstico.
  - `guardarDiagnosticoOrden(codigo, diagnostico)` → PATCH.
- **Cambio de estado:** Botones/select para avanzar la OT entre estados.
  - `actualizarEstadoOrden(codigo, estado)` → PATCH.
- **Evidencia fotográfica:** Subida de imágenes por fase (posiblemente a Supabase Storage).
- **Línea de tiempo** con `LineaTiempoOT` mostrando todas las fases.
- **Chat con el cliente** usando `ChatOT` integrado.
- **Inventario relacionado:** Posiblemente repuestos usados en la OT.

### `Inventario.jsx` (Técnico)

- Vista de inventario (solo lectura o con ajustes limitados).
- Búsqueda y filtros como en admin pero sin capacidades CRUD completas.

### `Perfil.jsx` (Técnico)

- Usa `PerfilTecnico` componente.
- Similar a PerfilUsuario pero con campos específicos del técnico: especialidades, certificaciones.
- Toggle de disponibilidad.

---

## 17. FLUJO DE DATOS: CÓMO VIAJA LA INFORMACIÓN ENTRE PÁGINAS

### Método 1: React Router State (useLocation / useNavigate con state)

Este es el **método principal** para pasar datos entre páginas.

**Ejemplo: Home → Cotizador:**
```javascript
// En Home.jsx
navigate('/cotizador', {
  state: {
    vehiculo: {
      marcaId, marca, modeloId, modelo, anio: '', kilometraje: '', patente: ''
    }
  }
})

// En Cotizador.jsx
const { state } = useLocation()
const vehiculo = state?.vehiculo ?? { /* defaults vacíos */ }
```

**Ejemplo: Cotizador → Agendamiento:**
```javascript
// En ResumenCotizacion.jsx
navigate('/agendar', {
  state: { vehiculo, servicios: serviciosSeleccionados }
})

// En Agendamiento.jsx
const { state } = useLocation()
const vehiculo = state?.vehiculo ?? {}
const servicios = state?.servicios ?? []
```

**Ejemplo: Servicios → Agendamiento:**
```javascript
navigate('/agendar', {
  state: {
    servicio: servicio.nombre,
    servicioId: servicio.id,
    precio: servicio.precioBase,
    descripcion: servicio.descripcion
  }
})
```

### Método 2: Query String (URLSearchParams)

**Ejemplo: HeroSection → Cotizador:**
```javascript
navigate(`/cotizador?${new URLSearchParams(form).toString()}`)
// URL: /cotizador?marca=Toyota&modelo=Rav4&servicio=Mantención+5.000+km
```

### Método 3: localStorage

Usado para datos persistentes que sobreviven a cierre de sesión:
- `token` — JWT de autenticación
- `usuario` — Datos del usuario en JSON
- `fotoPerfilCliente` — URL/base64 de la foto de perfil
- `fotoBannerPerfil` — URL/base64 del banner de perfil

### Método 4: sessionStorage

Usado para caché de sesión (se limpia al cerrar la pestaña):
- `_ag_topbar` — Agendamientos cacheados para el buscador de la topbar

### Método 5: Eventos del DOM (window.dispatchEvent / addEventListener)

Usado para comunicación cross-component sin props drilling:
- `auth:logout` — Disparado por axiosInstance (401) → escuchado por AuthContext → limpia usuario
- `fotoPerfilActualizada` — Disparado por PerfilUsuario al cambiar foto → escuchado por Navbar y TopbarCliente → refresca avatar
- `bannerPerfilActualizado` — Similar para el banner de perfil

### Método 6: Context API (useAuth)

El AuthContext expone `{ usuario, login, logout, authListo }` a toda la aplicación.
Cualquier componente puede usar `const { usuario } = useAuth()` para acceder al usuario actual.

### Método 7: Parámetros de Ruta (useParams)

Para rutas dinámicas:
```javascript
// App.jsx: <Route path="/tecnico/ordenes/:codigo" element={<DetalleOrden />} />
// En DetalleOrden.jsx:
const { codigo } = useParams()
// codigo = "OT-2024-001"
```

### Diagrama de Flujo Típico

```
Home (selecciona marca/modelo)
  │
  ├─→ state.vehiculo → Cotizador (manual o IA)
  │                        │
  │                        └─→ state.vehiculo + state.servicios → Agendamiento (paso 1→2→3)
  │                                                                     │
  │                                                                     └─→ POST /api/agendamientos
  │                                                                           │
  │                                                                           └─→ Dashboard Cliente
  │
  └─→ Login → AuthContext.login() → Redirección por rol
        │
        ├─→ CLIENTE → /cliente/dashboard → DashboardCliente
        ├─→ ADMIN   → /admin             → Dashboard Admin
        └─→ TECNICO → /tecnico/perfil    → Perfil Tecnico
```

---

## 18. SISTEMA DE ESTILOS: TAILWIND CSS Y ASSETS

### Filosofía de Estilos

El proyecto usa **Tailwind CSS utility-first**. No hay archivos CSS personalizados (excepto el heredado `App.css` y `index.css` que solo importa Tailwind).

### `index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
Estas 3 directivas inyectan:
- `base` — Reset CSS + estilos base de Tailwind.
- `components` — Clases de componentes (containers, etc.).
- `utilities` — Todas las clases utilitarias (flex, grid, colors, spacing, etc.).

### Paleta de Colores Principal

| Color | Uso |
|-------|-----|
| `orange-500` (#f97316) | Color primario: botones, links activos, acentos, badges |
| `orange-400/600` | Hover states del primario |
| `gray-900` (#111827) | Fondos oscuros (navbar, sidebar, footer, admin layout) |
| `gray-800` (#1f2937) | Fondos secundarios, bordes |
| `gray-100` (#f3f4f6) | Fondos claros (páginas públicas) |
| `white` | Fondos de tarjetas, inputs, páginas claras |
| `gray-950` (#030712) | Fondo del layout admin |
| `slate-900` (#0f172a) | Sidebar cliente |

### Patrones de Diseño Recurrentes

**Tarjetas (Cards):**
```jsx
className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
```

**Botones primarios:**
```jsx
className="bg-orange-500 hover:bg-orange-600 text-white font-black px-7 py-3.5 rounded-lg"
```

**Badges de estado:**
```jsx
className="px-2 py-0.5 rounded-full text-xs font-bold uppercase border"
```

**Títulos de sección:**
```jsx
className="text-xs font-black text-gray-500 uppercase tracking-widest"
```

**Inputs:**
```jsx
className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
```

### Responsive Design

Tailwind usa breakpoints:
- `sm:` (640px)
- `md:` (768px)
- `lg:` (1024px)
- `xl:` (1280px)
- `2xl:` (1536px)

Patrones comunes:
- `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` — Grid responsive.
- `flex flex-col lg:flex-row` — Flex direction cambia en desktop.
- `hidden md:flex` — Elementos visibles solo en desktop.

### Animaciones

- `animate-pulse` — Skeleton loading (Tailwind built-in).
- `animate-spin` — Loader spinners (Tailwind built-in).
- `animate-ping` — Indicador de fase activa en LineaTiempoOT.
- Animaciones CSS personalizadas en `CargandoAuto.jsx`: `@keyframes drive` y `@keyframes roadLine`.
- `transition-colors`, `transition-all`, `transition-transform` + `duration-*` — Transiciones suaves en hover.

### Assets — Imágenes

- **`assets/servicios/`** — 15 imágenes JPG para los servicios del catálogo (alineacion, amortiguadores, bateria, correa, diagnostico, electrico, enfriamiento, frenos-delanteros, frenos-traseros, mantencion-5000, mantencion-10000, motor, neumaticos, soldadura, suspension).
- **`assets/tienda/`** — 9 imágenes JPG para productos (aceite, bateria, filtro-aceite, filtro-aire, frenos, herramientas, plumillas, refrigerante, shampoo).
- **Imágenes externas:** Unsplash para hero y servicios en Home.
- **Avatar por defecto:** `https://api.dicebear.com/7.x/notionists/svg?seed=DefaultUser`.

---

## 19. DESPLIEGUE: VERCEL

### `vercel.json`

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

- **SPA Fallback:** Todas las rutas que no sean archivos estáticos se redirigen a `/` (index.html).
- Esto permite que React Router maneje todas las rutas del lado del cliente.
- Sin esta configuración, rutas como `/admin/agendamientos` devolverían 404.

### Proceso de Build

1. `npm run build` → Vite compila la app en `dist/`.
2. Vercel detecta el framework (Vite) automáticamente.
3. Sirve los archivos estáticos de `dist/`.
4. Aplica las reglas de `vercel.json`.

### Variables de Entorno en Producción

En Vercel se deben configurar:
- `VITE_API_URL` — URL del backend en producción
- `VITE_SUPABASE_URL` — URL del proyecto Supabase
- `VITE_SUPABASE_ANON_KEY` — Clave anónima de Supabase

---

## 20. PATRONES DE CÓDIGO AVANZADOS

### 20.1 Patrón de Estado con useReducer Implícito

Aunque el proyecto no usa `useReducer` explícitamente, varios componentes implementan un patrón similar mediante múltiples `useState` coordinados:

```javascript
// PerfilUsuario.jsx — 3 secciones con estados independientes
const [editandoPerfil, setEditandoPerfil] = useState(false)
const [perfil, setPerfil] = useState({ telefono: '', direccion: '', rut: '' })
const [guardandoPerfil, setGuardandoPerfil] = useState(false)
const [okPerfil, setOkPerfil] = useState(false)
const [errorPerfil, setErrorPerfil] = useState('')

const [pass, setPass] = useState({ passwordActual: '', passwordNuevo: '', confirmar: '' })
const [guardandoPass, setGuardandoPass] = useState(false)
const [okPass, setOkPass] = useState(false)
const [errorPass, setErrorPass] = useState('')
```

Cada sección (perfil, contraseña, banner) tiene su propio grupo de estados. Esto mantiene el código predecible sin necesidad de reducers formales.

### 20.2 Patrón de Feedback Temporal (Toast)

```javascript
const [mensaje, setMensaje] = useState({ texto: '', tipo: 'ok' })

const avisar = (texto, tipo = 'ok') => {
  setMensaje({ texto, tipo })
  setTimeout(() => setMensaje({ texto: '', tipo: 'ok' }), 3500)
}
```

- Mensaje de feedback que desaparece automáticamente después de 3.5 segundos.
- `tipo = 'ok'` → fondo verde con `CheckCircle`.
- `tipo = 'error'` → fondo rojo con `AlertTriangle`.
- Usado en: Admin Agendamientos, PerfilUsuario, BccAdminsConfig.

### 20.3 Patrón de Debounce para Búsqueda

```javascript
// Admin Inventario.jsx
const [busqTimer, setBusqTimer] = useState(null)

const handleBusqueda = (val) => {
  setBusqueda(val)
  clearTimeout(busqTimer)                     // Cancela el timer anterior
  setBusqTimer(setTimeout(() => cargar(val, filtro), 350))  // Nuevo timer a 350ms
}
```

- Cada tecla presionada resetea un temporizador de 350ms.
- Solo cuando el usuario deja de escribir por 350ms, se dispara la búsqueda.
- Esto evita bombardear el backend con peticiones en cada keystroke.
- `clearTimeout` previene que búsquedas antiguas sobrescriban resultados nuevos.

### 20.4 Patrón de Caché en sessionStorage

```javascript
// TopbarCliente.jsx
const cargarAgendamientos = async () => {
  const cached = sessionStorage.getItem('_ag_topbar')
  if (cached) { setAgendamientos(JSON.parse(cached)); return }
  const res = await obtenerMisAgendamientos()
  const data = res.data || []
  sessionStorage.setItem('_ag_topbar', JSON.stringify(data))
  setAgendamientos(data)
}
```

- `sessionStorage`: caché que dura una sesión de navegador (se limpia al cerrar la pestaña).
- Ideal para datos que cambian poco durante una sesión (agendamientos del cliente).
- Ahorra llamadas al backend en recargas de la topbar.

### 20.5 Patrón de Click Outside para Dropdowns

```javascript
// Navbar.jsx
const perfilRef = useRef(null)

useEffect(() => {
  function handleClickOutside(e) {
    if (perfilRef.current && !perfilRef.current.contains(e.target)) {
      setPerfilOpen(false)
    }
  }
  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [])
```

- `useRef` referencia el contenedor del dropdown.
- `mousedown` (no `click`) para responder más rápido.
- Si el click fue FUERA del contenedor (`!contains`), cierra el dropdown.
- El cleanup (`return () => removeEventListener`) evita memory leaks.
- Usado en: Navbar (menú de perfil), TopbarCliente (menú usuario + notificaciones).

### 20.6 Patrón de Skeleton Loading

```javascript
if (cargando) {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-[#16233b] rounded-2xl h-44 shadow-lg"></div>
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow p-6 h-28">
            <div className="h-5 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-7 bg-gray-200 rounded w-36"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- `animate-pulse` de Tailwind crea una animación de opacidad intermitente.
- Los divs vacíos con `bg-gray-200` y dimensiones similares al contenido real crean placeholders realistas.
- Se usan `rounded` (border-radius) para que coincida con el diseño final.
- El número de skeletons coincide con el layout real (4 KPIs, 3 tarjetas, etc.).

### 20.7 Patrón de Protección de Rutas con Roles

```javascript
// RutaProtegida.jsx — 3 niveles de verificación
if (!authListo) return null                           // Nivel 1: carga inicial
if (!usuario) return <Navigate to="/login" replace />  // Nivel 2: autenticación
if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol))  // Nivel 3: autorización
  return <Navigate to="/" replace />
return children
```

- **Nivel 1:** Si el contexto aún no terminó de leer localStorage, no renderiza nada (evita flash).
- **Nivel 2:** Si no hay sesión, redirige a login.
- **Nivel 3:** Si el rol no está autorizado, redirige al home.
- `replace` en Navigate evita que el botón "atrás" del navegador vuelva a la ruta protegida.

### 20.8 Patrón de Formulario Controlado con Validación en Tiempo Real

```javascript
// TabCrearCuenta.jsx
const passwordsIguales   = form.password && form.repetir && form.password === form.repetir
const passwordsDistintas = form.password && form.repetir && form.password !== form.repetir
const todoCompleto = form.nombre && form.apellido && form.email && form.telefono
                     && form.password && passwordsIguales

// En el JSX:
className={`border rounded-lg ${passwordsDistintas ? 'border-red-300' : 'border-gray-200'}`}
{passwordsDistintas && <p className="text-red-400">Las contraseñas no coinciden</p>}
{passwordsIguales   && <p className="text-green-500">✓ Las contraseñas coinciden</p>}
```

- Validación instantánea sin esperar al submit.
- Feedback visual: borde rojo cuando no coinciden, verde cuando sí.
- Mensajes explicativos en tiempo real.
- Botón deshabilitado (`disabled={!todoCompleto}`) hasta que todo sea válido.

### 20.9 Patrón de Carga Paralela de Datos

```javascript
// DashboardCliente.jsx
const cargarDatos = async () => {
  setLoading(true)
  try {
    const vehiculosRes = await obtenerMisVehiculos().catch(() => ({ data: [] }))
    const agendamientosRes = await obtenerMisAgendamientos().catch(() => ({ data: [] }))
    // Ambas llamadas se hicieron en secuencia (no en paralelo)
  }
}
```

**Optimización con Promise.all (mejora sugerida):**

```javascript
const [vehiculosRes, agendamientosRes] = await Promise.all([
  obtenerMisVehiculos().catch(() => ({ data: [] })),
  obtenerMisAgendamientos().catch(() => ({ data: [] }))
])
```

- `Promise.all` ejecuta ambas llamadas simultáneamente.
- El tiempo total es el de la llamada más lenta, no la suma de ambas.
- Cada una tiene su propio `.catch()` para que el fallo de una no afecte a la otra.

### 20.10 Patrón de Actualización Optimista

```javascript
// ChatOT.jsx
setTexto('')                         // Limpia optimistamente
try {
  const { data } = await enviarMensajeChat(codigoOt, contenido)
  setMensajes(prev => [...prev, data])
} catch {
  setTexto(contenido)                // Rollback en error
}
```

- La UI se actualiza antes de que el backend confirme.
- Si el backend falla, se revierte al estado anterior.
- Esto da una sensación de velocidad y fluidez al usuario.

---

## 21. SISTEMA DE MANEJO DE ERRORES

### 21.1 Interceptor Global de Axios

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !url.includes('/api/auth/')) {
      // Logout forzado para no-admins
    }
    return Promise.reject(error)  // Siempre rechaza para que el componente lo maneje
  }
)
```

### 21.2 Jerarquía de Manejo de Errores

```
Nivel 1: Interceptor global (axiosInstance)
  └─ 401 → logout forzado (excepto admins)
  
Nivel 2: Servicio (service files)
  └─ .catch(() => {}) → fallo silencioso para datos no críticos
  
Nivel 3: Componente/Página
  └─ .catch(e => setError(mensaje)) → feedback visual al usuario
  
Nivel 4: Try/Catch en funciones async
  └─ Manejo específico con rollback si es necesario
```

### 21.3 Tipos de Errores Manejados

| Tipo | Manejado por | Comportamiento |
|------|-------------|----------------|
| 401 Unauthorized | Interceptor Axios | Logout para cliente/técnico, ignorado para admin |
| 400 Bad Request | Componente | Extrae `e.response.data.message` y lo muestra |
| 403 Forbidden | RutaProtegida | Redirección al home |
| 404 Not Found | Componente | Muestra estado vacío o mensaje "No encontrado" |
| 500 Server Error | Componente | Mensaje genérico "Error del servidor" |
| Network Error | Componente | "No se pudo conectar con el servidor" |
| Token expirado | Interceptor | 401 → logout automático |

### 21.4 Extracción de Mensajes de Error del Backend

```javascript
} catch (e) {
  setError(
    e.response?.data?.message ??
    e.response?.data?.mensaje ??
    e.response?.data ??
    e.message ??
    'Error desconocido'
  )
}
```

- Encadenamiento con optional chaining (`?.`) y nullish coalescing (`??`).
- Busca el mensaje en múltiples ubicaciones posibles de la respuesta.
- Fallback final: 'Error desconocido'.

### 21.5 Errores Silenciosos (Non-Blocking)

Algunas operaciones fallan sin molestar al usuario:

```javascript
// TopbarCliente.jsx — las notificaciones no son críticas
obtenerMisAgendamientos()
  .then(res => setAgendamientos(res.data || []))
  .catch(() => {})  // Falla silenciosamente

// Home.jsx — servicios y marcas son secundarios
obtenerMarcas().then(({ data }) => setMarcas(data)).catch(() => {})
obtenerServicios().then(...).catch(() => {}).finally(...)
```

- Si fallan, simplemente no se muestran (la página sigue funcionando).
- Ideal para widgets secundarios que no bloquean la funcionalidad principal.

---

## 22. SEGURIDAD EN EL FRONTEND

### 22.1 Autenticación JWT

1. **Almacenamiento:** El token JWT se guarda en `localStorage`.
2. **Envío:** Cada petición sale con `Authorization: Bearer <token>` (interceptor de request).
3. **Expiración:** Si el backend responde 401, el token expiró y se hace logout forzado.
4. **Excepción admin:** Los admins no son deslogueados por 401 (pueden tener sesiones más largas).

### 22.2 Protección de Rutas

- `RutaProtegida` verifica autenticación + autorización por rol.
- Sin token → redirección a `/login`.
- Rol incorrecto → redirección a `/` (home).
- `replace: true` en `<Navigate>` evita que el botón "atrás" acceda a rutas no autorizadas.

### 22.3 Sanitización de Inputs

```javascript
// Seguimiento.jsx — sanitización de código OT
api.get(`/api/seguimiento/${encodeURIComponent(codigo.trim().toUpperCase())}`)

// Admin Agendamientos — patente en mayúsculas
patente: form.patente.toUpperCase().trim()
```

- `encodeURIComponent()` evade caracteres especiales en URLs.
- `.trim()` elimina espacios accidentales.
- `.toUpperCase()` normaliza mayúsculas para comparaciones.

### 22.4 Validación de Email

```javascript
// BccAdminsConfig.jsx
const validarEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
```

- Regex estándar de validación de email.
- Rechaza emails sin @ o sin dominio.
- Impide inyección de caracteres especiales.

### 22.5 Prevención de XSS

- React por defecto escapa todo el contenido renderizado con `{}`.
- No se usa `dangerouslySetInnerHTML`.
- Los datos del backend se renderizan como texto, no como HTML.

### 22.6 Variables de Entorno

- `VITE_API_URL` — URL del backend, no hardcodeada.
- Las claves de Supabase están en `.env` (gitignored).
- En producción se configuran en Vercel (no en el código).

---

## 23. OPTIMIZACIONES DE PERFORMANCE

### 23.1 Caché de Peticiones GET (axiosInstance)

- TTL de 30 segundos para respuestas GET.
- Deduplicación de peticiones idénticas concurrentes (solo se hace 1 llamada real).
- Invalidación manual post-mutación (`api.invalidar(url)`).

### 23.2 Caché en sessionStorage

- `_ag_topbar` en TopbarCliente evita recargar agendamientos en cada render.
- Se limpia automáticamente al cerrar la pestaña.

### 23.3 Debounce en Búsquedas

- 350ms de espera antes de ejecutar búsquedas en Inventario Admin.
- Reduce drásticamente el número de llamadas al backend.

### 23.4 Lazy Loading de Imágenes

- Las imágenes de Unsplash en Home.jsx cargan bajo demanda (atributo nativo `loading="lazy"` implícito en algunas).
- Las imágenes de servicios se importan como módulos (Vite las optimiza en el build).

### 23.5 Skeleton Loading vs Spinners

- Se usan skeletons (placeholders con forma) en lugar de spinners genéricos.
- Los skeletons reducen el "layout shift" (CLS) porque ya ocupan el espacio del contenido final.
- Mejor experiencia de usuario que un spinner central.

### 23.6 Code Splitting (Potencial)

Actualmente todas las páginas se importan estáticamente en `App.jsx`. Una optimización futura sería:

```javascript
// Lazy loading de páginas de admin (no se cargan hasta que el admin navega ahí)
const Dashboard = lazy(() => import('./pages/Admin/Dashboard'))
const Agendamientos = lazy(() => import('./pages/Admin/Agendamientos'))
// ...
<Suspense fallback={<CargandoAuto />}>
  <Routes>...</Routes>
</Suspense>
```

---

## 24. ACCESIBILIDAD Y UX

### 24.1 Navegación por Teclado

- Enter para enviar formularios (login, chat, búsqueda).
- Shift+Enter para nueva línea en textarea del chat.
- Tab sigue el orden natural del DOM.

### 24.2 Estados Visuales

Todos los elementos interactivos tienen estados claros:
- **Hover:** Cambio de color o fondo (transiciones suaves `transition-colors`).
- **Focus:** Anillo naranja (`focus:ring-2 focus:ring-orange-500` o `focus:border-orange-500`).
- **Active:** Efecto de escala (`active:scale-95` en botones).
- **Disabled:** Opacidad reducida (`disabled:opacity-50`) + cursor `not-allowed`.

### 24.3 Feedback Visual para Acciones

- **Éxito:** `CheckCircle` verde + mensaje temporal de 3.5s.
- **Error:** `AlertTriangle` rojo + mensaje persistente hasta siguiente acción.
- **Cargando:** Spinner `Loader2` con `animate-spin`.

### 24.4 Estados Vacíos

Todas las listas y tablas manejan el caso de 0 elementos:

```jsx
{datos.length === 0 ? (
  <div className="text-center py-12">
    <Icono size={32} className="text-gray-600 mx-auto mb-2" />
    <p className="text-gray-500">No hay datos disponibles</p>
  </div>
) : (
  <Tabla datos={datos} />
)}
```

### 24.5 Localización

- Fechas formateadas con `toLocaleDateString('es-CL')` y `toLocaleTimeString('es-CL')`.
- Timezone: `America/Santiago`.
- Precios formateados con `toLocaleString('es-CL')` (separador de miles con punto).
- Textos de la interfaz en español.

---

## 25. COMPONENTES VACÍOS Y DEUDA TÉCNICA

### Archivos vacíos o placeholder

| Archivo | Estado | Impacto |
|---------|--------|---------|
| `ModalNuevoVehiculo.jsx` | Vacío | Funcionalidad "Agregar Vehículo" está inline en MisVehiculos.jsx |
| `VehiculoCard.jsx` | Vacío | Las tarjetas de vehículo se renderizan inline en MisVehiculos.jsx |
| `ServicioCard.jsx` | Placeholder (`<div></div>`) | No usado actualmente |
| `PasoExito.jsx` | Placeholder (`<div></div>`) | La confirmación se maneja dentro de PasoConfirmacion |
| `SelectorVehiculo.jsx` (agendamiento) | Vacío | Reemplazado por la lógica inline en PasoConfirmacion |
| `catalogoService.js` | Vacío | Sus endpoints están en adminCatalogosService y serviciosCatalogoService |

### Mejoras Potenciales

1. **TypeScript:** Actualmente todo el proyecto es JavaScript. TypeScript añadiría seguridad de tipos y mejor autocompletado.
2. **React Query / TanStack Query:** Reemplazaría el sistema manual de caché de axiosInstance con una solución más robusta (cache invalidations, refetch, stale time configurables).
3. **Lazy Loading:** Separar los bundles de admin, cliente y técnico para reducir el tamaño inicial.
4. **Tests:** Aunque Playwright está en devDependencies, no hay tests implementados.
5. **Custom Hooks:** Extraer lógica repetida (carga de datos, formularios, modales) a hooks reutilizables.
6. **Internacionalización (i18n):** Soporte para múltiples idiomas (actualmente solo español chileno).

---

## 20. RESUMEN DE LA ARQUITECTURA GENERAL

### Diagrama de Capas

```
┌─────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Páginas  │  │Componentes│  │ Layouts  │  │ Shared  │ │
│  │(37 arch) │  │ (27 arch) │  │(4 arch)  │  │(5 arch) │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
├───────┼─────────────┼─────────────┼─────────────┼───────┤
│       │       CAPA DE ESTADO GLOBAL (Context API) │       │
│       │         ┌──────────────────┐              │       │
│       └─────────┤   AuthContext    ├──────────────┘       │
│                 │ usuario, login,  │                      │
│                 │ logout, authListo│                      │
│                 └────────┬─────────┘                      │
├──────────────────────────┼───────────────────────────────┤
│                 CAPA DE SERVICIOS                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │  auth    │  │agendamiento│ │ vehiculo │  │  admin  │  │
│  │ Service  │  │  Service  │  │ Service  │  │Services │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘  │
│       └─────────────┼─────────────┼─────────────┘        │
├─────────────────────┼────────────────────────────────────┤
│            CAPA DE COMUNICACIÓN HTTP                      │
│       ┌──────────────────────────────┐                   │
│       │     api/axiosInstance.js     │                   │
│       │  • Interceptor JWT           │                   │
│       │  • Caché GET (30s TTL)      │                   │
│       │  • Deduplicación concurrente │                   │
│       │  • Manejo de errores 401    │                   │
│       └──────────────┬───────────────┘                   │
├──────────────────────┼───────────────────────────────────┤
│             CAPA DE ALMACENAMIENTO LOCAL                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐   │
│  │ localStorage │  │sessionStorage│  │  Supabase     │   │
│  │ token,user,  │  │ caché topbar │  │  Storage      │   │
│  │ foto perfil  │  │              │  │  (fotos, OT)  │   │
│  └──────────────┘  └──────────────┘  └───────────────┘   │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │   BACKEND (Spring)  │
                │   localhost:8080    │
                │   REST API + JWT    │
                └─────────────────────┘
```

### Estadísticas del Código

| Categoría | Cantidad de archivos |
|-----------|---------------------|
| Páginas | 37 |
| Componentes | 32 |
| Servicios | 21 |
| Layouts | 4 |
| Context | 1 |
| API/Comunicación | 1 |
| Utilidades | 1 |
| Assets (imágenes) | 27 |
| Configuración | 7 |
| **TOTAL** | **~129 archivos** |

### Convenciones de Código

- **Nombrado de archivos:** PascalCase para componentes React (`.jsx`), camelCase para servicios/utilidades (`.js`).
- **Nombrado de funciones:** camelCase para funciones regulares, PascalCase para componentes.
- **Exportación:** `export default function` para componentes, `export const` para funciones de servicio.
- **Manejo de errores:** `.catch(() => {})` para fallos silenciosos, `.catch(e => setError(...))` para feedback al usuario.
- **Estados de carga:** `const [cargando, setCargando] = useState(true)` en casi todas las páginas.
- **Manejo de datos de API:** `const [datos, setDatos] = useState([])` + `useEffect` + llamada al servicio.
- **Skeleton loading:** `animate-pulse` de Tailwind como placeholder mientras carga.

### Dependencias Clave entre Componentes

```
App.jsx
  ├─ AuthProvider (context)
  │   └─ useAuth() → usado por 15+ componentes
  ├─ Navbar (visible en casi todas las páginas)
  ├─ Footer (visible en páginas públicas)
  ├─ RutaProtegida (wrapper de 25 rutas)
  ├─ AdminLayout → 14 páginas de admin
  ├─ SidebarCliente + TopbarCliente → 7 páginas de cliente
  └─ SidebarTecnico + TopbarTecnico → 5 páginas de técnico

Servicios → todos dependen de:
  └─ api/axiosInstance.js (instancia única de Axios)

Componentes reutilizables transversales:
  ├─ LineaTiempoOT → usado por Admin, Cliente, Seguimiento público
  ├─ ChatOT → usado por Cliente, Admin, Técnico
  ├─ PerfilUsuario → usado por Admin, Cliente, Perfil público
  ├─ CargandoAuto → usado por SelectorHorario, DashboardCliente
  ├─ SelectorVehiculoPerfil → usado por Cotizador, Agendamiento
  └─ InicioSesion → usado por Login, Register
```

---

## CONCLUSIÓN

MecánicaHub Frontend es una aplicación SPA (Single Page Application) construida con React 19, Vite 8, Tailwind CSS, y React Router 7. La arquitectura sigue el patrón de **separación por capas**:

1. **Presentación** (37 páginas + 32 componentes + 4 layouts)
2. **Estado global** (Context API — AuthContext)
3. **Servicios** (21 módulos, uno por dominio funcional)
4. **Comunicación** (Axios con interceptores JWT, caché, deduplicación)

Cada una de las ~129 piezas de código está interconectada mediante:
- React Router (navegación SPA con state, query params y path params)
- Context API (estado de autenticación compartido)
- Eventos del DOM (comunicación cross-component)
- localStorage/sessionStorage (persistencia de datos)

El sistema soporta 4 roles con diferentes niveles de acceso, 40+ rutas, y se comunica con un backend REST mediante ~50 endpoints diferentes. La interfaz es completamente responsive gracias a Tailwind CSS, con un diseño oscuro moderno para los portales internos y un diseño claro para las páginas públicas.
