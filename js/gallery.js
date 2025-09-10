// Sistema de galería con filtros y lightbox
class GallerySystem {
    constructor() {
        this.galleryGrid = document.getElementById('galeriaGrid');
        this.filterButtons = document.querySelectorAll('.filtro-btn');
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImg = document.getElementById('lightboxImg');
        this.lightboxCaption = document.getElementById('lightboxCaption');
        this.lightboxClose = document.getElementById('lightboxClose');
        
        this.currentFilter = 'todos';
        this.galleryData = [];
        
        this.init();
    }
    
    init() {
        this.loadGalleryData();
        this.setupEventListeners();
        this.renderGallery();
    }
    
    loadGalleryData() {
        // Datos de la galería con imágenes relacionadas con ludotecas
        this.galleryData = [
            // Actividades
            {
                id: 1,
                title: 'Juegos Libres',
                category: 'actividades',
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
                description: 'Niños jugando libremente en el área de juegos'
            },
            {
                id: 2,
                title: 'Talleres de Manualidades',
                category: 'actividades',
                image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop',
                description: 'Niños creando manualidades con pintura y papel'
            },
            {
                id: 3,
                title: 'Cuentacuentos',
                category: 'actividades',
                image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop',
                description: 'Sesión de cuentacuentos en el rincón de lectura'
            },
            {
                id: 4,
                title: 'Juegos de Mesa',
                category: 'actividades',
                image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=400&fit=crop',
                description: 'Niños jugando juegos de mesa educativos'
            },
            {
                id: 5,
                title: 'Construcciones',
                category: 'actividades',
                image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=400&fit=crop',
                description: 'Construcciones con bloques y piezas'
            },
            {
                id: 6,
                title: 'Pintura Creativa',
                category: 'actividades',
                image: 'https://images.unsplash.com/photo-1499892477393-f675706cbe6e?w=400&h=400&fit=crop',
                description: 'Taller de pintura creativa para niños'
            },
            
            // Talleres
            {
                id: 7,
                title: 'Taller de Cocina',
                category: 'talleres',
                image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
                description: 'Taller de cocina infantil con recetas sencillas'
            },
            {
                id: 8,
                title: 'Experimentos Científicos',
                category: 'talleres',
                image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=400&fit=crop',
                description: 'Experimentos científicos divertidos para niños'
            },
            {
                id: 9,
                title: 'Arte con Materiales Reciclados',
                category: 'talleres',
                image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop',
                description: 'Creaciones artísticas con materiales reciclados'
            },
            {
                id: 10,
                title: 'Música y Movimiento',
                category: 'talleres',
                image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
                description: 'Taller de música y movimiento corporal'
            },
            
            // Fiestas
            {
                id: 11,
                title: 'Cumpleaños Temático',
                category: 'fiestas',
                image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=400&fit=crop',
                description: 'Celebración de cumpleaños con decoración temática'
            },
            /*{
                id: 12,
                title: 'Escape Room Infantil',
                category: 'fiestas',
                image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop',
                description: 'Aventura de escape room adaptada para niños'
            },*/
            {
                id: 13,
                title: 'Spa Party',
                category: 'fiestas',
                image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=400&fit=crop',
                description: 'Fiesta spa con mascarillas y manicura'
            },
            /*{
                id: 14,
                title: 'Gymkana de Aventuras',
                category: 'fiestas',
                image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop',
                description: 'Gymkana con retos y pruebas divertidas'
            },
            {
                id: 15,
                title: 'Fiesta de Disfraces',
                category: 'fiestas',
                image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop',
                description: 'Fiesta de disfraces con temática especial'
            },*/
            
            // Instalaciones
            {
                id: 16,
                title: 'Área de Bebés',
                category: 'instalaciones',
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
                description: 'Zona especializada para bebés de 0 a 36 meses'
            },
            {
                id: 17,
                title: 'Zona de Juegos',
                category: 'instalaciones',
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
                description: 'Área principal de juegos para niños de 3 a 12 años'
            },
            {
                id: 18,
                title: 'Rincón de Lectura',
                category: 'instalaciones',
                image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop',
                description: 'Rincón mágico para cuentacuentos y lectura'
            },
            {
                id: 19,
                title: 'Sala de Talleres',
                category: 'instalaciones',
                image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop',
                description: 'Sala equipada para talleres y actividades creativas'
            },
            {
                id: 20,
                title: 'Área de Construcciones',
                category: 'instalaciones',
                image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=400&fit=crop',
                description: 'Espacio dedicado a construcciones y juegos de mesa'
            }
        ];
    }
    
    setupEventListeners() {
        // Filtros
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.dataset.filtro;
                this.setActiveFilter(filter);
                this.filterGallery(filter);
            });
        });
        
        // Lightbox
        this.lightboxClose.addEventListener('click', () => {
            this.closeLightbox();
        });
        
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.closeLightbox();
            }
        });
        
        // Cerrar lightbox con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.lightbox.style.display === 'block') {
                this.closeLightbox();
            }
        });
    }
    
    setActiveFilter(filter) {
        this.currentFilter = filter;
        
        // Actualizar botones
        this.filterButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.filtro === filter) {
                button.classList.add('active');
            }
        });
    }
    
    filterGallery(filter) {
        const items = this.galleryGrid.querySelectorAll('.galeria-item');
        
        items.forEach(item => {
            const category = item.dataset.categoria;
            
            if (filter === 'todos' || category === filter) {
                item.style.display = 'block';
                // Animar entrada
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 50);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    }
    
    renderGallery() {
        if (!this.galleryGrid) return;
        
        this.galleryGrid.innerHTML = this.galleryData.map(item => `
            <div class="galeria-item" data-categoria="${item.category}" data-id="${item.id}">
                <img src="${item.image}" 
                     alt="${item.title}" 
                     loading="lazy"
                     onclick="gallerySystem.openLightbox(${item.id})">
                <div class="galeria-overlay">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                </div>
            </div>
        `).join('');
        
        // Configurar lazy loading
        this.setupLazyLoading();
    }
    
    setupLazyLoading() {
        const images = this.galleryGrid.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.src; // Trigger load
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
    }
    
    openLightbox(itemId) {
        const item = this.galleryData.find(item => item.id === itemId);
        if (!item) return;
        
        this.lightboxImg.src = item.image;
        this.lightboxImg.alt = item.title;
        this.lightboxCaption.textContent = item.description;
        
        this.lightbox.style.display = 'block';
        
        // Animar entrada
        setTimeout(() => {
            this.lightbox.style.opacity = '1';
        }, 10);
        
        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
    }
    
    closeLightbox() {
        this.lightbox.style.opacity = '0';
        
        setTimeout(() => {
            this.lightbox.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
    
    // Navegación en lightbox
    navigateLightbox(direction) {
        const currentItem = this.galleryData.find(item => 
            item.image === this.lightboxImg.src
        );
        
        if (!currentItem) return;
        
        let nextIndex = this.galleryData.indexOf(currentItem);
        
        if (direction === 'next') {
            nextIndex = (nextIndex + 1) % this.galleryData.length;
        } else {
            nextIndex = nextIndex === 0 ? this.galleryData.length - 1 : nextIndex - 1;
        }
        
        const nextItem = this.galleryData[nextIndex];
        this.openLightbox(nextItem.id);
    }
    
    // Método para agregar nuevas imágenes dinámicamente
    addImage(imageData) {
        const newId = Math.max(...this.galleryData.map(item => item.id)) + 1;
        const newItem = {
            id: newId,
            ...imageData
        };
        
        this.galleryData.push(newItem);
        this.renderGallery();
    }
    
    // Método para eliminar imágenes
    removeImage(itemId) {
        this.galleryData = this.galleryData.filter(item => item.id !== itemId);
        this.renderGallery();
    }
    
    // Método para obtener estadísticas de la galería
    getGalleryStats() {
        const stats = {
            total: this.galleryData.length,
            byCategory: {}
        };
        
        this.galleryData.forEach(item => {
            if (!stats.byCategory[item.category]) {
                stats.byCategory[item.category] = 0;
            }
            stats.byCategory[item.category]++;
        });
        
        return stats;
    }
}

// Inicializar el sistema de galería
let gallerySystem;

document.addEventListener('DOMContentLoaded', function() {
    gallerySystem = new GallerySystem();
});

// Funciones globales para el lightbox
function openGalleryLightbox(itemId) {
    if (gallerySystem) {
        gallerySystem.openLightbox(itemId);
    }
}

function closeGalleryLightbox() {
    if (gallerySystem) {
        gallerySystem.closeLightbox();
    }
}

// Navegación con teclado en lightbox
document.addEventListener('keydown', function(e) {
    if (gallerySystem && gallerySystem.lightbox.style.display === 'block') {
        switch(e.key) {
            case 'ArrowLeft':
                gallerySystem.navigateLightbox('prev');
                break;
            case 'ArrowRight':
                gallerySystem.navigateLightbox('next');
                break;
        }
    }
});
