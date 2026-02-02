// Configuración de Strapi CMS
const STRAPI_CONFIG = {
    // URL de Strapi (cambiar en producción)
    apiUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:1337/api'//'http://localhost:1337/api'  // Desarrollo local
        : 'https://www.minegocio360.cloud/laolin/api', // Producción (cambiar después del deploy)

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

        // Convertir formato de Strapi al formato de gallery.js (con soporte de video)
        const imagenes = allImagenes.map(item => {
            // Strapi v5 puede usar directamente las propiedades o item.attributes
            const titulo = item.titulo || item.attributes?.titulo;
            const descripcion = item.descripcion || item.attributes?.descripcion;
            const categoria = item.categoria || item.attributes?.categoria;
            const imagen = item.imagen || item.attributes?.imagen;
            const orden = item.orden || item.attributes?.orden;
            const tipo_media = item.tipo_media || item.attributes?.tipo_media || 'imagen';
            const video_url = item.video_url || item.attributes?.video_url || '';
            const video_archivo = item.video_archivo || item.attributes?.video_archivo;
            const thumbnail = item.thumbnail || item.attributes?.thumbnail;

            const baseUrl = STRAPI_CONFIG.apiUrl.replace('/api', '');

            // Obtener URL de la imagen
            let imageUrl = '';
            if (imagen) {
                if (imagen.data) {
                    const imageData = imagen.data.attributes || imagen.data;
                    imageUrl = `${baseUrl}${imageData.url}`;
                } else if (imagen.url) {
                    imageUrl = `${baseUrl}${imagen.url}`;
                }
            }

            // Obtener URL del video archivo
            let videoArchivoUrl = '';
            if (video_archivo) {
                if (video_archivo.data) {
                    const videoData = video_archivo.data.attributes || video_archivo.data;
                    videoArchivoUrl = `${baseUrl}${videoData.url}`;
                } else if (video_archivo.url) {
                    videoArchivoUrl = `${baseUrl}${video_archivo.url}`;
                }
            }

            // Obtener URL del thumbnail
            let thumbnailUrl = imageUrl;
            if (thumbnail) {
                if (thumbnail.data) {
                    const thumbData = thumbnail.data.attributes || thumbnail.data;
                    thumbnailUrl = `${baseUrl}${thumbData.url}`;
                } else if (thumbnail.url) {
                    thumbnailUrl = `${baseUrl}${thumbnail.url}`;
                }
            }

            return {
                src: imageUrl,
                alt: titulo,
                category: categoria,
                descripcion: descripcion || '',
                orden: orden || 0,
                tipo_media: tipo_media,
                video_url: video_url,
                video_archivo: videoArchivoUrl,
                thumbnail: thumbnailUrl
            };
        });

        return imagenes;
    } catch (error) {
        console.error('Error cargando galería desde Strapi:', error);
        throw error;
    }
}

// Función para obtener banner slides desde Strapi
async function fetchBannerSlidesFromStrapi() {
    try {
        const pageSize = 100;
        let page = 1;
        let allSlides = [];
        let hasMore = true;

        // Obtener todas las páginas
        while (hasMore) {
            const response = await fetch(
                `${STRAPI_CONFIG.apiUrl}/banner-slides?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=orden:asc&filters[activo][$eq]=true`,
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

            allSlides = allSlides.concat(data.data);

            // Verificar si hay más páginas
            const total = data.meta?.pagination?.total || 0;
            const currentCount = page * pageSize;
            hasMore = currentCount < total;

            page++;
        }

        // Convertir formato de Strapi al formato esperado por el carousel
        const slides = allSlides.map(item => {
            // Strapi v5 puede usar directamente las propiedades o item.attributes
            const attrs = item.attributes || item;
            const titulo = attrs.titulo;
            const orden = attrs.orden || 0;
            const htmlContent = attrs.htmlContent || '';
            const activo = attrs.activo !== undefined ? attrs.activo : true;
            const duracion = attrs.duracion || 5000;
            const imagen = attrs.imagen;

            // Campos de botón de inscripción
            const boton_inscripcion_activo = attrs.boton_inscripcion_activo || false;
            const boton_inscripcion_texto = attrs.boton_inscripcion_texto || 'Inscribirse';
            const boton_inscripcion_color = attrs.boton_inscripcion_color || '#db2777';
            const boton_inscripcion_color_texto = attrs.boton_inscripcion_color_texto || '#ffffff';
            const boton_inscripcion_color_borde = attrs.boton_inscripcion_color_borde || '#db2777';
            const boton_inscripcion_color_gradiente = attrs.boton_inscripcion_color_gradiente || '#f472b6';
            const boton_inscripcion_color_hover = attrs.boton_inscripcion_color_hover || '#be185d';
            const boton_inscripcion_color_sombra = attrs.boton_inscripcion_color_sombra || '#db2777';
            const boton_accion = attrs.boton_accion || 'inscripcion_pequeclub';
            const boton_link_externo = attrs.boton_link_externo || '';

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
                titulo: titulo,
                imageUrl: imageUrl,
                htmlContent: htmlContent,
                activo: activo,
                duracion: duracion,
                orden: orden,
                // Campos de inscripción
                boton_inscripcion_activo: boton_inscripcion_activo,
                boton_inscripcion_texto: boton_inscripcion_texto,
                boton_inscripcion_color: boton_inscripcion_color,
                boton_inscripcion_color_texto: boton_inscripcion_color_texto,
                boton_inscripcion_color_borde: boton_inscripcion_color_borde,
                boton_inscripcion_color_gradiente: boton_inscripcion_color_gradiente,
                boton_inscripcion_color_hover: boton_inscripcion_color_hover,
                boton_inscripcion_color_sombra: boton_inscripcion_color_sombra,
                boton_accion: boton_accion,
                boton_link_externo: boton_link_externo
            };
        });

        // Filtrar solo slides activos y ordenar
        return slides.filter(slide => slide.activo).sort((a, b) => a.orden - b.orden);
    } catch (error) {
        console.error('Error cargando banner slides desde Strapi:', error);
        throw error;
    }
}

// Función para obtener categorías de precios desde Strapi
async function fetchPricingCategoriesFromStrapi() {
    try {
        const response = await fetch(
            `${STRAPI_CONFIG.apiUrl}/categoria-de-precios?populate=*&sort=orden:asc&filters[activo][$eq]=true`,
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

        // Convertir formato de Strapi
        const categories = data.data.map(item => {
            const attrs = item.attributes || item;
            return {
                id: item.id,
                nombre: attrs.nombre,
                slug: attrs.slug,
                icono: attrs.icono || '💰',
                color: attrs.color || '#a8d5ba',
                descripcion: attrs.descripcion || '',
                orden: attrs.orden || 0,
                activo: attrs.activo
            };
        });

        return categories;
    } catch (error) {
        console.error('Error cargando categorías de precios desde Strapi:', error);
        throw error;
    }
}

// Función para obtener items de precios desde Strapi
async function fetchPricingItemsFromStrapi() {
    try {
        const pageSize = 100;
        let page = 1;
        let allItems = [];
        let hasMore = true;

        // Obtener todas las páginas
        while (hasMore) {
            const response = await fetch(
                `${STRAPI_CONFIG.apiUrl}/item-de-precios?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=orden:asc&filters[activo][$eq]=true`,
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

            allItems = allItems.concat(data.data);

            // Verificar si hay más páginas
            const total = data.meta?.pagination?.total || 0;
            const currentCount = page * pageSize;
            hasMore = currentCount < total;

            page++;
        }

        // Convertir formato de Strapi
        const items = allItems.map(item => {
            const attrs = item.attributes || item;
            const categoria = attrs.categoria?.data?.attributes || attrs.categoria?.data || attrs.categoria;

            return {
                id: item.id,
                categoria: categoria?.slug || '',
                categoriaId: categoria?.id || attrs.categoria?.data?.id,
                subcategoria: attrs.subcategoria,
                descripcion: attrs.descripcion,
                precio: parseFloat(attrs.precio),
                moneda: attrs.moneda || '€',
                unidad: attrs.unidad || '',
                condiciones: attrs.condiciones || '',
                destacado: attrs.destacado || false,
                orden: attrs.orden || 0,
                activo: attrs.activo,
                nota: attrs.nota || ''
            };
        });

        return items;
    } catch (error) {
        console.error('Error cargando items de precios desde Strapi:', error);
        throw error;
    }
}

// Función para obtener horarios desde Strapi
async function fetchHorariosFromStrapi() {
    try {
        const response = await fetch(
            `${STRAPI_CONFIG.apiUrl}/horarios?populate=*&sort=orden:asc&filters[activo][$eq]=true`,
            STRAPI_CONFIG.fetchOptions
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.data || !Array.isArray(data.data)) {
            console.error('Formato de respuesta inválido:', data);
            throw new Error('Formato de respuesta inválido');
        }

        // Convertir formato de Strapi
        const horarios = data.data.map(item => {
            const attrs = item.attributes || item;
            return {
                id: item.id,
                tipo: attrs.tipo,
                dias: attrs.dias,
                hora_inicio: attrs.hora_inicio,
                hora_fin: attrs.hora_fin,
                nota: attrs.nota || '',
                orden: attrs.orden || 0,
                icono: attrs.icono || 'clock'
            };
        });

        return horarios;
    } catch (error) {
        console.error('Error cargando horarios desde Strapi:', error);
        throw error;
    }
}

// Función para obtener actividades desde Strapi
async function fetchActividadesFromStrapi() {
    try {
        const response = await fetch(
            `${STRAPI_CONFIG.apiUrl}/actividades?populate=*&sort=orden:asc&filters[activo][$eq]=true`,
            STRAPI_CONFIG.fetchOptions
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.data || !Array.isArray(data.data)) {
            console.error('Formato de respuesta inválido:', data);
            throw new Error('Formato de respuesta inválido');
        }

        // Convertir formato de Strapi
        const actividades = data.data.map(item => {
            const attrs = item.attributes || item;
            const imagen = attrs.imagen;

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
                id: item.id,
                nombre: attrs.nombre,
                descripcion: attrs.descripcion || '',
                emoji: attrs.emoji,
                color_fondo: attrs.color_fondo || '#a8d5ba',
                color_texto: attrs.color_texto || '#2c5530',
                icono_fontawesome: attrs.icono_fontawesome || '',
                imagen_url: imageUrl,
                link_seccion: attrs.link_seccion || '',
                orden: attrs.orden || 0,
                animacion_delay: attrs.animacion_delay || 0
            };
        });

        return actividades;
    } catch (error) {
        console.error('Error cargando actividades desde Strapi:', error);
        throw error;
    }
}

// Función para obtener documentos desde Strapi
async function fetchDocumentosFromStrapi() {
    try {
        const response = await fetch(
            `${STRAPI_CONFIG.apiUrl}/documentos?populate=*&sort=orden:asc&filters[activo][$eq]=true`,
            STRAPI_CONFIG.fetchOptions
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.data || !Array.isArray(data.data)) {
            throw new Error('Formato de respuesta inválido');
        }

        // Convertir formato de Strapi
        const documentos = data.data.map(item => {
            const attrs = item.attributes || item;
            const archivo = attrs.archivo;

            let archivoUrl = '';
            if (archivo) {
                if (archivo.data) {
                    const archivoData = archivo.data.attributes || archivo.data;
                    const baseUrl = STRAPI_CONFIG.apiUrl.replace('/api', '');
                    archivoUrl = `${baseUrl}${archivoData.url}`;
                } else if (archivo.url) {
                    const baseUrl = STRAPI_CONFIG.apiUrl.replace('/api', '');
                    archivoUrl = `${baseUrl}${archivo.url}`;
                }
            }

            return {
                id: item.id,
                nombre: attrs.nombre,
                descripcion: attrs.descripcion || '',
                tipo: attrs.tipo,
                archivo_url: archivoUrl,
                texto_boton: attrs.texto_boton || 'Descargar',
                icono: attrs.icono || 'fa-file-pdf',
                mostrar_en_tarifas: attrs.mostrar_en_tarifas || false,
                mostrar_en_reservas: attrs.mostrar_en_reservas || false,
                mostrar_en_alquiler: attrs.mostrar_en_alquiler || false,
                orden: attrs.orden || 0
            };
        });

        return documentos;
    } catch (error) {
        console.error('Error cargando documentos desde Strapi:', error);
        throw error;
    }
}

// Función para obtener configuración global desde Strapi
async function fetchConfiguracionGlobalFromStrapi() {
    try {
        const response = await fetch(
            `${STRAPI_CONFIG.apiUrl}/configuracion-global?populate=*`,
            STRAPI_CONFIG.fetchOptions
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.data) {
            throw new Error('Formato de respuesta inválido');
        }

        const attrs = data.data.attributes || data.data;

        return {
            telefono_principal: attrs.telefono_principal || '919358360',
            telefono_whatsapp: attrs.telefono_whatsapp || '614341504',
            email_contacto: attrs.email_contacto || 'ludotecalaolin@gmail.com',
            email_reservas: attrs.email_reservas || '',
            direccion: attrs.direccion || '',
            tipografia_principal: attrs.tipografia_principal || 'Gochi Hand',
            tipografia_secundaria: attrs.tipografia_secundaria || 'Arial, sans-serif',
            tamano_fuente_base: attrs.tamano_fuente_base || 16,
            instagram_url: attrs.instagram_url || '',
            facebook_url: attrs.facebook_url || '',
            google_maps_embed: attrs.google_maps_embed || '',
            google_places_id: attrs.google_places_id || '',
            mostrar_resenas_google: attrs.mostrar_resenas_google || false,
            cantidad_resenas_mostrar: attrs.cantidad_resenas_mostrar || 5,
            nota_horarios: attrs.nota_horarios || ''
        };
    } catch (error) {
        console.error('Error cargando configuración global desde Strapi:', error);
        throw error;
    }
}

// Función para obtener imágenes de sección desde Strapi
async function fetchImagenesSeccionFromStrapi(seccion) {
    try {
        let url = `${STRAPI_CONFIG.apiUrl}/imagen-secciones?populate=*&filters[activo][$eq]=true`;

        if (seccion) {
            url += `&filters[seccion][$eq]=${seccion}`;
        }

        const response = await fetch(url, STRAPI_CONFIG.fetchOptions);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.data || !Array.isArray(data.data)) {
            throw new Error('Formato de respuesta inválido');
        }

        // Convertir formato de Strapi
        const imagenes = data.data.map(item => {
            const attrs = item.attributes || item;
            const imagen = attrs.imagen;

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
                id: item.id,
                identificador: attrs.identificador,
                nombre: attrs.nombre,
                seccion: attrs.seccion,
                imagen_url: imageUrl,
                alt_text: attrs.alt_text || attrs.nombre,
                descripcion: attrs.descripcion || ''
            };
        });

        return imagenes;
    } catch (error) {
        console.error('Error cargando imágenes de sección desde Strapi:', error);
        throw error;
    }
}

// Función para obtener reseñas de Google desde Strapi
async function fetchResenasGoogleFromStrapi() {
    try {
        const response = await fetch(
            `${STRAPI_CONFIG.apiUrl}/resenas-google?populate=*&sort=fecha_resena:desc&filters[mostrar][$eq]=true`,
            STRAPI_CONFIG.fetchOptions
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.data || !Array.isArray(data.data)) {
            throw new Error('Formato de respuesta inválido');
        }

        // Convertir formato de Strapi
        const resenas = data.data.map(item => {
            const attrs = item.attributes || item;

            return {
                id: item.id,
                autor: attrs.autor,
                foto_autor: attrs.foto_autor || '',
                puntuacion: attrs.puntuacion,
                texto: attrs.texto,
                fecha_resena: attrs.fecha_resena,
                fecha_relativa: attrs.fecha_relativa || '',
                idioma: attrs.idioma || 'es',
                es_manual: attrs.es_manual !== false,
                orden: attrs.orden || 0
            };
        });

        return resenas;
    } catch (error) {
        console.error('Error cargando reseñas de Google desde Strapi:', error);
        throw error;
    }
}

// Función para obtener callouts desde Strapi
async function fetchCalloutsFromStrapi(seccion, categoriaFiltro = null) {
    try {
        let url = `${STRAPI_CONFIG.apiUrl}/callouts?populate=*&sort=orden:asc&filters[activo][$eq]=true`;

        if (seccion) {
            url += `&filters[seccion][$eq]=${seccion}`;
        }

        if (categoriaFiltro) {
            url += `&filters[categoria_filtro][$eq]=${categoriaFiltro}`;
        }

        const response = await fetch(url, STRAPI_CONFIG.fetchOptions);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.data || !Array.isArray(data.data)) {
            throw new Error('Formato de respuesta inválido');
        }

        const baseUrl = STRAPI_CONFIG.apiUrl.replace('/api', '');

        // Convertir formato de Strapi
        const callouts = data.data.map(item => {
            const attrs = item.attributes || item;
            const archivo = attrs.archivo;

            // Obtener URL del archivo
            let archivoUrl = '';
            if (archivo) {
                if (archivo.data) {
                    const archivoData = archivo.data.attributes || archivo.data;
                    archivoUrl = `${baseUrl}${archivoData.url}`;
                } else if (archivo.url) {
                    archivoUrl = `${baseUrl}${archivo.url}`;
                }
            }

            return {
                id: item.id,
                nombre: attrs.nombre,
                seccion: attrs.seccion,
                categoria_filtro: attrs.categoria_filtro || null,
                titulo: attrs.titulo,
                texto: attrs.texto,
                tipo_accion: attrs.tipo_accion || 'ninguna',
                archivo_url: archivoUrl,
                url_externa: attrs.url_externa || '',
                seccion_destino: attrs.seccion_destino || '',
                texto_boton: attrs.texto_boton || 'Ver más',
                icono: attrs.icono || 'fa-info-circle',
                color_fondo: attrs.color_fondo || '#fff3cd',
                color_borde: attrs.color_borde || '#ffc107',
                color_texto: attrs.color_texto || '#856404',
                orden: attrs.orden || 0,
                posicion: attrs.posicion || 'fin',
                estilo: attrs.estilo || 'info'
            };
        });

        return callouts;
    } catch (error) {
        console.error('Error cargando callouts desde Strapi:', error);
        throw error;
    }
}

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        STRAPI_CONFIG,
        fetchTextosFromStrapi,
        fetchGaleriaFromStrapi,
        fetchBannerSlidesFromStrapi,
        fetchPricingCategoriesFromStrapi,
        fetchPricingItemsFromStrapi,
        fetchHorariosFromStrapi,
        fetchActividadesFromStrapi,
        fetchDocumentosFromStrapi,
        fetchConfiguracionGlobalFromStrapi,
        fetchImagenesSeccionFromStrapi,
        fetchResenasGoogleFromStrapi,
        fetchCalloutsFromStrapi,
        fetchNumerosWhatsappFromStrapi
    };
}

// Función para obtener números de WhatsApp desde Strapi
async function fetchNumerosWhatsappFromStrapi() {
    try {
        const response = await fetch(
            `${STRAPI_CONFIG.apiUrl}/numeros-whatsapp?sort=orden:asc&filters[activo][$eq]=true`,
            STRAPI_CONFIG.fetchOptions
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.data || !Array.isArray(data.data)) {
            return [];
        }

        return data.data.map(item => {
            const attrs = item.attributes || item;
            return {
                id: item.id,
                etiqueta: attrs.etiqueta || 'WhatsApp',
                numero: attrs.numero,
                icono: attrs.icono || 'fa-whatsapp',
                descripcion: attrs.descripcion || '',
                orden: attrs.orden || 0
            };
        });
    } catch (error) {
        console.error('Error cargando números de WhatsApp:', error);
        return [];
    }
}
