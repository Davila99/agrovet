import React from 'react';
import { Box, Typography, Avatar, Badge, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PropTypes from 'prop-types';
import VerificationBadge from '../../page/profile/molecules/VerificationBadge';
import { useNavigate } from 'react-router-dom';

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
        // Merge participant data with usersMap data, prioritizing usersMap for complete user info
        const userFromMap = usersMap[participantId];
        const mergedProfile = userFromMap.specialist_profile || participant?.specialist_profile || {};
        
        // Determinar verification_status basado en documentos (igual que en SpecialistsList)
        let verificationStatus = mergedProfile.verification_status;
        let verificationType = mergedProfile.verification_type;
        
        if (!verificationStatus) {
            const hasTitle = !!mergedProfile.verification_title_id;
            const hasStudentCard = !!mergedProfile.verification_student_card_id;
            const hasGraduationLetter = !!mergedProfile.verification_graduation_letter_id;
            
            if (hasTitle || hasGraduationLetter) {
                verificationStatus = 'verified_professional';
                verificationType = verificationType || 'Médico Titulado';
            } else if (hasStudentCard) {
                verificationStatus = 'verified_student';
                verificationType = verificationType || 'Estudiante';
            }
        }
        
        participantData = { 
            ...participant, 
            ...userFromMap,
            specialist_profile: {
                ...mergedProfile,
                verification_status: verificationStatus,
                verification_type: verificationType,
            },
            role: userFromMap.role || participant?.role
        };
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

    const navigate = useNavigate();

    const handleAvatarClick = () => {
        if (participantId) {
            navigate(`/perfil?userId=${participantId}`);
        }
    };

    const handleNameClick = () => {
        if (participantId) {
            navigate(`/perfil?userId=${participantId}`);
        }
    };

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
                    onClick={handleAvatarClick}
                    sx={{
                        bgcolor: '#4caf50',
                        width: 48,
                        height: 48,
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 }
                    }}
                >
                    {participantName[0]?.toUpperCase() || 'U'}
                </Avatar>
            </Badge>
            <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                    <Typography 
                        variant="subtitle1" 
                        sx={{ fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        onClick={handleNameClick}
                    >
                        {participantName}
                    </Typography>
                    {/* Badge de verificación si el participante es especialista */}
                    {((participantData?.role || '').toString().toLowerCase() === 'specialist' || 
                      participantData?.specialist_profile) && 
                      participantData?.specialist_profile?.verification_status && (
                        <VerificationBadge
                            verificationStatus={participantData.specialist_profile.verification_status}
                            verificationType={participantData.specialist_profile.verification_type}
                            size="small"
                        />
                    )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                    {isOnline ? 'En línea' : 'Desconectado'}
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
