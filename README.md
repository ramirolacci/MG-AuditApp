<div align="center">

  <img src="public/logo-script.png" alt="Mi Gusto Logo" width="220" />

  # Portal de Auditorías Operativas

  <p align="center">
    <strong>Sistema integral de control de calidad, evaluación de estándares y diagnóstico de salud operativa para la red de locales Mi Gusto.</strong>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React 19" />
    <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Supabase-%233ECF8E.svg?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/gsap-%230AE448.svg?style=for-the-badge&logo=gsap&logoColor=white" alt="GSAP" />
  </p>

</div>

---

## 📸 Galería del Sistema

<table width="100%">
  <tr>
    <td width="50%" align="center">
      <img src="public/screenshots/Screenshot_1.png" alt="Portal de Acceso" width="100%" />
      <br />
      <b>🔐 Acceso Corporativo & Autenticación</b>
      <p><i>Ingreso seguro con perfiles por rol y credenciales institucionales.</i></p>
    </td>
    <td width="50%" align="center">
      <img src="public/screenshots/Screenshot_2.png" alt="Evaluación Operativa" width="100%" />
      <br />
      <b>📋 Evaluación Operativa en Tiempo Real</b>
      <p><i>Navegación dinámica por fases, scoring en vivo y carga de evidencias.</i></p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="public/screenshots/Screenshot_3.png" alt="Historial Centralizado" width="100%" />
      <br />
      <b>🗂️ Historial Centralizado & Filtros</b>
      <p><i>Búsqueda instantánea por tienda, fecha o auditor con badges de estado.</i></p>
    </td>
    <td width="50%" align="center">
      <img src="public/screenshots/Screenshot_4.png" alt="Diagnóstico y Métricas" width="100%" />
      <br />
      <b>📊 Diagnóstico de Salud Operativa & KPIs</b>
      <p><i>Desglose por fase, ponderaciones y reporte de hallazgos para planes de acción.</i></p>
    </td>
  </tr>
</table>

---

## ✨ Características Principales

### 🎯 Evaluación por Fases Estandarizadas
- **Segmentación Operativa Integral**: Cobertura estructurada de áreas clave (Atención al Cliente, Calidad del Producto, Seguridad e Higiene, Mantenimiento, KPIs, RRHH, Administración y Bodega).
- **Puntuación Ponderada en Vivo**: Cálculo dinámico del puntaje final sobre 100 puntos con metas automáticas de aprobación (meta estándar: 85 pts).
- **Doble Modalidad de Auditoría**: Soporte nativo para auditorías en modalidad **Normal** y modalidad **Experience**, adaptadas a las particularidades de cada tienda.

### 📸 Registro y Control de Desvíos
- **Gestión de Hallazgos**: Detección granular de desvíos con categorización inmediata (Cumple, No Cumple, Parcial).
- **Evidencia Visual**: Registro fotográfico integrado en cada ítem evaluado para respaldar las observaciones detectadas en sucursal.
- **Acciones Rápidas**: Marcado por bloques y navegación fluida entre fases sin fricción ni pérdida de datos.

### 📈 Diagnóstico de Salud Operativa
- **KPIs de Efectividad Global**: Métricas visuales de efectividad, porcentaje de calidad alcanzada y categorización de fases (En Estándar, Aceptables y Críticas).
- **Síntesis Ejecutiva Automatizada**: Diagnóstico analítico generado al instante, destacando fortalezas y puntos de atención prioritaria.
- **Reportes Listos para Exportar**: Generación de informes en formato digital (PDF / exportación estructurada) listos para auditorías gerenciales.

### 🔒 Seguridad y Persistencia Corporativa
- **Sincronización en la Nube**: Almacenamiento centralizado con Supabase para consulta distribuida y colaboración en tiempo real.
- **Resiliencia Offline**: Mecanismo de persistencia local preventiva para evitar pérdidas de progreso ante fluctuaciones de conectividad en planta.
- **Control de Roles**: Permisos diferenciados para auditoría, consulta y gestión de registros históricos.

---

## 🎨 Experiencia Visual & Diseño

La interfaz fue diseñada bajo un **Pure Dark Mode** de nivel industrial, concebido para brindar la máxima legibilidad y confort visual durante auditorías de campo:
- **Paleta Armónica**: Fondos Slate oscuros (`#0b0f19`, `#131b2e`), acentos azul eléctrico (`#3b82f6`) y contrastes funcionales según el dictamen operativo.
- **Micro-interacciones Fluidas**: Transiciones suaves impulsadas por **GSAP**, facilitando una navegación intuitiva y ágil entre paneles.
- **Diseño Responsive**: Interfaz totalmente adaptable a tablets, smartphones y terminales de escritorio.

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js** (versión 18.0 o superior recomendada)
- Gestor de paquetes: **npm**, **pnpm** o **yarn**

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/MiGusto-AuditApp.git
cd MiGusto-AuditApp
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configuración de Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

> [!NOTE]
> Para la estructura de tablas y políticas de seguridad (RLS), ejecuta el script [`supabase_schema.sql`](supabase_schema.sql) en el **SQL Editor** de tu panel de Supabase.

### 4. Iniciar en modo desarrollo
```bash
npm run dev
```
La aplicación quedará disponible en el navegador (por defecto en `http://localhost:5173`).

### 5. Compilar para producción
Para generar el build optimizado de producción:
```bash
npm run build
```
Para previsualizar localmente la versión compilada:
```bash
npm run preview
```

---

<div align="center">
  <sub>Desarrollado para el Departamento de Operaciones y Calidad de <strong>Mi Gusto</strong>.</sub>
</div>
