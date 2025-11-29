# Configuración del Agente de Voz IA

## ⚠️ IMPORTANTE: Configurar la API Key

Para que el agente de voz funcione, necesitas crear un archivo `.env.local` en la carpeta `frontend/agrovet/` con la siguiente línea:

```
VITE_ELEVEN_KEY=sk_7c2493cc118efc6b02bd85ac839ef97ad3b5d452f53e72e9
```

## Pasos para configurar:

1. **Crear el archivo `.env.local`**:
   - Ve a la carpeta: `frontend/agrovet/`
   - Crea un archivo llamado `.env.local` (sin comillas)
   - Agrega la línea: `VITE_ELEVEN_KEY=sk_7c2493cc118efc6b02bd85ac839ef97ad3b5d452f53e72e9`

2. **Reiniciar el servidor de desarrollo**:
   - Detén el servidor (Ctrl+C)
   - Inícialo de nuevo con `npm run dev`
   - Las variables de entorno solo se cargan al iniciar el servidor

3. **Probar la conexión**:
   - Ve al Dashboard
   - Haz clic en "IA" en el sidebar
   - Presiona el botón "🔧 Probar ElevenLabs"
   - Deberías ver mensajes de éxito si todo está configurado correctamente

## Problemas comunes:

### Error 401 (Unauthorized)
- **Causa**: API Key no configurada o inválida
- **Solución**: Verifica que el archivo `.env.local` exista y tenga la API key correcta
- **Solución**: Reinicia el servidor después de crear/modificar `.env.local`

### Error "no-speech"
- **Causa**: Normal cuando no hay audio detectado
- **Solución**: Este error es normal y no afecta el funcionamiento. Solo habla cuando el micrófono esté activo.

### El micrófono no funciona
- **Causa**: Permisos del navegador
- **Solución**: Permite el acceso al micrófono cuando el navegador lo solicite
- **Solución**: Verifica los permisos en la configuración del navegador

## Uso:

1. Presiona el botón del micrófono (verde) para activar
2. Habla claramente
3. El agente procesará tu mensaje y responderá con voz sintetizada
4. La esfera negra reaccionará al audio en tiempo real








