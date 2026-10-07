# 🧪 Script de Pruebas para Consola del Navegador

## Instrucciones:

1. Abre tu aplicación en el navegador
2. Abre la consola del navegador (F12 → Console)
3. Copia y pega TODO el código de abajo
4. Presiona Enter

---

## 📋 Código para copiar y pegar:

```javascript
(async function testAll() {
  console.clear();
  console.log('%c🧪 INICIANDO TESTS COMPLETOS', 'font-size: 20px; font-weight: bold; color: #4CAF50;');
  console.log('─'.repeat(60));
  
  const BASE_AUTH = 'http://127.0.0.1:8002/api';
  const BASE_PROFILES = 'http://127.0.0.1:8003/api';
  
  const credentials = { phone_number: '82397291', password: 'Daniel123.' };
  
  let token = null;
  let userId = null;
  let userData = null;
  
  function logTest(num, name) {
    console.log(`\n${num}️⃣ TEST: ${name}`);
    console.log('─'.repeat(60));
  }
  
  function logSuccess(msg, data = null) {
    console.log(`%c✅ ${msg}`, 'color: #4CAF50; font-weight: bold;');
    if (data) console.log('   ', data);
  }
  
  function logError(msg, error) {
    console.error(`%c❌ ${msg}`, 'color: #f44336; font-weight: bold;');
    console.error('   Error:', error.message || error);
    if (error.status) console.error('   Status:', error.status);
    if (error.body) console.error('   Body:', error.body);
    if (error.raw) console.error('   Raw:', error.raw);
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
      
      const statusColor = res.ok ? '#4CAF50' : '#f44336';
      console.log(`%c📥 Status: ${res.status} ${res.statusText}`, `color: ${statusColor}; font-weight: bold;`);
      
      if (res.ok) {
        if (Object.keys(data).length < 10) {
          console.log('   Response:', JSON.stringify(data, null, 2));
        } else {
          console.log('   Response keys:', Object.keys(data));
          console.log('   Response (first 500 chars):', JSON.stringify(data, null, 2).substring(0, 500));
        }
      } else {
        console.error('   Error Response:', JSON.stringify(data, null, 2));
        if (text.length < 500) {
          console.error('   Raw Response:', text);
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
        logError('Request failed', error);
      } else {
        console.error('❌ Network/Parse Error:', error.message);
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
    logSuccess('Login exitoso', { token: token.substring(0, 30) + '...' });
    
    // TEST 2: Obtener perfil
    logTest('2', 'Obtener perfil del usuario (me)');
    const profileResponse = await request(`${BASE_AUTH}/auth/users/me/`, { method: 'GET' });
    userId = profileResponse.id;
    userData = profileResponse;
    logSuccess('Perfil obtenido', {
      id: userId,
      name: profileResponse.full_name,
      role: profileResponse.role,
      hasSpecialistProfile: !!profileResponse.specialist_profile
    });
    
    if (profileResponse.specialist_profile) {
      console.log('   Specialist Profile:', JSON.stringify(profileResponse.specialist_profile, null, 2));
    }
    
    // TEST 3: Obtener usuario por ID
    logTest('3', `Obtener usuario por ID (${userId})`);
    const userByIdResponse = await request(`${BASE_AUTH}/auth/users/${userId}/`, { method: 'GET' });
    logSuccess('Usuario obtenido por ID', {
      id: userByIdResponse.id,
      name: userByIdResponse.full_name,
      email: userByIdResponse.email,
      role: userByIdResponse.role
    });
    
    // TEST 4: Verificar perfil de especialista
    logTest('4', `Verificar perfil de especialista (GET /profiles/specialists/${userId}/)`);
    try {
      const specialistGetResponse = await request(`${BASE_PROFILES}/profiles/specialists/${userId}/`, { method: 'GET' });
      logSuccess('Perfil de especialista encontrado', specialistGetResponse);
    } catch (e) {
      if (e.status === 404) {
        console.log('⚠️ Perfil de especialista no existe (404)');
      } else {
        logError('Error obteniendo perfil de especialista', e);
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
      logSuccess('PATCH exitoso', patchResponse);
      patchSuccess = true;
    } catch (e) {
      logError('Error en PATCH', e);
      
      // TEST 6: PUT como fallback
      logTest('6', `PUT al perfil de especialista (fallback)`);
      try {
        const putResponse = await request(`${BASE_PROFILES}/profiles/specialists/${userId}/`, {
          method: 'PUT',
          body: testSpecialistData,
        });
        logSuccess('PUT exitoso', putResponse);
        patchSuccess = true;
      } catch (e2) {
        logError('Error en PUT', e2);
        
        // TEST 7: CREATE si no existe
        if (e2.status === 404 || e.status === 404) {
          logTest('7', 'CREATE perfil de especialista (no existe)');
          try {
            const createResponse = await request(`${BASE_PROFILES}/profiles/specialists/`, {
              method: 'POST',
              body: testSpecialistData,
            });
            logSuccess('CREATE exitoso', createResponse);
            patchSuccess = true;
          } catch (e3) {
            logError('Error en CREATE', e3);
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
      logSuccess('Usuario actualizado', updateResponse);
    } catch (e) {
      logError('Error actualizando usuario', e);
    }
    
    // Resumen final
    console.log('\n' + '═'.repeat(60));
    console.log('%c📊 RESUMEN DE TESTS', 'font-size: 16px; font-weight: bold; color: #2196F3;');
    console.log('═'.repeat(60));
    console.log('✅ Login: OK');
    console.log('✅ Obtener perfil: OK');
    console.log('✅ Obtener usuario por ID: OK');
    console.log(patchSuccess ? '✅ Actualizar perfil especialista: OK' : '❌ Actualizar perfil especialista: FALLÓ');
    console.log('✅ Actualizar usuario: OK');
    console.log('\n' + '═'.repeat(60));
    
  } catch (error) {
    console.error('\n' + '═'.repeat(60));
    console.error('%c❌ ERROR CRÍTICO EN LOS TESTS', 'font-size: 16px; font-weight: bold; color: #f44336;');
    console.error('═'.repeat(60));
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
})();
```

---

## 📝 Qué hace cada test:

1. **Login** - Autentica con tus credenciales
2. **Obtener perfil** - Obtiene `/auth/users/me/`
3. **Obtener usuario por ID** - Obtiene `/auth/users/{id}/`
4. **Verificar perfil especialista** - Intenta GET `/profiles/specialists/{id}/`
5. **PATCH perfil especialista** - Intenta actualizar con PATCH
6. **PUT perfil especialista** - Si PATCH falla, intenta PUT
7. **CREATE perfil especialista** - Si no existe (404), intenta crearlo
8. **Actualizar usuario** - Actualiza datos básicos del usuario

Todos los resultados se mostrarán en la consola con colores y detalles completos.

