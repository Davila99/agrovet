// Script simplificado para ejecutar en la consola del navegador
// Usa los servicios de la aplicación directamente

(async function testFromApp() {
  console.log('🧪 Iniciando tests usando servicios de la app...\n');
  
  // Importar servicios (si están disponibles globalmente)
  // O usar directamente desde window si están expuestos
  
  try {
    // 1. Login usando authAPI
    console.log('1️⃣ TEST: Login');
    console.log('─'.repeat(50));
    
    // Necesitamos importar o acceder a authAPI
    // Si usas módulos ES6, puedes hacer:
    const { authAPI, profilesAPI } = await import('./src/services/endpoints/index.js');
    
    const loginResult = await authAPI.login({
      phone_number: '82397291',
      password: 'Daniel123.'
    });
    
    console.log('✅ Login exitoso');
    console.log('   Response:', loginResult);
    
    // 2. Obtener perfil
    console.log('\n2️⃣ TEST: Obtener perfil');
    console.log('─'.repeat(50));
    const profile = await authAPI.profile();
    console.log('✅ Perfil obtenido');
    console.log('   User ID:', profile.id);
    console.log('   Full Name:', profile.full_name);
    console.log('   Role:', profile.role);
    console.log('   Specialist Profile:', profile.specialist_profile);
    
    const userId = profile.id;
    
    // 3. Obtener usuario por ID
    console.log('\n3️⃣ TEST: Obtener usuario por ID');
    console.log('─'.repeat(50));
    const userById = await authAPI.userById(userId);
    console.log('✅ Usuario obtenido por ID');
    console.log('   Data:', userById);
    
    // 4. Test actualizar perfil de especialista
    if (userById.specialist_profile || userById.role?.toLowerCase() === 'specialist') {
      console.log('\n4️⃣ TEST: Actualizar perfil de especialista');
      console.log('─'.repeat(50));
      
      const specialistData = {
        user_display: userById.specialist_profile?.user_display || 'Test Display',
        profession: userById.specialist_profile?.profession || 'Test Profession',
        experience_years: userById.specialist_profile?.experience_years || 5,
        about_us: userById.specialist_profile?.about_us || 'Test about',
        can_give_consultations: userById.specialist_profile?.can_give_consultations ?? true,
        can_offer_online_services: userById.specialist_profile?.can_offer_online_services ?? false,
      };
      
      // Limpiar datos
      Object.keys(specialistData).forEach(key => {
        const value = specialistData[key];
        if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
          delete specialistData[key];
        }
      });
      
      console.log('   Enviando:', specialistData);
      
      try {
        const patchResult = await profilesAPI.patchSpecialistByUser(userId, specialistData);
        console.log('✅ PATCH exitoso');
        console.log('   Response:', patchResult);
      } catch (e) {
        console.error('❌ Error en PATCH:', e);
        console.log('   Status:', e.status);
        console.log('   Body:', e.body);
        console.log('   Raw:', e.raw);
        
        // Intentar PUT
        try {
          console.log('\n   Intentando PUT...');
          const putResult = await profilesAPI.putSpecialistByUser(userId, specialistData);
          console.log('✅ PUT exitoso');
          console.log('   Response:', putResult);
        } catch (e2) {
          console.error('❌ Error en PUT:', e2);
          console.log('   Status:', e2.status);
          console.log('   Body:', e2.body);
        }
      }
    }
    
    // 5. Test actualizar usuario
    console.log('\n5️⃣ TEST: Actualizar usuario');
    console.log('─'.repeat(50));
    const updateData = {
      full_name: userById.full_name,
      bio: userById.bio || 'Test bio updated',
    };
    
    try {
      const updateResult = await authAPI.updateUser(userId, updateData);
      console.log('✅ Usuario actualizado');
      console.log('   Response:', updateResult);
    } catch (e) {
      console.error('❌ Error actualizando usuario:', e);
      console.log('   Status:', e.status);
      console.log('   Body:', e.body);
    }
    
    console.log('\n✅ Todos los tests completados');
    
  } catch (error) {
    console.error('\n❌ Error en los tests:', error);
    console.error('   Stack:', error.stack);
  }
})();

