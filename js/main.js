// Función para hacer scroll suave a las secciones
function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = target.offsetTop - headerHeight + 30;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// ====== SISTEMA DE SELECTOR DE WHATSAPP ======
let numerosWhatsapp = [];

function crearModalWhatsapp() {
    // Verificar si ya existe el modal
    if (document.getElementById('whatsappModal')) return;

    const modal = document.createElement('div');
    modal.id = 'whatsappModal';
    modal.className = 'whatsapp-modal';
    modal.innerHTML = `
        <div class="whatsapp-modal-content">
            <div class="whatsapp-modal-header">
                <h3><i class="fab fa-whatsapp"></i> Contactar por WhatsApp</h3>
                <button class="whatsapp-modal-close" onclick="cerrarModalWhatsapp()">&times;</button>
            </div>
            <div class="whatsapp-modal-body">
                <p>Selecciona el número de contacto:</p>
                <div id="whatsappOptions" class="whatsapp-options"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            cerrarModalWhatsapp();
        }
    });
}

function abrirSelectorWhatsapp(e) {
    if (e) e.preventDefault();

    // Si solo hay un número, ir directamente
    if (numerosWhatsapp.length === 1) {
        const numero = numerosWhatsapp[0].numero.replace(/\D/g, '');
        window.open(`https://wa.me/${numero}`, '_blank');
        return;
    }

    // Si no hay números configurados, usar fallback
    if (numerosWhatsapp.length === 0) {
        window.open('https://wa.me/34614341504', '_blank');
        return;
    }

    // Mostrar modal con opciones
    crearModalWhatsapp();
    const optionsContainer = document.getElementById('whatsappOptions');
    optionsContainer.innerHTML = numerosWhatsapp.map(wa => `
        <a href="https://wa.me/${wa.numero.replace(/\D/g, '')}"
           class="whatsapp-option"
           target="_blank"
           onclick="cerrarModalWhatsapp()">
            <i class="fab ${wa.icono}"></i>
            <div class="whatsapp-option-info">
                <span class="whatsapp-option-label">${wa.etiqueta}</span>
                <span class="whatsapp-option-number">${wa.numero}</span>
                ${wa.descripcion ? `<span class="whatsapp-option-desc">${wa.descripcion}</span>` : ''}
            </div>
            <i class="fas fa-chevron-right"></i>
        </a>
    `).join('');

    document.getElementById('whatsappModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function cerrarModalWhatsapp() {
    const modal = document.getElementById('whatsappModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

async function cargarNumerosWhatsapp() {
    if (typeof fetchNumerosWhatsappFromStrapi !== 'function') {
        console.log('fetchNumerosWhatsappFromStrapi no disponible');
        return;
    }

    try {
        numerosWhatsapp = await fetchNumerosWhatsappFromStrapi();

        if (numerosWhatsapp.length > 0) {
            // Configurar todos los enlaces de WhatsApp para usar el selector
            configurarEnlacesWhatsapp();
        }
    } catch (error) {
        console.warn('Error cargando números de WhatsApp:', error);
    }
}

function configurarEnlacesWhatsapp() {
    // Botón flotante de WhatsApp
    const floatBtn = document.querySelector('.whatsapp-float');
    if (floatBtn) {
        floatBtn.href = 'javascript:void(0)';
        floatBtn.onclick = abrirSelectorWhatsapp;
    }

    // Botón de WhatsApp en contacto
    const contactBtn = document.querySelector('.contact-action-btn.secondary');
    if (contactBtn && contactBtn.querySelector('.fa-whatsapp')) {
        contactBtn.href = 'javascript:void(0)';
        contactBtn.onclick = abrirSelectorWhatsapp;
        contactBtn.removeAttribute('target');
    }

    // Ícono de WhatsApp en footer
    const footerBtn = document.querySelector('.red-social-footer.whatsapp');
    if (footerBtn) {
        footerBtn.href = 'javascript:void(0)';
        footerBtn.onclick = abrirSelectorWhatsapp;
    }

    // Actualizar sección de teléfonos en contacto
    actualizarSeccionTelefonos();
}

function actualizarSeccionTelefonos() {
    const telefonosContainer = document.querySelector('.info-item h4');
    if (!telefonosContainer || telefonosContainer.textContent !== 'Teléfonos') return;

    const infoItem = telefonosContainer.parentElement;
    if (!infoItem) return;

    // Limpiar contenido actual (excepto el título)
    const paragraphs = infoItem.querySelectorAll('p');
    paragraphs.forEach(p => p.remove());

    // Agregar números de WhatsApp
    numerosWhatsapp.forEach(wa => {
        const p = document.createElement('p');
        p.innerHTML = `
            <i class="fab fa-whatsapp" style="color: #25d366;"></i>
            <a href="https://wa.me/${wa.numero.replace(/\D/g, '')}" target="_blank">${wa.numero}</a>
            <span style="font-size: 0.85em; color: #666;">(${wa.etiqueta})</span>
        `;
        infoItem.appendChild(p);
    });
}

// Menú hamburguesa y buscador responsive
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const searchBox = document.querySelector('.search-box');
    const searchToggleBtn = document.getElementById('searchToggleBtn');
    const searchCloseBtn = document.getElementById('searchCloseBtn');
    const searchInput = document.getElementById('searchInput');

    // === MENÚ HAMBURGUESA ===
    if (hamburger && navLinks) {
        // Toggle menú sidebar
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        // Cerrar menú al hacer clic en un enlace
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Cerrar menú al hacer clic fuera de él (en el overlay)
        document.addEventListener('click', function(e) {
            if (navLinks.classList.contains('active') &&
                !hamburger.contains(e.target) &&
                !navLinks.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // === BUSCADOR DESKTOP ===
    if (searchBox && searchToggleBtn && searchInput) {
        const searchContainer = searchBox.closest('.search-container');

        // Abrir buscador
        searchToggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            searchBox.classList.add('active');
            setTimeout(() => {
                searchInput.focus();
            }, 300);
        });

        // Cerrar buscador
        if (searchCloseBtn) {
            searchCloseBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                searchBox.classList.remove('active');
                searchInput.value = '';
                searchInput.blur();
                const searchResults = document.getElementById('searchResults');
                if (searchResults) {
                    searchResults.style.display = 'none';
                    searchResults.innerHTML = '';
                }
            });
        }

        // Cerrar buscador al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (searchContainer && !searchContainer.contains(e.target)) {
                searchBox.classList.remove('active');
                const searchResults = document.getElementById('searchResults');
                if (searchResults && searchInput.value === '') {
                    searchResults.style.display = 'none';
                }
            }
        });

        // Cerrar buscador al presionar Escape
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                searchBox.classList.remove('active');
                searchInput.value = '';
                searchInput.blur();
                const searchResults = document.getElementById('searchResults');
                if (searchResults) {
                    searchResults.style.display = 'none';
                    searchResults.innerHTML = '';
                }
            }
        });
    }

    // === MODAL DE BÚSQUEDA MOBILE ===
    const searchMobileBtn = document.getElementById('searchMobileBtn');
    const searchModal = document.getElementById('searchModal');
    const searchModalClose = document.getElementById('searchModalClose');
    const searchInputMobile = document.getElementById('searchInputMobile');

    if (searchMobileBtn && searchModal) {
        // Abrir modal de búsqueda
        searchMobileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            searchModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevenir scroll del body
            setTimeout(() => {
                if (searchInputMobile) {
                    searchInputMobile.focus();
                }
            }, 300);
        });

        // Cerrar modal con botón X
        if (searchModalClose) {
            searchModalClose.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                searchModal.classList.remove('active');
                document.body.style.overflow = ''; // Restaurar scroll
                if (searchInputMobile) {
                    searchInputMobile.value = '';
                    const searchResultsMobile = document.getElementById('searchResultsMobile');
                    if (searchResultsMobile) {
                        searchResultsMobile.style.display = 'none';
                        searchResultsMobile.innerHTML = '';
                    }
                }
            });
        }

        // Cerrar modal al hacer click fuera del contenido
        searchModal.addEventListener('click', function(e) {
            if (e.target === searchModal) {
                searchModal.classList.remove('active');
                document.body.style.overflow = '';
                if (searchInputMobile) {
                    searchInputMobile.value = '';
                    const searchResultsMobile = document.getElementById('searchResultsMobile');
                    if (searchResultsMobile) {
                        searchResultsMobile.style.display = 'none';
                        searchResultsMobile.innerHTML = '';
                    }
                }
            }
        });

        // Cerrar modal con tecla Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && searchModal.classList.contains('active')) {
                searchModal.classList.remove('active');
                document.body.style.overflow = '';
                if (searchInputMobile) {
                    searchInputMobile.value = '';
                    const searchResultsMobile = document.getElementById('searchResultsMobile');
                    if (searchResultsMobile) {
                        searchResultsMobile.style.display = 'none';
                        searchResultsMobile.innerHTML = '';
                    }
                }
            }
        });
    }
    
    // Efecto de scroll en el header
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(168, 213, 186, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'linear-gradient(135deg, #a8d5ba 0%, #f4e4c1 50%, #e8c4a0 100%)';
            header.style.backdropFilter = 'none';
        }
    });
    
    // Animaciones al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observar elementos para animaciones
    document.querySelectorAll('.actividad-card, .tema-card, .blog-card, .testimonio, .faq-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
});

// Cargar textos desde JSON o Strapi
let textosData = {};

async function loadTexts() {
    // Verificar si strapi-config.js está cargado y si useCMS está habilitado
    if (typeof STRAPI_CONFIG !== 'undefined' && STRAPI_CONFIG.useCMS) {
        try {
            textosData = await fetchTextosFromStrapi();
            applyTexts();
            initializeDynamicContent();
            return;
        } catch (error) {
            console.warn('⚠️ Error cargando desde Strapi, intentando con textos.json...', error);
        }
    }

    // Fallback a textos.json (modo tradicional)
    try {
        // Agregar timestamp para evitar cache
        const response = await fetch('textos.json?t=' + Date.now());

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const jsonText = await response.text();

        textosData = JSON.parse(jsonText);

        applyTexts();
        initializeDynamicContent();
    } catch (error) {
        console.error('❌ Error cargando textos.json, usando fallback');
        loadFallbackTexts();
    }
}

function loadFallbackTexts() {
    // Textos de respaldo incluidos en el código con todas las claves necesarias
    textosData = {
        "tituloPagina": "Laolin Children's Play Hub",
        "altLogo": "Laolin Children's Play Hub",
        "logoTexto": "laolin",
        "logoSlogan": "children's play hub",
        "navInicio": "Inicio",
        "navQuienesSomos": "Quiénes Somos",
        "navActividades": "Actividades",
        "navHorarios": "Horarios y Tarifas",
        "navCumpleaños": "Cumpleaños",
        "navGaleria": "Galería",
        "navBlog": "Blog",
        "navReservas": "Reservas",
        "navNormas": "Normas",
        "navTestimonios": "Testimonios",
        "navFAQ": "FAQ",
        "navContacto": "Contacto",
        "heroTitulo": "Un espacio mágico para crecer y jugar",
        "heroDescripcion": "Donde la risa, la creatividad y la imaginación no tienen límites. En nuestro espacio desde los mas peques hasta los mas grandes encontraran un espacio seguro y acogedor para descubrir, aprender y disfrutar cada día. Aquí, cada juego es una aventura, cada actividad un descubrimiento, y cada momento una oportunidad para crecer felices",
        "heroBoton": "¡Ven, que aqui la magia empieza contigo!",
        "contactoTitulo": "Contacto",
        "contactoUbicacionTitulo": "📍 Ubicación",
        "contactoUbicacionTexto": "AV CARABANCHEL ALTO 90 <br>MADRID, CP 28044",
        "contactoTelefonoTitulo": "📞 Teléfono",
        "contactoTelefonoTexto": "+34 672 98 23 17 - +34 666 00 90 13<br>WhatsApp disponible",
        "contactoHorariosTitulo": "🕒 Horarios",
        "contactoHorariosTexto": "SIN HORARIO",
        "contactoEmailTitulo": "✉️ Email",
        "contactoEmailTexto": "ludotecalaolin@gmail.com<br>Respuesta en 24h",
        "footerTexto": "&copy; 2025 Laolin Children's Play Hub. Todos los derechos reservados.",
        
        // Agregar las claves que están fallando
        "nuevasSecciones": {
            "actividadesTitulo": "🎨 Actividades",
            "actividadesDescripcion": "Aquí los peques no solo están cuidados, ¡también se divierten a lo grande!",
            "horariosTitulo": "⏰💰 Horarios y tarifas",
            "horariosDescripcion": "Sabemos lo importante que es la flexibilidad para las familias, por eso tenemos varias opciones:",
            "cumpleañosTitulo": "🎉 Cumpleaños y eventos",
            "cumpleañosDescripcion": "¿Quieres que tu peque tenga un cumpleaños inolvidable? 🎂",
            "galeriaTitulo": "📸 Galería",
            "galeriaDescripcion": "Dicen que una imagen vale más que mil palabras 😉",
            "blogTitulo": "📰 Blog / Novedades",
            "blogDescripcion": "Un rincón para las familias 💕",
            "reservasTitulo": "📅 Reservas Online",
            "reservasDescripcion": "Reserva tu espacio de forma fácil y rápida",
            "normasTitulo": "📋 Normas de la Ludoteca",
            "normasDescripcion": "Para que todos disfrutemos de un ambiente seguro y agradable",
            "testimoniosTitulo": "💬 Testimonios de Familias",
            "testimoniosDescripcion": "Lo que dicen las familias que confían en nosotros",
            "faqTitulo": "❓ Preguntas Frecuentes",
            "faqDescripcion": "Resolvemos tus dudas más comunes"
        },
        "reservas": {
            "formulario": {
                "nombre": "Nombre completo",
                "email": "Email",
                "telefono": "Teléfono",
                "fecha": "Fecha de reserva",
                "hora": "Hora",
                "numNinos": "Número de niños",
                "edades": "Edades de los niños",
                "servicio": "Servicio",
                "comentarios": "Comentarios adicionales",
                "enviar": "Reservar",
                "cancelar": "Cancelar"
            },
            "servicios": {
                "ludoteca": "Ludoteca",
                "cumpleaños": "Cumpleaños",
                "taller": "Taller especial"
            }
        }
    };
    applyTexts();
    initializeDynamicContent();
}

function applyTexts() {
    // Encontrar todos los elementos con data-key
    const elementsWithDataKey = document.querySelectorAll('[data-key]');
    
    let appliedCount = 0;
    let missingCount = 0;
    let missingKeys = [];
    
    elementsWithDataKey.forEach(element => {
        const key = element.getAttribute('data-key');
        const text = getNestedValue(textosData, key);
        
        if (text) {
            // Manejar casos especiales para elementos que necesitan innerHTML
            if (element.tagName === 'TITLE') {
                element.textContent = text;
            } else if (element.tagName === 'IMG') {
                element.alt = text;
            } else {
                element.innerHTML = text;
            }
            appliedCount++;
        } else {
            missingKeys.push(key);
            missingCount++;
        }
    });
    
    if (missingKeys.length > 0) {
        verifyDataStructure(missingKeys);
    }
}

function verifyDataStructure(missingKeys) {
    // Función de verificación silenciosa
}

// Función para obtener valores anidados del objeto JSON
function getNestedValue(obj, path) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (current && current[key] !== undefined) {
            current = current[key];
        } else {
            return null;
        }
    }
    
    return current;
}

function initializeDynamicContent() {
    // Inicializar contenido dinámico
    initializeQuienesSomos();
    initializeActividades();
    initializeHorariosTarifas();
    initializeCumpleaños();
    initializeNormas();
    initializeFAQ();
    initializeRedesSociales();
}

function initializeQuienesSomos() {
    // Cargar valores
    const valoresList = document.getElementById('valoresList');
    if (valoresList && textosData.quienesSomos && textosData.quienesSomos.valores) {
        valoresList.innerHTML = textosData.quienesSomos.valores.map(valor => 
            `<li>${valor}</li>`
        ).join('');
    }
}

function initializeActividades() {
    // Cargar beneficios de juegos libres
    const beneficiosJuegos = document.getElementById('beneficiosJuegos');
    if (beneficiosJuegos && textosData.actividades && textosData.actividades.juegosLibres) {
        beneficiosJuegos.innerHTML = textosData.actividades.juegosLibres.beneficios.map(beneficio => 
            `<li>${beneficio}</li>`
        ).join('');
    }
    
    // Cargar materiales
    const materialesList = document.getElementById('materialesList');
    if (materialesList && textosData.actividades && textosData.actividades.manualidades) {
        materialesList.innerHTML = textosData.actividades.manualidades.materiales.map(material => 
            `<li>${material}</li>`
        ).join('');
    }
    
    // Cargar tipos de juegos
    const tiposJuegos = document.getElementById('tiposJuegos');
    if (tiposJuegos && textosData.actividades && textosData.actividades.juegosMesa) {
        tiposJuegos.innerHTML = textosData.actividades.juegosMesa.tipos.map(tipo => 
            `<li>${tipo}</li>`
        ).join('');
    }
    
    // Cargar eventos temáticos
    const eventosTematicos = document.getElementById('eventosTematicos');
    if (eventosTematicos && textosData.actividades && textosData.actividades.tematicas) {
        eventosTematicos.innerHTML = textosData.actividades.tematicas.eventos.map(evento => 
            `<li>${evento}</li>`
        ).join('');
    }
}

function initializeHorariosTarifas() {
    // Los horarios ahora están directamente en el HTML con data-key
    // Ya no necesitamos generar el grid de horarios dinámicamente

    // Cargar tarifas
    const tarifasGrid = document.getElementById('tarifasGrid');
    if (tarifasGrid && textosData.horariosTarifas && textosData.horariosTarifas.tarifas) {
        const tarifas = textosData.horariosTarifas.tarifas;
        tarifasGrid.innerHTML = Object.entries(tarifas).map(([tipo, precio]) => 
            `<div class="tarifa-item">
                <h4>${tipo.replace(/([A-Z])/g, ' $1').trim()}</h4>
                <p>${precio}</p>
            </div>`
        ).join('');
    }
    
    // Cargar servicios especiales
    const serviciosEspecialesGrid = document.getElementById('serviciosEspecialesGrid');
    if (serviciosEspecialesGrid && textosData.horariosTarifas && textosData.horariosTarifas.serviciosEspeciales) {
        const servicios = textosData.horariosTarifas.serviciosEspeciales;
        serviciosEspecialesGrid.innerHTML = Object.entries(servicios).map(([servicio, precio]) => 
            `<div class="servicio-item">
                <h4>${servicio.charAt(0).toUpperCase() + servicio.slice(1)}</h4>
                <p>${precio}</p>
            </div>`
        ).join('');
    }
}

function initializeCumpleaños() {
    // Cargar elementos incluidos
    const incluyeGrid = document.getElementById('incluyeGrid');
    if (incluyeGrid && textosData.cumpleaños && textosData.cumpleaños.incluye) {
        incluyeGrid.innerHTML = textosData.cumpleaños.incluye.map(item => 
            `<div class="incluye-item">
                <p>${item}</p>
            </div>`
        ).join('');
    }
}

function initializeNormas() {
    // Cargar normas generales
    const normasGenerales = document.getElementById('normasGenerales');
    if (normasGenerales && textosData.normas && textosData.normas.generales) {
        normasGenerales.innerHTML = textosData.normas.generales.map(norma => 
            `<li>${norma}</li>`
        ).join('');
    }
    
    // Cargar normas de seguridad
    const normasSeguridad = document.getElementById('normasSeguridad');
    if (normasSeguridad && textosData.normas && textosData.normas.seguridad) {
        normasSeguridad.innerHTML = textosData.normas.seguridad.map(norma => 
            `<li>${norma}</li>`
        ).join('');
    }
    
    // Cargar normas de limpieza
    const normasLimpieza = document.getElementById('normasLimpieza');
    if (normasLimpieza && textosData.normas && textosData.normas.limpieza) {
        normasLimpieza.innerHTML = textosData.normas.limpieza.map(norma => 
            `<li>${norma}</li>`
        ).join('');
    }
}

function initializeFAQ() {
    const faqContent = document.getElementById('faqContent');
    if (faqContent && textosData.faq) {
        faqContent.innerHTML = textosData.faq.map((item, index) => 
            `<div class="faq-item">
                <div class="faq-pregunta" onclick="toggleFAQ(${index})">
                    <h4>${item.pregunta}</h4>
                    <span class="faq-toggle">+</span>
                </div>
                <div class="faq-respuesta" id="faq-respuesta-${index}">
                    <p>${item.respuesta}</p>
                </div>
            </div>`
        ).join('');
    }
}

function toggleFAQ(index) {
    const respuesta = document.getElementById(`faq-respuesta-${index}`);
    const toggle = respuesta.previousElementSibling.querySelector('.faq-toggle');
    
    if (respuesta.classList.contains('active')) {
        respuesta.classList.remove('active');
        toggle.textContent = '+';
    } else {
        // Cerrar todas las otras respuestas
        document.querySelectorAll('.faq-respuesta').forEach(r => {
            r.classList.remove('active');
        });
        document.querySelectorAll('.faq-toggle').forEach(t => {
            t.textContent = '+';
        });
        
        // Abrir la respuesta seleccionada
        respuesta.classList.add('active');
        toggle.textContent = '−';
    }
}

function initializeRedesSociales() {
    // Actualizar enlaces de redes sociales
    const instagramLinks = document.querySelectorAll('.red-social-link.instagram, .red-social-footer.instagram');
    const facebookLinks = document.querySelectorAll('.red-social-link.facebook, .red-social-footer.facebook');
    const whatsappLinks = document.querySelectorAll('.red-social-footer.whatsapp');
    
    if (textosData.redesSociales) {
        instagramLinks.forEach(link => {
            link.href = textosData.redesSociales.instagram;
        });
        
        facebookLinks.forEach(link => {
            link.href = textosData.redesSociales.facebook;
        });
        
        whatsappLinks.forEach(link => {
            link.href = textosData.redesSociales.whatsapp;
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Forzar recarga sin cache
    setTimeout(() => {
        loadTexts();
    }, 100);
    
    // Verificar que las burbujas se inicialicen
    setTimeout(() => {
        if (typeof bubbleSystem !== 'undefined' && bubbleSystem) {
            // Sistema de burbujas ya inicializado
        } else {
            // Intentar inicializar manualmente si no se ha hecho
            if (typeof BubbleSystem !== 'undefined') {
                try {
                    window.bubbleSystem = new BubbleSystem();
                } catch (error) {
                    // Error silencioso
                }
            }
        }
    }, 1000);
    
    // Manejar cambio de tamaño de ventana para el buscador
    window.addEventListener('resize', function() {
        const searchBox = document.querySelector('.search-box');
        if (window.innerWidth > 768 && searchBox) {
            searchBox.classList.remove('expanded');
        }
    });
});

// Smooth scrolling para enlaces de navegación
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Toggle para secciones en móvil
document.addEventListener('DOMContentLoaded', function() {
    // Toggle para cumpleaños
    const cumpleañosToggle = document.querySelector('.cumpleaños-toggle');
    const cumpleañosContent = document.querySelector('.cumpleaños-content');
    
    if (cumpleañosToggle && cumpleañosContent) {
        cumpleañosToggle.addEventListener('click', function() {
            // Solo funciona en móvil
            if (window.innerWidth <= 768) {
                cumpleañosContent.classList.toggle('expanded');
                cumpleañosToggle.classList.toggle('expanded');
            }
        });
    }
    
    // Toggle para actividades
    const actividadesToggle = document.querySelector('.actividades-toggle');
    const actividadesContent = document.querySelector('.actividades-content');
    
    if (actividadesToggle && actividadesContent) {
        actividadesToggle.addEventListener('click', function() {
            // Solo funciona en móvil
            if (window.innerWidth <= 768) {
                actividadesContent.classList.toggle('expanded');
                actividadesToggle.classList.toggle('expanded');
            }
        });
    }
    
    // Manejar cambios de tamaño de ventana para ambas secciones
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // En desktop, asegurar que el contenido esté visible
            if (cumpleañosContent && cumpleañosToggle) {
                cumpleañosContent.classList.add('expanded');
                cumpleañosToggle.classList.add('expanded');
            }
            if (actividadesContent && actividadesToggle) {
                actividadesContent.classList.add('expanded');
                actividadesToggle.classList.add('expanded');
            }
        }
    });
});

// ====== SCROLL TO TOP FUNCTIONALITY ======
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Mostrar/ocultar botón de scroll to top
document.addEventListener('DOMContentLoaded', function() {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    if (scrollToTopBtn) {
        // Mostrar botón después de hacer scroll
        window.addEventListener('scroll', function() {
            if (window.scrollY > 500) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });
    }
});

// ====== CARGA DINÁMICA DE ACTIVIDADES DESDE STRAPI ======
async function loadActividadesFromStrapi() {
    if (typeof fetchActividadesFromStrapi !== 'function') {
        console.log('fetchActividadesFromStrapi no disponible, usando datos estáticos');
        return;
    }

    try {
        const actividades = await fetchActividadesFromStrapi();

        if (actividades && actividades.length > 0) {
            const container = document.getElementById('actividadesCirculos');
            if (container) {
                container.innerHTML = actividades.map(actividad => `
                    <a href="javascript:void(0)" class="actividad-circulo"
                       style="background: linear-gradient(135deg, ${actividad.color_fondo}, ${adjustColor(actividad.color_fondo, -20)});
                              animation-delay: ${actividad.animacion_delay || 0}s;"
                       ${actividad.link_seccion ? `onclick="scrollToSection('${actividad.link_seccion}')"` : ''}>
                        <span class="emoji">${actividad.emoji}</span>
                        <span class="nombre" style="color: ${actividad.color_texto};">${actividad.nombre}</span>
                    </a>
                `).join('');
            }
        }
    } catch (error) {
        console.warn('Error cargando actividades desde Strapi:', error);
    }
}

// ====== FUNCIÓN AUXILIAR PARA FORMATEAR HORA ======
function formatearHora(hora) {
    if (!hora) return '';
    // Convertir "HH:MM:SS" o "HH:MM:SS.000" a "HH:MM"
    return hora.substring(0, 5);
}

// ====== CARGA DINÁMICA DE HORARIOS DESDE STRAPI ======
async function loadHorariosFromStrapi() {
    if (typeof fetchHorariosFromStrapi !== 'function') {
        console.log('fetchHorariosFromStrapi no disponible, usando datos estáticos');
        return;
    }

    try {
        const horarios = await fetchHorariosFromStrapi();

        if (horarios && horarios.length > 0) {
            // Separar horarios por tipo
            const ludotecaHorarios = horarios.filter(h => h.tipo === 'ludoteca');
            const pequeClubHorarios = horarios.filter(h => h.tipo === 'pequeclub');

            // Actualizar containers de horarios
            updateHorariosContainer('horariosReservas', ludotecaHorarios, pequeClubHorarios);
            updateHorariosContainer('horariosContacto', ludotecaHorarios, pequeClubHorarios);
            updateHorariosContainer('horariosHorariosTarifas', ludotecaHorarios, pequeClubHorarios);
        }
    } catch (error) {
        console.warn('Error cargando horarios desde Strapi:', error);
    }
}

function updateHorariosContainer(containerId, ludotecaHorarios, pequeClubHorarios) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Actualizar columna Ludoteca
    const ludotecaColumna = container.querySelector('.horario-columna.ludoteca');
    if (ludotecaColumna && ludotecaHorarios.length > 0) {
        const lineasContainer = ludotecaColumna.querySelector('.horario-linea')?.parentElement;
        if (lineasContainer) {
            // Mantener el título, limpiar líneas existentes
            const titulo = ludotecaColumna.querySelector('.horario-columna-titulo');
            ludotecaColumna.innerHTML = '';
            if (titulo) ludotecaColumna.appendChild(titulo);

            // Agregar nuevas líneas
            ludotecaHorarios.forEach(h => {
                const linea = document.createElement('div');
                linea.className = 'horario-linea';
                linea.innerHTML = `
                    <span class="dias">${h.dias}</span>
                    <span class="horas">${formatearHora(h.hora_inicio)} - ${formatearHora(h.hora_fin)}</span>
                `;
                ludotecaColumna.appendChild(linea);
            });
        }
    }

    // Actualizar columna PequeClub
    const pequeClubColumna = container.querySelector('.horario-columna.pequeclub');
    if (pequeClubColumna && pequeClubHorarios.length > 0) {
        const titulo = pequeClubColumna.querySelector('.horario-columna-titulo');
        pequeClubColumna.innerHTML = '';
        if (titulo) pequeClubColumna.appendChild(titulo);

        pequeClubHorarios.forEach(h => {
            const linea = document.createElement('div');
            linea.className = 'horario-linea';
            linea.innerHTML = `
                <span class="dias">${h.dias}</span>
                <span class="horas">${formatearHora(h.hora_inicio)} - ${formatearHora(h.hora_fin)}</span>
            `;
            pequeClubColumna.appendChild(linea);

            // Agregar nota si existe
            if (h.nota) {
                const nota = document.createElement('div');
                nota.className = 'horario-nota-especial';
                nota.textContent = h.nota;
                pequeClubColumna.appendChild(nota);
            }
        });
    }
}

// ====== FUNCIÓN AUXILIAR PARA AJUSTAR COLOR ======
function adjustColor(hex, amount) {
    // Remover el # si existe
    hex = hex.replace('#', '');

    // Convertir a RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Ajustar valores
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));

    // Convertir de vuelta a hex
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// ====== CARGA DINÁMICA DE IMÁGENES DE SECCIÓN DESDE STRAPI ======
async function loadImagenesSeccionFromStrapi() {
    if (typeof fetchImagenesSeccionFromStrapi !== 'function') {
        console.log('fetchImagenesSeccionFromStrapi no disponible, usando imágenes estáticas');
        return;
    }

    try {
        const imagenes = await fetchImagenesSeccionFromStrapi('quienes-somos');

        if (imagenes && imagenes.length > 0) {
            // Mapeo de identificadores a IDs de elementos HTML
            const imageMapping = {
                'laolin-principal': 'imgLaolinPrincipal',
                'fundadora-1': 'imgFundadora1',
                'fundadora-2': 'imgFundadora2',
                'equipo-icon': 'imgEquipoIcon'
            };

            imagenes.forEach(imagen => {
                const elementId = imageMapping[imagen.identificador];
                if (elementId && imagen.imagen_url) {
                    const imgElement = document.getElementById(elementId);
                    if (imgElement) {
                        imgElement.src = imagen.imagen_url;
                        if (imagen.alt_text) {
                            imgElement.alt = imagen.alt_text;
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.warn('Error cargando imágenes de sección desde Strapi:', error);
    }
}

// ====== CARGA DINÁMICA DE RESEÑAS GOOGLE DESDE STRAPI ======
async function loadResenasGoogleFromStrapi() {
    if (typeof fetchResenasGoogleFromStrapi !== 'function' || typeof fetchConfiguracionGlobalFromStrapi !== 'function') {
        console.log('Funciones de reseñas no disponibles');
        return;
    }

    try {
        // Cargar configuración global
        const config = await fetchConfiguracionGlobalFromStrapi();

        // Verificar si las reseñas de Google están habilitadas
        if (!config.mostrar_resenas_google) {
            console.log('Reseñas de Google deshabilitadas en configuración');
            return;
        }

        // Cargar reseñas
        const resenas = await fetchResenasGoogleFromStrapi();

        if (resenas && resenas.length > 0 && typeof testimonialsSystem !== 'undefined') {
            // Limitar cantidad según configuración
            const cantidadMostrar = config.cantidad_resenas_mostrar || 5;
            const resenasLimitadas = resenas.slice(0, cantidadMostrar);

            // Convertir formato de reseñas a formato de testimonios
            const testimoniosConvertidos = resenasLimitadas.map((resena, index) => ({
                id: resena.id || index + 1,
                nombre: resena.autor,
                foto: resena.foto_autor || '⭐',
                texto: resena.texto,
                calificacion: resena.puntuacion,
                fecha: resena.fecha_relativa || formatearFechaResena(resena.fecha_resena),
                categoria: 'google'
            }));

            // Actualizar el sistema de testimonios
            testimonialsSystem.testimonials = testimoniosConvertidos;
            testimonialsSystem.currentIndex = 0;
            testimonialsSystem.renderTestimonials();
        }
    } catch (error) {
        console.warn('Error cargando reseñas de Google desde Strapi:', error);
    }
}

// Función auxiliar para formatear fecha de reseña
function formatearFechaResena(fechaStr) {
    if (!fechaStr) return '';
    try {
        const fecha = new Date(fechaStr);
        const ahora = new Date();
        const diffMs = ahora - fecha;
        const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDias === 0) return 'Hoy';
        if (diffDias === 1) return 'Ayer';
        if (diffDias < 7) return `Hace ${diffDias} días`;
        if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semanas`;
        if (diffDias < 365) return `Hace ${Math.floor(diffDias / 30)} meses`;
        return `Hace ${Math.floor(diffDias / 365)} años`;
    } catch (e) {
        return fechaStr;
    }
}

// ====== CARGA DINÁMICA DE TIPOGRAFÍA DESDE STRAPI ======
async function loadTipografiaFromStrapi() {
    if (typeof fetchConfiguracionGlobalFromStrapi !== 'function') {
        console.log('fetchConfiguracionGlobalFromStrapi no disponible');
        return;
    }

    try {
        const config = await fetchConfiguracionGlobalFromStrapi();

        // Aplicar tipografía usando CSS variables
        const root = document.documentElement;

        if (config.tipografia_principal) {
            root.style.setProperty('--font-primary', config.tipografia_principal);
        }

        if (config.tipografia_secundaria) {
            root.style.setProperty('--font-secondary', config.tipografia_secundaria);
        }

        if (config.tamano_fuente_base) {
            root.style.setProperty('--font-size-base', config.tamano_fuente_base + 'px');
            document.body.style.fontSize = config.tamano_fuente_base + 'px';
        }

        if (config.tamano_foto_fundadora) {
            root.style.setProperty('--fundadora-foto-size', config.tamano_foto_fundadora + 'px');
        }

    } catch (error) {
        console.warn('Error cargando tipografía desde Strapi:', error);
    }
}

// ====== CARGA DINÁMICA DE DOCUMENTOS EN SECCIONES ======
async function loadDocumentosSeccionesFromStrapi() {
    if (typeof fetchDocumentosFromStrapi !== 'function') {
        console.log('fetchDocumentosFromStrapi no disponible');
        return;
    }

    try {
        const documentos = await fetchDocumentosFromStrapi();

        if (!documentos || documentos.length === 0) {
            return;
        }

        // Documentos para sección de Alquiler (solo con archivo)
        const docsAlquiler = documentos.filter(doc => doc.mostrar_en_alquiler && doc.archivo_url);
        const containerAlquiler = document.getElementById('documentoAlquilerContainer');

        if (containerAlquiler && docsAlquiler.length > 0) {
            const doc = docsAlquiler[0];
            containerAlquiler.innerHTML = `
                <i class="fas ${doc.icono || 'fa-file-pdf'}"></i>
                Descarga <a href="${doc.archivo_url}" target="_blank" class="documento-descarga-inline" title="${doc.nombre}">Aquí</a>
                ${doc.descripcion || 'el modelo de contrato para tu alquiler y revisa las condiciones'}
            `;
            containerAlquiler.style.display = 'block';
        } else if (containerAlquiler) {
            containerAlquiler.style.display = 'none';
        }

        // Documentos para sección de Reservas (solo con archivo)
        const docsReservas = documentos.filter(doc => doc.mostrar_en_reservas && doc.archivo_url);
        const containerReservas = document.getElementById('documentoReservasContainer');

        if (containerReservas && docsReservas.length > 0) {
            const doc = docsReservas[0];
            containerReservas.innerHTML = `
                Consulta <a href="${doc.archivo_url}" target="_blank" class="documento-descarga-inline" title="${doc.nombre}">aquí</a>
                ${doc.descripcion || 'nuestro contrato de alquiler'}
            `;
            containerReservas.style.display = '';
        } else if (containerReservas) {
            containerReservas.style.display = 'none';
        }

    } catch (error) {
        console.warn('Error cargando documentos de secciones:', error);
    }
}

// ====== CARGA DINÁMICA DE NOTA DE HORARIOS ======
async function loadNotaHorariosFromStrapi() {
    if (typeof fetchConfiguracionGlobalFromStrapi !== 'function') {
        return;
    }

    try {
        const config = await fetchConfiguracionGlobalFromStrapi();

        if (config && config.nota_horarios) {
            // Convertir saltos de línea en <br> para HTML
            const nota = config.nota_horarios.replace(/\n/g, '<br>');
            const containers = [
                document.getElementById('notaHorariosTarifas'),
                document.getElementById('notaHorariosReservas')
            ];

            containers.forEach(container => {
                if (container) {
                    container.innerHTML = `<p>${nota}</p>`;
                }
            });
        }
    } catch (error) {
        console.warn('Error cargando nota de horarios:', error);
    }
}

// ====== INICIALIZAR CARGA DINÁMICA ======
document.addEventListener('DOMContentLoaded', function() {
    // Cargar actividades, horarios e imágenes después de un breve delay
    setTimeout(() => {
        loadActividadesFromStrapi();
        loadHorariosFromStrapi();
        loadImagenesSeccionFromStrapi();
        loadTipografiaFromStrapi();
        loadDocumentosSeccionesFromStrapi();
        loadNotaHorariosFromStrapi();
        cargarNumerosWhatsapp();
    }, 500);

    // Cargar reseñas de Google después de que el sistema de testimonios esté listo
    setTimeout(() => {
        loadResenasGoogleFromStrapi();
    }, 1000);
});
