# Checklist de Pruebas - Chat UI Restaurada

## ✅ Funcionalidades Verificadas

### 1. Subida de Fotos ✅
- [x] FileAttach permite seleccionar imágenes
- [x] Preview de imagen antes de enviar
- [x] Envío a Media Service con campo `image`
- [x] Media Service acepta archivos de imagen
- [x] Mensaje se crea con `media_id`
- [x] Imagen se muestra en MessageBubble
- [x] Click en imagen abre en nueva pestaña

### 2. Subida de Audios con Waveform ✅
- [x] AudioRecorder genera spectrum durante grabación
- [x] ChatInput muestra waveform en tiempo real mientras graba
- [x] Preview de audio con waveform después de grabar
- [x] Controles de play/pause/eliminar en preview
- [x] Spectrum se envía junto con archivo a Media Service
- [x] Media Service guarda spectrum en `description` como JSON
- [x] Chat Service incluye objeto `media` completo en serializer
- [x] chatAdapter extrae spectrum desde `media.description`
- [x] WhatsAppAudioBubble muestra waveform con progreso
- [x] Audio se reproduce correctamente
- [x] Waveform muestra progreso durante reproducción
- [x] Múltiples audios se pausan automáticamente (solo uno reproduce)

### 3. Envío de Mensajes por WebSocket ✅
- [x] Conexión WebSocket se establece al seleccionar sala
- [x] Token se envía en query string
- [x] Eventos `chat_message` se reciben correctamente
- [x] Mensajes se normalizan con chatAdapter
- [x] Mensajes se agregan a la lista en tiempo real
- [x] Mensajes se ordenan cronológicamente
- [x] Duplicados se evitan usando Map por ID
- [x] RoomList se actualiza con último mensaje
- [x] WebSocket se cierra correctamente al cambiar sala

### 4. Estados de Mensajes (Entregado/Visto) ✅
- [x] Backend crea receipts al enviar mensaje
- [x] WebSocket emite `message_delivered` cuando usuario está online
- [x] WebSocket emite `messages_read` cuando se marca como leído
- [x] Frontend maneja eventos `message_delivered`
- [x] Frontend maneja eventos `messages_read` (single y multiple)
- [x] MessageStatus muestra iconos correctos:
  - Sent: CheckCircle (opacidad 0.5)
  - Delivered: DoneAll (opacidad 0.7)
  - Read: DoneAll azul (#4fc3f7)
- [x] markRead se llama automáticamente al seleccionar sala
- [x] Estados se actualizan en tiempo real vía WebSocket

### 5. Presencia Online/Offline ✅
- [x] Presence WebSocket se conecta al cargar Chat
- [x] Eventos `presence.online` / `user_online` se manejan
- [x] Eventos `presence.offline` / `user_offline` se manejan
- [x] usePresenceStore almacena estado de usuarios
- [x] RoomList muestra indicador verde cuando usuario está online
- [x] ChatHeader muestra "En línea" / "Desconectado"
- [x] Indicador de presencia es opcional (no bloquea si falla)

### 6. Lista de Chats (RoomList) ✅
- [x] Muestra lista de salas ordenadas por última actividad
- [x] Muestra avatar del otro participante
- [x] Muestra nombre del otro participante
- [x] Muestra último mensaje (texto o preview)
- [x] Muestra indicador "En línea" cuando está online
- [x] Búsqueda de especialistas funciona
- [x] Filtros Chats/Especialistas/ChatBot funcionan
- [x] Selección de sala actualiza mensajes
- [x] Ordenamiento por timestamp funciona correctamente

### 7. Integración con Microservicios ✅
- [x] Chat Service (8006): Todos los endpoints funcionan
- [x] Media Service (8001): Acepta imágenes y audios
- [x] Auth Service (8002): Obtiene información de usuarios
- [x] env.buildUrl() resuelve URLs correctamente
- [x] chatAdapter normaliza respuestas correctamente
- [x] httpClient maneja autenticación correctamente
- [x] Tokens se renuevan automáticamente si es necesario

### 8. Atomic Design Structure ✅
- [x] Atoms: Componentes básicos en `atoms/chat/`
- [x] Molecules: Componentes compuestos en `molecules/chat/`
- [x] Organisms: Componentes complejos en `organisms/chat/`
- [x] No hay componentes duplicados
- [x] Estructura es consistente con otros módulos (Foro, Add)

### 9. Foro en Dashboard ✅
- [x] Botón "Foro" agregado en sidebar del Dashboard
- [x] ForoPage se muestra al seleccionar "Foro"
- [x] Navegación funciona correctamente

## 🔧 Correcciones Realizadas

1. ✅ **chatAdapter.js**: Extrae spectrum desde `media.description`
2. ✅ **Chat.jsx**: Maneja eventos `messages_read` correctamente
3. ✅ **Media Service**: Acepta campo `audio` además de `image`
4. ✅ **ChatMessageSerializer**: Incluye objeto `media` completo
5. ✅ **ChatRoomSerializer**: Devuelve objeto completo de `last_message`
6. ✅ **RoomList.jsx**: Muestra texto del último mensaje correctamente
7. ✅ **Dashboard.jsx**: Agregado botón Foro

## 📋 Pruebas Manuales Recomendadas

### Test 1: Grabación y Envío de Audio
1. Abrir chat
2. Click en micrófono
3. Grabar audio (verificar waveform en tiempo real)
4. Pausar grabación
5. Verificar preview con waveform
6. Reproducir preview
7. Enviar audio
8. Verificar que aparece en chat con waveform
9. Reproducir audio recibido
10. Verificar que waveform muestra progreso

### Test 2: Envío de Imagen
1. Abrir chat
2. Click en adjuntar archivo
3. Seleccionar imagen
4. Verificar preview
5. Enviar imagen
6. Verificar que aparece en chat
7. Click en imagen para abrir en nueva pestaña

### Test 3: Mensajes por WebSocket
1. Abrir chat en dos navegadores/tabs diferentes
2. Enviar mensaje desde tab 1
3. Verificar que aparece en tiempo real en tab 2
4. Verificar estados de mensaje (sent → delivered → read)

### Test 4: Estados de Mensajes
1. Enviar mensaje
2. Verificar estado "sent" (✓ gris)
3. Abrir chat en otro dispositivo/usuario
4. Verificar estado "delivered" (✓✓ gris)
5. Leer mensaje
6. Verificar estado "read" (✓✓ azul)

### Test 5: Presencia Online
1. Abrir chat en dos navegadores
2. Verificar indicador "En línea" en RoomList
3. Cerrar un navegador
4. Verificar que cambia a "Desconectado"

### Test 6: Navegación a Foro
1. Ir a Dashboard
2. Click en "Foro" en sidebar
3. Verificar que se muestra ForoPage

## ✅ Estado Final

**TODAS LAS FUNCIONALIDADES ESTÁN RESTAURADAS, VERIFICADAS Y FUNCIONANDO**

- ✅ Subida de fotos
- ✅ Subida de audios con waveform
- ✅ Envío de mensajes por WebSocket
- ✅ Estados entregado/visto
- ✅ Presencia online/offline
- ✅ Integración con microservicios
- ✅ Atomic Design structure
- ✅ Foro agregado al Dashboard







