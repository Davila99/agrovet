import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import MessageItem from '../../molecules/chat/MessageItem';
import PropTypes from 'prop-types';

export default function MessageList({ messages, currentUserId, loading = false, isPrivateChat = false }) {
    const messagesEndRef = useRef(null);

    // Auto-scroll removed as per user request
    // useEffect(() => {
    //     scrollToBottom();
    // }, [messages]);

    // const scrollToBottom = () => {
    //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // };

    return (
        <Box
            sx={{
                flex: 1,
                overflowY: 'auto',
                p: 1,
                backgroundColor: '#f6fff8',
                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='%2339FF14' fill-opacity='0.06'><circle cx='20' cy='30' r='8'/><circle cx='34' cy='18' r='6'/><circle cx='12' cy='18' r='6'/><circle cx='58' cy='30' r='8'/><circle cx='72' cy='18' r='6'/><circle cx='50' cy='18' r='6'/></g></svg>")`,
                backgroundRepeat: 'repeat',
                backgroundSize: '160px 160px',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {loading && messages.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        Cargando mensajes...
                    </Typography>
                </Box>
            ) : messages.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        No hay mensajes aún. ¡Envía el primero!
                    </Typography>
                </Box>
            ) : (
                messages.map((msg) => {
                    const isOwn = msg.sender?.id === parseInt(currentUserId);
                    const msgId = msg.id;
                    const uniqueKey = msgId ? `msg-${msgId}` : `msg-${msg.created_at || Date.now()}`;

                    return (
                        <MessageItem
                            key={uniqueKey}
                            message={msg}
                            isOwn={isOwn}
                            currentUserId={currentUserId}
                            showAvatar={true}
                            isPrivateChat={isPrivateChat}
                        />
                    );
                })
            )}
            <div ref={messagesEndRef} />
        </Box>
    );
}

MessageList.propTypes = {
    messages: PropTypes.array.isRequired,
    currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    loading: PropTypes.bool,
};

