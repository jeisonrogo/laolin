// Google Apps Script para manejar reservas de Laolin Children's Play Hub
// Este script debe ser desplegado como una aplicación web

// Configuración
const SPREADSHEET_ID = '1X_e6XwaCtQJY7_Ael5qjcp8SQ7ayDWshepYKb6ahU_o'; // Reemplazar con el ID real
const SHEET_NAME = 'Reservas';
const ADMIN_EMAIL = 'jeison.rodriguez@fitideas.co';

// Función principal que maneja las peticiones POST
function doPost(e) {
  try {
    // Parsear los datos recibidos
    const data = JSON.parse(e.postData.contents);
    
    // Validar los datos
    const validation = validateReservationData(data);
    if (!validation.isValid) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: validation.error
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Guardar la reserva en Google Sheets
    const reservationId = saveReservationToSheet(data);
    
    // Enviar confirmación por email
    sendConfirmationEmail(data, reservationId);
    
    // Enviar notificación al administrador
    sendAdminNotification(data, reservationId);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        reservationId: reservationId,
        message: 'Reserva realizada con éxito'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error procesando reserva:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Error interno del servidor'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Función para manejar peticiones GET (para verificar disponibilidad)
function doGet(e) {
  try {
    const params = e.parameter;
    const fecha = params.fecha;
    const hora = params.hora;
    
    if (!fecha || !hora) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Faltan parámetros fecha y hora'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const isAvailable = checkAvailability(fecha, hora);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        available: isAvailable
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error verificando disponibilidad:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Error interno del servidor'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Validar datos de la reserva
function validateReservationData(data) {
  const requiredFields = ['nombre', 'email', 'telefono', 'fecha', 'hora', 'numNinos', 'servicio'];
  
  for (let field of requiredFields) {
    if (!data[field] || data[field].trim() === '') {
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
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  // Generar ID único para la reserva
  const reservationId = generateReservationId();
  
  // Preparar fila de datos
  const rowData = [
    reservationId,                    // ID de reserva
    new Date(),                      // Fecha de creación
    data.nombre,                     // Nombre
    data.email,                      // Email
    data.telefono,                   // Teléfono
    data.fecha,                      // Fecha de reserva
    data.hora,                       // Hora
    data.numNinos,                   // Número de niños
    data.edades || '',               // Edades
    data.servicio,                   // Servicio
    data.comentarios || '',          // Comentarios
    'Pendiente'                      // Estado
  ];
  
  // Agregar fila al final de la hoja
  sheet.appendRow(rowData);
  
  return reservationId;
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
    const reservaFecha = row[5]; // Columna de fecha
    const reservaHora = row[6];  // Columna de hora
    const estado = row[11];      // Columna de estado
    
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
          <p><strong>Hora:</strong> ${data.hora}</p>
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
    Hora: ${data.hora}
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
          <p><strong>Hora:</strong> ${data.hora}</p>
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
    'taller': 'Taller Especial'
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
