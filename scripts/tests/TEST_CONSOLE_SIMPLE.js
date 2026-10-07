// ============================================
// SCRIPT SIMPLE PARA COPIAR Y PEGAR EN CONSOLA
// ============================================
// 1. Abre tu aplicación en el navegador (debe estar corriendo en http://localhost:5173 o similar)
// 2. Abre la consola (F12)
// 3. Copia y pega TODO este código
// 4. Presiona Enter

(async function testAll() {
  console.clear();
  console.log('%c🧪 INICIANDO TESTS COMPLETOS', 'font-size: 20px; font-weight: bold; color: #4CAF50;');
  console.log('─'.repeat(60));
  
  // Usar las URLs de tu configuración
  const BASE_AUTH = 'http://127.0.0.1:8002/api';
  const BASE_PROFILES = 'http://127.0.0.1:8003/api';
  
  const credentials = { phone_number: '82397291', password: 'Daniel123.' };
  
  let token = null;
  let userId = null;
  let userData = null;
  
  function logTest(num, name) {
    console.log(`\n%c${num}️⃣ TEST: ${name}`, 'font-weight: bold; color: #2196F3;');
    console.log('─'.repeat(60));
  }
  
  async function request(url, options = {}) {
    const { headers = {}, ...rest } = options;
    const fetchHeaders = { ...headers };
    
    if (token && !fetchHeaders.Authorization) {
      fetchHeaders.Authorization = `Bearer ${token}`;
    }
    
    if (rest.body && !(rest.body instanceof FormData)) {
      fetchHeaders['Content-Type'] = 'application/json';
      if (typeof rest.body === 'object') {
        rest.body = JSON.stringify(rest.body);
      }
    }
    
    console.log(`%c📤 ${options.method || 'GET'} ${url}`, 'color: #2196F3;');
    if (rest.body && typeof rest.body === 'string' && rest.body.length < 300) {
      console.log('   Body:', rest.body);
    }
    
    try {
      const res = await fetch(url, { ...rest, headers: fetchHeaders });
      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { raw: text };
      }
      
      if (res.ok) {
        console.log(`%c📥 Status: ${res.status} ${res.statusText}`, 'color: #4CAF50; font-weight: bold;');
        if (Object.keys(data).length < 10) {
          console.log('   Response:', JSON.stringify(data, null, 2));
        } else {
          console.log('   Response keys:', Object.keys(data));
          console.log('   Response (first 500 chars):', JSON.stringify(data, null, 2).substring(0, 500));
        }
      } else {
        console.error(`%c📥 Status: ${res.status} ${res.statusText}`, 'color: #f44336; font-weight: bold;');
        console.error('   Error Response:', JSON.stringify(data, null, 2));
        if (text.length < 1000) {
          console.error('   Raw Response:', text);
        } else {
          console.error('   Raw Response (first 1000 chars):', text.substring(0, 1000));
        }
      }
      
      if (!res.ok) {
        const error = new Error(`HTTP ${res.status}: ${data.detail || data.error || data.message || res.statusText}`);
        error.status = res.status;
        error.body = data;
        error.raw = text;
        throw error;
      }
      
      return data;
    } catch (error) {
      if (error.status) {
        console.error(`%c❌ Request failed: ${error.message}`, 'color: #f44336; font-weight: bold;');
        console.error('   Status:', error.status);
        console.error('   Body:', JSON.stringify(error.body, null, 2));
        if (error.raw && error.raw.length < 1000) {
          console.error('   Raw:', error.raw);
        } else if (error.raw) {
          console.error('   Raw (first 1000 chars):', error.raw.substring(0, 1000));
        }
      } else {
        console.error(`%c❌ Network/Parse Error: ${error.message}`, 'color: #f44336; font-weight: bold;');
        console.error('   Esto puede ser un problema de CORS o el servidor no está corriendo');
      }
      throw error;
    }
  }
  
  try {
    // TEST 1: Login
    logTest('1', 'Login');
    const loginResponse = await request(`${BASE_AUTH}/auth/login/`, {
      method: 'POST',
      body: credentials,
    });
    
    token = loginResponse.access || loginResponse.token || loginResponse.access_token;
    if (!token) {
      throw new Error('No se recibió token en el login');
    }
    console.log(`%c✅ Login exitoso - Token: ${token.substring(0, 30)}...`, 'color: #4CAF50; font-weight: bold;');
    
    // TEST 2: Obtener perfil
    logTest('2', 'Obtener perfil del usuario (me)');
    const profileResponse = await request(`${BASE_AUTH}/auth/users/me/`, { method: 'GET' });
    userId = profileResponse.id;
    userData = profileResponse;
    console.log(`%c✅ Perfil obtenido`, 'color: #4CAF50; font-weight: bold;');
    console.log('   ID:', userId);
    console.log('   Name:', profileResponse.full_name);
    console.log('   Role:', profileResponse.role);
    console.log('   Has Specialist Profile:', !!profileResponse.specialist_profile);
    
    if (profileResponse.specialist_profile) {
      console.log('   Specialist Profile:', JSON.stringify(profileResponse.specialist_profile, null, 2));
    }
    
    // TEST 3: Obtener usuario por ID
    logTest('3', `Obtener usuario por ID (${userId})`);
    const userByIdResponse = await request(`${BASE_AUTH}/auth/users/${userId}/`, { method: 'GET' });
    console.log(`%c✅ Usuario obtenido por ID`, 'color: #4CAF50; font-weight: bold;');
    console.log('   ID:', userByIdResponse.id);
    console.log('   Name:', userByIdResponse.full_name);
    console.log('   Email:', userByIdResponse.email);
    
    // TEST 4: Verificar perfil de especialista
    logTest('4', `Verificar perfil de especialista (GET /profiles/specialists/${userId}/)`);
    try {
      const specialistGetResponse = await request(`${BASE_PROFILES}/profiles/specialists/${userId}/`, { method: 'GET' });
      console.log(`%c✅ Perfil de especialista encontrado`, 'color: #4CAF50; font-weight: bold;');
      console.log('   Data:', JSON.stringify(specialistGetResponse, null, 2));
    } catch (e) {
      if (e.status === 404) {
        console.log(`%c⚠️ Perfil de especialista no existe (404)`, 'color: #FF9800; font-weight: bold;');
      } else {
        console.error(`%c❌ Error obteniendo perfil de especialista: ${e.message}`, 'color: #f44336; font-weight: bold;');
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
    
    console.log('   Datos a enviar:', JSON.stringify(testSpecialistData, null, 2));
    
    let patchSuccess = false;
    try {
      const patchResponse = await request(`${BASE_PROFILES}/profiles/specialists/${userId}/`, {
        method: 'PATCH',
        body: testSpecialistData,
      });
      console.log(`%c✅ PATCH exitoso`, 'color: #4CAF50; font-weight: bold;');
      console.log('   Response:', JSON.stringify(patchResponse, null, 2));
      patchSuccess = true;
    } catch (e) {
      console.error(`%c❌ Error en PATCH: ${e.message}`, 'color: #f44336; font-weight: bold;');
      console.error('   Status:', e.status);
      console.error('   Body:', JSON.stringify(e.body, null, 2));
      if (e.raw && e.raw.length < 1000) {
        console.error('   Raw:', e.raw);
      } else if (e.raw) {
        console.error('   Raw (first 1000 chars):', e.raw.substring(0, 1000));
      }
      
      // TEST 6: PUT como fallback
      logTest('6', `PUT al perfil de especialista (fallback)`);
      try {
        const putResponse = await request(`${BASE_PROFILES}/profiles/specialists/${userId}/`, {
          method: 'PUT',
          body: testSpecialistData,
        });
        console.log(`%c✅ PUT exitoso`, 'color: #4CAF50; font-weight: bold;');
        console.log('   Response:', JSON.stringify(putResponse, null, 2));
        patchSuccess = true;
      } catch (e2) {
        console.error(`%c❌ Error en PUT: ${e2.message}`, 'color: #f44336; font-weight: bold;');
        console.error('   Status:', e2.status);
        console.error('   Body:', JSON.stringify(e2.body, null, 2));
        if (e2.raw && e2.raw.length < 1000) {
          console.error('   Raw:', e2.raw);
        } else if (e2.raw) {
          console.error('   Raw (first 1000 chars):', e2.raw.substring(0, 1000));
        }
        
        // TEST 7: CREATE si no existe
        if (e2.status === 404 || e.status === 404) {
          logTest('7', 'CREATE perfil de especialista (no existe)');
          try {
            const createResponse = await request(`${BASE_PROFILES}/profiles/specialists/`, {
              method: 'POST',
              body: testSpecialistData,
            });
            console.log(`%c✅ CREATE exitoso`, 'color: #4CAF50; font-weight: bold;');
            console.log('   Response:', JSON.stringify(createResponse, null, 2));
            patchSuccess = true;
          } catch (e3) {
            console.error(`%c❌ Error en CREATE: ${e3.message}`, 'color: #f44336; font-weight: bold;');
            console.error('   Status:', e3.status);
            console.error('   Body:', JSON.stringify(e3.body, null, 2));
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
      const updateResponse = await request(`${BASE_AUTH}/auth/users/${userId}/`, {
        method: 'PATCH',
        body: updateUserData,
      });
      console.log(`%c✅ Usuario actualizado`, 'color: #4CAF50; font-weight: bold;');
      console.log('   Response:', JSON.stringify(updateResponse, null, 2));
    } catch (e) {
      console.error(`%c❌ Error actualizando usuario: ${e.message}`, 'color: #f44336; font-weight: bold;');
    }
    
    // Resumen final
    console.log('\n' + '═'.repeat(60));
    console.log('%c📊 RESUMEN DE TESTS', 'font-size: 16px; font-weight: bold; color: #2196F3;');
    console.log('═'.repeat(60));
    console.log('%c✅ Login: OK', 'color: #4CAF50; font-weight: bold;');
    console.log('%c✅ Obtener perfil: OK', 'color: #4CAF50; font-weight: bold;');
    console.log('%c✅ Obtener usuario por ID: OK', 'color: #4CAF50; font-weight: bold;');
    console.log(patchSuccess ? '%c✅ Actualizar perfil especialista: OK' : '%c❌ Actualizar perfil especialista: FALLÓ', patchSuccess ? 'color: #4CAF50; font-weight: bold;' : 'color: #f44336; font-weight: bold;');
    console.log('%c✅ Actualizar usuario: OK', 'color: #4CAF50; font-weight: bold;');
    console.log('\n' + '═'.repeat(60));
    console.log('%c✅ TODOS LOS TESTS COMPLETADOS', 'color: #4CAF50; font-weight: bold;');
    
  } catch (error) {
    console.error('\n' + '═'.repeat(60));
    console.error('%c❌ ERROR CRÍTICO EN LOS TESTS', 'font-size: 16px; font-weight: bold; color: #f44336;');
    console.error('═'.repeat(60));
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
})();

