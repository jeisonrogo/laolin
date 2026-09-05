// Google Apps Script para manejar reservas de Laolin Children's Play Hub
// Este script debe ser desplegado como una aplicación web

// Configuración
const SPREADSHEET_ID = '1X_e6XwaCtQJY7_Ael5qjcp8SQ7ayDWshepYKb6ahU_o'; // Reemplazar con el ID real
const SHEET_NAME = 'Reservas';
const INSCRIPCIONES_SHEET_NAME = 'Inscripciones';
const ADMIN_EMAIL = 'ludotecalaolin@gmail.com';

// Configuración de Google Calendar
// IMPORTANTE: Debes crear un calendario llamado "Laolin Reservas" en tu cuenta de Google Calendar
// O puedes usar el ID de un calendario existente
const CALENDAR_NAME = 'Laolin Reservas';
let CALENDAR_ID = null; // Se inicializará automáticamente

// Horarios de trabajo
const WORKING_HOURS = {
  start: 9,  // 9:00 AM
  end: 20,   // 8:00 PM
  slotDuration: 60  // 60 minutos por slot (1 hora)
};

// Tipos de servicio que bloquean horarios (eventos exclusivos)
const BLOCKING_SERVICES = ['cumpleaños', 'cumpleanos', 'alquiler', 'taller', 'evento'];
// Servicios que NO bloquean (pueden haber múltiples reservas a la misma hora)
const NON_BLOCKING_SERVICES = ['ludoteca'];

// Función principal que maneja las peticiones GET con JSONP
function doGet(e) {
  try {
    console.log('Iniciando doGet con parámetros:', e.parameter);

    const params = e.parameter;
    const action = params.action;
    const callback = params.callback;

    let result;

    if (action === 'submitReservation') {
      console.log('Procesando submitReservation');

      try {
        // Procesar reserva
        const data = JSON.parse(params.data);
        console.log('Datos parseados:', data);

        // Validar los datos
        const validation = validateReservationData(data);
        console.log('Validación:', validation);

        if (!validation.isValid) {
          result = {
            success: false,
            error: validation.error
          };
        } else {
          // Verificar disponibilidad en Google Calendar
          const isAvailable = checkCalendarAvailability(data.fecha, data.horaInicio, data.horaFin, data.servicio);

          if (!isAvailable) {
            result = {
              success: false,
              error: 'El horario seleccionado ya no está disponible. Por favor, selecciona otro horario.'
            };
          } else {
            // Guardar la reserva en Google Sheets
            const reservationId = saveReservationToSheet(data);
            console.log('Reserva guardada con ID:', reservationId);

            // Crear evento en Google Calendar
            try {
              createCalendarEvent(data, reservationId);
              console.log('Evento creado en Google Calendar');
            } catch (calendarError) {
              console.error('Error creando evento en calendario:', calendarError);
              // Continuar aunque falle el calendario
            }

            // Enviar confirmación por email
            try {
              sendConfirmationEmail(data, reservationId);
              console.log('Email de confirmación enviado');
            } catch (emailError) {
              console.error('Error enviando email:', emailError);
              // Continuar aunque falle el email
            }

            // Enviar notificación al administrador
            try {
              sendAdminNotification(data, reservationId);
              console.log('Notificación al admin enviada');
            } catch (adminError) {
              console.error('Error enviando notificación admin:', adminError);
              // Continuar aunque falle la notificación
            }

            result = {
              success: true,
              reservationId: reservationId,
              message: 'Reserva realizada con éxito'
            };
          }
        }
      } catch (parseError) {
        console.error('Error parseando datos:', parseError);
        result = {
          success: false,
          error: 'Error al procesar los datos de la reserva'
        };
      }

    } else if (action === 'submitInscripcion') {
      console.log('Procesando submitInscripcion');

      try {
        // Procesar inscripción PequeClub
        const data = JSON.parse(params.data);
        console.log('Datos de inscripción parseados:', data);

        // Validar los datos de inscripción
        const validation = validateInscripcionData(data);
        console.log('Validación inscripción:', validation);

        if (!validation.isValid) {
          result = {
            success: false,
            error: validation.error
          };
        } else {
          // Guardar la inscripción en Google Sheets
          const inscripcionId = saveInscripcionToSheet(data);
          console.log('Inscripción guardada con ID:', inscripcionId);

          // Enviar notificación al administrador
          try {
            sendInscripcionNotification(data, inscripcionId);
            console.log('Notificación de inscripción enviada');
          } catch (notifyError) {
            console.error('Error enviando notificación:', notifyError);
            // Continuar aunque falle la notificación
          }

          // Enviar confirmación al cliente
          try {
            sendInscripcionConfirmation(data, inscripcionId);
            console.log('Confirmación de inscripción enviada al cliente');
          } catch (confirmError) {
            console.error('Error enviando confirmación:', confirmError);
          }

          result = {
            success: true,
            inscripcionId: inscripcionId,
            message: 'Inscripción recibida con éxito'
          };
        }
      } catch (parseError) {
        console.error('Error parseando datos de inscripción:', parseError);
        result = {
          success: false,
          error: 'Error al procesar los datos de inscripción'
        };
      }

    } else if (action === 'getAvailableSlots') {
      console.log('Procesando getAvailableSlots');

      // Obtener slots disponibles para una fecha
      const fecha = params.date;

      if (!fecha) {
        result = {
          success: false,
          error: 'Falta parámetro date'
        };
      } else {
        try {
          const availableSlots = getAvailableSlotsForDate(fecha);
          result = {
            success: true,
            availableSlots: availableSlots
          };
        } catch (error) {
          console.error('Error obteniendo slots:', error);
          result = {
            success: false,
            error: 'Error al obtener disponibilidad: ' + error.message
          };
        }
      }

    } else if (action === 'checkAvailability') {
      console.log('Procesando checkAvailability');

      // Verificar disponibilidad
      const fecha = params.fecha;
      const hora = params.hora;

      if (!fecha || !hora) {
        result = {
          success: false,
          error: 'Faltan parámetros fecha y hora'
        };
      } else {
        const isAvailable = checkAvailability(fecha, hora);
        result = {
          success: true,
          available: isAvailable
        };
      }

    } else {
      result = {
        success: false,
        error: 'Acción no válida: ' + (action || 'undefined')
      };
    }
    
    console.log('Resultado final:', result);
    
    // Si hay callback, usar JSONP
    if (callback) {
      const jsonpResponse = `${callback}(${JSON.stringify(result)})`;
      console.log('Respuesta JSONP:', jsonpResponse);
      return ContentService
        .createTextOutput(jsonpResponse)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      // Respuesta JSON normal
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    console.error('Error general en doGet:', error);
    console.error('Stack trace:', error.stack);
    
    const errorResult = {
      success: false,
      error: 'Error interno del servidor: ' + error.message
    };
    
    const callback = e.parameter.callback;
    if (callback) {
      const jsonpResponse = `${callback}(${JSON.stringify(errorResult)})`;
      return ContentService
        .createTextOutput(jsonpResponse)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService
        .createTextOutput(JSON.stringify(errorResult))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
}





// ====== FUNCIONES DE GOOGLE CALENDAR ======

// Obtener o crear el calendario de reservas
function getOrCreateCalendar() {
  if (CALENDAR_ID) {
    return CalendarApp.getCalendarById(CALENDAR_ID);
  }

  // Buscar calendario existente por nombre
  const calendars = CalendarApp.getCalendarsByName(CALENDAR_NAME);

  if (calendars.length > 0) {
    CALENDAR_ID = calendars[0].getId();
    console.log('Calendario encontrado:', CALENDAR_ID);
    return calendars[0];
  }

  // Crear nuevo calendario
  const newCalendar = CalendarApp.createCalendar(CALENDAR_NAME, {
    summary: 'Calendario de reservas para Laolin Children\'s Play Hub',
    description: 'Gestión de reservas y disponibilidad',
    timeZone: 'Europe/Madrid',
    color: CalendarApp.Color.GREEN
  });

  CALENDAR_ID = newCalendar.getId();
  console.log('Nuevo calendario creado:', CALENDAR_ID);

  return newCalendar;
}

// Obtener slots disponibles para una fecha
function getAvailableSlotsForDate(dateString) {
  const calendar = getOrCreateCalendar();
  const date = new Date(dateString + 'T00:00:00');

  // Crear array de todos los slots posibles
  const allSlots = [];
  const startMinutes = WORKING_HOURS.start * 60;
  const endMinutes = WORKING_HOURS.end * 60;

  // Generar slots desde start hasta end (inclusive para permitir 20:00 como hora fin)
  for (let minutes = startMinutes; minutes <= endMinutes; minutes += WORKING_HOURS.slotDuration) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const time = padZero(hours) + ':' + padZero(mins);

    // El último slot (20:00) solo puede ser hora fin, no hora de inicio
    allSlots.push({
      time: time,
      available: true,
      isEndOnly: minutes === endMinutes  // Marcar el slot de cierre
    });
  }

  // Obtener eventos del calendario para esa fecha
  const startOfDay = new Date(date);
  startOfDay.setHours(WORKING_HOURS.start, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(WORKING_HOURS.end, 0, 0, 0);

  const events = calendar.getEvents(startOfDay, endOfDay);

  // Marcar slots ocupados (solo por eventos bloqueantes)
  events.forEach(event => {
    const eventTitle = event.getTitle();
    const eventDescription = event.getDescription();

    // Verificar si es un evento bloqueante
    const isBlockingEvent = isEventBlocking(eventTitle, eventDescription);

    // Solo marcar como ocupado si es un evento bloqueante
    if (isBlockingEvent) {
      const eventStart = event.getStartTime();
      const eventEnd = event.getEndTime();

      allSlots.forEach(slot => {
        const slotTime = parseTimeString(slot.time);
        const slotDateTime = new Date(date);
        slotDateTime.setHours(slotTime.hours, slotTime.minutes, 0, 0);

        // Si el slot está dentro del rango del evento, marcarlo como ocupado
        if (slotDateTime >= eventStart && slotDateTime < eventEnd) {
          slot.available = false;
        }
      });
    }
  });

  return allSlots;
}

// Verificar disponibilidad en el calendario
function checkCalendarAvailability(dateString, startTime, endTime, servicio) {
  const calendar = getOrCreateCalendar();
  const date = new Date(dateString + 'T00:00:00');

  const startTimeObj = parseTimeString(startTime);
  const endTimeObj = parseTimeString(endTime);

  const startDateTime = new Date(date);
  startDateTime.setHours(startTimeObj.hours, startTimeObj.minutes, 0, 0);

  const endDateTime = new Date(date);
  endDateTime.setHours(endTimeObj.hours, endTimeObj.minutes, 0, 0);

  // Obtener eventos en el rango solicitado
  const events = calendar.getEvents(startDateTime, endDateTime);

  // Si es un servicio no bloqueante (ludoteca), siempre está disponible
  if (NON_BLOCKING_SERVICES.includes(servicio)) {
    return true;
  }

  // Para servicios bloqueantes, verificar que no haya otros eventos bloqueantes
  for (let event of events) {
    const eventTitle = event.getTitle();
    const eventDescription = event.getDescription();

    if (isEventBlocking(eventTitle, eventDescription)) {
      return false; // Hay un evento bloqueante, no disponible
    }
  }

  return true; // No hay eventos bloqueantes, disponible
}

// Crear evento en Google Calendar
function createCalendarEvent(data, reservationId) {
  const calendar = getOrCreateCalendar();
  const date = new Date(data.fecha + 'T00:00:00');

  const startTimeObj = parseTimeString(data.horaInicio);
  const endTimeObj = parseTimeString(data.horaFin);

  const startDateTime = new Date(date);
  startDateTime.setHours(startTimeObj.hours, startTimeObj.minutes, 0, 0);

  const endDateTime = new Date(date);
  endDateTime.setHours(endTimeObj.hours, endTimeObj.minutes, 0, 0);

  // Crear título del evento
  const title = `${getServiceName(data.servicio)} - ${data.nombre}`;

  // Crear descripción (incluye tipo de servicio para identificación)
  const description = `
Tipo de Servicio: ${data.servicio}
ID de Reserva: ${reservationId}
Cliente: ${data.nombre}
Email: ${data.email}
Teléfono: ${data.telefono}
Número de niños: ${data.numNinos}
Edades: ${data.edades || 'No especificadas'}
Comentarios: ${data.comentarios || 'Ninguno'}
  `.trim();

  // Crear evento
  const event = calendar.createEvent(title, startDateTime, endDateTime, {
    description: description,
    location: 'Laolin Children\'s Play Hub - Av. Carabanchel Alto 90, Madrid',
    guests: data.email,
    sendInvites: false
  });

  console.log('Evento creado:', event.getId());
  return event.getId();
}

// Función auxiliar para parsear hora (HH:MM)
function parseTimeString(timeString) {
  const parts = timeString.split(':');
  return {
    hours: parseInt(parts[0], 10),
    minutes: parseInt(parts[1], 10)
  };
}

// Función auxiliar para agregar ceros a la izquierda
function padZero(num) {
  return num.toString().padStart(2, '0');
}

// Verificar si un evento es bloqueante
function isEventBlocking(eventTitle, eventDescription) {
  console.log('Verificando evento - Título:', eventTitle, 'Descripción:', eventDescription);

  // Primero verificar EXPLÍCITAMENTE si es ludoteca (el único no bloqueante)
  if (eventDescription) {
    const match = eventDescription.match(/Tipo de Servicio:\s*(\w+)/i);
    if (match) {
      const servicioType = match[1].toLowerCase();
      console.log('Tipo de servicio encontrado:', servicioType);

      // Si es ludoteca, NO bloquea
      if (NON_BLOCKING_SERVICES.includes(servicioType)) {
        console.log('Evento NO bloqueante (ludoteca)');
        return false;
      }

      // Si es cualquier otro servicio conocido, SÍ bloquea
      if (BLOCKING_SERVICES.includes(servicioType)) {
        console.log('Evento bloqueante (servicio conocido)');
        return true;
      }
    }
  }

  // Verificar el título
  if (eventTitle) {
    const titleLower = eventTitle.toLowerCase();

    // Primero verificar si es ludoteca (NO bloquea)
    for (let service of NON_BLOCKING_SERVICES) {
      if (titleLower.includes(service.toLowerCase())) {
        console.log('Evento NO bloqueante (ludoteca en título)');
        return false;
      }
    }

    // Luego verificar si es un servicio bloqueante conocido
    for (let service of BLOCKING_SERVICES) {
      if (titleLower.includes(service.toLowerCase())) {
        console.log('Evento bloqueante (servicio bloqueante en título)');
        return true;
      }
    }
  }

  // IMPORTANTE: Por defecto, CUALQUIER EVENTO bloquea
  // Esto incluye eventos creados manualmente por el administrador
  // Solo ludoteca NO bloquea (y debe estar explícitamente identificada)
  console.log('Evento bloqueante (por defecto - no identificado como ludoteca)');
  return true;
}

// ====== FIN FUNCIONES DE GOOGLE CALENDAR ======

// Validar datos de la reserva
function validateReservationData(data) {
  const requiredFields = ['nombre', 'email', 'telefono', 'fecha', 'horaInicio', 'horaFin', 'numNinos', 'servicio'];

  for (let field of requiredFields) {
    if (!data[field] || data[field].toString().trim() === '') {
      return {
        isValid: false,
        error: `Campo requerido: ${field}`
      };
    }
  }
  
  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return {
      isValid: false,
      error: 'Email inválido'
    };
  }
  
  // Validar teléfono
  const phoneRegex = /^(\+34|0034|34)?[6789]\d{8}$/;
  if (!phoneRegex.test(data.telefono.replace(/\s/g, ''))) {
    return {
      isValid: false,
      error: 'Teléfono inválido'
    };
  }
  
  // Validar fecha
  const selectedDate = new Date(data.fecha);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate <= today) {
    return {
      isValid: false,
      error: 'La fecha debe ser posterior a hoy'
    };
  }
  
  // Validar número de niños
  const numNinos = parseInt(data.numNinos);
  if (isNaN(numNinos) || numNinos < 1 || numNinos > 15) {
    return {
      isValid: false,
      error: 'El número de niños debe estar entre 1 y 15'
    };
  }
  
  return {
    isValid: true
  };
}

// Guardar reserva en Google Sheets
function saveReservationToSheet(data) {
  try {
    console.log('Abriendo spreadsheet con ID:', SPREADSHEET_ID);
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    console.log('Obteniendo hoja:', SHEET_NAME);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error('No se encontró la hoja: ' + SHEET_NAME);
    }
    
    // Generar ID único para la reserva
    const reservationId = generateReservationId();
    console.log('ID generado:', reservationId);
    
    // Preparar fila de datos según el orden de las columnas en la hoja
    const rowData = [
      reservationId,                    // A - ID de reserva
      data.fecha || '',                // B - Fecha de reserva
      data.horaInicio || '',           // C - Hora de inicio
      data.horaFin || '',              // D - Hora de fin
      data.nombre || '',               // E - Nombre
      data.email || '',                // F - Email
      data.telefono || '',             // G - Teléfono
      data.numNinos || '',             // H - Número de niños
      data.edades || '',               // I - Edades
      data.servicio || '',             // J - Servicio
      data.comentarios || '',          // K - Comentarios
      'Pendiente',                     // L - Estado
      new Date()                       // M - Fecha de creación
    ];
    
    console.log('Datos a guardar:', rowData);
    
    // Agregar fila al final de la hoja
    sheet.appendRow(rowData);
    console.log('Fila agregada exitosamente');
    
    return reservationId;
    
  } catch (error) {
    console.error('Error en saveReservationToSheet:', error);
    throw new Error('Error al guardar en Google Sheets: ' + error.message);
  }
}

// Generar ID único para la reserva
function generateReservationId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `LAO-${timestamp}-${random}`;
}

// Verificar disponibilidad
function checkAvailability(fecha, hora) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  // Obtener todas las reservas existentes
  const data = sheet.getDataRange().getValues();
  
  // Buscar reservas para la misma fecha y hora
  for (let i = 1; i < data.length; i++) { // Saltar la primera fila (encabezados)
    const row = data[i];
    const reservaFecha = row[1]; // Columna B - Fecha de reserva
    const reservaHora = row[2];  // Columna C - Hora de reserva
    const estado = row[10];      // Columna K - Estado
    
    if (reservaFecha === fecha && reservaHora === hora && estado !== 'Cancelada') {
      return false; // No disponible
    }
  }
  
  return true; // Disponible
}

// Enviar email de confirmación al cliente
function sendConfirmationEmail(data, reservationId) {
  const subject = `Confirmación de Reserva - Laolin Children's Play Hub`;
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #a8d5ba, #e8c4a0); padding: 20px; text-align: center;">
        <h1 style="color: #2c5530; margin: 0;">Laolin Children's Play Hub</h1>
        <p style="color: #4a6741; margin: 10px 0 0 0;">Confirmación de Reserva</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #2c5530;">¡Hola ${data.nombre}!</h2>
        
        <p>Tu reserva ha sido confirmada exitosamente. Aquí tienes los detalles:</p>
        
        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #2c5530; margin-top: 0;">Detalles de la Reserva</h3>
          <p><strong>ID de Reserva:</strong> ${reservationId}</p>
          <p><strong>Fecha:</strong> ${formatDate(data.fecha)}</p>
          <p><strong>Horario:</strong> ${data.horaInicio} - ${data.horaFin}</p>
          <p><strong>Servicio:</strong> ${getServiceName(data.servicio)}</p>
          <p><strong>Número de niños:</strong> ${data.numNinos}</p>
          ${data.edades ? `<p><strong>Edades:</strong> ${data.edades}</p>` : ''}
        </div>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 10px; margin: 20px 0;">
          <h4 style="color: #2c5530; margin-top: 0;">Información Importante</h4>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Llega 10 minutos antes de la hora reservada</li>
            <li>Los niños deben estar acompañados por un adulto</li>
            <li>Trae ropa cómoda para los niños</li>
            <li>Puedes cancelar hasta 24 horas antes sin cargo</li>
          </ul>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 10px; margin: 20px 0;">
          <h4 style="color: #856404; margin-top: 0;">Contacto</h4>
          <p><strong>Dirección:</strong> Av. Carabanchel Alto 90, Madrid</p>
          <p><strong>Teléfono:</strong> +34 672 98 23 17</p>
          <p><strong>WhatsApp:</strong> +34 666 00 90 13</p>
        </div>
        
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        
        <p style="margin-top: 30px;">
          ¡Esperamos verte pronto!<br>
          <strong>El equipo de Laolin Children's Play Hub</strong>
        </p>
      </div>
      
      <div style="background: #2c5530; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0;">© 2025 Laolin Children's Play Hub. Todos los derechos reservados.</p>
      </div>
    </div>
  `;
  
  const textBody = `
    Confirmación de Reserva - Laolin Children's Play Hub
    
    Hola ${data.nombre},
    
    Tu reserva ha sido confirmada exitosamente.
    
    ID de Reserva: ${reservationId}
    Fecha: ${formatDate(data.fecha)}
    Horario: ${data.horaInicio} - ${data.horaFin}
    Servicio: ${getServiceName(data.servicio)}
    Número de niños: ${data.numNinos}
    
    Información importante:
    - Llega 10 minutos antes de la hora reservada
    - Los niños deben estar acompañados por un adulto
    - Trae ropa cómoda para los niños
    - Puedes cancelar hasta 24 horas antes sin cargo
    
    Contacto:
    Dirección: Av. Carabanchel Alto 90, Madrid
    Teléfono: +34 672 98 23 17
    WhatsApp: +34 666 00 90 13
    
    ¡Esperamos verte pronto!
    El equipo de Laolin Children's Play Hub
  `;
  
  try {
    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      htmlBody: htmlBody,
      body: textBody,
      name: 'Laolin Children\'s Play Hub'
    });
  } catch (error) {
    console.error('Error enviando email de confirmación:', error);
  }
}

// Enviar notificación al administrador
function sendAdminNotification(data, reservationId) {
  const subject = `Nueva Reserva - ${data.nombre}`;
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #ff6b6b; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Nueva Reserva Recibida</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #2c5530;">Detalles de la Reserva</h2>
        
        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p><strong>ID de Reserva:</strong> ${reservationId}</p>
          <p><strong>Nombre:</strong> ${data.nombre}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Teléfono:</strong> ${data.telefono}</p>
          <p><strong>Fecha:</strong> ${formatDate(data.fecha)}</p>
          <p><strong>Horario:</strong> ${data.horaInicio} - ${data.horaFin}</p>
          <p><strong>Servicio:</strong> ${getServiceName(data.servicio)}</p>
          <p><strong>Número de niños:</strong> ${data.numNinos}</p>
          ${data.edades ? `<p><strong>Edades:</strong> ${data.edades}</p>` : ''}
          ${data.comentarios ? `<p><strong>Comentarios:</strong> ${data.comentarios}</p>` : ''}
        </div>
        
        <p><strong>Fecha de creación:</strong> ${new Date().toLocaleString('es-ES')}</p>
      </div>
    </div>
  `;
  
  try {
    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: subject,
      htmlBody: htmlBody,
      name: 'Sistema de Reservas - Laolin'
    });
  } catch (error) {
    console.error('Error enviando notificación al administrador:', error);
  }
}

// Función auxiliar para formatear fecha
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Función auxiliar para obtener nombre del servicio
function getServiceName(serviceCode) {
  const services = {
    'ludoteca': 'Ludoteca',
    'cumpleaños': 'Cumpleaños',
    'cumpleanos': 'Cumpleaños',
    'taller': 'Taller Especial',
    'alquiler': 'Alquiler de Local',
    'evento': 'Evento Especial'
  };

  return services[serviceCode] || serviceCode;
}

// Función para configurar la hoja de cálculo (ejecutar una vez)
function setupSpreadsheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  // Crear la hoja si no existe
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  
  // Configurar encabezados
  const headers = [
    'ID Reserva',
    'Fecha Creación',
    'Nombre',
    'Email',
    'Teléfono',
    'Fecha Reserva',
    'Hora',
    'Número Niños',
    'Edades',
    'Servicio',
    'Comentarios',
    'Estado'
  ];
  
  // Limpiar hoja y agregar encabezados
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formatear encabezados
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#2c5530');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Ajustar ancho de columnas
  sheet.autoResizeColumns(1, headers.length);
  
  // Congelar primera fila
  sheet.setFrozenRows(1);
  
  console.log('Hoja de cálculo configurada correctamente');
}

// Función para obtener estadísticas de reservas
function getReservationStats() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);

  const data = sheet.getDataRange().getValues();
  const totalReservations = data.length - 1; // Excluir encabezados

  const today = new Date();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  let thisMonthReservations = 0;
  let pendingReservations = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const creationDate = new Date(row[1]);
    const estado = row[11];

    if (creationDate >= thisMonth) {
      thisMonthReservations++;
    }

    if (estado === 'Pendiente') {
      pendingReservations++;
    }
  }

  return {
    total: totalReservations,
    thisMonth: thisMonthReservations,
    pending: pendingReservations
  };
}

// ====== FUNCIONES DE INSCRIPCIÓN PEQUECLUB ======

// Validar datos de inscripción
function validateInscripcionData(data) {
  const requiredFields = ['nombre', 'email', 'telefono'];

  for (let field of requiredFields) {
    if (!data[field] || data[field].toString().trim() === '') {
      return {
        isValid: false,
        error: `Campo requerido: ${field}`
      };
    }
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return {
      isValid: false,
      error: 'Email inválido'
    };
  }

  // Validar teléfono español
  const phoneRegex = /^(\+34|0034|34)?[6789]\d{8}$/;
  if (!phoneRegex.test(data.telefono.replace(/\s/g, ''))) {
    return {
      isValid: false,
      error: 'Teléfono inválido'
    };
  }

  return {
    isValid: true
  };
}

// Guardar inscripción en Google Sheets
function saveInscripcionToSheet(data) {
  try {
    console.log('Abriendo spreadsheet con ID:', SPREADSHEET_ID);
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

    // Obtener o crear la hoja de inscripciones
    let sheet = spreadsheet.getSheetByName(INSCRIPCIONES_SHEET_NAME);

    if (!sheet) {
      // Crear la hoja si no existe
      sheet = spreadsheet.insertSheet(INSCRIPCIONES_SHEET_NAME);

      // Configurar encabezados
      const headers = [
        'ID Inscripción',
        'Fecha',
        'Nombre',
        'Email',
        'Teléfono',
        'Mensaje',
        'Estado'
      ];

      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

      // Formatear encabezados
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#db2777');
      headerRange.setFontColor('white');
      headerRange.setFontWeight('bold');

      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, headers.length);
    }

    // Generar ID único para la inscripción
    const inscripcionId = generateInscripcionId();
    console.log('ID de inscripción generado:', inscripcionId);

    // Preparar fila de datos
    const rowData = [
      inscripcionId,                   // A - ID
      new Date(),                      // B - Fecha
      data.nombre || '',               // C - Nombre
      data.email || '',                // D - Email
      data.telefono || '',             // E - Teléfono
      data.mensaje || '',              // F - Mensaje
      'Pendiente'                      // G - Estado
    ];

    console.log('Datos a guardar:', rowData);

    // Agregar fila al final de la hoja
    sheet.appendRow(rowData);
    console.log('Inscripción agregada exitosamente');

    return inscripcionId;

  } catch (error) {
    console.error('Error en saveInscripcionToSheet:', error);
    throw new Error('Error al guardar inscripción: ' + error.message);
  }
}

// Generar ID único para inscripción
function generateInscripcionId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `INS-${timestamp}-${random}`;
}

// Enviar notificación de inscripción al administrador
function sendInscripcionNotification(data, inscripcionId) {
  const subject = `Nueva Inscripción PequeClub - ${data.nombre}`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #db2777, #f472b6); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Nueva Inscripción PequeClub</h1>
      </div>

      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #2c5530;">Detalles de la Inscripción</h2>

        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #db2777;">
          <p><strong>ID de Inscripción:</strong> ${inscripcionId}</p>
          <p><strong>Nombre:</strong> ${data.nombre}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Teléfono:</strong> ${data.telefono}</p>
          ${data.mensaje ? `<p><strong>Mensaje:</strong> ${data.mensaje}</p>` : ''}
        </div>

        <p><strong>Fecha de solicitud:</strong> ${new Date().toLocaleString('es-ES')}</p>

        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="margin: 0; color: #92400e;"><strong>Acción requerida:</strong> Contactar al interesado para completar la inscripción.</p>
        </div>
      </div>
    </div>
  `;

  try {
    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: subject,
      htmlBody: htmlBody,
      name: 'Sistema de Inscripciones - Laolin'
    });
  } catch (error) {
    console.error('Error enviando notificación de inscripción:', error);
  }
}

// Enviar confirmación de inscripción al cliente
function sendInscripcionConfirmation(data, inscripcionId) {
  const subject = `Confirmación de Inscripción PequeClub - Laolin`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #db2777 0%, #f472b6 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Laolin Children's Play Hub</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">PequeClub Escuela</p>
      </div>

      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #2c5530;">¡Hola ${data.nombre}!</h2>

        <p>Hemos recibido tu solicitud de inscripción para PequeClub Escuela. Nos pondremos en contacto contigo muy pronto para completar el proceso.</p>

        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #db2777; margin-top: 0;">Datos de tu solicitud</h3>
          <p><strong>Número de referencia:</strong> ${inscripcionId}</p>
          <p><strong>Nombre:</strong> ${data.nombre}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Teléfono:</strong> ${data.telefono}</p>
        </div>

        <div style="background: #fce7f3; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #9d174d; margin-top: 0;">Horarios PequeClub</h4>
          <p style="margin: 0; color: #831843;"><strong>Lunes a Viernes:</strong> 9:00 - 15:00</p>
          <p style="margin: 5px 0 0 0; font-size: 0.9em; color: #9d174d;">Posibilidad de ampliación</p>
        </div>

        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #2c5530; margin-top: 0;">Contacto</h4>
          <p style="margin: 0;"><strong>Dirección:</strong> Av. Carabanchel Alto 90, Madrid</p>
          <p style="margin: 5px 0 0 0;"><strong>Teléfono:</strong> 919 358 360</p>
          <p style="margin: 5px 0 0 0;"><strong>WhatsApp:</strong> 614 341 504</p>
        </div>

        <p style="margin-top: 30px;">
          ¡Esperamos verte pronto!<br>
          <strong>El equipo de Laolin Children's Play Hub</strong>
        </p>
      </div>

      <div style="background: #2c5530; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="margin: 0;">© 2025 Laolin Children's Play Hub. Todos los derechos reservados.</p>
      </div>
    </div>
  `;

  const textBody = `
    Confirmación de Inscripción PequeClub - Laolin Children's Play Hub

    Hola ${data.nombre},

    Hemos recibido tu solicitud de inscripción para PequeClub Escuela.
    Nos pondremos en contacto contigo muy pronto.

    Número de referencia: ${inscripcionId}
    Nombre: ${data.nombre}
    Email: ${data.email}
    Teléfono: ${data.telefono}

    Horarios PequeClub:
    Lunes a Viernes: 9:00 - 15:00
    Posibilidad de ampliación

    Contacto:
    Dirección: Av. Carabanchel Alto 90, Madrid
    Teléfono: 919 358 360
    WhatsApp: 614 341 504

    ¡Esperamos verte pronto!
    El equipo de Laolin Children's Play Hub
  `;

  try {
    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      htmlBody: htmlBody,
      body: textBody,
      name: 'Laolin Children\'s Play Hub'
    });
  } catch (error) {
    console.error('Error enviando confirmación de inscripción:', error);
  }
}

// Función para configurar la hoja de inscripciones (ejecutar una vez si es necesario)
function setupInscripcionesSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(INSCRIPCIONES_SHEET_NAME);

  // Crear la hoja si no existe
  if (!sheet) {
    sheet = spreadsheet.insertSheet(INSCRIPCIONES_SHEET_NAME);
  }

  // Configurar encabezados
  const headers = [
    'ID Inscripción',
    'Fecha',
    'Nombre',
    'Email',
    'Teléfono',
    'Mensaje',
    'Estado'
  ];

  // Limpiar hoja y agregar encabezados
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Formatear encabezados
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#db2777');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');

  // Ajustar ancho de columnas
  sheet.autoResizeColumns(1, headers.length);

  // Congelar primera fila
  sheet.setFrozenRows(1);

  console.log('Hoja de inscripciones configurada correctamente');
}

// ====== FIN FUNCIONES DE INSCRIPCIÓN PEQUECLUB ======
