import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import MessageStatus from '../../atoms/chat/MessageStatus';
import MessageTime from '../../atoms/chat/MessageTime';
import WhatsAppAudioBubble from './WhatsAppAudioBubble';
import VerificationBadge from '../../page/profile/molecules/VerificationBadge';
import PropTypes from 'prop-types';

export default function MessageItem({
    message,
    isOwn,
    currentUserId,
    showAvatar = true,
    isPrivateChat = false, // Para chats privados no mostrar nombre
    usersMap = {}
}) {
    const getMessageStatus = (msg) => {
        if (!msg.sender || msg.sender.id !== parseInt(currentUserId)) return null;
        if (msg.read || msg.is_read) return 'read';
        if (msg.delivered) return 'delivered';
        return 'sent';
    };

    const status = getMessageStatus(message);
    const senderName = message.sender?.full_name || message.sender?.username || message.sender?.name || 'Usuario';
    const avatarUrl = message.sender?.profile_picture || message.sender?.avatar || message.sender?.profile_picture_url;
    
    // Obtener datos del remitente para verificación
    const senderId = message.sender?.id || message.sender?.user_id || message.sender?.pk;
    const senderData = senderId && usersMap[senderId] ? usersMap[senderId] : message.sender || {};
    const isSpecialist = (senderData?.role || '').toString().toLowerCase() === 'specialist' || !!senderData?.specialist_profile;
    const verificationStatus = senderData?.specialist_profile?.verification_status || null;
    const verificationType = senderData?.specialist_profile?.verification_type || null;

    // Detectar si es mensaje de audio
    const mediaUrl = message.media_url || (message.attachments && message.attachments[0]?.url);
    const mediaType = mediaUrl ? (
        message.attachments?.[0]?.type ||
        (mediaUrl.match(/\.(mp4|webm|mov)$/i) ? 'video' :
            mediaUrl.match(/\.(mp3|wav|ogg|webm|m4a|aac)$/i) ? 'audio' : 'image')
    ) : null;
    const isAudio = mediaType === 'audio';
    const audioSpectrum = message.media_spectrum || message.spectrum || null;
    const audioDuration = message.media_duration || message.duration || 0;
    
    // Estado para manejar la carga de videos
    const [videoLoading, setVideoLoading] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const videoRef = React.useRef(null);
    
    // Detectar cuando el video está cargando o cargado
    useEffect(() => {
        if (mediaType === 'video' && mediaUrl && !isOwn) {
            setVideoLoading(true);
            setVideoLoaded(false);
            setVideoError(false);
            
            const video = videoRef.current;
            if (video) {
                const handleCanPlay = () => {
                    setVideoLoaded(true);
                    setVideoLoading(false);
                };
                
                const handleLoadStart = () => {
                    setVideoLoading(true);
                };
                
                const handleError = () => {
                    setVideoError(true);
                    setVideoLoading(false);
                };
                
                video.addEventListener('canplay', handleCanPlay);
                video.addEventListener('loadstart', handleLoadStart);
                video.addEventListener('error', handleError);
                
                return () => {
                    video.removeEventListener('canplay', handleCanPlay);
                    video.removeEventListener('loadstart', handleLoadStart);
                    video.removeEventListener('error', handleError);
                };
            }
        } else if (mediaType === 'video' && isOwn) {
            // Para mensajes propios, el video ya está cargado si no está subiendo
            setVideoLoaded(!message.is_uploading && !message.media_uploading);
            setVideoLoading(message.is_uploading || message.media_uploading);
        }
    }, [mediaType, mediaUrl, isOwn, message.is_uploading, message.media_uploading]);
    
    // Formatear tamaño del archivo
    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };
    
    const fileSize = message.media_file_size || message.file_size || null;
    const fileSizeFormatted = fileSize ? formatFileSize(fileSize) : '';

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                mb: 0.75,
            }}
        >
            {isAudio ? (
                <Box sx={{ maxWidth: '85%', my: '2px' }}>
                    <WhatsAppAudioBubble
                        src={mediaUrl}
                        avatarUrl={isOwn ? avatarUrl : null}
                        fromMe={isOwn}
                        duration={audioDuration}
                        waveformData={audioSpectrum}
                        read={message.read || message.is_read}
                        receipts={message.receipts || []}
                        currentUserId={currentUserId}
                        id={message.id}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 0.5, gap: 0.5, px: 1 }}>
                        <MessageTime timestamp={message.created_at || message.timestamp} />
                        {isOwn && (
                            <MessageStatus status={status} />
                        )}
                    </Box>
                </Box>
            ) : (
                <Paper
                    elevation={0}
                    sx={{
                        px: '9px',
                        py: '6px',
                        bgcolor: isOwn ? '#d9fdd3' : '#FFFFFF',
                        borderRadius: isOwn ? '7.5px 7.5px 1px 7.5px' : '7.5px 7.5px 7.5px 1px',
                        maxWidth: '85%',
                        width: 'fit-content',
                        my: '2px',
                        boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        border: isOwn ? 'none' : '1px solid rgba(0,0,0,0.08)',
                    }}
                >
                    {mediaUrl && (
                        <Box sx={{ mb: message.text ? 1 : 0, position: 'relative' }}>
                            {mediaType === 'image' && (
                                <>
                                    <Box
                                        component="img"
                                        src={mediaUrl}
                                        alt={message.text || 'image'}
                                        sx={{
                                            maxWidth: '280px',
                                            maxHeight: '200px',
                                            width: 'auto',
                                            height: 'auto',
                                            borderRadius: 1.5,
                                            display: 'block',
                                            objectFit: 'contain',
                                            opacity: message.is_uploading ? 0.6 : 1
                                        }}
                                    />
                                    {message.is_uploading && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                            }}
                                        >
                                            <CircularProgress
                                                size={40}
                                                sx={{ color: '#fff' }}
                                                variant={message.upload_progress ? 'determinate' : 'indeterminate'}
                                                value={message.upload_progress || 0}
                                            />
                                        </Box>
                                    )}
                                </>
                            )}
                            {mediaType === 'video' && (
                                <>
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            maxWidth: '280px',
                                            maxHeight: '200px',
                                            borderRadius: 1.5,
                                            overflow: 'hidden',
                                            backgroundColor: '#000',
                                        }}
                                    >
                                        <Box
                                            component="video"
                                            ref={videoRef}
                                            src={mediaUrl}
                                            controls={!message.is_uploading && !message.media_uploading && videoLoaded}
                                            preload="metadata"
                                            sx={{
                                                maxWidth: '100%',
                                                maxHeight: '200px',
                                                width: 'auto',
                                                height: 'auto',
                                                display: 'block',
                                                filter: (videoLoading || message.is_uploading || message.media_uploading) ? 'blur(8px)' : 'none',
                                                transition: 'filter 0.3s ease',
                                                opacity: (videoLoading || message.is_uploading || message.media_uploading) ? 0.6 : 1,
                                            }}
                                        />
                                        {/* Barra de carga circular cuando se está enviando */}
                                        {(message.is_uploading || message.media_uploading) && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    zIndex: 2,
                                                }}
                                            >
                                                <CircularProgress
                                                    size={48}
                                                    thickness={4}
                                                    sx={{ color: '#fff' }}
                                                    variant={message.media_upload_percent !== undefined && message.media_upload_percent !== null ? 'determinate' : 'indeterminate'}
                                                    value={message.media_upload_percent || message.upload_progress || 0}
                                                />
                                                {(message.media_upload_percent !== undefined && message.media_upload_percent !== null) && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: '#fff',
                                                            fontWeight: 600,
                                                            fontSize: '0.7rem',
                                                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                                        }}
                                                    >
                                                        {Math.round(message.media_upload_percent || message.upload_progress || 0)}%
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                        {/* Barra de carga circular cuando se está descargando (para el receptor) */}
                                        {!isOwn && videoLoading && !message.is_uploading && !message.media_uploading && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    zIndex: 2,
                                                }}
                                            >
                                                <CircularProgress
                                                    size={48}
                                                    thickness={4}
                                                    sx={{ color: '#fff' }}
                                                />
                                            </Box>
                                        )}
                                        {/* Mostrar tamaño del archivo */}
                                        {fileSizeFormatted && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 8,
                                                    right: 8,
                                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                                    color: '#fff',
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    fontSize: '0.65rem',
                                                    fontWeight: 500,
                                                    zIndex: 1,
                                                }}
                                            >
                                                {fileSizeFormatted}
                                            </Box>
                                        )}
                                    </Box>
                                </>
                            )}
                        </Box>
                    )}
                    {message.text && (
                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: '14.2px',
                                lineHeight: 1.3,
                                color: '#111b21',
                                wordWrap: 'break-word',
                                whiteSpace: 'pre-wrap',
                                overflowWrap: 'break-word',
                            }}
                        >
                            {message.text}
                        </Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 0.25, gap: 0.5 }}>
                        <MessageTime timestamp={message.created_at || message.timestamp} />
                        {isOwn && (
                            <MessageStatus status={status} />
                        )}
                    </Box>
                </Paper>
            )}
        </Box>
    );
}

MessageItem.propTypes = {
    message: PropTypes.object.isRequired,
    isOwn: PropTypes.bool.isRequired,
    currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    showAvatar: PropTypes.bool,
};
