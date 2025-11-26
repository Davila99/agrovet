import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import chatService from '../../services/endpoints/chat';
import chatAdapter from '../../services/adapters/chatAdapter';
import { normalizeStoredToken } from './chat/chatUtils';
import env from '../../services/env';
import usePresenceStore from '../../store/usePresenceStore';
import { fetchUsers } from '../../data/users';
import writingSound from '../../assets/mp3/writing.mp3';
import notificationSound from '../../assets/mp3/notification.mp3';
import RoomList from '../organisms/chat/RoomList';
import ChatHeader from '../organisms/chat/ChatHeader';
import MessageList from '../organisms/chat/MessageList';
import ChatInput from '../molecules/chat/ChatInput';

export default function Chat() {
    const [searchParams] = useSearchParams();
    const targetUserId = searchParams.get('userId');

    // State
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [ws, setWs] = useState(null);
    const [wsConnected, setWsConnected] = useState(false);
    const [sending, setSending] = useState(false);
    const [presenceWs, setPresenceWs] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [pendingAttachment, setPendingAttachment] = useState(null);
    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const [usersMap, setUsersMap] = useState({});
    const [viewMode, setViewMode] = useState('chats');
    const [specialistSearch, setSpecialistSearch] = useState('');

    const writingAudioRef = useRef(null);
    const notificationAudioRef = useRef(null);

    const rawToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const token = normalizeStoredToken(rawToken);

    // Get currentUserId from localStorage (Django tokens don't contain user data)
    const currentUserId = localStorage.getItem('userId') || sessionStorage.getItem('userId');

    const presenceStore = usePresenceStore(s => s.users || {});

    // Fetch all users for usersMap
    useEffect(() => {
        const loadUsers = async () => {
            if (!token) return;
            try {
                const usersData = await fetchUsers(token);
                const usersById = {};
                (usersData || []).forEach(user => {
                    if (user.id) {
                        usersById[user.id] = user;
                    }
                });
                setUsersMap(usersById);
            } catch (err) {
                console.warn('Could not load users map:', err);
            }
        };
        loadUsers();
    }, [token]);

    // Load rooms and presence on mount
    useEffect(() => {
        if (token) {
            loadRooms(token);
            connectPresence(token);
        }
        return () => {
            if (presenceWs) {
                try { presenceWs.close(); } catch (e) { }
            }
        };
    }, [token]);

    // WebSocket handling for selected room
    useEffect(() => {
        if (ws) {
            try { ws.close(); } catch (e) { }
            setWs(null);
            setWsConnected(false);
        }

        if (selectedRoom && token) {
            loadMessages(selectedRoom.id, token);
            connectWebSocket(selectedRoom.id, token);
            chatService.markRead(selectedRoom.id, token).catch(console.error);
        }

        return () => {
            if (ws) {
                try { ws.close(); } catch (e) { }
            }
        };
    }, [selectedRoom?.id, token]);

    const connectPresence = (authToken) => {
        try {
            const wsBase = env.getServiceUrl('WS') || 'ws://127.0.0.1:8006/ws';
            const wsUrl = `${wsBase}/presence/?token=${authToken}`;
            const websocket = new WebSocket(wsUrl);

            websocket.onopen = () => {
                console.log('Presence WebSocket conectado');
            };

            websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'presence.online' || data.type === 'user_online') {
                        const userId = data.user_id;
                        setOnlineUsers(prev => new Set([...prev, userId]));
                        if (usePresenceStore.getState) {
                            usePresenceStore.getState().updateUser(userId, { online: true });
                        }
                    } else if (data.type === 'presence.offline' || data.type === 'user_offline') {
                        const userId = data.user_id;
                        setOnlineUsers(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(userId);
                            return newSet;
                        });
                        if (usePresenceStore.getState) {
                            usePresenceStore.getState().updateUser(userId, { online: false });
                        }
                    }
                } catch (error) {
                    console.error('Error procesando presencia:', error);
                }
            };

            websocket.onerror = () => {
                console.warn('Presence WebSocket no disponible (opcional)');
            };

            websocket.onclose = () => {
                console.log('Presence WebSocket desconectado');
            };

            setPresenceWs(websocket);
        } catch (error) {
            console.warn('No se pudo conectar a Presence WebSocket (opcional):', error);
        }
    };

    const loadRooms = async (authToken) => {
        try {
            setLoading(true);
            setError(null);
            const roomsData = await chatService.getRooms(authToken);
            const normalizedRooms = Array.isArray(roomsData) ? roomsData : [];
            setRooms(normalizedRooms);

            if (targetUserId && normalizedRooms.length > 0) {
                const existingRoom = normalizedRooms.find(r =>
                    r.participants?.some(p => p.id === parseInt(targetUserId))
                );

                if (existingRoom) {
                    setSelectedRoom(existingRoom);
                } else if (currentUserId) {
                    const newRoom = await chatService.getOrCreatePrivateRoom(
                        parseInt(currentUserId),
                        parseInt(targetUserId),
                        authToken
                    );
                    setSelectedRoom(newRoom);
                    await loadRooms(authToken);
                }
            }
        } catch (error) {
            console.error('Error cargando salas:', error);
            setError('Error al cargar las conversaciones. Por favor, recarga la página.');
            setRooms([]);
        } finally {
            setLoading(false);
        }
    };

    const updateRoomLastMessage = (roomId, message) => {
        setRooms(prev => prev.map(room => {
            if (room.id === roomId) {
                return {
                    ...room,
                    last_message: message,
                    updated_at: message.created_at || new Date().toISOString()
                };
            }
            return room;
        }));
    };

    const loadMessages = async (roomId, authToken) => {
        try {
            const messagesData = await chatService.getMessages(roomId, authToken);
            const normalizedMessages = Array.isArray(messagesData) ? messagesData : [];
            const uniqueMessages = normalizedMessages.reduce((acc, msg) => {
                const msgId = msg.id;
                if (msgId && !acc.find(m => m.id === msgId)) {
                    acc.push(msg);
                }
                return acc;
            }, []);
            setMessages(uniqueMessages.sort((a, b) => {
                const timeA = new Date(a.created_at || 0).getTime();
                const timeB = new Date(b.created_at || 0).getTime();
                return timeA - timeB;
            }));
        } catch (error) {
            console.error('Error cargando mensajes:', error);
        }
    };

    const connectWebSocket = (roomId, authToken) => {
        const wsBase = env.getServiceUrl('WS') || 'ws://127.0.0.1:8006/ws';
        const wsUrl = `${wsBase}/chat/${roomId}/?token=${authToken}`;
        const websocket = new WebSocket(wsUrl);

        websocket.onopen = () => {
            console.log('WebSocket conectado');
            setWsConnected(true);
        };

        websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'chat_message' || data.type === 'chat.message') {
                    const normalizedMessage = chatAdapter.normalizeMessage(data);

                    if (!normalizedMessage.id) {
                        console.warn('Mensaje WebSocket sin ID:', data);
                        return;
                    }

                    const msgSenderId = normalizedMessage.sender?.id || normalizedMessage.sender_id;
                    const isFromMe = msgSenderId && parseInt(msgSenderId) === parseInt(currentUserId);

                    // Play notification sound if message is not from me and tab is hidden
                    if (!isFromMe && document.hidden) {
                        try {
                            if (notificationAudioRef.current) {
                                notificationAudioRef.current.currentTime = 0;
                                notificationAudioRef.current.play().catch(() => { });
                            }
                        } catch (e) { }
                    }

                    setMessages(prev => {
                        const messageMap = new Map();
                        prev.forEach(msg => {
                            if (msg.id) {
                                messageMap.set(msg.id, msg);
                            }
                        });
                        if (!messageMap.has(normalizedMessage.id)) {
                            messageMap.set(normalizedMessage.id, normalizedMessage);
                        } else {
                            const existing = messageMap.get(normalizedMessage.id);
                            messageMap.set(normalizedMessage.id, { ...existing, ...normalizedMessage });
                        }
                        return Array.from(messageMap.values()).sort((a, b) => {
                            const timeA = new Date(a.created_at || 0).getTime();
                            const timeB = new Date(b.created_at || 0).getTime();
                            return timeA - timeB;
                        });
                    });

                    updateRoomLastMessage(roomId, normalizedMessage);

                    if (token) {
                        loadRooms(token).catch(console.error);
                    }
                } else if (data.type === 'message_delivered' || data.type === 'message.read' || data.type === 'messages_read') {
                    if (data.type === 'messages_read' && Array.isArray(data.message_ids)) {
                        setMessages(prev => prev.map(msg => {
                            if (data.message_ids.includes(msg.id)) {
                                return {
                                    ...msg,
                                    read: true,
                                    is_read: true,
                                };
                            }
                            return msg;
                        }));
                    } else {
                        setMessages(prev => prev.map(msg => {
                            if (msg.id === data.message_id) {
                                return {
                                    ...msg,
                                    delivered: data.type === 'message_delivered' ? true : msg.delivered,
                                    read: (data.type === 'message.read' || data.type === 'messages_read') ? true : msg.read,
                                    is_read: (data.type === 'message.read' || data.type === 'messages_read') ? true : msg.is_read,
                                };
                            }
                            return msg;
                        }));
                    }
                }
            } catch (error) {
                console.error('Error procesando mensaje WebSocket:', error);
            }
        };

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            setWsConnected(false);
        };

        websocket.onclose = () => {
            console.log('WebSocket desconectado');
            setWsConnected(false);
        };

        setWs(websocket);
    };

    const handleSend = async () => {
        if (!text.trim() && !pendingAttachment) return;
        if (!selectedRoom || !token) return;

        try {
            setSending(true);

            if (writingAudioRef.current) {
                writingAudioRef.current.currentTime = 0;
                writingAudioRef.current.play().catch(() => { });
            }

            let sentMessage = null;

            if (pendingAttachment && pendingAttachment.file) {
                const fileType = pendingAttachment.file.type?.split('/')[0] || 'image';
                const spectrum = pendingAttachment.spectrum || null;
                let previewUrl = pendingAttachment.previewUrl;

                // Asegurar que hay previewUrl para imágenes y videos
                if (!previewUrl && (fileType === 'image' || fileType === 'video')) {
                    try {
                        previewUrl = URL.createObjectURL(pendingAttachment.file);
                    } catch (e) {
                        console.warn('[Chat] No se pudo crear preview URL:', e);
                    }
                }



                // Agregar mensaje optimísticamente con preview URL
                const tempId = `temp_${Date.now()}_${Math.random()}`;
                const optimisticMessage = {
                    id: tempId,
                    text: text.trim() || '',
                    sender: { id: parseInt(currentUserId) },
                    sender_id: parseInt(currentUserId),
                    created_at: new Date().toISOString(),
                    room_id: selectedRoom.id,
                    media_url: previewUrl, // Usar preview URL temporalmente
                    attachments: [{
                        url: previewUrl,
                        type: fileType === 'audio' ? 'audio' : (fileType === 'video' ? 'video' : 'image')
                    }],
                    media_spectrum: spectrum,
                    is_uploading: true, // Flag para mostrar indicador de carga
                    sent: true,
                    delivered: false,
                    read: false,
                };

                setMessages(prev => [...prev, optimisticMessage]);

                if (fileType === 'audio') {
                    sentMessage = await chatService.sendMessageWithImage(
                        selectedRoom.id,
                        pendingAttachment.file,
                        token,
                        text.trim() || '',
                        spectrum
                    );
                } else {
                    sentMessage = await chatService.sendMessageWithImage(
                        selectedRoom.id,
                        pendingAttachment.file,
                        token,
                        text.trim() || ''
                    );
                }

                // Reemplazar mensaje temporal con el real
                if (sentMessage && sentMessage.id) {
                    setMessages(prev => {
                        // Encontrar el mensaje temporal para preservar su previewUrl
                        const tempMessage = prev.find(msg => msg.id === tempId);
                        const tempPreviewUrl = tempMessage?.media_url;
                        const tempAttachments = tempMessage?.attachments;

                        // Primero filtrar el mensaje temporal
                        const withoutTemp = prev.filter(msg => msg.id !== tempId);
                        const serverExists = withoutTemp.find(m => m.id === sentMessage.id);

                        // Preparar el mensaje del servidor, preservando el preview si no tiene media_url propio
                        const serverMessage = {
                            ...sentMessage,
                            is_uploading: false,
                            // Si el servidor aún no tiene media_url, usar el preview temporal
                            media_url: sentMessage.media_url || tempPreviewUrl,
                            attachments: sentMessage.attachments || tempAttachments
                        };

                        if (serverExists) {
                            // Si ya existe el mensaje del servidor, solo actualizarlo
                            return withoutTemp.map(msg =>
                                msg.id === sentMessage.id ? { ...msg, ...serverMessage } : msg
                            );
                        } else {
                            // Si no existe, agregarlo
                            return [...withoutTemp, serverMessage];
                        }
                    });
                } else {
                    // Si no hay respuesta, remover el mensaje temporal
                    setMessages(prev => prev.filter(msg => msg.id !== tempId));
                }

                setPendingAttachment(null);
            } else if (text.trim()) {
                sentMessage = await chatService.sendMessage(selectedRoom.id, text.trim(), token);

                // Agregar mensaje optimísticamente
                if (sentMessage && sentMessage.id) {
                    setMessages(prev => {
                        const exists = prev.find(m => m.id === sentMessage.id);
                        if (!exists) {
                            return [...prev, sentMessage];
                        }
                        return prev;
                    });
                }
            }

            setText('');

            if (token) {
                await loadRooms(token);
            }
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            // Remover mensaje temporal en caso de error
            setMessages(prev => prev.filter(msg => !msg.is_uploading || !msg.id?.toString().startsWith('temp_')));
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleAttach = (payload) => {
        setPendingAttachment(payload);
    };

    const handleCancelAttachment = () => {
        if (pendingAttachment?.previewUrl) {
            try {
                URL.revokeObjectURL(pendingAttachment.previewUrl);
            } catch (e) { }
        }
        setPendingAttachment(null);
    };

    const handleConfirmAttachment = async (payload) => {
        const attachment = payload || pendingAttachment;
        if (!attachment || !attachment.file || !selectedRoom || !token) return;

        try {
            setUploadingAttachment(true);
            const fileType = attachment.file.type?.split('/')[0] || 'image';
            const spectrum = attachment.spectrum || null;

            if (fileType === 'audio') {
                await chatService.sendMessageWithImage(
                    selectedRoom.id,
                    attachment.file,
                    token,
                    text.trim() || '',
                    spectrum
                );
            } else {
                await chatService.sendMessageWithImage(
                    selectedRoom.id,
                    attachment.file,
                    token,
                    text.trim() || ''
                );
            }

            setPendingAttachment(null);
            setText('');

            if (token) {
                await loadRooms(token);
            }
        } catch (error) {
            console.error('Error enviando archivo:', error);
        } finally {
            setUploadingAttachment(false);
        }
    };

    const getOtherParticipant = (room) => {
        if (!room.participants || !currentUserId) return null;
        const other = room.participants.find(p => {
            const pid = p.id || p.user_id || p.pk;
            return pid && String(pid) !== String(currentUserId);
        });
        return other;
    };

    const isUserOnline = (userId) => {
        if (!userId) return false;
        return onlineUsers.has(parseInt(userId)) ||
            (presenceStore[userId] && presenceStore[userId].online);
    };

    const computeLastTsForRoom = (room) => {
        try {
            if (room?.updated_at) return new Date(room.updated_at).getTime();
            if (room?.last_message?.created_at) return new Date(room.last_message.created_at).getTime();
            return 0;
        } catch (e) {
            return 0;
        }
    };

    const participant = selectedRoom ? getOtherParticipant(selectedRoom) : null;
    const participantOnline = participant ? isUserOnline(participant.id || participant.user_id || participant.pk) : false;



    return (
        <Box sx={{
            display: 'flex',
            height: '100%',
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
            bgcolor: '#f0f0f0',
            flexDirection: { xs: 'column', md: 'row' },
            position: 'relative',
            minWidth: 0,
            boxSizing: 'border-box',
            flexShrink: 0,
        }}>
            <audio ref={writingAudioRef} src={writingSound} preload="auto" />
            <audio ref={notificationAudioRef} src={notificationSound} preload="auto" />

            {/* Sidebar - Room List */}
            <Paper sx={{
                width: { xs: '100%', sm: '28%', md: '26%', lg: '24%' },
                maxWidth: { xs: '100%', sm: 500, md: 500, lg: 500 },
                minWidth: { xs: 0, sm: 300, md: 320 },
                height: { xs: selectedRoom ? '0' : '100%', md: '100%' },
                borderRight: { md: 1 },
                borderBottom: { xs: selectedRoom ? 1 : 0, md: 0 },
                borderColor: 'divider',
                display: { xs: selectedRoom ? 'none' : 'flex', md: 'flex' },
                flexDirection: 'column',
                overflow: 'hidden',
                bgcolor: '#ffffff',
                borderRadius: 0,
                position: { xs: 'absolute', md: 'relative' },
                zIndex: { xs: 1300, md: 1 },
                top: { xs: 0, md: 'auto' },
                left: { xs: 0, md: 'auto' },
                flexShrink: 0,
                boxSizing: 'border-box',
            }}>
                <RoomList
                    rooms={rooms}
                    activeId={selectedRoom?.id}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    specialistSearch={specialistSearch}
                    setSpecialistSearch={setSpecialistSearch}
                    onSelectChat={(roomId) => {
                        const room = rooms.find(r => String(r.id) === String(roomId));
                        if (room) setSelectedRoom(room);
                    }}
                    openOneToOne={async (specialist) => {
                        try {
                            if (!specialist || !specialist.id) {
                                console.warn('openOneToOne: specialist inválido', specialist);
                                return null;
                            }

                            const specialistId = parseInt(specialist.id);
                            if (!specialistId || !currentUserId) {
                                console.warn('openOneToOne: IDs inválidos', { specialistId, currentUserId });
                                return null;
                            }

                            // Buscar si ya existe una sala con este especialista
                            const existingRoom = rooms.find(r =>
                                r.participants?.some(p => p.id === specialistId)
                            );

                            if (existingRoom) {
                                // Si existe, seleccionarla
                                setSelectedRoom(existingRoom);
                                return existingRoom;
                            } else {
                                // Si no existe, crear una nueva sala
                                const newRoom = await chatService.getOrCreatePrivateRoom(
                                    parseInt(currentUserId),
                                    specialistId,
                                    token
                                );
                                
                                // Recargar las salas para tener la lista actualizada
                                await loadRooms(token);
                                
                                // Seleccionar la nueva sala
                                setSelectedRoom(newRoom);
                                
                                // Cambiar a la vista de chats
                                setViewMode('chats');
                                
                                return newRoom;
                            }
                        } catch (error) {
                            console.error('Error en openOneToOne:', error);
                            setError('Error al abrir la conversación. Por favor, intenta de nuevo.');
                            return null;
                        }
                    }}
                    isMd={true}
                    getCurrentUserId={() => currentUserId}
                    computeLastTsForRoom={computeLastTsForRoom}
                    isParticipantOnline={isUserOnline}
                    loading={loading}
                    error={error}
                    usersMap={usersMap}
                />
            </Paper>

            {/* Chat Area */}
            {selectedRoom ? (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <ChatHeader
                        participant={participant}
                        isOnline={participantOnline}
                        wsConnected={wsConnected}
                        onBack={() => setSelectedRoom(null)}
                        showBack={true}
                        usersMap={usersMap}
                    />
                    <MessageList
                        messages={messages}
                        currentUserId={currentUserId}
                    />
                    <ChatInput
                        text={text}
                        setText={setText}
                        handleSend={handleSend}
                        handleKeyDown={handleKeyDown}
                        onAttach={handleAttach}
                        pendingAttachment={pendingAttachment}
                        onCancelAttachment={handleCancelAttachment}
                        onConfirmAttachment={handleConfirmAttachment}
                        sending={sending}
                        uploadingAttachment={uploadingAttachment}
                    />
                </Box>
            ) : (
                <Box sx={{ p: 4, textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">
                        Selecciona una conversación o inicia una nueva
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
