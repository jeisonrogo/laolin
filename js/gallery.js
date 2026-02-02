// Sistema de galería con filtros, lightbox y soporte de video
class GallerySystem {
    constructor() {
        this.galleryGrid = document.getElementById('galeriaGrid');
        this.filterButtons = document.querySelectorAll('.filtro-btn');
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImg = document.getElementById('lightboxImg');
        this.lightboxCaption = document.getElementById('lightboxCaption');
        this.lightboxClose = document.getElementById('lightboxClose');

        // Video lightbox elements
        this.videoLightbox = document.getElementById('videoLightbox');
        this.videoPlayer = document.getElementById('videoLightboxPlayer');
        this.videoLightboxClose = document.getElementById('videoLightboxClose');

        this.currentFilter = 'todos';
        this.galleryData = [];

        this.init();
    }
    
    async init() {
        await this.loadGalleryData();
        this.setupEventListeners();
        this.renderGallery();
    }

    async loadGalleryData() {
        // Intentar cargar desde Strapi primero
        if (typeof STRAPI_CONFIG !== 'undefined' && STRAPI_CONFIG.useCMS) {
            try {
                const imagenes = await fetchGaleriaFromStrapi();

                if (imagenes && imagenes.length > 0) {
                    // Convertir formato Strapi a formato interno (con soporte de video)
                    this.galleryData = imagenes.map((img, index) => ({
                        id: index + 1,
                        title: img.alt,
                        category: img.category,
                        image: img.src,
                        description: img.descripcion || '',
                        // Nuevos campos para video
                        tipo_media: img.tipo_media || 'imagen',
                        video_url: img.video_url || '',
                        video_archivo: img.video_archivo || '',
                        thumbnail: img.thumbnail || img.src
                    }));
                    return;
                }
            } catch (error) {
                console.warn('Error cargando galería desde Strapi, usando datos locales...', error);
            }
        }

        // Fallback: Datos de la galería con imágenes locales de Laolin
        this.galleryData = [
            // Actividades
            {
                id: 1,
                title: 'Actividad 1',
                category: 'actividades',
                image: 'images/gallery/actividades/imagen4.jpeg',
                description: 'Actividad divertida en Laolin'
            },
            {
                id: 2,
                title: 'Actividad 2',
                category: 'actividades',
                image: 'images/gallery/actividades/imagen5.jpeg',
                description: 'Momentos de diversión y aprendizaje'
            },
            {
                id: 3,
                title: 'Actividad 3',
                category: 'actividades',
                image: 'images/gallery/actividades/imagen8.jpeg',
                description: 'Actividades creativas para niños'
            },
            {
                id: 4,
                title: 'Actividad 4',
                category: 'actividades',
                image: 'images/gallery/actividades/imagen9.jpeg',
                description: 'Juegos y actividades educativas'
            },
            {
                id: 5,
                title: 'Actividad 5',
                category: 'actividades',
                image: 'images/gallery/actividades/imagen14.jpeg',
                description: 'Experiencias únicas en Laolin'
            },
            
            // Talleres
            {
                id: 6,
                title: 'Taller 1',
                category: 'talleres',
                image: 'images/gallery/talleres/imagen6.jpeg',
                description: 'Taller creativo en Laolin'
            },
            {
                id: 7,
                title: 'Taller 2',
                category: 'talleres',
                image: 'images/gallery/talleres/imagen7.jpeg',
                description: 'Aprendizaje a través del juego'
            },
            
            // Fiestas
            {
                id: 8,
                title: 'Fiesta 1',
                category: 'fiestas',
                image: 'images/gallery/fiestas/imagen11.jpeg',
                description: 'Celebración especial en Laolin'
            },
            {
                id: 9,
                title: 'Fiesta 2',
                category: 'fiestas',
                image: 'images/gallery/fiestas/imagen12.jpeg',
                description: 'Momentos mágicos de celebración'
            },
            {
                id: 10,
                title: 'Fiesta 3',
                category: 'fiestas',
                image: 'images/gallery/fiestas/imagen13.jpeg',
                description: 'Fiestas temáticas inolvidables'
            },
            
            // Instalaciones
            {
                id: 11,
                title: 'Instalación 1',
                category: 'instalaciones',
                image: 'images/gallery/instalaciones/imagen1.jpeg',
                description: 'Espacios diseñados para el aprendizaje'
            },
            {
                id: 12,
                title: 'Instalación 2',
                category: 'instalaciones',
                image: 'images/gallery/instalaciones/imagen2.jpeg',
                description: 'Ambientes seguros y divertidos'
            },
            {
                id: 13,
                title: 'Instalación 3',
                category: 'instalaciones',
                image: 'images/gallery/instalaciones/imagen3.jpeg',
                description: 'Instalaciones modernas y funcionales'
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

        // Lightbox para imágenes
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
            if (e.key === 'Escape') {
                if (this.lightbox.style.display === 'block') {
                    this.closeLightbox();
                }
                if (this.videoLightbox && this.videoLightbox.classList.contains('active')) {
                    this.closeVideoLightbox();
                }
            }
        });

        // Video lightbox event listeners
        if (this.videoLightboxClose) {
            this.videoLightboxClose.addEventListener('click', () => {
                this.closeVideoLightbox();
            });
        }

        if (this.videoLightbox) {
            this.videoLightbox.addEventListener('click', (e) => {
                if (e.target === this.videoLightbox) {
                    this.closeVideoLightbox();
                }
            });
        }
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

        this.galleryGrid.innerHTML = this.galleryData.map(item => {
            const isVideo = item.tipo_media === 'video';
            const thumbnail = item.thumbnail || item.image;
            const videoClass = isVideo ? 'video-item' : '';

            return `
            <div class="galeria-item ${videoClass}" data-categoria="${item.category}" data-id="${item.id}" data-tipo="${item.tipo_media || 'imagen'}">
                <img src="${thumbnail}"
                     alt="${item.title}"
                     loading="lazy"
                     onclick="gallerySystem.${isVideo ? 'openVideoLightbox' : 'openLightbox'}(${item.id})">
                ${isVideo ? `
                <div class="video-play-icon" onclick="gallerySystem.openVideoLightbox(${item.id})">
                    <i class="fas fa-play"></i>
                </div>
                ` : ''}
                <div class="galeria-overlay">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                </div>
            </div>
            `;
        }).join('');

        // Configurar lazy loading
        this.setupLazyLoading();
    }
    
    setupLazyLoading() {
        const images = this.galleryGrid.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
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

    // Video lightbox methods
    openVideoLightbox(itemId) {
        const item = this.galleryData.find(item => item.id === itemId);
        if (!item) return;

        if (!this.videoLightbox || !this.videoPlayer) {
            console.warn('Video lightbox elements not found');
            return;
        }

        // Get video source
        const videoSrc = item.video_archivo || item.video_url || '';

        if (!videoSrc) {
            console.warn('No video source found for item:', itemId);
            return;
        }

        // Set video source
        const sourceElement = this.videoPlayer.querySelector('source');
        if (sourceElement) {
            sourceElement.src = videoSrc;
        } else {
            this.videoPlayer.src = videoSrc;
        }

        this.videoPlayer.load();

        // Show lightbox
        this.videoLightbox.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Auto-play video
        setTimeout(() => {
            this.videoPlayer.play().catch(e => {
                console.log('Auto-play blocked:', e);
            });
        }, 300);
    }

    closeVideoLightbox() {
        if (!this.videoLightbox || !this.videoPlayer) return;

        // Pause and reset video
        this.videoPlayer.pause();
        this.videoPlayer.currentTime = 0;

        // Hide lightbox
        this.videoLightbox.classList.remove('active');
        document.body.style.overflow = '';
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
