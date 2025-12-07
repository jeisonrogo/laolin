// Herramienta de diagnóstico para el sistema de reservas
// Ejecuta en la consola: diagnosticarSistemaReservas()

function diagnosticarSistemaReservas() {
    console.clear();
    console.log('%c🔍 DIAGNÓSTICO DEL SISTEMA DE RESERVAS', 'background: #2c5530; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
    console.log('');

    const scriptUrl = getScriptUrl();

    // 1. Verificar configuración
    console.log('%c1️⃣ CONFIGURACIÓN', 'background: #a8d5ba; color: #2c5530; padding: 5px; font-weight: bold;');
    console.log('URL del script:', scriptUrl || '❌ NO CONFIGURADA');
    console.log('Modo simulación:', isSimulationMode() ? '✅ SÍ' : '❌ NO');
    console.log('');

    if (!scriptUrl) {
        console.error('❌ PROBLEMA: No hay URL configurada');
        console.log('%cSOLUCIÓN:', 'color: orange; font-weight: bold;');
        console.log('1. Ve a Google Apps Script y despliega tu script');
        console.log('2. Copia la URL del despliegue');
        console.log('3. Edita js/reservations-config.js y pega la URL');
        return;
    }

    // 2. Verificar formato de URL
    console.log('%c2️⃣ VALIDACIÓN DE URL', 'background: #a8d5ba; color: #2c5530; padding: 5px; font-weight: bold;');
    const urlPattern = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;
    const isValidFormat = urlPattern.test(scriptUrl);

    if (isValidFormat) {
        console.log('✅ Formato de URL correcto');
    } else {
        console.error('❌ Formato de URL incorrecto');
        console.log('Formato esperado: https://script.google.com/macros/s/SCRIPT_ID/exec');
        console.log('Tu URL:', scriptUrl);
    }
    console.log('');

    // 3. Probar conexión
    console.log('%c3️⃣ PRUEBA DE CONEXIÓN', 'background: #a8d5ba; color: #2c5530; padding: 5px; font-weight: bold;');
    console.log('Probando conexión con el servidor...');

    const testUrl = `${scriptUrl}?action=getAvailableSlots&date=2025-12-08&callback=testDiagnostico`;

    window.testDiagnostico = function(result) {
        console.log('');
        console.log('%c✅ CONEXIÓN EXITOSA', 'background: green; color: white; padding: 5px; font-weight: bold;');
        console.log('Respuesta del servidor:', result);

        if (result.success) {
            console.log('✅ El servidor respondió correctamente');
            console.log('Slots disponibles:', result.availableSlots?.length || 0);
        } else {
            console.error('⚠️ El servidor respondió pero con error:', result.error);
        }

        delete window.testDiagnostico;
        mostrarResumen(true);
    };

    const script = document.createElement('script');
    script.src = testUrl;

    script.onerror = function(error) {
        console.log('');
        console.log('%c❌ ERROR DE CONEXIÓN', 'background: red; color: white; padding: 5px; font-weight: bold;');
        console.error('No se pudo conectar con el servidor');
        console.error('URL intentada:', testUrl);
        console.log('');

        console.log('%c🔧 POSIBLES CAUSAS Y SOLUCIONES:', 'color: orange; font-weight: bold;');
        console.log('');

        console.log('❌ Causa 1: El script no está desplegado');
        console.log('   Solución:');
        console.log('   1. Ve a script.google.com');
        console.log('   2. Abre tu proyecto');
        console.log('   3. Clic en "Implementar" > "Administrar implementaciones"');
        console.log('   4. Verifica que hay una implementación activa');
        console.log('   5. Si no, crea una nueva: "Implementar" > "Nueva implementación"');
        console.log('');

        console.log('❌ Causa 2: URL incorrecta');
        console.log('   Solución:');
        console.log('   1. En Google Apps Script, ve a "Implementar" > "Administrar implementaciones"');
        console.log('   2. Copia la URL de la implementación activa');
        console.log('   3. Asegúrate de que termina en "/exec"');
        console.log('   4. Actualiza js/reservations-config.js con la URL correcta');
        console.log('');

        console.log('❌ Causa 3: Permisos incorrectos');
        console.log('   Solución:');
        console.log('   1. En la configuración del despliegue:');
        console.log('   2. "Ejecutar como" debe ser: YO (tu email)');
        console.log('   3. "Quién tiene acceso" debe ser: CUALQUIER USUARIO');
        console.log('   4. Vuelve a desplegar');
        console.log('');

        console.log('❌ Causa 4: Script no actualizado');
        console.log('   Solución:');
        console.log('   1. Asegúrate de que tu script tiene el código actualizado');
        console.log('   2. Busca la función: getAvailableSlots');
        console.log('   3. Si no existe, copia el código de google-apps-script/reservations.gs');
        console.log('   4. Despliega de nuevo: "Implementar" > "Nueva implementación"');
        console.log('');

        delete window.testDiagnostico;
        mostrarResumen(false);
    };

    // Timeout
    setTimeout(() => {
        if (window.testDiagnostico) {
            console.log('');
            console.log('%c⏱️ TIMEOUT', 'background: orange; color: white; padding: 5px; font-weight: bold;');
            console.error('El servidor no respondió en 10 segundos');
            console.log('Esto puede indicar que el script no está ejecutándose correctamente');
            delete window.testDiagnostico;
            mostrarResumen(false);
        }
    }, 10000);

    document.head.appendChild(script);
}

function mostrarResumen(exito) {
    console.log('');
    console.log('%c📋 RESUMEN', 'background: #2c5530; color: white; padding: 5px; font-weight: bold;');

    if (exito) {
        console.log('%c✅ El sistema está configurado correctamente', 'color: green; font-weight: bold; font-size: 14px;');
        console.log('');
        console.log('Puedes hacer una reserva de prueba para verificar que todo funciona.');
    } else {
        console.log('%c❌ Hay problemas de configuración', 'color: red; font-weight: bold; font-size: 14px;');
        console.log('');
        console.log('%c🔧 OPCIÓN TEMPORAL:', 'color: orange; font-weight: bold;');
        console.log('Mientras solucionas el problema, puedes usar el MODO SIMULACIÓN:');
        console.log('');
        console.log('En js/reservations-config.js, cambia:');
        console.log('  scriptUrl: \'TU_URL_ACTUAL\'');
        console.log('Por:');
        console.log('  scriptUrl: \'SIMULATION\'');
        console.log('');
        console.log('Esto te permitirá probar el calendario con datos simulados.');
    }

    console.log('');
    console.log('%c📖 Documentación completa: CONFIGURACION_CALENDARIO_RESERVAS.md', 'color: #2c5530; font-style: italic;');
}

// Función para probar directamente la URL en una nueva ventana
function probarURLEnNavegador() {
    const scriptUrl = getScriptUrl();
    if (!scriptUrl) {
        console.error('No hay URL configurada');
        return;
    }

    const testUrl = `${scriptUrl}?action=getAvailableSlots&date=2025-12-08`;
    console.log('Abriendo URL en nueva ventana:', testUrl);
    console.log('Si ves JSON en la ventana, el script funciona correctamente');
    console.log('Si ves un error, hay un problema con el script o los permisos');

    window.open(testUrl, '_blank');
}

// Función para verificar el calendario de Google
function verificarCalendarioGoogle() {
    console.log('%c🗓️ VERIFICACIÓN DE GOOGLE CALENDAR', 'background: #2c5530; color: white; padding: 10px; font-weight: bold;');
    console.log('');
    console.log('Para que el sistema funcione, necesitas:');
    console.log('');
    console.log('1. ✅ Un calendario llamado exactamente: "Laolin Reservas"');
    console.log('2. ✅ El calendario debe estar en tu cuenta de Google');
    console.log('3. ✅ El script debe tener permisos para acceder al calendario');
    console.log('');
    console.log('Pasos para verificar:');
    console.log('1. Ve a calendar.google.com');
    console.log('2. Busca en la lista de calendarios (lado izquierdo)');
    console.log('3. Si no ves "Laolin Reservas", créalo:');
    console.log('   - Clic en "+" junto a "Otros calendarios"');
    console.log('   - "Crear nuevo calendario"');
    console.log('   - Nombre: "Laolin Reservas"');
    console.log('   - Zona horaria: Europe/Madrid');
    console.log('');
    console.log('4. Verifica permisos del script:');
    console.log('   - Ve a script.google.com');
    console.log('   - Abre tu proyecto');
    console.log('   - Ejecuta manualmente la función "getOrCreateCalendar"');
    console.log('   - Te pedirá autorizar el acceso al calendario');
    console.log('   - Acepta todos los permisos');
}

console.log('%c💡 HERRAMIENTAS DE DIAGNÓSTICO CARGADAS', 'background: #a8d5ba; color: #2c5530; padding: 5px;');
console.log('');
console.log('Ejecuta en la consola:');
console.log('  diagnosticarSistemaReservas()     - Diagnóstico completo');
console.log('  probarURLEnNavegador()            - Prueba la URL en el navegador');
console.log('  verificarCalendarioGoogle()       - Guía para verificar el calendario');
