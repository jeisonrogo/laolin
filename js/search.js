// Sistema de búsqueda inteligente
class SearchSystem {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.searchResults = document.getElementById('searchResults');
        this.searchData = [];
        this.currentResults = [];
        
        this.init();
    }
    
    init() {
        this.loadSearchData();
        this.setupEventListeners();
    }
    
    loadSearchData() {
        // Datos de búsqueda basados en el contenido de la página
        this.searchData = [
            // Actividades
            {
                title: 'Juegos Libres y Guiados',
                description: 'Espacios diseñados para que los niños exploren y jueguen libremente',
                keywords: ['juegos', 'libres', 'guiados', 'explorar', 'jugar', 'actividades'],
                section: 'actividades',
                icon: '🎮'
            },
            {
                title: 'Talleres de Manualidades',
                description: 'Actividades creativas que desarrollan la motricidad fina y la expresión artística',
                keywords: ['manualidades', 'arte', 'creatividad', 'pintura', 'talleres', 'actividades'],
                section: 'actividades',
                icon: '🎨'
            },
            {
                title: 'Cuentacuentos y Lectura',
                description: 'Rincón mágico donde los niños descubren el amor por la lectura',
                keywords: ['cuentos', 'lectura', 'libros', 'historias', 'cuentacuentos', 'actividades'],
                section: 'actividades',
                icon: '📚'
            },
            {
                title: 'Juegos de Mesa y Construcción',
                description: 'Juegos que estimulan el pensamiento lógico y la cooperación',
                keywords: ['juegos mesa', 'construcción', 'puzzles', 'lego', 'lógica', 'actividades'],
                section: 'actividades',
                icon: '🏗️'
            },
            {
                title: 'Actividades Temáticas',
                description: 'Celebramos las estaciones y festividades con actividades especiales',
                keywords: ['temáticas', 'navidad', 'verano', 'halloween', 'carnaval', 'eventos'],
                section: 'actividades',
                icon: '🎉'
            },
            
            // Horarios y Tarifas
            {
                title: 'Horarios de Apertura',
                description: 'Lunes a Sábado de 9:00 a 20:00',
                keywords: ['horarios', 'apertura', 'horas', 'días', 'cuándo', 'precios'],
                section: 'horarios-tarifas',
                icon: '⏰'
            },
            {
                title: 'Tarifas',
                description: 'Desde 8€ por hora hasta bonos de 20 horas',
                keywords: ['precios', 'tarifas', 'coste', 'euros', 'bonos', 'horas'],
                section: 'horarios-tarifas',
                icon: '💰'
            },
            {
                title: 'Servicios Especiales',
                description: 'Cumpleaños, talleres especiales y eventos familiares',
                keywords: ['servicios', 'especiales', 'cumpleaños', 'eventos', 'talleres'],
                section: 'horarios-tarifas',
                icon: '🌟'
            },
            
            // Cumpleaños
            {
                title: 'Escape Room Infantil',
                description: 'Misterios y enigmas adaptados a la edad de los niños',
                keywords: ['escape room', 'misterios', 'enigmas', 'aventura', 'cumpleaños'],
                section: 'cumpleaños',
                icon: '🕵️‍♂️'
            },
            {
                title: 'Spa Party',
                description: 'Mascarillas, manicura y relajación para princesas y príncipes',
                keywords: ['spa', 'mascarillas', 'manicura', 'relajación', 'cumpleaños'],
                section: 'cumpleaños',
                icon: '💅'
            },
            {
                title: 'Desafíos y Gymkanas',
                description: 'Juegos de equipo, pruebas y retos para los más aventureros',
                keywords: ['gymkana', 'desafíos', 'retos', 'equipo', 'aventura', 'cumpleaños'],
                section: 'cumpleaños',
                icon: '🏃‍♀️'
            },
            {
                title: 'Fiesta Clásica',
                description: 'La celebración tradicional con juegos, tarta y diversión',
                keywords: ['fiesta', 'clásica', 'tradicional', 'juegos', 'tarta', 'cumpleaños'],
                section: 'cumpleaños',
                icon: '🎂'
            },
            
            // Información general
            {
                title: 'Ubicación',
                description: 'Av. Carabanchel Alto 90, Madrid',
                keywords: ['ubicación', 'dirección', 'carabanchel', 'madrid', 'dónde'],
                section: 'contacto',
                icon: '📍'
            },
            {
                title: 'Contacto',
                description: '+34 672 98 23 17 - +34 666 00 90 13',
                keywords: ['teléfono', 'contacto', 'llamar', 'whatsapp', 'comunicar'],
                section: 'contacto',
                icon: '📞'
            },
            {
                title: 'Reservas Online',
                description: 'Reserva tu espacio de forma fácil y rápida',
                keywords: ['reservas', 'online', 'reservar', 'cita', 'fecha', 'hora'],
                section: 'reservas',
                icon: '📅'
            },
            {
                title: 'Normas de la Ludoteca',
                description: 'Para que todos disfrutemos de un ambiente seguro y agradable',
                keywords: ['normas', 'reglas', 'seguridad', 'limpieza', 'comportamiento'],
                section: 'normas',
                icon: '📋'
            },
            {
                title: 'Preguntas Frecuentes',
                description: 'Resolvemos tus dudas más comunes',
                keywords: ['preguntas', 'faq', 'dudas', 'ayuda', 'información'],
                section: 'faq',
                icon: '❓'
            }
        ];
    }
    
    setupEventListeners() {
        // Búsqueda en tiempo real
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                this.performSearch(query);
            } else {
                this.hideResults();
            }
        });
        
        // Búsqueda al hacer clic en el botón
        this.searchBtn.addEventListener('click', () => {
            const query = this.searchInput.value.trim();
            if (query.length >= 2) {
                this.performSearch(query);
            }
        });
        
        // Búsqueda con Enter
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = this.searchInput.value.trim();
                if (query.length >= 2) {
                    this.performSearch(query);
                }
            }
        });
        
        // Cerrar resultados al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.searchResults.contains(e.target)) {
                this.hideResults();
            }
        });
    }
    
    performSearch(query) {
        const searchTerm = query.toLowerCase();
        this.currentResults = this.searchData.filter(item => {
            // Buscar en título
            if (item.title.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            // Buscar en descripción
            if (item.description.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            // Buscar en palabras clave
            if (item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))) {
                return true;
            }
            
            return false;
        });
        
        this.displayResults();
    }
    
    displayResults() {
        if (this.currentResults.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-result-item">
                    <p>No se encontraron resultados</p>
                </div>
            `;
        } else {
            this.searchResults.innerHTML = this.currentResults.map(result => `
                <div class="search-result-item" onclick="searchSystem.selectResult('${result.section}')">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.2rem;">${result.icon}</span>
                        <div>
                            <strong>${result.title}</strong>
                            <p style="margin: 5px 0 0 0; font-size: 0.9rem; color: #666;">${result.description}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        this.searchResults.style.display = 'block';
    }
    
    hideResults() {
        this.searchResults.style.display = 'none';
    }
    
    selectResult(sectionId) {
        this.hideResults();
        this.searchInput.value = '';
        
        // Hacer scroll a la sección
        scrollToSection(sectionId);
        
        // Resaltar la sección brevemente
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.transition = 'all 0.3s ease';
            section.style.backgroundColor = 'rgba(168, 213, 186, 0.3)';
            setTimeout(() => {
                section.style.backgroundColor = '';
            }, 2000);
        }
    }
    
    // Búsqueda avanzada con autocompletado
    getSuggestions(query) {
        const suggestions = [];
        const searchTerm = query.toLowerCase();
        
        this.searchData.forEach(item => {
            // Sugerencias basadas en palabras clave
            item.keywords.forEach(keyword => {
                if (keyword.toLowerCase().startsWith(searchTerm) && !suggestions.includes(keyword)) {
                    suggestions.push(keyword);
                }
            });
            
            // Sugerencias basadas en títulos
            const words = item.title.toLowerCase().split(' ');
            words.forEach(word => {
                if (word.startsWith(searchTerm) && word.length > 2 && !suggestions.includes(word)) {
                    suggestions.push(word);
                }
            });
        });
        
        return suggestions.slice(0, 5); // Máximo 5 sugerencias
    }
}

// Inicializar el sistema de búsqueda
let searchSystem;

document.addEventListener('DOMContentLoaded', function() {
    searchSystem = new SearchSystem();
});

// Función global para seleccionar resultados
function selectSearchResult(sectionId) {
    if (searchSystem) {
        searchSystem.selectResult(sectionId);
    }
}
