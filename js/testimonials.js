// Sistema de testimonios con carrusel
class TestimonialsSystem {
    constructor() {
        this.carousel = document.getElementById('testimoniosCarousel');
        this.dotsContainer = document.getElementById('testimoniosDots');
        this.prevBtn = document.getElementById('prevTestimonio');
        this.nextBtn = document.getElementById('nextTestimonio');
        
        this.currentIndex = 0;
        this.testimonials = [];
        this.autoPlayInterval = null;
        this.autoPlayDelay = 5000; // 5 segundos
        
        this.init();
    }
    
    init() {
        this.loadTestimonials();
        this.setupEventListeners();
        this.renderTestimonials();
        this.startAutoPlay();
    }
    
    loadTestimonials() {
        // Datos de testimonios reales
        this.testimonials = [
            {
                id: 1,
                nombre: 'Familia García',
                foto: '👨‍👩‍👧‍👦',
                texto: 'Laolin se ha convertido en nuestro lugar favorito. Los niños siempre están felices y nosotros tranquilos sabiendo que están en buenas manos. El personal es muy profesional y cariñoso.',
                calificacion: 5,
                fecha: '2024',
                categoria: 'ludoteca'
            },
            {
                id: 2,
                nombre: 'Familia Martínez',
                foto: '👨‍👩‍👧‍👦',
                texto: 'El cumpleaños de nuestra hija fue mágico. Todo perfecto, desde la decoración hasta la animación. Los niños se lo pasaron genial y nosotros pudimos disfrutar sin preocupaciones.',
                calificacion: 5,
                fecha: '2024',
                categoria: 'cumpleaños'
            },
            {
                id: 3,
                nombre: 'Familia López',
                foto: '👨‍👩‍👧‍👦',
                texto: 'Los talleres son increíbles. Nuestro hijo ha desarrollado mucha creatividad y siempre viene con ganas de más. Los educadores son muy pacientes y creativos.',
                calificacion: 5,
                fecha: '2024',
                categoria: 'talleres'
            },
            {
                id: 4,
                nombre: 'Familia Rodríguez',
                foto: '👨‍👩‍👧‍👦',
                texto: 'El personal es muy profesional y cariñoso. Los niños se sienten como en casa y nosotros confiamos plenamente. Las instalaciones son seguras y limpias.',
                calificacion: 5,
                fecha: '2024',
                categoria: 'general'
            },
            {
                id: 5,
                nombre: 'Familia Sánchez',
                foto: '👨‍👩‍👧‍👦',
                texto: 'Hemos celebrado varios cumpleaños aquí y siempre han sido un éxito. Las temáticas son originales y los niños se divierten muchísimo. Muy recomendable.',
                calificacion: 5,
                fecha: '2024',
                categoria: 'cumpleaños'
            },
            {
                id: 6,
                nombre: 'Familia Fernández',
                foto: '👨‍👩‍👧‍👦',
                texto: 'La flexibilidad de horarios nos viene genial. Podemos venir cuando necesitamos y los precios son muy razonables. Los niños siempre quieren volver.',
                calificacion: 5,
                fecha: '2024',
                categoria: 'horarios'
            },
            {
                id: 7,
                nombre: 'Familia Pérez',
                foto: '👨‍👩‍👧‍👦',
                texto: 'Las actividades temáticas son fantásticas. Los niños aprenden mientras se divierten y siempre hay algo nuevo. El equipo es muy creativo.',
                calificacion: 5,
                fecha: '2024',
                categoria: 'actividades'
            },
            {
                id: 8,
                nombre: 'Familia Gómez',
                foto: '👨‍👩‍👧‍👦',
                texto: 'El área de bebés es perfecta para nuestro pequeño. Está muy bien equipada y es completamente segura. Los educadores son muy atentos.',
                calificacion: 5,
                fecha: '2024',
                categoria: 'bebes'
            }
        ];
    }
    
    setupEventListeners() {
        // Controles manuales
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.prevTestimonial();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.nextTestimonial();
            });
        }
        
        // Pausar autoplay al hacer hover
        if (this.carousel) {
            this.carousel.addEventListener('mouseenter', () => {
                this.stopAutoPlay();
            });
            
            this.carousel.addEventListener('mouseleave', () => {
                this.startAutoPlay();
            });
        }
        
        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevTestimonial();
            } else if (e.key === 'ArrowRight') {
                this.nextTestimonial();
            }
        });
    }
    
    renderTestimonials() {
        if (!this.carousel) return;
        
        // Renderizar testimonios
        this.carousel.innerHTML = this.testimonials.map((testimonial, index) => `
            <div class="testimonio ${index === 0 ? 'active' : ''}" data-index="${index}">
                <div class="testimonio-foto">${testimonial.foto}</div>
                <div class="testimonio-texto">"${testimonial.texto}"</div>
                <div class="testimonio-nombre">${testimonial.nombre}</div>
                <div class="testimonio-calificacion">${this.generateStars(testimonial.calificacion)}</div>
                <div class="testimonio-fecha">${testimonial.fecha}</div>
            </div>
        `).join('');
        
        // Renderizar dots
        this.renderDots();
    }
    
    renderDots() {
        if (!this.dotsContainer) return;
        
        this.dotsContainer.innerHTML = this.testimonials.map((_, index) => `
            <span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
        `).join('');
        
        // Agregar event listeners a los dots
        this.dotsContainer.querySelectorAll('.dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.dataset.index);
                this.goToTestimonial(index);
            });
        });
    }
    
    generateStars(rating) {
        const fullStar = '★';
        const emptyStar = '☆';
        let stars = '';
        
        for (let i = 1; i <= 5; i++) {
            stars += i <= rating ? fullStar : emptyStar;
        }
        
        return stars;
    }
    
    goToTestimonial(index) {
        if (index < 0 || index >= this.testimonials.length) return;
        
        // Ocultar testimonio actual
        const currentTestimonial = this.carousel.querySelector('.testimonio.active');
        const currentDot = this.dotsContainer.querySelector('.dot.active');
        
        if (currentTestimonial) {
            currentTestimonial.classList.remove('active');
        }
        if (currentDot) {
            currentDot.classList.remove('active');
        }
        
        // Mostrar nuevo testimonio
        const newTestimonial = this.carousel.querySelector(`[data-index="${index}"]`);
        const newDot = this.dotsContainer.querySelector(`[data-index="${index}"]`);
        
        if (newTestimonial) {
            newTestimonial.classList.add('active');
        }
        if (newDot) {
            newDot.classList.add('active');
        }
        
        this.currentIndex = index;
        
        // Reiniciar autoplay
        this.restartAutoPlay();
    }
    
    nextTestimonial() {
        const nextIndex = (this.currentIndex + 1) % this.testimonials.length;
        this.goToTestimonial(nextIndex);
    }
    
    prevTestimonial() {
        const prevIndex = this.currentIndex === 0 ? this.testimonials.length - 1 : this.currentIndex - 1;
        this.goToTestimonial(prevIndex);
    }
    
    startAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
        
        this.autoPlayInterval = setInterval(() => {
            this.nextTestimonial();
        }, this.autoPlayDelay);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    restartAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }
    
    // Método para filtrar testimonios por categoría
    filterByCategory(category) {
        const filteredTestimonials = category === 'todos' 
            ? this.testimonials 
            : this.testimonials.filter(t => t.categoria === category);
        
        this.renderFilteredTestimonials(filteredTestimonials);
    }
    
    renderFilteredTestimonials(testimonials) {
        if (!this.carousel) return;
        
        this.carousel.innerHTML = testimonials.map((testimonial, index) => `
            <div class="testimonio ${index === 0 ? 'active' : ''}" data-index="${index}">
                <div class="testimonio-foto">${testimonial.foto}</div>
                <div class="testimonio-texto">"${testimonial.texto}"</div>
                <div class="testimonio-nombre">${testimonial.nombre}</div>
                <div class="testimonio-calificacion">${this.generateStars(testimonial.calificacion)}</div>
                <div class="testimonio-fecha">${testimonial.fecha}</div>
            </div>
        `).join('');
        
        this.currentIndex = 0;
        this.renderDots();
    }
    
    // Método para agregar nuevos testimonios
    addTestimonial(testimonialData) {
        const newId = Math.max(...this.testimonials.map(t => t.id)) + 1;
        const newTestimonial = {
            id: newId,
            ...testimonialData
        };
        
        this.testimonials.push(newTestimonial);
        this.renderTestimonials();
    }
    
    // Método para obtener estadísticas
    getTestimonialsStats() {
        const stats = {
            total: this.testimonials.length,
            averageRating: 0,
            byCategory: {},
            byRating: {}
        };
        
        let totalRating = 0;
        
        this.testimonials.forEach(testimonial => {
            totalRating += testimonial.calificacion;
            
            // Por categoría
            if (!stats.byCategory[testimonial.categoria]) {
                stats.byCategory[testimonial.categoria] = 0;
            }
            stats.byCategory[testimonial.categoria]++;
            
            // Por calificación
            if (!stats.byRating[testimonial.calificacion]) {
                stats.byRating[testimonial.calificacion] = 0;
            }
            stats.byRating[testimonial.calificacion]++;
        });
        
        stats.averageRating = totalRating / this.testimonials.length;
        
        return stats;
    }
    
    // Método para cambiar la velocidad del autoplay
    setAutoPlaySpeed(delay) {
        this.autoPlayDelay = delay;
        this.restartAutoPlay();
    }
    
    // Método para pausar/reanudar autoplay
    toggleAutoPlay() {
        if (this.autoPlayInterval) {
            this.stopAutoPlay();
            return false; // Autoplay detenido
        } else {
            this.startAutoPlay();
            return true; // Autoplay iniciado
        }
    }
    
    // Método para obtener el testimonio actual
    getCurrentTestimonial() {
        return this.testimonials[this.currentIndex];
    }
    
    // Método para obtener todos los testimonios
    getAllTestimonials() {
        return this.testimonials;
    }
    
    // Método para limpiar recursos
    destroy() {
        this.stopAutoPlay();
        
        if (this.carousel) {
            this.carousel.innerHTML = '';
        }
        
        if (this.dotsContainer) {
            this.dotsContainer.innerHTML = '';
        }
    }
}

// Inicializar el sistema de testimonios
let testimonialsSystem;

document.addEventListener('DOMContentLoaded', function() {
    testimonialsSystem = new TestimonialsSystem();
});

// Funciones globales para controlar el carrusel
function nextTestimonial() {
    if (testimonialsSystem) {
        testimonialsSystem.nextTestimonial();
    }
}

function prevTestimonial() {
    if (testimonialsSystem) {
        testimonialsSystem.prevTestimonial();
    }
}

function goToTestimonial(index) {
    if (testimonialsSystem) {
        testimonialsSystem.goToTestimonial(index);
    }
}

function toggleTestimonialsAutoPlay() {
    if (testimonialsSystem) {
        return testimonialsSystem.toggleAutoPlay();
    }
    return false;
}

function filterTestimonials(category) {
    if (testimonialsSystem) {
        testimonialsSystem.filterByCategory(category);
    }
}
