/**
 * Sistema de Tarifas con Filtros
 * Carga y muestra tarifas desde Strapi con sistema de filtrado por categorías
 */

class PricingSystem {
    constructor() {
        this.categories = [];
        this.items = [];
        this.currentFilter = 'all';
        this.filteredItems = [];
        this.isLoading = false;
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
            console.log('🔄 Cargando tarifas desde Strapi...');

            // Cargar categorías y items en paralelo
            const [categories, items] = await Promise.all([
                fetchPricingCategoriesFromStrapi(),
                fetchPricingItemsFromStrapi()
            ]);

            this.categories = categories;
            this.items = items;
            this.filteredItems = items;

            console.log(`✅ Cargadas ${categories.length} categorías y ${items.length} items`);
        } catch (error) {
            console.warn('⚠️ Error cargando desde Strapi, usando fallback...', error);
            await this.loadFromFallback();
        }
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
        this.renderPricingTable();
        this.renderStats();
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

                const rowClass = item.destacado ? 'pricing-row-destacado' : '';
                const priceDisplay = `${item.precio}${item.moneda}${item.unidad ? ` / ${item.unidad}` : ''}`;

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
                        <td class="pricing-cell-description">
                            <div class="description-content">
                                <span class="description-text">${item.descripcion}</span>
                                ${item.nota ? `<span class="description-note">💡 ${item.nota}</span>` : ''}
                            </div>
                        </td>
                        <td class="pricing-cell-price">
                            <div class="price-content">
                                <span class="price-amount">${priceDisplay}</span>
                                ${item.destacado ? '<span class="price-badge">⭐ Popular</span>' : ''}
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
        return items.reduce((acc, item) => {
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

        // Re-renderizar tabla
        this.renderPricingTable();

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
