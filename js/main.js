// Función para hacer scroll suave a las secciones
function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = target.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Menú hamburguesa y buscador responsive
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const searchBox = document.querySelector('.search-box');
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Cerrar menú al hacer clic en un enlace
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
        
        // Cerrar menú al hacer clic fuera de él
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
    
    // Funcionalidad del buscador responsive
    if (searchBtn && searchBox && searchInput) {
        const searchContainer = document.querySelector('.search-container');
        
        // Función para limpiar expansión en desktop
        function cleanDesktopExpansion() {
            if (window.innerWidth > 768) {
                searchBox.classList.remove('expanded');
                if (searchContainer) {
                    searchContainer.classList.remove('expanded');
                }
            }
        }
        
        // Limpiar al cargar
        cleanDesktopExpansion();
        
        searchBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            if (window.innerWidth <= 768) {
                // En móvil, expandir/contraer el buscador
                const isExpanded = searchBox.classList.contains('expanded');
                
                searchBox.classList.toggle('expanded');
                if (searchContainer) {
                    searchContainer.classList.toggle('expanded');
                }
                
                if (!isExpanded) {
                    searchInput.focus();
                } else {
                    searchInput.blur();
                    searchInput.value = '';
                }
            } else {
                // En desktop, solo hacer foco en el input (comportamiento normal)
                // Asegurar que no haya clases de expansión
                cleanDesktopExpansion();
                searchInput.focus();
            }
        });
        
        // Cerrar buscador al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!searchBox.contains(e.target) && window.innerWidth <= 768) {
                searchBox.classList.remove('expanded');
                if (searchContainer) {
                    searchContainer.classList.remove('expanded');
                }
                searchInput.blur();
            }
        });
        
        // Cerrar buscador al presionar Escape
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && window.innerWidth <= 768) {
                searchBox.classList.remove('expanded');
                if (searchContainer) {
                    searchContainer.classList.remove('expanded');
                }
                searchInput.blur();
            }
        });
        
        // Asegurar que el buscador se cierre al cambiar de tamaño de ventana
        window.addEventListener('resize', function() {
            cleanDesktopExpansion();
            if (window.innerWidth > 768) {
                searchInput.blur();
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

// Cargar textos desde JSON
let textosData = {};

async function loadTexts() {
    try {
        console.log('=== INICIO DE CARGA DE TEXTOS ===');
        console.log('Intentando cargar textos.json...');
        
        // Agregar timestamp para evitar cache
        const response = await fetch('textos.json?t=' + Date.now());
        console.log('Respuesta del servidor:', response.status, response.statusText);
        console.log('Headers de respuesta:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const jsonText = await response.text();
        console.log('Texto JSON recibido (primeros 200 caracteres):', jsonText.substring(0, 200));
        
        textosData = JSON.parse(jsonText);
        console.log('Textos cargados exitosamente desde archivo JSON');
        console.log('Estructura de datos cargados:', Object.keys(textosData));
        console.log('Claves en nuevasSecciones:', textosData.nuevasSecciones ? Object.keys(textosData.nuevasSecciones) : 'NO EXISTE');
        console.log('Claves en reservas:', textosData.reservas ? Object.keys(textosData.reservas) : 'NO EXISTE');
        
        applyTexts();
        initializeDynamicContent();
        console.log('=== FIN DE CARGA DE TEXTOS ===');
    } catch (error) {
        console.error('Error al cargar textos.json:', error);
        console.warn('Usando textos de respaldo...');
        loadFallbackTexts();
    }
}

function loadFallbackTexts() {
    console.log('Cargando textos de respaldo...');
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
    console.log('Textos de respaldo cargados');
    applyTexts();
    initializeDynamicContent();
}

function applyTexts() {
    console.log('Aplicando textos a elementos con data-key...');
    // Encontrar todos los elementos con data-key
    const elementsWithDataKey = document.querySelectorAll('[data-key]');
    console.log(`Encontrados ${elementsWithDataKey.length} elementos con data-key`);
    
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
            console.warn(`No se encontró texto para la clave: ${key}`);
            missingKeys.push(key);
            missingCount++;
        }
    });
    
    console.log(`Textos aplicados: ${appliedCount}, Textos faltantes: ${missingCount}`);
    
    if (missingKeys.length > 0) {
        console.log('Claves faltantes:', missingKeys);
        console.log('Verificando estructura de datos...');
        verifyDataStructure(missingKeys);
    }
}

function verifyDataStructure(missingKeys) {
    console.log('=== VERIFICACIÓN DE ESTRUCTURA DE DATOS ===');
    console.log('Datos disponibles:', textosData);
    
    missingKeys.forEach(key => {
        const keys = key.split('.');
        let current = textosData;
        let path = '';
        
        for (let i = 0; i < keys.length; i++) {
            path += (i > 0 ? '.' : '') + keys[i];
            if (current && current[keys[i]] !== undefined) {
                current = current[keys[i]];
                console.log(`✓ ${path} existe`);
            } else {
                console.log(`✗ ${path} NO existe`);
                console.log(`  Nivel anterior (${keys.slice(0, i).join('.')}):`, current);
                break;
            }
        }
    });
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
            console.debug(`Clave no encontrada: ${key} en ruta ${path} (nivel ${i})`);
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
    // Cargar horarios
    const horariosGrid = document.getElementById('horariosGrid');
    if (horariosGrid && textosData.horariosTarifas && textosData.horariosTarifas.horarios) {
        const horarios = textosData.horariosTarifas.horarios;
        horariosGrid.innerHTML = Object.entries(horarios).map(([dia, horario]) => 
            `<div class="horario-item">
                <h4>${dia.charAt(0).toUpperCase() + dia.slice(1)}</h4>
                <p>${horario}</p>
            </div>`
        ).join('');
    }
    
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
    console.log('DOM cargado, iniciando carga de textos...');
    // Forzar recarga sin cache
    setTimeout(() => {
        loadTexts();
    }, 100);
    
    // Verificar que las burbujas se inicialicen
    setTimeout(() => {
        if (typeof bubbleSystem !== 'undefined' && bubbleSystem) {
            console.log('Sistema de burbujas inicializado:', bubbleSystem.getStats());
        } else {
            console.warn('Sistema de burbujas no encontrado, intentando inicializar...');
            // Intentar inicializar manualmente si no se ha hecho
            if (typeof BubbleSystem !== 'undefined') {
                try {
                    window.bubbleSystem = new BubbleSystem();
                    console.log('Sistema de burbujas inicializado manualmente');
                } catch (error) {
                    console.error('Error al inicializar burbujas:', error);
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
