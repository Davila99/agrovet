import React from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import MessageStatus from '../../atoms/chat/MessageStatus';
import MessageTime from '../../atoms/chat/MessageTime';
import WhatsAppAudioBubble from './WhatsAppAudioBubble';
import PropTypes from 'prop-types';

export default function MessageItem({
    message,
    isOwn,
    currentUserId,
    showAvatar = true,
    isPrivateChat = false // Para chats privados no mostrar nombre
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
                                        component="video"
                                        src={mediaUrl}
                                        controls={!message.is_uploading}
                                        sx={{
                                            maxWidth: '280px',
                                            maxHeight: '200px',
                                            width: 'auto',
                                            height: 'auto',
                                            borderRadius: 1.5,
                                            display: 'block',
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
