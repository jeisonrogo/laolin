// 🔧 CONFIGURACIÓN DE RESERVAS - GOOGLE APPS SCRIPT
// 
// INSTRUCCIONES:
// 1. Sigue las instrucciones en google-apps-script/setup-instructions.md
// 2. Reemplaza la URL de abajo con tu URL real de Google Apps Script
// 3. Descomenta la línea correcta y comenta la línea de simulación

// ⚠️ CONFIGURACIÓN ACTUAL: SIMULACIÓN (para pruebas)
const RESERVATION_CONFIG = {
    // URL de simulación (comentar cuando tengas la URL real)
    scriptUrl: 'https://script.google.com/macros/s/AKfycbzCdz44Cn7qdFNuzFkXSe2ER7RKunaW3eQ0xODWL3fneXFZTRVO0j4EKIHwwDUQbakn/exec', // production
    //scriptUrl: 'https://script.google.com/macros/s/AKfycby2o1xHEKyMAad9p5Sk-RRF3_lG6UJokGU1CbS28rtCTA65LO8tcenIvW7QqWSj2b9L/exec',// development
    //scriptUrl: 'https://script.google.com/macros/s/AKfycbzzGd0oP2UfudlyJtROclt3nuWqrXEhUWj4bjwYebDXIUgi8ZjsoDAVcC6qz3l55XDs/exec', // development
    // URL real de Google Apps Script (descomentar y reemplazar)
    // scriptUrl: 'https://script.google.com/macros/s/TU_SCRIPT_ID_REAL/exec',
    
    // Configuración de debugging
    debugMode: true,
    showConsoleLogs: true
};

// Función para obtener la URL del script
function getScriptUrl() {
    if (RESERVATION_CONFIG.scriptUrl === 'SIMULATION') {
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
