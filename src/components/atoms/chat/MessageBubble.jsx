import React from 'react';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export default function MessageBubble({ 
    message, 
    isOwn, 
    showAvatar = false,
    avatarUrl,
    senderName 
}) {
    const mediaUrl = message.media_url || (message.attachments && message.attachments[0]?.url);
    const mediaType = mediaUrl ? (
        message.attachments?.[0]?.type || 
        (mediaUrl.match(/\.(mp4|webm|mov)$/i) ? 'video' : 
         mediaUrl.match(/\.(mp3|wav|ogg|webm)$/i) ? 'audio' : 'image')
    ) : null;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '70%',
                minWidth: '120px',
                mb: 1.5,
            }}
        >
            {showAvatar && !isOwn && (
                <Typography 
                    variant="caption" 
                    sx={{ 
                        mb: 0.5, 
                        ml: 1, 
                        color: 'text.secondary',
                        fontSize: '0.7rem'
                    }}
                >
                    {senderName || 'Usuario'}
                </Typography>
            )}
            <Box
                sx={{
                    p: '6px 7px 8px 9px',
                    borderRadius: isOwn ? '7.5px 7.5px 1px 7.5px' : '7.5px 7.5px 7.5px 1px',
                    bgcolor: isOwn ? '#dcf8c6' : '#ffffff',
                    border: isOwn ? 'none' : '1px solid #e0e0e0',
                    boxShadow: isOwn ? '0 1px 0.5px rgba(0,0,0,0.13)' : '0 1px 0.5px rgba(0,0,0,0.13)',
                    alignSelf: isOwn ? 'flex-end' : 'flex-start',
                    position: 'relative',
                }}
            >
                {mediaUrl && (
                    <Box sx={{ mb: message.text ? 1 : 0 }}>
                        {mediaType === 'video' ? (
                            <video
                                src={mediaUrl}
                                controls
                                style={{ 
                                    maxWidth: '100%', 
                                    borderRadius: 8, 
                                    maxHeight: '300px',
                                    display: 'block'
                                }}
                            />
                        ) : mediaType === 'audio' ? (
                            <Box sx={{ width: '100%', minWidth: '250px' }}>
                                {/* AudioMessage se renderizará desde MessageItem */}
                                <audio
                                    src={mediaUrl}
                                    controls
                                    style={{ width: '100%' }}
                                />
                            </Box>
                        ) : (
                            <img
                                src={mediaUrl}
                                alt="Media"
                                style={{ 
                                    maxWidth: '100%', 
                                    borderRadius: 8, 
                                    cursor: 'pointer',
                                    maxHeight: '400px',
                                    display: 'block'
                                }}
                                onClick={() => window.open(mediaUrl, '_blank')}
                            />
                        )}
                    </Box>
                )}
                {message.text && (
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            mb: 0.5,
                            color: isOwn ? '#000000' : '#212121',
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap',
                            fontSize: '0.95rem',
                            lineHeight: 1.4
                        }}
                    >
                        {message.text}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

MessageBubble.propTypes = {
    message: PropTypes.object.isRequired,
    isOwn: PropTypes.bool.isRequired,
    showAvatar: PropTypes.bool,
    avatarUrl: PropTypes.string,
    senderName: PropTypes.string,
};

