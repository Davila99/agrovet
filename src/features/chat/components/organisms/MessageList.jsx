import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import MessageItem from '../molecules/MessageItem';
import PropTypes from 'prop-types';

export default function MessageList({ messages, currentUserId, loading = false, isPrivateChat = false, usersMap = {}, targetMessageId = null }) {
    const messagesEndRef = useRef(null);
    const [highlightedId, setHighlightedId] = React.useState(null);

    useEffect(() => {
      if (targetMessageId) {
        setHighlightedId(targetMessageId);
        const timer = setTimeout(() => {
          const el = document.getElementById(`msg-item-${targetMessageId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 200);

        const fadeTimer = setTimeout(() => {
          setHighlightedId(null);
        }, 2500);

        return () => {
          clearTimeout(timer);
          clearTimeout(fadeTimer);
        };
      }
    }, [targetMessageId, messages]);

    return (
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          // Add bottom padding on small screens so messages aren't hidden
          // behind the fixed ChatInput. Adjust value if ChatInput height changes.
          pb: { xs: "72px", md: 0 },
          p: 1,
          backgroundColor: "#f6fff8",
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='%2339FF14' fill-opacity='0.06'><circle cx='20' cy='30' r='8'/><circle cx='34' cy='18' r='6'/><circle cx='12' cy='18' r='6'/><circle cx='58' cy='30' r='8'/><circle cx='72' cy='18' r='6'/><circle cx='50' cy='18' r='6'/></g></svg>")`,
          backgroundRepeat: "repeat",
          backgroundSize: "160px 160px",
          display: "flex",
          flexDirection: "column",
        }}>
        {loading && messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 3,
            }}>
            <Typography variant="body2" color="text.secondary">
              Cargando mensajes...
            </Typography>
          </Box>
        ) : messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 3,
            }}>
            <Typography variant="body2" color="text.secondary">
              No hay mensajes aún. ¡Envía el primero!
            </Typography>
          </Box>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender?.id === parseInt(currentUserId);
            const msgId = msg.id;
            const uniqueKey = msgId
              ? `msg-${msgId}`
              : `msg-${msg.created_at || Date.now()}`;

            const isHighlighted = String(msg.id) === String(highlightedId);

            return (
              <Box
                key={uniqueKey}
                id={`msg-item-${msg.id}`}
                sx={{
                  transition: 'background-color 0.4s ease',
                  backgroundColor: isHighlighted ? 'rgba(255, 235, 59, 0.35)' : 'transparent',
                  borderRadius: 2,
                  px: 0.5,
                  py: 0.25,
                }}
              >
                <MessageItem
                  message={msg}
                  isOwn={isOwn}
                  currentUserId={currentUserId}
                  showAvatar={true}
                  isPrivateChat={isPrivateChat}
                  usersMap={usersMap}
                />
              </Box>
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

