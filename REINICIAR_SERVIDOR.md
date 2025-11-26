# ⚠️ IMPORTANTE: Reiniciar Servidor después de crear .env.local

## Problema
Si ves el error **401 (Unauthorized)** al usar ElevenLabs, significa que las variables de entorno no se han cargado.

## Solución

### 1. Verificar que el archivo existe
El archivo `.env.local` debe estar en: `frontend/agrovet/.env.local`

Contenido:
```
VITE_ELEVEN_KEY=sk_7c2493cc118efc6b02bd85ac839ef97ad3b5d452f53e72e9
```

### 2. REINICIAR el servidor de desarrollo

**⚠️ CRÍTICO**: Vite solo carga las variables de entorno cuando se INICIA el servidor.

```powershell
# Detener el servidor (Ctrl+C)
# Luego iniciar de nuevo:
cd frontend\agrovet
npm run dev
```

### 3. Verificar en la consola del navegador
Después de reiniciar, deberías ver:
```
✅ VITE_ELEVEN_KEY cargada correctamente
   Key preview: sk_7c2493c...e72e9
```

Si ves:
```
⚠️ VITE_ELEVEN_KEY no está configurada
```
Significa que el servidor no se reinició o el archivo no está en la ubicación correcta.

## Verificación rápida

1. ✅ Archivo `.env.local` existe en `frontend/agrovet/`
2. ✅ Contiene `VITE_ELEVEN_KEY=sk_...`
3. ✅ Servidor de desarrollo REINICIADO después de crear el archivo
4. ✅ Consola del navegador muestra "✅ VITE_ELEVEN_KEY cargada correctamente"

Si todos los pasos están correctos y aún ves el error 401, la API key podría estar expirada o ser inválida.


