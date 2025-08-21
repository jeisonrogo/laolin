# 🔧 Configuración de Google Apps Script para Reservas

## 📋 Pasos para Configurar Google Sheets

### 1. Crear Google Sheet
1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nombra la primera hoja como "Reservas"
4. Agrega estos encabezados en la primera fila:
   ```
   A1: ID | B1: Fecha | C1: Hora | D1: Nombre | E1: Email | F1: Teléfono | F1: Número de Niños | G1: Edades | H1: Servicio | I1: Comentarios | J1: Estado | K1: Fecha de Creación
   ```

### 2. Configurar Google Apps Script
1. En tu Google Sheet, ve a **Extensiones > Apps Script**
2. Reemplaza todo el código con el contenido de `reservations.gs`
3. Actualiza las siguientes variables en el código:
   ```javascript
   const SPREADSHEET_ID = 'TU_SPREADSHEET_ID'; // ID de tu Google Sheet
   const ADMIN_EMAIL = 'tu-email@gmail.com';   // Tu email para notificaciones
   ```

### 3. Obtener el ID del Spreadsheet
1. En tu Google Sheet, mira la URL
2. El ID está entre `/d/` y `/edit`
3. Ejemplo: `https://docs.google.com/spreadsheets/d/1ABC123.../edit`
4. Copia `1ABC123...` (esa es tu SPREADSHEET_ID)

### 4. Desplegar el Script
1. En Apps Script, haz clic en **Desplegar > Nueva implementación**
2. Selecciona **Tipo: Aplicación web**
3. Configura:
   - **Ejecutar como**: Tu cuenta
   - **Quién tiene acceso**: Cualquier persona
4. Haz clic en **Desplegar**
5. Copia la URL del Web App

### 5. Actualizar el Código JavaScript
1. En `js/reservations.js`, línea 365, reemplaza:
   ```javascript
   const scriptUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
   ```
2. Con tu URL real del Web App

### 6. Configurar Permisos
1. La primera vez que alguien use el formulario, Google pedirá permisos
2. Haz clic en **Revisar permisos**
3. Selecciona tu cuenta
4. Haz clic en **Avanzado > Ir a [Nombre del proyecto] (no seguro)**
5. Haz clic en **Permitir**

## 🔍 Verificación

### Probar la Integración
1. Abre la página web
2. Llena el formulario de reserva
3. Envía la reserva
4. Verifica que aparezca en tu Google Sheet
5. Revisa tu email para la confirmación

### Debugging
- Abre la consola del navegador (F12)
- Busca mensajes de error o éxito
- Verifica que la URL del script sea correcta

## 📧 Notificaciones por Email

El script enviará:
- **Email de confirmación** al cliente
- **Email de notificación** al administrador

## 🔒 Seguridad

- El script valida los datos antes de guardarlos
- Los emails se envían solo a direcciones válidas
- Se genera un ID único para cada reserva

## 🚨 Solución de Problemas

### Error CORS (Access-Control-Allow-Origin)
**Síntomas:** Error en consola: "has been blocked by CORS policy"
**Solución:**
1. El sistema ahora usa solicitudes GET en lugar de POST para evitar problemas de CORS
2. **Re-despliega** el script después de actualizar el código
3. Verifica que la URL del script sea correcta
4. Usa el archivo `test-cors.html` para probar la conexión

### Error 403 (Forbidden)
- Verifica que el script esté desplegado como aplicación web
- Asegúrate de que "Quién tiene acceso" esté en "Cualquier persona"

### Error 404 (Not Found)
- Verifica que la URL del script sea correcta
- Asegúrate de que el script esté desplegado

### No se reciben emails
- Verifica que ADMIN_EMAIL sea correcto
- Revisa la carpeta de spam
- Asegúrate de que el email del cliente sea válido

### Datos no aparecen en la hoja
- Verifica que SPREADSHEET_ID sea correcto
- Asegúrate de que tengas permisos de escritura en la hoja
- Revisa los logs en Apps Script (Ver > Logs de ejecución)

### Error "Failed to fetch"
- Verifica que el script esté desplegado correctamente
- Asegúrate de que la URL del script sea accesible
- Revisa los logs en Apps Script para errores internos
