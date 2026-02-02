/**
 * Sistema de Tarifas con Filtros
 * Carga y muestra tarifas desde Strapi con sistema de filtrado por categorías
 */

class PricingSystem {
    constructor() {
        this.categories = [];
        this.items = [];
        this.documents = [];
        this.callouts = [];
        this.currentFilter = 'all';
        this.filteredItems = [];
        this.isLoading = false;

        // Orden predefinido de categorías (debe coincidir con el orden de los botones)
        this.categoryOrder = ['alquiler', 'alquileres', 'servicios', 'menus', 'menús'];
    }

    async init() {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            // Cargar datos desde Strapi o fallback
            if (typeof STRAPI_CONFIG !== 'undefined' && STRAPI_CONFIG.useCMS) {
                await this.loadFromStrapi();
            } else {
                await this.loadFromFallback();
            }

            // Renderizar la interfaz
            this.render();
            this.attachEventListeners();

        } catch (error) {
            console.error('Error inicializando sistema de tarifas:', error);
            this.showError();
        } finally {
            this.isLoading = false;
        }
    }

    async loadFromStrapi() {
        try {
            console.log('Cargando tarifas desde Strapi...');

            // Cargar categorías, items, documentos y callouts en paralelo
            const promises = [
                fetchPricingCategoriesFromStrapi(),
                fetchPricingItemsFromStrapi()
            ];

            // Intentar cargar documentos si la función existe
            if (typeof fetchDocumentosFromStrapi === 'function') {
                promises.push(fetchDocumentosFromStrapi());
            }

            // Intentar cargar callouts si la función existe
            if (typeof fetchCalloutsFromStrapi === 'function') {
                promises.push(fetchCalloutsFromStrapi('tarifas'));
            }

            const results = await Promise.all(promises);

            let categories = results[0];
            const items = results[1];
            this.documents = results[2] || [];
            this.callouts = results[3] || [];

            // Ordenar categorías según el orden predefinido
            categories = this.sortCategories(categories);

            this.categories = categories;
            this.items = items;
            this.filteredItems = items;

            console.log(`Cargadas ${categories.length} categorías, ${items.length} items y ${this.callouts.length} callouts`);
        } catch (error) {
            console.warn('Error cargando desde Strapi, usando fallback...', error);
            await this.loadFromFallback();
        }
    }

    sortCategories(categories) {
        return categories.sort((a, b) => {
            const indexA = this.categoryOrder.findIndex(slug =>
                a.slug.toLowerCase().includes(slug) || a.nombre.toLowerCase().includes(slug)
            );
            const indexB = this.categoryOrder.findIndex(slug =>
                b.slug.toLowerCase().includes(slug) || b.nombre.toLowerCase().includes(slug)
            );

            // Si no está en el orden predefinido, usar el orden original
            const orderA = indexA === -1 ? 999 : indexA;
            const orderB = indexB === -1 ? 999 : indexB;

            if (orderA !== orderB) return orderA - orderB;

            // Si ambos tienen el mismo orden predefinido, usar el campo orden
            return (a.orden || 0) - (b.orden || 0);
        });
    }

    async loadFromFallback() {
        // Datos de fallback (puedes personalizar esto)
        this.categories = [
            {
                id: 1,
                nombre: 'Alquiler',
                slug: 'alquiler',
                icono: '🏢',
                color: '#a8d5ba',
                descripcion: 'Alquiler de espacios',
                orden: 1
            },
            {
                id: 2,
                nombre: 'Servicios',
                slug: 'servicios',
                icono: '🎨',
                color: '#ffe4b3',
                descripcion: 'Servicios adicionales',
                orden: 2
            },
            {
                id: 3,
                nombre: 'Menús',
                slug: 'menus',
                icono: '🍕',
                color: '#ffd480',
                descripcion: 'Menús y catering',
                orden: 3
            }
        ];

        this.items = [
            {
                id: 1,
                categoria: 'alquiler',
                subcategoria: 'Lunes a Jueves (tardes)',
                descripcion: '4 horas',
                precio: 110,
                moneda: '€',
                unidad: '4h',
                destacado: false,
                condiciones: 'NO incluye limpieza final'
            }
        ];

        this.filteredItems = this.items;
        console.log('📋 Usando datos de fallback');
    }

    render() {
        this.renderFilters();
        this.renderCalloutsInicio();
        this.renderPricingTable();
        this.renderStats();
        this.renderDocumentLinks();
        this.renderCalloutsFin();
    }

    renderCalloutsInicio() {
        // Obtener callouts de inicio para la categoría actual o generales
        let callouts = this.callouts.filter(c => c.posicion === 'inicio');

        // Filtrar por categoría si hay un filtro activo
        if (this.currentFilter !== 'all') {
            callouts = callouts.filter(c =>
                !c.categoria_filtro || c.categoria_filtro === this.currentFilter
            );
        } else {
            // Si no hay filtro, solo mostrar callouts generales (sin categoria_filtro)
            callouts = callouts.filter(c => !c.categoria_filtro);
        }

        this.renderCallouts(callouts, 'pricingCalloutsInicio');
    }

    renderCalloutsFin() {
        // Obtener callouts de fin para la categoría actual o generales
        let callouts = this.callouts.filter(c => c.posicion === 'fin');

        // Filtrar por categoría si hay un filtro activo
        if (this.currentFilter !== 'all') {
            callouts = callouts.filter(c =>
                !c.categoria_filtro || c.categoria_filtro === this.currentFilter
            );
        } else {
            // Si no hay filtro, solo mostrar callouts generales (sin categoria_filtro)
            callouts = callouts.filter(c => !c.categoria_filtro);
        }

        this.renderCallouts(callouts, 'pricingCalloutsFin');
    }

    renderCallouts(callouts, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Limpiar contenedor
        container.innerHTML = '';

        if (callouts.length === 0) return;

        // Renderizar cada callout
        callouts.forEach(callout => {
            const calloutHTML = this.createCalloutHTML(callout);
            container.insertAdjacentHTML('beforeend', calloutHTML);
        });

        // Añadir event listeners para botones de callouts
        this.attachCalloutListeners(containerId);
    }

    createCalloutHTML(callout) {
        const estiloClass = `callout-${callout.estilo || 'info'}`;

        // Determinar el tipo de acción
        let actionHTML = '';
        if (callout.tipo_accion === 'descargar_archivo' && callout.archivo_url) {
            actionHTML = `
                <a href="${callout.archivo_url}" target="_blank" class="callout-button" download>
                    <i class="fas ${callout.icono}"></i>
                    <span>${callout.texto_boton}</span>
                </a>
            `;
        } else if (callout.tipo_accion === 'link_externo' && callout.url_externa) {
            actionHTML = `
                <a href="${callout.url_externa}" target="_blank" rel="noopener noreferrer" class="callout-button">
                    <i class="fas ${callout.icono}"></i>
                    <span>${callout.texto_boton}</span>
                </a>
            `;
        } else if (callout.tipo_accion === 'scroll_seccion' && callout.seccion_destino) {
            actionHTML = `
                <a href="javascript:void(0)" class="callout-button" onclick="scrollToSection('${callout.seccion_destino}')">
                    <i class="fas ${callout.icono}"></i>
                    <span>${callout.texto_boton}</span>
                </a>
            `;
        }

        // Si no hay título, mostrar solo el texto de forma más compacta
        const tituloHTML = callout.titulo ? `<h4 class="callout-titulo">${callout.titulo}</h4>` : '';

        return `
            <div class="pricing-callout ${estiloClass}"
                 style="--callout-bg: ${callout.color_fondo};
                        --callout-border: ${callout.color_borde};
                        --callout-text: ${callout.color_texto}">
                <div class="callout-content">
                    <div class="callout-icon">
                        <i class="fas ${callout.icono}"></i>
                    </div>
                    <div class="callout-text">
                        ${tituloHTML}
                        <p class="callout-descripcion">${callout.texto}</p>
                    </div>
                </div>
                ${actionHTML ? `<div class="callout-actions">${actionHTML}</div>` : ''}
            </div>
        `;
    }

    attachCalloutListeners(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Los enlaces ya tienen su comportamiento nativo
        // Aquí podrías añadir analytics o tracking si lo necesitas
        const buttons = container.querySelectorAll('.callout-button');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Tracking opcional
                console.log('Callout button clicked:', button.textContent.trim());
            });
        });
    }

    renderDocumentLinks() {
        // Buscar documentos que deben mostrarse en tarifas
        const tarifasDocuments = this.documents.filter(doc => doc.mostrar_en_tarifas);

        if (tarifasDocuments.length === 0) return;

        const pricingNote = document.querySelector('.pricing-note');
        if (!pricingNote) return;

        // Insertar después de la nota de precios
        let docsHTML = '<div class="pricing-documents">';
        docsHTML += '<h4>Documentos importantes</h4>';
        docsHTML += '<div class="documents-grid">';

        tarifasDocuments.forEach(doc => {
            docsHTML += `
                <a href="${doc.archivo_url}" target="_blank" class="documento-descarga" title="${doc.descripcion || doc.nombre}">
                    <i class="fas ${doc.icono}"></i>
                    <span>${doc.texto_boton}: ${doc.nombre}</span>
                </a>
            `;
        });

        docsHTML += '</div></div>';

        // Insertar antes de la nota de precios
        pricingNote.insertAdjacentHTML('beforebegin', docsHTML);
    }

    renderFilters() {
        const filtersContainer = document.getElementById('pricingFilters');
        if (!filtersContainer) return;

        const allCount = this.items.length;

        let filtersHTML = `
            <button class="pricing-filter-btn active" data-filter="all">
                <span class="filter-icon">📋</span>
                <span class="filter-name">Todas</span>
                <span class="filter-count">${allCount}</span>
            </button>
        `;

        this.categories.forEach(category => {
            const count = this.items.filter(item => item.categoria === category.slug).length;
            filtersHTML += `
                <button class="pricing-filter-btn" data-filter="${category.slug}" style="--category-color: ${category.color}">
                    <span class="filter-icon">${category.icono}</span>
                    <span class="filter-name">${category.nombre}</span>
                    <span class="filter-count">${count}</span>
                </button>
            `;
        });

        filtersContainer.innerHTML = filtersHTML;
    }

    renderPricingTable() {
        const tableContainer = document.getElementById('pricingTable');
        if (!tableContainer) return;

        if (this.filteredItems.length === 0) {
            tableContainer.innerHTML = `
                <div class="pricing-empty">
                    <div class="empty-icon">📭</div>
                    <p>No hay tarifas disponibles en esta categoría</p>
                </div>
            `;
            return;
        }

        // Agrupar items por subcategoría
        const groupedItems = this.groupBySubcategory(this.filteredItems);

        let tableHTML = '<div class="pricing-table-wrapper">';
        tableHTML += '<table class="pricing-table">';
        tableHTML += `
            <thead>
                <tr>
                    <th>Categoría</th>
                    <th>Descripción</th>
                    <th>Precio</th>
                    <th class="pricing-th-mobile-hide">Condiciones</th>
                </tr>
            </thead>
            <tbody>
        `;

        Object.entries(groupedItems).forEach(([subcategoria, items]) => {
            items.forEach((item, index) => {
                const categoryInfo = this.categories.find(cat => cat.slug === item.categoria);
                const categoryColor = categoryInfo?.color || '#a8d5ba';
                const categoryIcon = categoryInfo?.icono || '💰';

                // Determinar si es Super Party
                const isSuperParty = item.es_super_party === true;
                const rowClass = isSuperParty ? 'super-party' : (item.destacado ? 'pricing-row-destacado' : '');
                const priceDisplay = `${item.precio}${item.moneda}${item.unidad ? ` / ${item.unidad}` : ''}`;

                // Buscar documento asociado
                let documentLink = '';
                if (item.mostrar_link_documento && item.documento) {
                    const doc = this.documents.find(d => d.id === item.documento);
                    if (doc && doc.archivo_url) {
                        documentLink = `<a href="${doc.archivo_url}" target="_blank" class="documento-descarga-inline" title="${doc.nombre}">
                            <i class="fas ${doc.icono}"></i> ${doc.texto_boton}
                        </a>`;
                    }
                }

                tableHTML += `
                    <tr class="pricing-row ${rowClass}" style="--row-color: ${categoryColor}">
                        ${index === 0 ? `
                            <td rowspan="${items.length}" class="pricing-cell-category">
                                <div class="category-badge" style="background: ${categoryColor}20; color: ${categoryColor}">
                                    <span class="category-icon">${categoryIcon}</span>
                                    <span class="category-text">${subcategoria}</span>
                                </div>
                            </td>
                        ` : ''}
                        <td class="pricing-cell-description ${isSuperParty ? 'pricing-description' : ''}">
                            <div class="description-content">
                                ${isSuperParty ? '<span class="super-party-badge">Super Party</span>' : ''}
                                <span class="description-text">${item.descripcion}</span>
                                ${item.super_party_texto && isSuperParty ? `<span class="description-note">✨ ${item.super_party_texto}</span>` : ''}
                                ${item.nota && !isSuperParty ? `<span class="description-note">💡 ${item.nota}</span>` : ''}
                                ${documentLink}
                            </div>
                        </td>
                        <td class="pricing-cell-price ${isSuperParty ? 'pricing-price' : ''}">
                            <div class="price-content">
                                <span class="price-amount">${priceDisplay}</span>
                                ${item.destacado && !isSuperParty ? '<span class="price-badge">⭐ Popular</span>' : ''}
                            </div>
                        </td>
                        <td class="pricing-cell-conditions pricing-th-mobile-hide">
                            <span class="conditions-text">${item.condiciones || '-'}</span>
                        </td>
                    </tr>
                `;
            });
        });

        tableHTML += '</tbody></table></div>';
        tableContainer.innerHTML = tableHTML;
    }

    renderStats() {
        const statsContainer = document.getElementById('pricingStats');
        if (!statsContainer) return;

        const totalItems = this.items.length;
        const totalCategories = this.categories.length;
        const minPrice = Math.min(...this.items.map(item => item.precio));
        const maxPrice = Math.max(...this.items.map(item => item.precio));

        statsContainer.innerHTML = `
            <div class="pricing-stats">
                <div class="stat-item">
                    <span class="stat-icon">📊</span>
                    <span class="stat-value">${totalItems}</span>
                    <span class="stat-label">Opciones</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">🏷️</span>
                    <span class="stat-value">${totalCategories}</span>
                    <span class="stat-label">Categorías</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">💰</span>
                    <span class="stat-value">${minPrice}€ - ${maxPrice}€</span>
                    <span class="stat-label">Rango de precios</span>
                </div>
            </div>
        `;
    }

    groupBySubcategory(items) {
        // Primero ordenar items según el orden de categorías
        const sortedItems = [...items].sort((a, b) => {
            // Obtener índice de orden de cada categoría
            const indexA = this.categoryOrder.findIndex(slug =>
                a.categoria.toLowerCase().includes(slug) || a.categoria.toLowerCase() === slug
            );
            const indexB = this.categoryOrder.findIndex(slug =>
                b.categoria.toLowerCase().includes(slug) || b.categoria.toLowerCase() === slug
            );

            const orderA = indexA === -1 ? 999 : indexA;
            const orderB = indexB === -1 ? 999 : indexB;

            // Si pertenecen a diferentes categorías, ordenar por categoría
            if (orderA !== orderB) return orderA - orderB;

            // Si son de la misma categoría, mantener orden original
            return 0;
        });

        // Ahora agrupar por subcategoría manteniendo el orden
        return sortedItems.reduce((acc, item) => {
            if (!acc[item.subcategoria]) {
                acc[item.subcategoria] = [];
            }
            acc[item.subcategoria].push(item);
            return acc;
        }, {});
    }

    filterByCategory(categorySlug) {
        this.currentFilter = categorySlug;

        if (categorySlug === 'all') {
            this.filteredItems = this.items;
        } else {
            this.filteredItems = this.items.filter(item => item.categoria === categorySlug);
        }

        // Re-renderizar tabla y callouts
        this.renderPricingTable();
        this.renderCalloutsInicio();
        this.renderCalloutsFin();

        // Animar la transición
        this.animateFilterChange();
    }

    attachEventListeners() {
        // Filtros
        const filterButtons = document.querySelectorAll('.pricing-filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = btn.getAttribute('data-filter');

                // Actualizar estado activo
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Aplicar filtro
                this.filterByCategory(filter);
            });
        });
    }

    animateFilterChange() {
        const table = document.querySelector('.pricing-table-wrapper');
        if (!table) return;

        table.style.opacity = '0';
        table.style.transform = 'translateY(20px)';

        setTimeout(() => {
            table.style.transition = 'all 0.3s ease';
            table.style.opacity = '1';
            table.style.transform = 'translateY(0)';
        }, 50);
    }

    showError() {
        const tableContainer = document.getElementById('pricingTable');
        if (!tableContainer) return;

        tableContainer.innerHTML = `
            <div class="pricing-error">
                <div class="error-icon">⚠️</div>
                <h3>Error al cargar tarifas</h3>
                <p>No pudimos cargar la información de precios. Por favor, inténtalo de nuevo más tarde.</p>
                <button class="btn-retry" onclick="pricingSystem.init()">Reintentar</button>
            </div>
        `;
    }
}

// Inicializar sistema cuando el DOM esté listo
let pricingSystem;

document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que strapi-config.js esté cargado
    setTimeout(() => {
        pricingSystem = new PricingSystem();
        pricingSystem.init();
    }, 100);
});
