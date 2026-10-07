// Script de pruebas para editar usuario
// Ejecutar en la consola del navegador después de cargar la aplicación

(async function testUserEditing() {
  console.log('🧪 Iniciando tests de edición de usuario...\n');
  
  const BASE_AUTH = 'http://127.0.0.1:8002/api';
  const BASE_PROFILES = 'http://127.0.0.1:8003/api';
  
  const credentials = {
    phone_number: '82397291',
    password: 'Daniel123.'
  };
  
  let token = null;
  let userId = null;
  let userData = null;
  
  // Helper para hacer peticiones
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
    
    try {
      console.log(`📤 ${options.method || 'GET'} ${url}`);
      if (rest.body && typeof rest.body === 'string') {
        console.log('   Body:', rest.body.substring(0, 200));
      }
      
      const res = await fetch(url, {
        ...rest,
        headers: fetchHeaders,
      });
      
      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { raw: text };
      }
      
      console.log(`📥 Status: ${res.status} ${res.statusText}`);
      console.log('   Response:', JSON.stringify(data, null, 2).substring(0, 500));
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${data.detail || data.error || data.message || res.statusText}`);
      }
      
      return data;
    } catch (error) {
      console.error(`❌ Error:`, error.message);
      throw error;
    }
  }
  
  try {
    // 1. Login
    console.log('\n1️⃣ TEST: Login');
    console.log('─'.repeat(50));
    const loginResponse = await request(`${BASE_AUTH}/auth/login/`, {
      method: 'POST',
      body: credentials,
    });
    
    token = loginResponse.access || loginResponse.token || loginResponse.access_token;
    if (!token) {
      throw new Error('No se recibió token en el login');
    }
    console.log('✅ Login exitoso');
    console.log('   Token (masked):', token.substring(0, 20) + '...');
    
    // 2. Obtener perfil del usuario
    console.log('\n2️⃣ TEST: Obtener perfil del usuario');
    console.log('─'.repeat(50));
    const profileResponse = await request(`${BASE_AUTH}/auth/users/me/`, {
      method: 'GET',
    });
    
    userId = profileResponse.id;
    userData = profileResponse;
    console.log('✅ Perfil obtenido');
    console.log('   User ID:', userId);
    console.log('   Role:', profileResponse.role);
    console.log('   Specialist Profile:', profileResponse.specialist_profile ? 'Existe' : 'No existe');
    
    if (profileResponse.specialist_profile) {
      console.log('   Specialist Profile Data:', JSON.stringify(profileResponse.specialist_profile, null, 2));
    }
    
    // 3. Obtener usuario por ID
    console.log('\n3️⃣ TEST: Obtener usuario por ID');
    console.log('─'.repeat(50));
    const userByIdResponse = await request(`${BASE_AUTH}/auth/users/${userId}/`, {
      method: 'GET',
    });
    console.log('✅ Usuario obtenido por ID');
    console.log('   Full Name:', userByIdResponse.full_name);
    console.log('   Email:', userByIdResponse.email);
    
    // 4. Verificar si existe perfil de especialista
    console.log('\n4️⃣ TEST: Verificar perfil de especialista');
    console.log('─'.repeat(50));
    try {
      const specialistResponse = await request(`${BASE_PROFILES}/profiles/specialists/${userId}/`, {
        method: 'GET',
      });
      console.log('✅ Perfil de especialista encontrado');
      console.log('   Specialist Data:', JSON.stringify(specialistResponse, null, 2));
    } catch (e) {
      console.log('⚠️ Perfil de especialista no encontrado (404) o error:', e.message);
    }
    
    // 5. Test PATCH al perfil de especialista
    console.log('\n5️⃣ TEST: PATCH al perfil de especialista');
    console.log('─'.repeat(50));
    const testSpecialistData = {
      user_display: userData.specialist_profile?.user_display || 'Test Display Name',
      profession: userData.specialist_profile?.profession || 'Test Profession',
      experience_years: userData.specialist_profile?.experience_years || 5,
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
    
    console.log('   Enviando datos:', JSON.stringify(testSpecialistData, null, 2));
    
    try {
      const patchResponse = await request(`${BASE_PROFILES}/profiles/specialists/${userId}/`, {
        method: 'PATCH',
        body: testSpecialistData,
      });
      console.log('✅ PATCH exitoso');
      console.log('   Response:', JSON.stringify(patchResponse, null, 2));
    } catch (e) {
      console.error('❌ Error en PATCH:', e.message);
      console.log('   Intentando PUT como fallback...');
      
      // 6. Test PUT como fallback
      console.log('\n6️⃣ TEST: PUT al perfil de especialista (fallback)');
      console.log('─'.repeat(50));
      try {
        const putResponse = await request(`${BASE_PROFILES}/profiles/specialists/${userId}/`, {
          method: 'PUT',
          body: testSpecialistData,
        });
        console.log('✅ PUT exitoso');
        console.log('   Response:', JSON.stringify(putResponse, null, 2));
      } catch (e2) {
        console.error('❌ Error en PUT:', e2.message);
        
        // 7. Test CREATE si no existe
        if (e2.message.includes('404') || e.message.includes('404')) {
          console.log('\n7️⃣ TEST: CREATE perfil de especialista (no existe)');
          console.log('─'.repeat(50));
          try {
            const createResponse = await request(`${BASE_PROFILES}/profiles/specialists/`, {
              method: 'POST',
              body: testSpecialistData,
            });
            console.log('✅ CREATE exitoso');
            console.log('   Response:', JSON.stringify(createResponse, null, 2));
          } catch (e3) {
            console.error('❌ Error en CREATE:', e3.message);
          }
        }
      }
    }
    
    // 8. Test actualizar usuario
    console.log('\n8️⃣ TEST: Actualizar usuario (PATCH)');
    console.log('─'.repeat(50));
    const updateUserData = {
      full_name: userData.full_name || 'Test User',
      bio: userData.bio || 'Test bio',
    };
    
    try {
      const updateResponse = await request(`${BASE_AUTH}/auth/users/${userId}/`, {
        method: 'PATCH',
        body: updateUserData,
      });
      console.log('✅ Usuario actualizado');
      console.log('   Response:', JSON.stringify(updateResponse, null, 2));
    } catch (e) {
      console.error('❌ Error actualizando usuario:', e.message);
    }
    
    console.log('\n✅ Todos los tests completados');
    console.log('─'.repeat(50));
    
  } catch (error) {
    console.error('\n❌ Error general en los tests:', error);
    console.error('   Stack:', error.stack);
  }
})();

