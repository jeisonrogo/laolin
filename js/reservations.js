// Sistema de reservas online
class ReservationSystem {
    constructor() {
        this.form = document.getElementById('reservasForm');
        this.fechaInput = document.getElementById('fecha');
        this.horaSelect = document.getElementById('hora');
        this.servicioSelect = document.getElementById('servicio');
        this.numNinosInput = document.getElementById('numNinos');
        this.edadesInput = document.getElementById('edades');
        
        this.horariosReserva = {
            diasHabiles: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
            horarioInicio: '09:00',
            horarioFin: '20:00',
            intervaloReserva: 60
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeDatePicker();
        this.initializeTimeSlots();
        this.setupValidation();
    }
    
    setupEventListeners() {
        // Validación en tiempo real
        this.form.addEventListener('input', (e) => {
            this.validateField(e.target);
        });
        
        // Cambio de fecha
        this.fechaInput.addEventListener('change', () => {
            this.updateTimeSlots();
        });
        
        // Cambio de servicio
        this.servicioSelect.addEventListener('change', () => {
            this.updateServiceValidation();
        });
        
        // Envío del formulario
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReservation();
        });
    }
    
    initializeDatePicker() {
        // Establecer fecha mínima (hoy)
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        this.fechaInput.min = tomorrow.toISOString().split('T')[0];
        
        // Establecer fecha máxima (3 meses desde hoy)
        const maxDate = new Date(today);
        maxDate.setMonth(maxDate.getMonth() + 3);
        this.fechaInput.max = maxDate.toISOString().split('T')[0];
    }
    
    initializeTimeSlots() {
        this.updateTimeSlots();
    }
    
    updateTimeSlots() {
        const fecha = this.fechaInput.value;
        if (!fecha) return;
        
        const selectedDate = new Date(fecha);
        const dayOfWeek = selectedDate.getDay(); // 0 = Domingo, 1 = Lunes, etc.
        
        // Limpiar opciones actuales
        this.horaSelect.innerHTML = '<option value="">Seleccionar hora</option>';
        
        // Verificar si es un día hábil (no domingo)
        if (dayOfWeek === 0) {
            this.horaSelect.innerHTML = '<option value="">Cerrado los domingos</option>';
            this.horaSelect.disabled = true;
            return;
        }
        
        this.horaSelect.disabled = false;
        
        // Generar horarios disponibles
        const timeSlots = this.generateTimeSlots();
        timeSlots.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            this.horaSelect.appendChild(option);
        });
    }
    
    generateTimeSlots() {
        const slots = [];
        const startTime = new Date(`2000-01-01T${this.horariosReserva.horarioInicio}`);
        const endTime = new Date(`2000-01-01T${this.horariosReserva.horarioFin}`);
        const interval = parseInt(this.horariosReserva.intervaloReserva);
        
        let currentTime = new Date(startTime);
        
        while (currentTime < endTime) {
            slots.push(currentTime.toTimeString().slice(0, 5));
            currentTime.setMinutes(currentTime.getMinutes() + interval);
        }
        
        return slots;
    }
    
    setupValidation() {
        // Validación de email
        const emailInput = document.getElementById('email');
        emailInput.addEventListener('blur', () => {
            this.validateEmail(emailInput.value);
        });
        
        // Validación de teléfono
        const telefonoInput = document.getElementById('telefono');
        telefonoInput.addEventListener('blur', () => {
            this.validatePhone(telefonoInput.value);
        });
        
        // Validación de número de niños
        this.numNinosInput.addEventListener('change', () => {
            this.validateNumNinos();
        });
        
        // Validación de edades
        this.edadesInput.addEventListener('blur', () => {
            this.validateEdades();
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        switch (field.name) {
            case 'nombre':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'El nombre debe tener al menos 2 caracteres';
                }
                break;
                
            case 'email':
                if (!this.validateEmail(value)) {
                    isValid = false;
                    errorMessage = 'Introduce un email válido';
                }
                break;
                
            case 'telefono':
                if (!this.validatePhone(value)) {
                    isValid = false;
                    errorMessage = 'Introduce un teléfono válido';
                }
                break;
                
            case 'fecha':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Selecciona una fecha';
                } else {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (selectedDate <= today) {
                        isValid = false;
                        errorMessage = 'La fecha debe ser posterior a hoy';
                    }
                }
                break;
                
            case 'hora':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Selecciona una hora';
                }
                break;
                
            case 'numNinos':
                const num = parseInt(value);
                if (isNaN(num) || num < 1 || num > 10) {
                    isValid = false;
                    errorMessage = 'El número de niños debe estar entre 1 y 10';
                }
                break;
                
            case 'edades':
                if (!this.validateEdades()) {
                    isValid = false;
                    errorMessage = 'Introduce las edades separadas por comas (ej: 3, 5, 7 años)';
                }
                break;
                
            case 'servicio':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Selecciona un servicio';
                }
                break;
        }
        
        this.showFieldValidation(field, isValid, errorMessage);
        return isValid;
    }
    
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    validatePhone(phone) {
        const phoneRegex = /^(\+34|0034|34)?[6789]\d{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }
    
    validateNumNinos() {
        const num = parseInt(this.numNinosInput.value);
        const edades = this.edadesInput.value;
        
        if (edades) {
            const edadesArray = edades.split(',').map(e => e.trim());
            if (edadesArray.length !== num) {
                this.showFieldValidation(this.edadesInput, false, 
                    `Debes especificar ${num} edad(es) separadas por comas`);
                return false;
            }
        }
        
        return true;
    }
    
    validateEdades() {
        const edades = this.edadesInput.value;
        const numNinos = parseInt(this.numNinosInput.value);
        
        if (!edades) return true;
        
        const edadesArray = edades.split(',').map(e => e.trim());
        
        // Verificar que el número de edades coincida con el número de niños
        if (edadesArray.length !== numNinos) {
            return false;
        }
        
        // Verificar que todas las edades sean válidas
        for (let edad of edadesArray) {
            const edadNum = parseInt(edad);
            if (isNaN(edadNum) || edadNum < 0 || edadNum > 12) {
                return false;
            }
        }
        
        return true;
    }
    
    showFieldValidation(field, isValid, errorMessage = '') {
        // Remover clases de validación anteriores
        field.classList.remove('valid', 'invalid');
        
        // Remover mensaje de error anterior
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        if (field.value.trim() === '') {
            return; // No mostrar validación si el campo está vacío
        }
        
        if (isValid) {
            field.classList.add('valid');
        } else {
            field.classList.add('invalid');
            
            // Mostrar mensaje de error
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = errorMessage;
            errorDiv.style.color = '#e74c3c';
            errorDiv.style.fontSize = '0.8rem';
            errorDiv.style.marginTop = '5px';
            field.parentNode.appendChild(errorDiv);
        }
    }
    
    updateServiceValidation() {
        const servicio = this.servicioSelect.value;
        
        // Ajustar validaciones según el servicio
        if (servicio === 'cumpleaños') {
            this.numNinosInput.min = '5';
            this.numNinosInput.max = '15';
        } else {
            this.numNinosInput.min = '1';
            this.numNinosInput.max = '10';
        }
    }
    
    validateForm() {
        const fields = this.form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    async submitReservation() {
        if (!this.validateForm()) {
            this.showMessage('Por favor, completa todos los campos obligatorios correctamente.', 'error');
            return;
        }
        
        const formData = new FormData(this.form);
        const reservationData = {
            nombre: formData.get('nombre'),
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            fecha: formData.get('fecha'),
            hora: formData.get('hora'),
            numNinos: formData.get('numNinos'),
            edades: formData.get('edades'),
            servicio: formData.get('servicio'),
            comentarios: formData.get('comentarios'),
            timestamp: new Date().toISOString()
        };
        
        // Mostrar indicador de carga
        this.showLoading(true);
        
        try {
            // Simular envío a Google Sheets (en producción, esto sería una llamada real)
            await this.sendToGoogleSheets(reservationData);
            
            this.showMessage('¡Reserva realizada con éxito! Te enviaremos una confirmación por email.', 'success');
            this.form.reset();
            this.updateTimeSlots();
            
        } catch (error) {
            console.error('Error al enviar la reserva:', error);
            this.showMessage('Ha ocurrido un error. Por favor, inténtalo de nuevo o contacta con nosotros.', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async sendToGoogleSheets(data) {
        // Verificar si estamos en modo simulación
        if (isSimulationMode()) {
            console.log('🔄 MODO SIMULACIÓN: Simulando envío a Google Sheets...');
            console.log('📊 Datos de la reserva:', data);
            
            // Simular envío exitoso
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log('✅ Simulación: Reserva "enviada" exitosamente');
                    resolve({ success: true, message: 'Reserva enviada (simulación)' });
                }, 2000);
            });
        }
        
        // Envío real a Google Apps Script
        const scriptUrl = getScriptUrl();
        if (!scriptUrl) {
            throw new Error('URL de Google Apps Script no configurada');
        }
        
        try {
            console.log('📤 Enviando reserva a Google Sheets...');
            
            const response = await fetch(scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'submitReservation',
                    data: data
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Reserva enviada exitosamente:', result);
                return result;
            } else {
                throw new Error(result.error || 'Error al enviar la reserva');
            }
            
        } catch (error) {
            console.error('❌ Error al enviar a Google Sheets:', error);
            
            // Fallback: mostrar datos en consola para debugging
            console.log('📊 Datos de la reserva (para debugging):', data);
            
            throw error;
        }
    }
    
    showLoading(show) {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        if (show) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
            submitBtn.style.opacity = '0.7';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            submitBtn.style.opacity = '1';
        }
    }
    
    showMessage(message, type) {
        // Crear elemento de mensaje
        const messageDiv = document.createElement('div');
        messageDiv.className = `reservation-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        if (type === 'success') {
            messageDiv.style.backgroundColor = '#27ae60';
        } else {
            messageDiv.style.backgroundColor = '#e74c3c';
        }
        
        document.body.appendChild(messageDiv);
        
        // Animar entrada
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(messageDiv);
            }, 300);
        }, 5000);
    }
    
    // Método para verificar disponibilidad
    async checkAvailability(fecha, hora) {
        // En producción, esto consultaría la base de datos
        // Por ahora, simulamos disponibilidad
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simular que hay disponibilidad 80% de las veces
                resolve(Math.random() > 0.2);
            }, 500);
        });
    }
}

// Inicializar el sistema de reservas
let reservationSystem;

document.addEventListener('DOMContentLoaded', function() {
    reservationSystem = new ReservationSystem();
});

// Función global para verificar disponibilidad
async function checkReservationAvailability(fecha, hora) {
    if (reservationSystem) {
        return await reservationSystem.checkAvailability(fecha, hora);
    }
    return false;
}
