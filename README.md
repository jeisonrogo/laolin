# Laolin Children's Play Hub - Landing Page Completa

## 📋 Descripción del Proyecto

Landing page completa y funcional para Laolin Children's Play Hub, una ludoteca en Madrid. El proyecto incluye todas las funcionalidades solicitadas: menú hamburguesa responsive, sistema de búsqueda inteligente, sistema de reservas online, galería de imágenes, testimonios, y mucho más.

## ✨ Características Principales

### 🎯 Funcionalidades Implementadas

#### 1. **Menú Hamburguesa Responsive**
- Menú de tres rayitas que se despliega en dispositivos móviles
- Navegación suave hacia todas las secciones
- Animación de apertura/cierre
- Menú horizontal en desktop

#### 2. **Sistema de Búsqueda Inteligente**
- Barra de búsqueda en tiempo real
- Búsqueda por actividades, servicios, precios, horarios, etc.
- Autocompletado con sugerencias
- Redirección automática a secciones correspondientes

#### 3. **Sistema de Reservas Online**
- Formulario completo con validación en tiempo real
- Calendario interactivo que excluye domingos y festivos
- Integración con Google Sheets
- Confirmación automática por email
- Validación de horarios disponibles

#### 4. **Galería de Imágenes**
- Grid responsive con filtros por categorías
- Lightbox para visualización completa
- Lazy loading para optimización
- Imágenes relacionadas con ludotecas

#### 5. **Carrusel de Testimonios**
- Rotación automática
- Controles manuales
- Testimonios reales de familias
- Sistema de calificaciones

#### 6. **Secciones Completas**
- **Inicio**: Hero con animaciones de burbujas
- **Quiénes Somos**: Historia de las fundadoras
- **Actividades**: Detalle de todas las actividades
- **Horarios y Tarifas**: Información completa de precios
- **Cumpleaños**: Diferentes temáticas disponibles
- **Galería**: Imágenes de las instalaciones
- **Blog/Novedades**: Artículos y noticias
- **Reservas**: Formulario online completo
- **Normas**: Reglas de la ludoteca
- **Testimonios**: Opiniones de familias
- **FAQ**: Preguntas frecuentes
- **Contacto**: Información de contacto

#### 7. **Integración con Redes Sociales**
- Instagram: @laolin_childrens_play_hub
- Facebook: Laolin Children's Play Hub
- WhatsApp: +34 666 00 90 13 (botón flotante)

#### 8. **Animaciones de Burbujas**
- Sistema de burbujas interactivas en el hero
- Interacción con el mouse/touch
- Optimización para móviles

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica y accesible
- **CSS3**: Diseño responsive y animaciones
- **JavaScript ES6+**: Funcionalidad interactiva
- **Google Apps Script**: Backend para reservas
- **Google Sheets**: Base de datos de reservas
- **Font Awesome**: Iconos
- **Google Fonts**: Tipografía Gochi Hand

## 📁 Estructura del Proyecto

```
laolin/
├── index.html                 # Landing page principal
├── styles.css                 # Estilos principales
├── textos.json               # Contenido dinámico
├── js/
│   ├── main.js              # Funcionalidad principal
│   ├── search.js            # Sistema de búsqueda
│   ├── reservations.js      # Sistema de reservas
│   ├── gallery.js           # Galería de imágenes
│   ├── testimonials.js      # Carrusel de testimonios
│   └── bubbles.js           # Animaciones de burbujas
├── images/
│   ├── logo_guarderia_icon.png
│   ├── logo_guarderia.png
│   ├── gallery/             # Imágenes de galería
│   ├── testimonials/        # Fotos de testimonios
│   └── blog/                # Imágenes del blog
├── assets/
│   └── icons/               # Iconos SVG
├── google-apps-script/
│   └── reservations.gs      # Script para Google Sheets
└── README.md                # Documentación
```

## 🚀 Instalación y Configuración

### 1. **Configuración Local**

```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd laolin

# Abrir en servidor local
# Puedes usar cualquier servidor local como:
python -m http.server 8000
# o
npx serve .
```

### 2. **Configuración de Google Sheets**

1. Crear una nueva hoja de cálculo en Google Sheets
2. Copiar el contenido de `google-apps-script/reservations.gs`
3. En Google Apps Script:
   - Crear nuevo proyecto
   - Pegar el código
   - Reemplazar `TU_SPREADSHEET_ID_AQUI` con el ID real de tu hoja
   - Desplegar como aplicación web
   - Copiar la URL del webhook

4. Actualizar la URL del webhook en `js/reservations.js`:

```javascript
// En la función sendToGoogleSheets
const response = await fetch('TU_URL_DEL_WEBHOOK', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
});
```

### 3. **Configuración de Email**

El sistema de reservas envía emails automáticamente. Asegúrate de que:
- El email `ludotecalaolin@gmail.com` esté configurado
- Los permisos de Google Apps Script estén habilitados

## 📱 Responsive Design

La landing page está completamente optimizada para:
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: 320px - 767px

### Breakpoints Principales
- `@media (max-width: 768px)`: Menú hamburguesa, ajustes móviles
- `@media (max-width: 480px)`: Optimizaciones para móviles pequeños

## 🎨 Paleta de Colores

- **Verde Principal**: `#a8d5ba`
- **Verde Oscuro**: `#2c5530`
- **Beige**: `#f4e4c1`
- **Naranja**: `#e8c4a0`
- **Naranja Oscuro**: `#d4a574`

## 🔧 Personalización

### 1. **Modificar Contenido**

Edita el archivo `textos.json` para cambiar cualquier texto de la página:

```json
{
  "heroTitulo": "Tu título personalizado",
  "heroDescripcion": "Tu descripción personalizada"
}
```

### 2. **Agregar Nuevas Secciones**

1. Agregar la sección en `index.html`
2. Agregar estilos en `styles.css`
3. Agregar funcionalidad en `js/main.js`

### 3. **Modificar Imágenes**

Reemplaza las imágenes en la carpeta `images/` manteniendo los mismos nombres o actualiza las referencias en el código.

## 📊 Funcionalidades Avanzadas

### Sistema de Búsqueda
- Búsqueda en tiempo real
- Filtrado por categorías
- Sugerencias automáticas
- Redirección inteligente

### Sistema de Reservas
- Validación completa de formularios
- Verificación de disponibilidad
- Integración con Google Sheets
- Emails automáticos de confirmación

### Galería
- Filtros por categorías
- Lightbox interactivo
- Lazy loading
- Navegación con teclado

### Testimonios
- Carrusel automático
- Controles manuales
- Pausa en hover
- Navegación con teclado

## 🔒 Seguridad y Validación

### Validaciones Implementadas
- **Email**: Formato válido
- **Teléfono**: Formato español
- **Fecha**: Fechas futuras únicamente
- **Horarios**: Solo días hábiles
- **Campos requeridos**: Validación completa

### Protecciones
- Sanitización de datos
- Validación en frontend y backend
- Rate limiting en Google Apps Script
- Logs de errores

## 📈 SEO y Performance

### Optimizaciones SEO
- Meta tags completos
- Schema markup para negocio local
- URLs semánticas
- Alt text en imágenes
- Sitemap automático

### Optimizaciones Performance
- Lazy loading de imágenes
- Compresión de archivos
- Minificación de CSS/JS
- Caché optimizado
- Service Worker (opcional)

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Las reservas no se envían**
   - Verificar URL del webhook en Google Apps Script
   - Comprobar permisos de la hoja de cálculo
   - Revisar logs en Google Apps Script

2. **Las imágenes no cargan**
   - Verificar rutas de archivos
   - Comprobar permisos de carpetas
   - Revisar consola del navegador

3. **El menú hamburguesa no funciona**
   - Verificar que todos los archivos JS estén cargados
   - Comprobar que no hay errores en la consola
   - Verificar que el CSS está aplicado correctamente

### Debugging

```javascript
// Activar modo debug
localStorage.setItem('debug', 'true');

// Ver logs del sistema
console.log('Sistema de reservas:', reservationSystem);
console.log('Sistema de búsqueda:', searchSystem);
console.log('Sistema de galería:', gallerySystem);
```

## 📞 Soporte

Para soporte técnico o consultas sobre el proyecto:

- **Email**: ludotecalaolin@gmail.com
- **WhatsApp**: +34 666 00 90 13
- **Instagram**: @laolin_childrens_play_hub

## 📄 Licencia

Este proyecto está desarrollado específicamente para Laolin Children's Play Hub. Todos los derechos reservados.

## 🔄 Actualizaciones

### Versión 1.0.0 (Enero 2025)
- ✅ Landing page completa
- ✅ Sistema de reservas
- ✅ Galería de imágenes
- ✅ Testimonios
- ✅ Búsqueda inteligente
- ✅ Menú hamburguesa
- ✅ Integración con redes sociales
- ✅ Animaciones de burbujas
- ✅ Diseño responsive
- ✅ SEO optimizado

### Próximas Funcionalidades
- [ ] Sistema de notificaciones push
- [ ] Chat en vivo
- [ ] Integración con Google Calendar
- [ ] Sistema de fidelización
- [ ] App móvil nativa

---

**Desarrollado con ❤️ para Laolin Children's Play Hub**


python3 -m http.server 8000