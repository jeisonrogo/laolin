// Configuración de Strapi CMS
const STRAPI_CONFIG = {
    // URL de Strapi (cambiar en producción)
    apiUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:1337/api'  // Desarrollo local
        : 'https://TU_DOMINIO_RAILWAY.up.railway.app/api', // Producción (cambiar después del deploy)

    // Modo de desarrollo
    devMode: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',

    // Usar Strapi o fallback a textos.json
    useCMS: true, // Cambiar a false para volver a textos.json

    // Opciones de fetch
    fetchOptions: {
        headers: {
            'Content-Type': 'application/json',
        }
    }
};

// Función para obtener textos desde Strapi
async function fetchTextosFromStrapi() {
    try {
        const pageSize = 100;
        let page = 1;
        let allTextos = [];
        let hasMore = true;

        // Obtener todas las páginas
        while (hasMore) {
            const response = await fetch(
                `${STRAPI_CONFIG.apiUrl}/textos?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
                STRAPI_CONFIG.fetchOptions
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.data || !Array.isArray(data.data)) {
                console.error('❌ Formato de respuesta inválido:', data);
                throw new Error('Formato de respuesta inválido');
            }

            allTextos = allTextos.concat(data.data);

            // Verificar si hay más páginas
            const total = data.meta?.pagination?.total || 0;
            const currentCount = page * pageSize;
            hasMore = currentCount < total;

            page++;
        }

        // Convertir formato de Strapi al formato de textos.json
        const textos = {};

        allTextos.forEach(item => {
            // Strapi v5 puede usar directamente las propiedades o item.attributes
            const clave = item.clave || item.attributes?.clave;
            let valor = item.valor || item.attributes?.valor;

            if (!clave || valor === undefined || valor === null) {
                console.warn('⚠️ Item sin clave o valor:', item);
                return;
            }

            // Intentar parsear valores que son JSON strings (arrays/objects)
            if (typeof valor === 'string' && (valor.startsWith('[') || valor.startsWith('{'))) {
                try {
                    valor = JSON.parse(valor);
                } catch (e) {
                    // Si falla el parse, mantener como string
                }
            }

            // Reconstruir estructura anidada desde claves con puntos
            const keys = clave.split('.');
            let current = textos;

            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (!current[key]) {
                    current[key] = {};
                }
                current = current[key];
            }

            current[keys[keys.length - 1]] = valor;
        });

        return textos;
    } catch (error) {
        console.error('Error cargando textos desde Strapi:', error);
        throw error;
    }
}

// Función para obtener imágenes de galería desde Strapi
async function fetchGaleriaFromStrapi() {
    try {
        const pageSize = 100;
        let page = 1;
        let allImagenes = [];
        let hasMore = true;

        // Obtener todas las páginas
        while (hasMore) {
            const response = await fetch(
                `${STRAPI_CONFIG.apiUrl}/imagen-galerias?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=orden:asc`,
                STRAPI_CONFIG.fetchOptions
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.data || !Array.isArray(data.data)) {
                console.error('❌ Formato de respuesta inválido:', data);
                throw new Error('Formato de respuesta inválido');
            }

            allImagenes = allImagenes.concat(data.data);

            // Verificar si hay más páginas
            const total = data.meta?.pagination?.total || 0;
            const currentCount = page * pageSize;
            hasMore = currentCount < total;

            page++;
        }

        // Convertir formato de Strapi al formato de gallery.js
        const imagenes = allImagenes.map(item => {
            // Strapi v5 puede usar directamente las propiedades o item.attributes
            const titulo = item.titulo || item.attributes?.titulo;
            const descripcion = item.descripcion || item.attributes?.descripcion;
            const categoria = item.categoria || item.attributes?.categoria;
            const imagen = item.imagen || item.attributes?.imagen;
            const orden = item.orden || item.attributes?.orden;

            // Obtener URL de la imagen
            let imageUrl = '';
            if (imagen) {
                if (imagen.data) {
                    const imageData = imagen.data.attributes || imagen.data;
                    const baseUrl = STRAPI_CONFIG.apiUrl.replace('/api', '');
                    imageUrl = `${baseUrl}${imageData.url}`;
                } else if (imagen.url) {
                    const baseUrl = STRAPI_CONFIG.apiUrl.replace('/api', '');
                    imageUrl = `${baseUrl}${imagen.url}`;
                }
            }

            return {
                src: imageUrl,
                alt: titulo,
                category: categoria,
                descripcion: descripcion || '',
                orden: orden || 0
            };
        });

        return imagenes;
    } catch (error) {
        console.error('Error cargando galería desde Strapi:', error);
        throw error;
    }
}

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        STRAPI_CONFIG,
        fetchTextosFromStrapi,
        fetchGaleriaFromStrapi
    };
}
