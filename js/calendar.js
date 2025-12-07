// Sistema de Calendario Visual para Reservas con Google Calendar
class CalendarSystem {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedStartTime = null;
        this.selectedEndTime = null;
        this.availableSlots = [];
        this.calendarContainer = document.getElementById('calendarContainer');
        this.timeSlotsContainer = document.getElementById('timeSlotsContainer');

        // Configuración
        this.config = {
            minAdvanceHours: 2,  // Mínimo 2 horas de anticipación
            maxDaysAhead: 90,    // Máximo 3 meses adelante
            workingDays: [1, 2, 3, 4, 5, 6], // Lunes a Sábado (0 = Domingo)
            startHour: 9,        // 9:00 AM
            endHour: 20,         // 8:00 PM
            slotDuration: 60     // Intervalos de 60 minutos (1 hora)
        };

        this.init();
    }

    init() {
        this.renderCalendar();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Botones de navegación del calendario
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Actualizar título del mes
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const currentMonthEl = document.getElementById('currentMonth');
        if (currentMonthEl) {
            currentMonthEl.textContent = `${monthNames[month]} ${year}`;
        }

        // Obtener primer día del mes y número de días
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay(); // 0 = Domingo

        // Limpiar calendario
        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) return;

        calendarGrid.innerHTML = '';

        // Días de la semana
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        // Calcular fechas mínimas y máximas
        const now = new Date();
        const minDate = new Date(now.getTime() + this.config.minAdvanceHours * 60 * 60 * 1000);
        const maxDate = new Date(now.getTime() + this.config.maxDaysAhead * 24 * 60 * 60 * 1000);

        // Espacios vacíos antes del primer día
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }

        // Días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;

            // Verificar si es día válido
            const isWorkingDay = this.config.workingDays.includes(date.getDay());
            const isInRange = date >= minDate && date <= maxDate;
            const isToday = this.isSameDay(date, new Date());
            const isSelected = this.selectedDate && this.isSameDay(date, this.selectedDate);

            if (isToday) {
                dayEl.classList.add('today');
            }

            if (isSelected) {
                dayEl.classList.add('selected');
            }

            if (!isWorkingDay) {
                dayEl.classList.add('disabled');
                dayEl.title = 'Cerrado los domingos';
            } else if (!isInRange) {
                dayEl.classList.add('disabled');
                if (date < minDate) {
                    dayEl.title = 'No disponible (muy pronto)';
                } else {
                    dayEl.title = 'No disponible (muy lejos)';
                }
            } else {
                dayEl.classList.add('available');
                dayEl.addEventListener('click', () => this.selectDate(date));
            }

            calendarGrid.appendChild(dayEl);
        }
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    async selectDate(date) {
        this.selectedDate = date;
        this.selectedStartTime = null;
        this.selectedEndTime = null;

        // Actualizar visualización del calendario
        this.renderCalendar();

        // Mostrar loading en slots de tiempo
        if (this.timeSlotsContainer) {
            this.timeSlotsContainer.innerHTML = `
                <div class="time-slots-loading">
                    <div class="loading-spinner"></div>
                    <p>Cargando horarios disponibles...</p>
                </div>
            `;
            this.timeSlotsContainer.style.display = 'block';
        }

        // Cargar horarios disponibles desde Google Calendar
        try {
            await this.loadAvailableSlots(date);
            this.renderTimeSlots();
        } catch (error) {
            console.error('Error cargando horarios:', error);
            if (this.timeSlotsContainer) {
                this.timeSlotsContainer.innerHTML = `
                    <div class="time-slots-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Error al cargar horarios disponibles. Por favor, intenta de nuevo.</p>
                    </div>
                `;
            }
        }
    }

    async loadAvailableSlots(date) {
        // Formatear fecha para enviar al servidor
        const dateStr = date.toISOString().split('T')[0];

        const scriptUrl = getScriptUrl();

        // Si no hay URL o está en modo simulación, usar slots simulados
        if (!scriptUrl || scriptUrl === 'SIMULATION') {
            console.log('🔧 Modo simulación activado - generando slots simulados');
            this.generateSimulatedSlots(date);
            return Promise.resolve();
        }

        console.log('📡 Consultando disponibilidad para:', dateStr);
        console.log('🔗 URL del script:', scriptUrl);

        return new Promise((resolve, reject) => {
            const callbackName = 'calendarCallback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

            window[callbackName] = (result) => {
                console.log('✅ Respuesta recibida del servidor:', result);

                // Limpiar
                const script = document.querySelector(`script[data-callback="${callbackName}"]`);
                if (script && script.parentNode) {
                    document.head.removeChild(script);
                }
                delete window[callbackName];

                if (result && result.success) {
                    this.availableSlots = result.availableSlots || [];
                    console.log(`📅 ${this.availableSlots.length} slots cargados`);
                    resolve();
                } else {
                    console.error('❌ Error en respuesta:', result?.error);
                    reject(new Error(result?.error || 'Error al cargar disponibilidad'));
                }
            };

            const params = new URLSearchParams();
            params.append('action', 'getAvailableSlots');
            params.append('date', dateStr);
            params.append('callback', callbackName);

            const url = `${scriptUrl}?${params.toString()}`;
            console.log('🌐 URL completa:', url);

            const script = document.createElement('script');
            script.src = url;
            script.setAttribute('data-callback', callbackName);

            script.onerror = (error) => {
                console.error('❌ Error cargando script de Google Apps Script');
                console.error('Detalles del error:', error);
                console.error('URL que falló:', url);

                if (script && script.parentNode) {
                    document.head.removeChild(script);
                }
                delete window[callbackName];

                // Intentar con modo simulación como fallback
                console.warn('⚠️ Cambiando a modo simulación automáticamente...');
                this.generateSimulatedSlots(date);
                resolve(); // Resolver en lugar de rechazar para que continúe
            };

            // Timeout de 15 segundos
            const timeoutId = setTimeout(() => {
                if (window[callbackName]) {
                    console.error('⏱️ Timeout esperando respuesta del servidor (15 segundos)');

                    if (script && script.parentNode) {
                        document.head.removeChild(script);
                    }
                    delete window[callbackName];

                    // Fallback a simulación
                    console.warn('⚠️ Cambiando a modo simulación por timeout...');
                    this.generateSimulatedSlots(date);
                    resolve();
                }
            }, 15000);

            // Limpiar timeout si se recibe respuesta
            const originalCallback = window[callbackName];
            window[callbackName] = function(result) {
                clearTimeout(timeoutId);
                originalCallback(result);
            };

            console.log('📤 Enviando petición al servidor...');
            document.head.appendChild(script);
        });
    }

    generateSimulatedSlots(date) {
        // Generar slots simulados (para desarrollo)
        this.availableSlots = [];

        const start = this.config.startHour * 60; // en minutos
        const end = this.config.endHour * 60;

        // Generar slots incluyendo el de cierre (20:00)
        for (let minutes = start; minutes <= end; minutes += this.config.slotDuration) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            const time = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

            // Simular 80% de disponibilidad
            const isAvailable = Math.random() > 0.2;

            this.availableSlots.push({
                time: time,
                available: isAvailable,
                isEndOnly: minutes === end  // Marcar el slot de cierre
            });
        }
    }

    renderTimeSlots() {
        if (!this.timeSlotsContainer) return;

        const dateStr = this.selectedDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        this.timeSlotsContainer.innerHTML = `
            <div class="time-slots-header">
                <h3>Horarios disponibles para ${dateStr}</h3>
                <p class="time-slots-instruction">Selecciona la hora de inicio y fin de tu reserva</p>
            </div>
            <div class="time-slots-grid" id="timeSlotsGrid"></div>
            <div class="time-selection-summary" id="timeSelectionSummary" style="display: none;">
                <p><strong>Reserva seleccionada:</strong></p>
                <p class="selected-time-range" id="selectedTimeRange"></p>
                <p class="selected-duration" id="selectedDuration"></p>
            </div>
        `;

        const grid = document.getElementById('timeSlotsGrid');

        this.availableSlots.forEach(slot => {
            const slotEl = document.createElement('div');
            slotEl.className = 'time-slot';
            slotEl.setAttribute('data-time', slot.time);
            slotEl.setAttribute('data-available', slot.available);
            slotEl.setAttribute('data-end-only', slot.isEndOnly || false);

            // Si es un slot que solo puede ser hora fin (como 20:00)
            if (slot.isEndOnly) {
                slotEl.classList.add('end-only');
                slotEl.innerHTML = `
                    <span class="time-slot-time">${slot.time}</span>
                    <span class="time-slot-status">Solo Fin</span>
                `;
            } else if (!slot.available) {
                slotEl.classList.add('occupied');
                slotEl.innerHTML = `
                    <span class="time-slot-time">${slot.time}</span>
                    <span class="time-slot-status">Ocupado</span>
                `;
            } else {
                slotEl.classList.add('available');
                slotEl.innerHTML = `
                    <span class="time-slot-time">${slot.time}</span>
                    <span class="time-slot-status">Disponible</span>
                `;
            }

            // TODOS los slots tienen evento click, la lógica está en selectTimeSlot
            slotEl.addEventListener('click', () => this.selectTimeSlot(slot.time, slotEl, slot.available, slot.isEndOnly));

            grid.appendChild(slotEl);
        });
    }

    selectTimeSlot(time, element, isAvailable, isEndOnly) {
        if (!this.selectedStartTime) {
            // Seleccionar hora de inicio - DEBE ser disponible y NO puede ser endOnly
            if (isEndOnly) {
                alert(`${time} es la hora de cierre. Solo puedes usarla como hora fin, no como hora de inicio.`);
                return;
            }

            if (!isAvailable) {
                alert('No puedes empezar una reserva en un horario ocupado. Por favor, selecciona un horario disponible.');
                return;
            }

            this.selectedStartTime = time;
            element.classList.add('selected-start');

            // Resaltar slots que pueden ser usados como fin (incluyendo ocupados adyacentes)
            this.highlightSelectableEndSlots();

            // Actualizar instrucción
            const instruction = document.querySelector('.time-slots-instruction');
            if (instruction) {
                instruction.textContent = 'Ahora selecciona la hora de fin (puedes seleccionar hasta un horario ocupado)';
            }
        } else if (!this.selectedEndTime) {
            // Ya hay hora de inicio seleccionada, pero no hora fin

            // Caso 1: Hiciste clic en la misma hora de inicio → DESMARCAR (toggle)
            if (time === this.selectedStartTime) {
                this.resetTimeSelection();
                return;
            }

            // Caso 2: Hiciste clic en una hora anterior o igual → CAMBIAR hora de inicio
            const clickedMinutes = this.timeToMinutes(time);
            const startMinutes = this.timeToMinutes(this.selectedStartTime);

            if (clickedMinutes <= startMinutes) {
                // Solo permitir si es disponible y no es endOnly
                if (isEndOnly) {
                    alert(`${time} es la hora de cierre. Solo puedes usarla como hora fin, no como hora de inicio.`);
                    return;
                }

                if (!isAvailable) {
                    alert('No puedes empezar una reserva en un horario ocupado. Por favor, selecciona un horario disponible.');
                    return;
                }

                // Cambiar la hora de inicio
                this.resetTimeSelection();
                this.selectedStartTime = time;
                element.classList.add('selected-start');

                // Resaltar slots que pueden ser usados como fin
                this.highlightSelectableEndSlots();

                // Actualizar instrucción
                const instruction = document.querySelector('.time-slots-instruction');
                if (instruction) {
                    instruction.textContent = 'Ahora selecciona la hora de fin (puedes seleccionar hasta un horario ocupado)';
                }
                return;
            }

            // Caso 3: Hiciste clic en una hora posterior → Seleccionar como hora FIN
            // Seleccionar hora de fin
            const endMinutes = this.timeToMinutes(time);

            if (endMinutes <= startMinutes) {
                alert('La hora de fin debe ser posterior a la hora de inicio');
                return;
            }

            // Validar según el tipo de slot
            if (isEndOnly) {
                // Es el slot de cierre (20:00), permitir siempre que todos los slots intermedios estén disponibles
                if (!this.areIntermediateSlotsAvailable(startMinutes, endMinutes)) {
                    alert('Hay horarios ocupados en el rango seleccionado. Por favor, elige otro rango.');
                    return;
                }
            } else if (!isAvailable) {
                // Si el slot seleccionado como fin está ocupado, verificar que sea válido
                if (!this.canUseOccupiedSlotAsEnd(startMinutes, endMinutes)) {
                    alert('Solo puedes usar un horario ocupado como hora fin si está inmediatamente después de horarios disponibles.');
                    return;
                }
            } else {
                // Si el slot está disponible, verificar que todos los intermedios también lo estén
                if (!this.areIntermediateSlotsAvailable(startMinutes, endMinutes)) {
                    alert('Hay horarios ocupados en el rango seleccionado. Por favor, elige otro rango.');
                    return;
                }
            }

            this.selectedEndTime = time;
            element.classList.add('selected-end');

            // Marcar slots intermedios
            this.markIntermediateSlots(startMinutes, endMinutes);

            // Mostrar resumen
            this.showTimeSelectionSummary();

            // Actualizar campos ocultos del formulario
            this.updateFormFields();
        } else {
            // Reset y volver a empezar - DEBE ser disponible y NO puede ser endOnly
            if (isEndOnly) {
                alert(`${time} es la hora de cierre. Solo puedes usarla como hora fin, no como hora de inicio.`);
                return;
            }

            if (!isAvailable) {
                alert('No puedes empezar una reserva en un horario ocupado. Por favor, selecciona un horario disponible.');
                return;
            }

            this.resetTimeSelection();
            this.selectedStartTime = time;
            element.classList.add('selected-start');

            // Resaltar slots que pueden ser usados como fin
            this.highlightSelectableEndSlots();

            const instruction = document.querySelector('.time-slots-instruction');
            if (instruction) {
                instruction.textContent = 'Ahora selecciona la hora de fin (puedes seleccionar hasta un horario ocupado)';
            }
        }
    }

    timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    areIntermediateSlotsAvailable(startMinutes, endMinutes) {
        for (let minutes = startMinutes; minutes < endMinutes; minutes += this.config.slotDuration) {
            const time = this.minutesToTime(minutes);
            const slot = this.availableSlots.find(s => s.time === time);
            if (!slot || !slot.available) {
                return false;
            }
        }
        return true;
    }

    canUseOccupiedSlotAsEnd(startMinutes, endMinutes) {
        // Verificar que todos los slots desde inicio hasta (fin - 1 slot) estén disponibles
        // El slot de fin ocupado actúa como límite superior, no como parte de la reserva

        // Verificar que todos los slots intermedios (incluyendo el inicio, excluyendo el fin) estén disponibles
        for (let minutes = startMinutes; minutes < endMinutes; minutes += this.config.slotDuration) {
            const time = this.minutesToTime(minutes);
            const slot = this.availableSlots.find(s => s.time === time);
            if (!slot || !slot.available) {
                return false;
            }
        }

        // Si llegamos aquí, significa que todos los slots desde inicio hasta (fin-1) están disponibles
        // Esto es válido: la reserva ocupará desde startMinutes hasta endMinutes,
        // y el slot ocupado en endMinutes marca el límite
        return true;
    }

    markIntermediateSlots(startMinutes, endMinutes) {
        const slots = document.querySelectorAll('.time-slot');
        slots.forEach(slotEl => {
            const timeText = slotEl.querySelector('.time-slot-time').textContent;
            const slotMinutes = this.timeToMinutes(timeText);

            if (slotMinutes > startMinutes && slotMinutes < endMinutes) {
                slotEl.classList.add('selected-range');
            }
        });
    }

    showTimeSelectionSummary() {
        const summary = document.getElementById('timeSelectionSummary');
        const rangeEl = document.getElementById('selectedTimeRange');
        const durationEl = document.getElementById('selectedDuration');

        if (summary && rangeEl && durationEl) {
            const duration = this.calculateDuration(this.selectedStartTime, this.selectedEndTime);

            rangeEl.textContent = `${this.selectedStartTime} - ${this.selectedEndTime}`;
            durationEl.textContent = `Duración: ${duration}`;

            summary.style.display = 'block';
        }
    }

    calculateDuration(startTime, endTime) {
        const startMinutes = this.timeToMinutes(startTime);
        const endMinutes = this.timeToMinutes(endTime);
        const durationMinutes = endMinutes - startMinutes;

        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;

        if (hours > 0 && minutes > 0) {
            return `${hours}h ${minutes}min`;
        } else if (hours > 0) {
            return `${hours}h`;
        } else {
            return `${minutes}min`;
        }
    }

    highlightSelectableEndSlots() {
        if (!this.selectedStartTime) return;

        const startMinutes = this.timeToMinutes(this.selectedStartTime);
        const slots = document.querySelectorAll('.time-slot');

        slots.forEach(slotEl => {
            const timeText = slotEl.querySelector('.time-slot-time').textContent;
            const slotMinutes = this.timeToMinutes(timeText);
            const isAvailable = slotEl.getAttribute('data-available') === 'true';
            const isEndOnly = slotEl.getAttribute('data-end-only') === 'true';

            // Remover clase anterior
            slotEl.classList.remove('selectable-as-end');

            // Si el slot es posterior al inicio
            if (slotMinutes > startMinutes) {
                // Si es un slot de solo fin (como 20:00), siempre es seleccionable si hay disponibilidad
                if (isEndOnly) {
                    if (this.areIntermediateSlotsAvailable(startMinutes, slotMinutes)) {
                        slotEl.classList.add('selectable-as-end', 'end-boundary');
                    }
                }
                // Si está disponible, es seleccionable
                else if (isAvailable) {
                    slotEl.classList.add('selectable-as-end');
                }
                // Si está ocupado, verificar si puede ser usado como límite
                else {
                    if (this.canUseOccupiedSlotAsEnd(startMinutes, slotMinutes)) {
                        slotEl.classList.add('selectable-as-end', 'occupied-boundary');
                    }
                }
            }
        });
    }

    resetTimeSelection() {
        this.selectedStartTime = null;
        this.selectedEndTime = null;

        // Limpiar clases de selección
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected-start', 'selected-end', 'selected-range', 'selectable-as-end', 'occupied-boundary', 'end-boundary');
        });

        // Ocultar resumen
        const summary = document.getElementById('timeSelectionSummary');
        if (summary) {
            summary.style.display = 'none';
        }

        // Resetear instrucción
        const instruction = document.querySelector('.time-slots-instruction');
        if (instruction) {
            instruction.textContent = 'Selecciona la hora de inicio y fin de tu reserva';
        }
    }

    updateFormFields() {
        // Actualizar campos ocultos en el formulario de reservas
        const fechaInput = document.getElementById('fecha');
        const horaInicioInput = document.getElementById('horaInicio');
        const horaFinInput = document.getElementById('horaFin');

        if (fechaInput && this.selectedDate) {
            fechaInput.value = this.selectedDate.toISOString().split('T')[0];
        }

        if (horaInicioInput && this.selectedStartTime) {
            horaInicioInput.value = this.selectedStartTime;
        }

        if (horaFinInput && this.selectedEndTime) {
            horaFinInput.value = this.selectedEndTime;
        }

        // Disparar evento para notificar al sistema de reservas
        const event = new CustomEvent('calendarTimeSelected', {
            detail: {
                date: this.selectedDate,
                startTime: this.selectedStartTime,
                endTime: this.selectedEndTime
            }
        });
        document.dispatchEvent(event);
    }

    getSelectedDateTime() {
        if (!this.selectedDate || !this.selectedStartTime || !this.selectedEndTime) {
            return null;
        }

        return {
            date: this.selectedDate.toISOString().split('T')[0],
            startTime: this.selectedStartTime,
            endTime: this.selectedEndTime,
            duration: this.calculateDuration(this.selectedStartTime, this.selectedEndTime)
        };
    }

    reset() {
        // Resetear fecha seleccionada
        this.selectedDate = null;

        // Resetear selección de tiempo
        this.resetTimeSelection();

        // Limpiar campos del formulario
        const fechaInput = document.getElementById('fecha');
        const horaInicioInput = document.getElementById('horaInicio');
        const horaFinInput = document.getElementById('horaFin');

        if (fechaInput) fechaInput.value = '';
        if (horaInicioInput) horaInicioInput.value = '';
        if (horaFinInput) horaFinInput.value = '';

        // Ocultar contenedor de slots de tiempo
        if (this.timeSlotsContainer) {
            this.timeSlotsContainer.style.display = 'none';
            this.timeSlotsContainer.innerHTML = '';
        }

        // Re-renderizar el calendario para limpiar selecciones visuales
        this.renderCalendar();
    }
}

// Inicializar sistema de calendario
let calendarSystem;

document.addEventListener('DOMContentLoaded', function() {
    calendarSystem = new CalendarSystem();
    // Hacer el calendario accesible globalmente
    window.calendarSystem = calendarSystem;
});
