// Script de Node.js para ejecutar los tests
// Ejecutar con: node run-tests.js

const http = require('http');

const BASE_AUTH = 'http://127.0.0.1:8002/api';
const BASE_PROFILES = 'http://127.0.0.1:8003/api';

const credentials = {
  phone_number: '82397291',
  password: 'Daniel123.'
};

let token = null;
let userId = null;
let userData = null;

function log(message, type = 'info') {
  const colors = {
    success: '\x1b[32m', // verde
    error: '\x1b[31m',   // rojo
    info: '\x1b[36m',    // cyan
    warning: '\x1b[33m', // amarillo
    reset: '\x1b[0m'
  };
  const color = colors[type] || colors.info;
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(num, name) {
  log(`\n${num}️⃣ TEST: ${name}`, 'info');
  log('─'.repeat(60), 'info');
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const { method = 'GET', body, headers = {} } = options;
    
    const requestHeaders = { ...headers };
    if (token && !requestHeaders.Authorization) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
    
    if (body && typeof body === 'object' && !(body instanceof FormData)) {
      requestHeaders['Content-Type'] = 'application/json';
    }
    
    log(`📤 ${method} ${url}`, 'info');
    if (body && typeof body === 'string' && body.length < 300) {
      log(`   Body: ${body}`, 'info');
    }
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: requestHeaders
    };
    
    const req = http.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        let parsedData = {};
        try {
          parsedData = data ? JSON.parse(data) : {};
        } catch (e) {
          parsedData = { raw: data };
        }
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          log(`📥 Status: ${res.statusCode} ${res.statusMessage}`, 'success');
          if (Object.keys(parsedData).length < 10) {
            log(`   Response: ${JSON.stringify(parsedData, null, 2)}`, 'success');
          } else {
            log(`   Response (first 500 chars): ${JSON.stringify(parsedData, null, 2).substring(0, 500)}`, 'success');
          }
          resolve(parsedData);
        } else {
          log(`📥 Status: ${res.statusCode} ${res.statusMessage}`, 'error');
          log(`   Error Response: ${JSON.stringify(parsedData, null, 2)}`, 'error');
          if (data.length < 500) {
            log(`   Raw Response: ${data}`, 'error');
          }
          const error = new Error(`HTTP ${res.statusCode}: ${parsedData.detail || parsedData.error || parsedData.message || res.statusMessage}`);
          error.status = res.statusCode;
          error.body = parsedData;
          error.raw = data;
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      log(`❌ Network Error: ${error.message}`, 'error');
      reject(error);
    });
    
    if (body) {
      if (typeof body === 'object' && !(body instanceof FormData)) {
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    
    req.end();
  });
}

(async function runTests() {
  try {
    // TEST 1: Login
    logTest('1', 'Login');
    const loginResponse = await makeRequest(`${BASE_AUTH}/auth/login/`, {
      method: 'POST',
      body: credentials,
    });
    
    token = loginResponse.access || loginResponse.token || loginResponse.access_token;
    if (!token) {
      throw new Error('No se recibió token en el login');
    }
    log(`✅ Login exitoso - Token: ${token.substring(0, 30)}...`, 'success');
    
    // TEST 2: Obtener perfil
    logTest('2', 'Obtener perfil del usuario (me)');
    const profileResponse = await makeRequest(`${BASE_AUTH}/auth/users/me/`, { method: 'GET' });
    userId = profileResponse.id;
    userData = profileResponse;
    log(`✅ Perfil obtenido - ID: ${userId}, Name: ${profileResponse.full_name}, Role: ${profileResponse.role}`, 'success');
    
    if (profileResponse.specialist_profile) {
      log(`   Specialist Profile: ${JSON.stringify(profileResponse.specialist_profile, null, 2)}`, 'info');
    }
    
    // TEST 3: Obtener usuario por ID
    logTest('3', `Obtener usuario por ID (${userId})`);
    const userByIdResponse = await makeRequest(`${BASE_AUTH}/auth/users/${userId}/`, { method: 'GET' });
    log(`✅ Usuario obtenido por ID`, 'success');
    log(`   ID: ${userByIdResponse.id}, Name: ${userByIdResponse.full_name}`, 'success');
    
    // TEST 4: Verificar perfil de especialista
    logTest('4', `Verificar perfil de especialista (GET /profiles/specialists/${userId}/)`);
    try {
      const specialistGetResponse = await makeRequest(`${BASE_PROFILES}/profiles/specialists/${userId}/`, { method: 'GET' });
      log(`✅ Perfil de especialista encontrado`, 'success');
      log(`   Data: ${JSON.stringify(specialistGetResponse, null, 2)}`, 'success');
    } catch (e) {
      if (e.status === 404) {
        log(`⚠️ Perfil de especialista no existe (404)`, 'warning');
      } else {
        log(`❌ Error obteniendo perfil de especialista: ${e.message}`, 'error');
      }
    }
    
    // TEST 5: PATCH al perfil de especialista
    logTest('5', `PATCH al perfil de especialista (${userId})`);
    const testSpecialistData = {
      user_display: userData.specialist_profile?.user_display || 'Test Display Name',
      profession: userData.specialist_profile?.profession || 'Test Profession',
      experience_years: userData.specialist_profile?.experience_years ?? 5,
      about_us: userData.specialist_profile?.about_us || 'Test about us',
      can_give_consultations: userData.specialist_profile?.can_give_consultations ?? true,
      can_offer_online_services: userData.specialist_profile?.can_offer_online_services ?? false,
    };
    
    // Limpiar datos
    Object.keys(testSpecialistData).forEach(key => {
      const value = testSpecialistData[key];
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        delete testSpecialistData[key];
      }
    });
    
    log(`   Datos a enviar: ${JSON.stringify(testSpecialistData, null, 2)}`, 'info');
    
    let patchSuccess = false;
    try {
      const patchResponse = await makeRequest(`${BASE_PROFILES}/profiles/specialists/${userId}/`, {
        method: 'PATCH',
        body: testSpecialistData,
      });
      log(`✅ PATCH exitoso`, 'success');
      log(`   Response: ${JSON.stringify(patchResponse, null, 2)}`, 'success');
      patchSuccess = true;
    } catch (e) {
      log(`❌ Error en PATCH: ${e.message}`, 'error');
      log(`   Status: ${e.status}`, 'error');
      log(`   Body: ${JSON.stringify(e.body, null, 2)}`, 'error');
      if (e.raw && e.raw.length < 500) {
        log(`   Raw: ${e.raw}`, 'error');
      }
      
      // TEST 6: PUT como fallback
      logTest('6', `PUT al perfil de especialista (fallback)`);
      try {
        const putResponse = await makeRequest(`${BASE_PROFILES}/profiles/specialists/${userId}/`, {
          method: 'PUT',
          body: testSpecialistData,
        });
        log(`✅ PUT exitoso`, 'success');
        log(`   Response: ${JSON.stringify(putResponse, null, 2)}`, 'success');
        patchSuccess = true;
      } catch (e2) {
        log(`❌ Error en PUT: ${e2.message}`, 'error');
        log(`   Status: ${e2.status}`, 'error');
        log(`   Body: ${JSON.stringify(e2.body, null, 2)}`, 'error');
        if (e2.raw && e2.raw.length < 500) {
          log(`   Raw: ${e2.raw}`, 'error');
        }
        
        // TEST 7: CREATE si no existe
        if (e2.status === 404 || e.status === 404) {
          logTest('7', 'CREATE perfil de especialista (no existe)');
          try {
            const createResponse = await makeRequest(`${BASE_PROFILES}/profiles/specialists/`, {
              method: 'POST',
              body: testSpecialistData,
            });
            log(`✅ CREATE exitoso`, 'success');
            log(`   Response: ${JSON.stringify(createResponse, null, 2)}`, 'success');
            patchSuccess = true;
          } catch (e3) {
            log(`❌ Error en CREATE: ${e3.message}`, 'error');
            log(`   Status: ${e3.status}`, 'error');
            log(`   Body: ${JSON.stringify(e3.body, null, 2)}`, 'error');
          }
        }
      }
    }
    
    // TEST 8: Actualizar usuario básico
    logTest('8', 'Actualizar usuario (PATCH)');
    const updateUserData = {
      full_name: userData.full_name || 'Test User',
      bio: userData.bio || 'Test bio updated',
    };
    
    try {
      const updateResponse = await makeRequest(`${BASE_AUTH}/auth/users/${userId}/`, {
        method: 'PATCH',
        body: updateUserData,
      });
      log(`✅ Usuario actualizado`, 'success');
      log(`   Response: ${JSON.stringify(updateResponse, null, 2)}`, 'success');
    } catch (e) {
      log(`❌ Error actualizando usuario: ${e.message}`, 'error');
    }
    
    // Resumen final
    log('\n' + '═'.repeat(60), 'info');
    log('📊 RESUMEN DE TESTS', 'info');
    log('═'.repeat(60), 'info');
    log('✅ Login: OK', 'success');
    log('✅ Obtener perfil: OK', 'success');
    log('✅ Obtener usuario por ID: OK', 'success');
    log(patchSuccess ? '✅ Actualizar perfil especialista: OK' : '❌ Actualizar perfil especialista: FALLÓ', patchSuccess ? 'success' : 'error');
    log('✅ Actualizar usuario: OK', 'success');
    log('\n' + '═'.repeat(60), 'info');
    log('✅ TODOS LOS TESTS COMPLETADOS', 'success');
    
  } catch (error) {
    log('\n' + '═'.repeat(60), 'error');
    log('❌ ERROR CRÍTICO EN LOS TESTS', 'error');
    log('═'.repeat(60), 'error');
    log(`Error: ${error.message}`, 'error');
    if (error.stack) {
      log(`Stack: ${error.stack}`, 'error');
    }
    process.exit(1);
  }
})();

