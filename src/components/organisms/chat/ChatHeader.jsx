import React from 'react';
import { Box, Typography, Avatar, Badge, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PropTypes from 'prop-types';

export default function ChatHeader({
    participant,
    isOnline = false,
    wsConnected = false,
    onBack,
    showBack = false,
    usersMap = {}
}) {
    // Try to get enhanced participant data from usersMap  
    let participantData = participant;
    const participantId = participant?.id || participant?.user_id || participant?.pk;

    if (participantId && usersMap[participantId]) {
        participantData = { ...participant, ...usersMap[participantId] };
    }

    const participantName = participantData?.full_name ||
        participantData?.username ||
        participantData?.name ||
        participantData?.display_name ||
        'Usuario';

    // Handle avatar as string or object with url property
    let avatarUrl = participantData?.profile_picture || participantData?.profile_picture_url || participantData?.picture;
    if (!avatarUrl && participantData?.avatar) {
        avatarUrl = typeof participantData.avatar === 'object' ? participantData.avatar.url : participantData.avatar;
    }

    return (
        <Box
            sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: '#ededed',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
            }}
        >
            {showBack && onBack && (
                <IconButton onClick={onBack} sx={{ mr: -1 }}>
                    <ArrowBackIcon />
                </IconButton>
            )}
            <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                sx={{
                    '& .MuiBadge-badge': {
                        bgcolor: isOnline ? '#4caf50' : '#9e9e9e',
                        border: '2px solid white',
                        width: 12,
                        height: 12,
                    }
                }}
            >
                <Avatar
                    src={avatarUrl}
                    sx={{
                        bgcolor: '#4caf50',
                        width: 48,
                        height: 48
                    }}
                >
                    {participantName[0]?.toUpperCase() || 'U'}
                </Avatar>
            </Badge>
            <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {participantName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {isOnline ? 'En línea' : 'Desconectado'}
                    {wsConnected && ' • Conectado'}
                </Typography>
            </Box>
        </Box>
    );
}

ChatHeader.propTypes = {
    participant: PropTypes.object,
    isOnline: PropTypes.bool,
    wsConnected: PropTypes.bool,
    onBack: PropTypes.func,
    showBack: PropTypes.bool,
};
