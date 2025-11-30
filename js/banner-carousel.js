/**
 * Banner Carousel Component
 * Gestiona el carousel de banners con transiciones, auto-avance y navegación manual
 */

class BannerCarousel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            return;
        }

        this.slides = [];
        this.currentIndex = 0;
        this.autoPlayTimer = null;
        this.isPaused = false;
        this.isTransitioning = false;

        // Referencias a elementos del DOM
        this.slidesContainer = null;
        this.dotsContainer = null;
        this.prevBtn = null;
        this.nextBtn = null;

        // Configuración por defecto
        this.defaultDuration = 5000;

        this.init();
    }

    async init() {
        try {
            // Cargar slides desde Strapi
            await this.loadSlides();

            if (this.slides.length === 0) {
                this.container.style.display = 'none';
                return;
            }

            // Crear estructura del carousel
            this.createCarouselStructure();

            // Renderizar slides
            this.renderSlides();

            // Crear indicadores (dots)
            this.createDots();

            // Configurar eventos
            this.setupEventListeners();

            // Mostrar primer slide
            this.showSlide(0);

            // Iniciar auto-play
            this.startAutoPlay();
        } catch (error) {
            this.container.style.display = 'none';
        }
    }

    async loadSlides() {
        try {
            if (typeof fetchBannerSlidesFromStrapi === 'function' && STRAPI_CONFIG.useCMS) {
                this.slides = await fetchBannerSlidesFromStrapi();
            } else {
                this.slides = this.getDefaultSlides();
            }
        } catch (error) {
            this.slides = this.getDefaultSlides();
        }
    }

    getDefaultSlides() {
        // Slides por defecto si Strapi no está disponible
        return [
            {
                titulo: 'Bienvenidos a Laolin',
                imageUrl: 'images/gallery/instalaciones/imagen1.jpg',
                htmlContent: '<h2>Bienvenidos a Laolin</h2><p>Un espacio mágico para crecer y jugar</p>',
                duracion: 5000,
                orden: 1
            }
        ];
    }

    createCarouselStructure() {
        this.container.innerHTML = `
            <div class="banner-carousel-wrapper">
                <div class="banner-carousel-slides"></div>

                <div class="banner-carousel-controls">
                    <button class="banner-carousel-btn banner-carousel-prev" aria-label="Slide anterior">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="banner-carousel-btn banner-carousel-next" aria-label="Slide siguiente">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>

                <div class="banner-carousel-dots"></div>
            </div>
        `;

        // Obtener referencias
        this.slidesContainer = this.container.querySelector('.banner-carousel-slides');
        this.dotsContainer = this.container.querySelector('.banner-carousel-dots');
        this.prevBtn = this.container.querySelector('.banner-carousel-prev');
        this.nextBtn = this.container.querySelector('.banner-carousel-next');
    }

    renderSlides() {
        this.slidesContainer.innerHTML = '';

        this.slides.forEach((slide, index) => {
            const slideElement = document.createElement('div');
            slideElement.className = 'banner-carousel-slide';
            slideElement.dataset.index = index;

            // Imagen de fondo
            const imageLayer = document.createElement('div');
            imageLayer.className = 'banner-carousel-image';
            imageLayer.style.backgroundImage = `url('${slide.imageUrl}')`;

            // Contenedor de contenido HTML
            const contentLayer = document.createElement('div');
            contentLayer.className = 'banner-carousel-content';

            // Insertar HTML content de forma segura
            if (slide.htmlContent) {
                contentLayer.innerHTML = slide.htmlContent;
            }

            slideElement.appendChild(imageLayer);
            slideElement.appendChild(contentLayer);
            this.slidesContainer.appendChild(slideElement);
        });
    }

    createDots() {
        this.dotsContainer.innerHTML = '';

        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'banner-carousel-dot';
            dot.setAttribute('aria-label', `Ir al slide ${index + 1}`);
            dot.dataset.index = index;

            dot.addEventListener('click', () => {
                this.goToSlide(index);
            });

            this.dotsContainer.appendChild(dot);
        });
    }

    setupEventListeners() {
        // Navegación con botones
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        // Pausar en hover
        this.container.addEventListener('mouseenter', () => this.pause());
        this.container.addEventListener('mouseleave', () => this.resume());

        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (!this.isVisible()) return;

            if (e.key === 'ArrowLeft') {
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });

        // Touch/swipe support para móviles
        this.setupTouchEvents();
    }

    setupTouchEvents() {
        let touchStartX = 0;
        let touchEndX = 0;
        const minSwipeDistance = 50;

        this.slidesContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.slidesContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX, minSwipeDistance);
        }, { passive: true });
    }

    handleSwipe(startX, endX, minDistance) {
        const diff = startX - endX;

        if (Math.abs(diff) < minDistance) return;

        if (diff > 0) {
            // Swipe izquierda - siguiente slide
            this.nextSlide();
        } else {
            // Swipe derecha - slide anterior
            this.prevSlide();
        }
    }

    showSlide(index, direction = 'next') {
        if (this.isTransitioning) return;
        if (this.slides.length === 0) return;

        // Normalizar índice
        if (index < 0) {
            index = this.slides.length - 1;
        } else if (index >= this.slides.length) {
            index = 0;
        }

        this.isTransitioning = true;
        const previousIndex = this.currentIndex;
        this.currentIndex = index;

        // Obtener elementos
        const slides = this.slidesContainer.querySelectorAll('.banner-carousel-slide');
        const dots = this.dotsContainer.querySelectorAll('.banner-carousel-dot');

        // Remover clases activas
        slides.forEach(slide => {
            slide.classList.remove('active', 'prev', 'next', 'slide-out-left', 'slide-out-right');
        });
        dots.forEach(dot => dot.classList.remove('active'));

        // Aplicar transiciones
        if (previousIndex !== index) {
            const prevSlide = slides[previousIndex];
            const currentSlide = slides[index];

            if (direction === 'next') {
                prevSlide.classList.add('slide-out-left');
                currentSlide.classList.add('active');
            } else {
                prevSlide.classList.add('slide-out-right');
                currentSlide.classList.add('active');
            }
        } else {
            slides[index].classList.add('active');
        }

        // Activar dot correspondiente
        if (dots[index]) {
            dots[index].classList.add('active');
        }

        // Resetear flag de transición
        setTimeout(() => {
            this.isTransitioning = false;
        }, 600); // Duración de la transición CSS

        // Reiniciar auto-play con la duración del slide actual
        this.restartAutoPlay();
    }

    nextSlide() {
        this.showSlide(this.currentIndex + 1, 'next');
    }

    prevSlide() {
        this.showSlide(this.currentIndex - 1, 'prev');
    }

    goToSlide(index) {
        const direction = index > this.currentIndex ? 'next' : 'prev';
        this.showSlide(index, direction);
    }

    startAutoPlay() {
        if (this.slides.length <= 1) return;

        const currentSlide = this.slides[this.currentIndex];
        const duration = currentSlide?.duracion || this.defaultDuration;

        this.autoPlayTimer = setTimeout(() => {
            if (!this.isPaused) {
                this.nextSlide();
            }
        }, duration);
    }

    stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearTimeout(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }

    restartAutoPlay() {
        this.stopAutoPlay();
        if (!this.isPaused) {
            this.startAutoPlay();
        }
    }

    pause() {
        this.isPaused = true;
        this.stopAutoPlay();
    }

    resume() {
        this.isPaused = false;
        this.startAutoPlay();
    }

    isVisible() {
        return this.container && this.container.offsetParent !== null;
    }

    destroy() {
        this.stopAutoPlay();
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Crear instancia global del carousel
    window.bannerCarousel = new BannerCarousel('banner-carousel');
});
