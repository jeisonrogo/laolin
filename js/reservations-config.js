// 🔧 CONFIGURACIÓN DE RESERVAS - GOOGLE APPS SCRIPT
// 
// INSTRUCCIONES:
// 1. Sigue las instrucciones en google-apps-script/setup-instructions.md
// 2. Reemplaza la URL de abajo con tu URL real de Google Apps Script
// 3. Descomenta la línea correcta y comenta la línea de simulación

// ⚠️ CONFIGURACIÓN ACTUAL: SIMULACIÓN (para pruebas)
const RESERVATION_CONFIG = {
    // URL de simulación (comentar cuando tengas la URL real)
    scriptUrl: 'https://script.google.com/macros/s/AKfycbwDLi69aXEdQ-RORzOjy59zbTl4hAh0GQWUhDblphYVjcJh9CHP5A4IK1Cq-juZnYhQ/exec',
    
    // URL real de Google Apps Script (descomentar y reemplazar)
    // scriptUrl: 'https://script.google.com/macros/s/TU_SCRIPT_ID_REAL/exec',
    
    // Configuración de debugging
    debugMode: true,
    showConsoleLogs: true
};

// Función para obtener la URL del script
function getScriptUrl() {
    if (RESERVATION_CONFIG.scriptUrl === 'SIMULATION') {
        console.log('⚠️ MODO SIMULACIÓN: Las reservas no se envían realmente');
        console.log('📋 Para configurar Google Sheets, sigue las instrucciones en:');
        console.log('   google-apps-script/setup-instructions.md');
        return null;
    }
    return RESERVATION_CONFIG.scriptUrl;
}

// Función para verificar si estamos en modo simulación
function isSimulationMode() {
    return RESERVATION_CONFIG.scriptUrl === 'SIMULATION';
}

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RESERVATION_CONFIG, getScriptUrl, isSimulationMode };
}
