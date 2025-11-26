# Configuración de ElevenLabs API

## Pasos para configurar correctamente la API key

### 1. Obtener tu API Key
1. Ve a https://elevenlabs.io/app/settings/api-keys
2. Crea una nueva API key o copia una existente
3. **IMPORTANTE**: Copia la key completa sin espacios adicionales

### 2. Configurar el archivo .env.local

Crea o edita el archivo `.env.local` en la raíz del proyecto `frontend/agrovet/`:

```env
VITE_ELEVEN_KEY=sk_a70e2cf3dbd9f896604d85c9b119bc07ea55eb901f93078e
```

**⚠️ CRÍTICO:**
- NO pongas espacios antes o después del `=`
- NO pongas comillas alrededor de la key
- NO pongas espacios dentro de la key
- La key debe empezar con `sk_`
- La key debe tener aproximadamente 51 caracteres

### 3. Ejemplo correcto vs incorrecto

✅ **CORRECTO:**
```env
VITE_ELEVEN_KEY=sk_fc74195ebb8b4a8c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5
```

❌ **INCORRECTO (con espacios):**
```env
VITE_ELEVEN_KEY = sk_fc74195ebb8b4a8c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5
```

❌ **INCORRECTO (con comillas):**
```env
VITE_ELEVEN_KEY="sk_fc74195ebb8b4a8c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5"
```

❌ **INCORRECTO (con espacios dentro):**
```env
VITE_ELEVEN_KEY=sk_fc74195 ebb8b4a8c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5
```

### 4. Reiniciar el servidor

**IMPORTANTE**: Después de crear o modificar `.env.local`, DEBES:
1. Detener el servidor de desarrollo (Ctrl+C)
2. Reiniciarlo completamente
3. Las variables de entorno solo se cargan al iniciar el servidor

### 5. Verificar que funciona

Cuando el servidor inicie, deberías ver en la consola:
```
✅ VITE_ELEVEN_KEY cargada correctamente
   Key preview: sk_fc74195...480d5
🔑 API Key procesada: sk_fc74195...480d5 (51 chars)
   Key sin espacios: ✅
   Formato correcto: ✅
```

Si ves errores o advertencias, revisa:
- Que el archivo `.env.local` esté en la raíz de `frontend/agrovet/`
- Que no haya espacios en la key
- Que la key empiece con `sk_`
- Que hayas reiniciado el servidor

### 6. Solución de problemas

**Error 401 (Unauthorized):**
- Verifica que la key sea válida en https://elevenlabs.io/app/settings/api-keys
- Verifica que no haya espacios en el archivo `.env.local`
- Asegúrate de haber reiniciado el servidor después de cambiar el archivo
- Verifica que la key no haya expirado

**La key no se carga:**
- Verifica que el archivo se llame exactamente `.env.local` (con el punto al inicio)
- Verifica que esté en `frontend/agrovet/.env.local`
- Reinicia el servidor completamente

