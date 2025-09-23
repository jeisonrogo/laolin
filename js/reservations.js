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
            const dato = await this.sendToGoogleSheets(reservationData);
            console.log('Respuesta de Google Sheets:', dato);
            
            this.showMessage('¡Reserva realizada con éxito! Te enviaremos una confirmación por email.', 'success');
            this.form.reset();
            this.updateTimeSlots();
            
        } catch (error) {
            console.log('Error:', error);
            this.showMessage('Ha ocurrido un error. Por favor, inténtalo de nuevo o contacta con nosotros.', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async sendToGoogleSheets(data) {
        // Verificar si estamos en modo simulación
        if (isSimulationMode()) {
            // Simular envío exitoso
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ success: true, message: 'Reserva enviada (simulación)' });
                }, 2000);
            });
        }
        
        // Envío real usando JSONP para evitar completamente CORS
        const scriptUrl = getScriptUrl();
        
        if (!scriptUrl) {
            throw new Error('URL de Google Apps Script no configurada');
        }
        
        // Usar URL directa de Google Apps Script (evitar redirección)
        // La URL original puede causar redirecciones que fallan en JSONP
        const directUrl = scriptUrl;
        
        return new Promise((resolve, reject) => {
            try {
                // Crear un callback único
                const callbackName = 'jsonpCallback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                
                // Crear función global de callback
                window[callbackName] = function(result) {
                    // Limpiar el script y la función global
                    if (script && script.parentNode) {
                        document.head.removeChild(script);
                    }
                    delete window[callbackName];
                    
                    if (result && result.success) {
                        resolve(result);
                    } else {
                        reject(new Error(result?.error || 'Error al enviar la reserva'));
                    }
                };
                
                // Crear parámetros URL
                const params = new URLSearchParams();
                params.append('action', 'submitReservation');
                params.append('data', JSON.stringify(data));
                params.append('callback', callbackName);
                
                const url = `${scriptUrl}?${params.toString()}`;
                
                // Crear script element primero
                const script = document.createElement('script');
                
                // Verificar si la URL contiene redirección
                if (url.includes('script.google.com/macros/s/')) {
                    // Intentar con fetch primero
                    this.tryFetchFirst(url, data)
                        .then(resolve)
                        .catch(() => {
                            this.executeJsonpScript(url, script, callbackName, resolve, reject);
                        });
                    return;
                }
                
                this.executeJsonpScript(url, script, callbackName, resolve, reject);
                
            } catch (error) {
                console.error('Error en sendToGoogleSheets:', error);
                reject(error);
            }
        });
    }
    
    async tryFetchFirst(url, data) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const responseText = await response.text();
            
            // Verificar si es una respuesta JSONP
            if (responseText.startsWith('jsonpCallback_') || responseText.includes('(')) {
                // Extraer el JSON del callback JSONP
                const jsonMatch = responseText.match(/\((.+)\)$/);
                if (jsonMatch) {
                    try {
                        const result = JSON.parse(jsonMatch[1]);
                        
                        if (result.success) {
                            return result;
                        } else {
                            throw new Error(result.error || 'Error del servidor');
                        }
                    } catch (parseError) {
                        throw new Error('Respuesta JSONP recibida en fetch');
                    }
                } else {
                    throw new Error('Respuesta JSONP recibida en fetch');
                }
            }
            
            const result = JSON.parse(responseText);
            
            if (result.success) {
                return result;
            } else {
                throw new Error(result.error || 'Error del servidor');
            }
            
        } catch (error) {
            throw error;
        }
    }
    
    executeJsonpScript(url, script, callbackName, resolve, reject) {
        // Crear y agregar script tag
        script.src = url;
        script.type = 'text/javascript';
        script.async = true;
        
        script.onerror = function(error) {
            // Limpiar en caso de error
            if (script && script.parentNode) {
                document.head.removeChild(script);
            }
            delete window[callbackName];
            reject(new Error('Error de conexión con Google Apps Script - Verifica la URL y que el script esté desplegado'));
        };
        
        // Agregar evento de timeout específico para el script
        script.ontimeout = function() {
            if (script && script.parentNode) {
                document.head.removeChild(script);
            }
            delete window[callbackName];
            reject(new Error('Timeout cargando el script'));
        };
        
        // Timeout de 15 segundos
        const timeoutId = setTimeout(() => {
            if (window[callbackName]) {
                if (script && script.parentNode) {
                    document.head.removeChild(script);
                }
                delete window[callbackName];
                reject(new Error('Timeout: No se recibió respuesta del servidor'));
            }
        }, 15000);
        
        // Limpiar timeout si el callback se ejecuta
        const originalCallback = window[callbackName];
        window[callbackName] = function(result) {
            clearTimeout(timeoutId);
            originalCallback(result);
        };
        
        document.head.appendChild(script);
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

// Función de prueba para verificar la conexión con Google Apps Script
async function testGoogleAppsScriptConnection() {
    const scriptUrl = getScriptUrl();
    
    if (!scriptUrl) {
        console.error('No hay URL configurada');
        return false;
    }
    
    // Probar con una petición simple
    const testUrl = `${scriptUrl}?action=test&callback=testCallback`;
    
    return new Promise((resolve) => {
        // Crear callback de prueba
        window.testCallback = function(result) {
            delete window.testCallback;
            resolve(true);
        };
        
        // Crear script de prueba
        const script = document.createElement('script');
        script.src = testUrl;
        
        script.onerror = function(error) {
            delete window.testCallback;
            resolve(false);
        };
        
        // Timeout de 10 segundos
        setTimeout(() => {
            if (window.testCallback) {
                delete window.testCallback;
                resolve(false);
            }
        }, 10000);
        
        document.head.appendChild(script);
    });
}

// Función para verificar el estado del Google Apps Script
async function checkGoogleAppsScriptStatus() {
    const scriptUrl = getScriptUrl();
    if (!scriptUrl) {
        console.error('No hay URL configurada');
        return;
    }
    
    try {
        // Intentar hacer una petición directa para ver si el script responde
        const response = await fetch(scriptUrl + '?action=test', {
            method: 'GET',
            mode: 'no-cors' // Para evitar CORS
        });
        
    } catch (error) {
        console.error('Error en fetch:', error);
    }
}

// Función de diagnóstico completo
function diagnosticGoogleAppsScript() {
    const scriptUrl = getScriptUrl();
    
    if (!scriptUrl) {
        console.error('PROBLEMA: No hay URL configurada');
        console.log('SOLUCIÓN: Configura la URL en reservations-config.js');
        return;
    }
    
    // Verificar formato de URL
    const urlPattern = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;
    if (!urlPattern.test(scriptUrl)) {
        console.error('PROBLEMA: Formato de URL incorrecto');
        console.log('SOLUCIÓN: La URL debe tener el formato: https://script.google.com/macros/s/SCRIPT_ID/exec');
        return;
    }
    
    // Verificar si está en modo simulación
    if (isSimulationMode()) {
        console.log('MODO SIMULACIÓN ACTIVADO');
        console.log('Para usar el script real, cambia scriptUrl en reservations-config.js');
        return;
    }
    
    // Probar la URL
    testGoogleAppsScriptConnection().then(success => {
        if (success) {
            console.log('CONEXIÓN EXITOSA');
        } else {
            console.log('FALLO EN LA CONEXIÓN');
            console.log('POSIBLES SOLUCIONES:');
            console.log('1. Verifica que el script esté desplegado como aplicación web');
            console.log('2. Verifica que los permisos estén configurados para "Cualquier usuario"');
            console.log('3. Verifica que la URL sea correcta');
            console.log('4. Verifica que el script tenga la función doGet()');
        }
    });
}

// Función para probar la URL manualmente
function testUrlManually() {
    const scriptUrl = getScriptUrl();
    if (!scriptUrl) {
        console.error('No hay URL configurada');
        return;
    }
    
    const testUrl = scriptUrl + '?action=test&callback=manualTest';
    window.open(testUrl, '_blank');
    
    // Crear callback para capturar respuesta
    window.manualTest = function(result) {
        console.log('Respuesta manual:', result);
        delete window.manualTest;
    };
}

// Función para probar con datos reales (como el curl que funciona)
function testWithRealData() {
    const scriptUrl = getScriptUrl();
    if (!scriptUrl) {
        console.error('No hay URL configurada');
        return;
    }
    
    // Datos de prueba (los mismos del curl que funciona)
    const testData = {
        "nombre": "dffdfdf",
        "email": "fdffdfd@dsdsd.co",
        "telefono": "672554487",
        "fecha": "2025-09-24",
        "hora": "10:00",
        "numNinos": "1",
        "edades": "1",
        "servicio": "ludoteca",
        "comentarios": "545",
        "timestamp": "2025-09-22T23:06:46.721Z"
    };
    
    const callbackName = 'testCallback_' + Date.now();
    
    // Crear callback
    window[callbackName] = function(result) {
        console.log('RESPUESTA DEL SERVIDOR:', result);
        delete window[callbackName];
    };
    
    // Construir URL exactamente como en el curl
    const params = new URLSearchParams();
    params.append('action', 'submitReservation');
    params.append('data', JSON.stringify(testData));
    params.append('callback', callbackName);
    
    const url = `${scriptUrl}?${params.toString()}`;
    
    // Crear script
    const script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';
    
    script.onerror = function(error) {
        delete window[callbackName];
    };
    
    // Timeout
    setTimeout(() => {
        if (window[callbackName]) {
            delete window[callbackName];
        }
    }, 10000);
    
    document.head.appendChild(script);
}
