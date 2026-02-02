// Sistema de Inscripción PequeClub - Laolin Children's Play Hub
// Formulario de inscripción que envía datos a Google Sheets via JSONP

class InscripcionPequeClub {
    constructor() {
        this.modal = document.getElementById('modalInscripcion');
        this.closeBtn = document.getElementById('modalInscripcionClose');
        this.form = document.getElementById('formInscripcion');

        this.init();
    }

    init() {
        if (!this.modal || !this.form) {
            console.warn('Modal de inscripción no encontrado');
            return;
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Cerrar modal con botón X
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Cerrar modal al hacer clic fuera
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Cerrar modal con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });

        // Manejar envío del formulario
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    openModal() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus en el primer campo
        setTimeout(() => {
            const firstInput = this.form.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 300);
    }

    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.form.reset();
    }

    async handleSubmit(e) {
        e.preventDefault();

        const submitBtn = this.form.querySelector('.btn-inscripcion');
        const originalText = submitBtn.innerHTML;

        // Validar formulario
        if (!this.validateForm()) {
            return;
        }

        // Deshabilitar botón
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        // Recoger datos del formulario
        const formData = {
            nombre: document.getElementById('inscripcion-nombre').value.trim(),
            telefono: document.getElementById('inscripcion-telefono').value.trim(),
            email: document.getElementById('inscripcion-email').value.trim(),
            mensaje: document.getElementById('inscripcion-mensaje').value.trim(),
            tipo: 'inscripcion_pequeclub',
            fecha: new Date().toISOString()
        };

        try {
            // Enviar a Google Sheets via JSONP
            const result = await this.sendToGoogleSheets(formData);

            if (result.success) {
                this.showSuccessMessage();
                this.closeModal();
            } else {
                this.showErrorMessage(result.error || 'Error al enviar la inscripción');
            }
        } catch (error) {
            console.error('Error enviando inscripción:', error);
            this.showErrorMessage('Error de conexión. Por favor, intenta de nuevo.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    validateForm() {
        const nombre = document.getElementById('inscripcion-nombre').value.trim();
        const telefono = document.getElementById('inscripcion-telefono').value.trim();
        const email = document.getElementById('inscripcion-email').value.trim();

        // Validar nombre
        if (!nombre || nombre.length < 2) {
            this.showFieldError('inscripcion-nombre', 'Por favor, introduce tu nombre');
            return false;
        }

        // Validar teléfono español
        const phoneRegex = /^(\+34|0034|34)?[6789]\d{8}$/;
        if (!phoneRegex.test(telefono.replace(/\s/g, ''))) {
            this.showFieldError('inscripcion-telefono', 'Introduce un teléfono válido');
            return false;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showFieldError('inscripcion-email', 'Introduce un email válido');
            return false;
        }

        return true;
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.style.borderColor = '#db2777';
            field.focus();

            // Mostrar mensaje temporal
            const existingError = field.parentElement.querySelector('.field-error');
            if (existingError) existingError.remove();

            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.style.cssText = 'color: #db2777; font-size: 0.85rem; margin-top: 5px;';
            errorDiv.textContent = message;
            field.parentElement.appendChild(errorDiv);

            // Remover error después de 3 segundos
            setTimeout(() => {
                field.style.borderColor = '';
                if (errorDiv) errorDiv.remove();
            }, 3000);
        }
    }

    sendToGoogleSheets(data) {
        return new Promise((resolve, reject) => {
            // Verificar si hay configuración de reservas
            if (typeof RESERVATION_CONFIG === 'undefined' || !RESERVATION_CONFIG.scriptUrl) {
                console.warn('No hay configuración de Google Sheets, simulando envío');
                // Simular envío exitoso
                setTimeout(() => {
                    resolve({ success: true, message: 'Inscripción simulada' });
                }, 1000);
                return;
            }

            const scriptUrl = RESERVATION_CONFIG.scriptUrl;

            // Crear nombre único para el callback
            const callbackName = `inscripcionCallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Crear callback global
            window[callbackName] = (response) => {
                // Limpiar
                delete window[callbackName];
                const script = document.getElementById(callbackName);
                if (script) script.remove();

                if (response && response.success) {
                    resolve(response);
                } else {
                    reject(response || { error: 'Error desconocido' });
                }
            };

            // Preparar URL con datos
            const params = new URLSearchParams({
                callback: callbackName,
                action: 'submitInscripcion',
                data: JSON.stringify(data)
            });

            // Crear script tag para JSONP
            const script = document.createElement('script');
            script.id = callbackName;
            script.src = `${scriptUrl}?${params.toString()}`;
            script.onerror = () => {
                delete window[callbackName];
                script.remove();
                reject({ error: 'Error de conexión' });
            };

            // Timeout de 15 segundos
            const timeout = setTimeout(() => {
                if (window[callbackName]) {
                    delete window[callbackName];
                    script.remove();
                    reject({ error: 'Tiempo de espera agotado' });
                }
            }, 15000);

            // Modificar callback para limpiar timeout
            const originalCallback = window[callbackName];
            window[callbackName] = (response) => {
                clearTimeout(timeout);
                originalCallback(response);
            };

            document.head.appendChild(script);
        });
    }

    showSuccessMessage() {
        // Crear notificación de éxito
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 30px 40px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 10001;
            text-align: center;
            animation: fadeInScale 0.3s ease;
        `;
        notification.innerHTML = `
            <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
            <h3 style="margin: 0 0 10px 0;">¡Inscripción Enviada!</h3>
            <p style="margin: 0;">Nos pondremos en contacto contigo pronto.</p>
        `;

        document.body.appendChild(notification);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showErrorMessage(message) {
        // Crear notificación de error
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 30px 40px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 10001;
            text-align: center;
            animation: fadeInScale 0.3s ease;
        `;
        notification.innerHTML = `
            <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
            <h3 style="margin: 0 0 10px 0;">Error</h3>
            <p style="margin: 0;">${message}</p>
        `;

        document.body.appendChild(notification);

        // Remover después de 4 segundos
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// Inicializar sistema de inscripción
let inscripcionSystem;

document.addEventListener('DOMContentLoaded', function() {
    inscripcionSystem = new InscripcionPequeClub();
});

// Función global para abrir el modal de inscripción
function abrirModalInscripcion() {
    if (inscripcionSystem) {
        inscripcionSystem.openModal();
    }
}

// CSS para animaciones
const inscripcionStyles = document.createElement('style');
inscripcionStyles.textContent = `
    @keyframes fadeInScale {
        from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }

    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }

    .documento-descarga-inline {
        color: #db2777;
        text-decoration: underline;
        font-weight: bold;
    }

    .documento-descarga-inline:hover {
        color: #9d174d;
    }
`;
document.head.appendChild(inscripcionStyles);
