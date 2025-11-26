import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import useWaveform from '../../../hooks/chat/useWaveform';
import AudioPlayButton from '../../atoms/chat/AudioPlayButton';
import PropTypes from 'prop-types';

export default function AudioMessage({ 
    audioUrl, 
    spectrum = null, 
    duration = null,
    isOwn = false 
}) {
    const [playing, setPlaying] = useState(false);
    const { containerRef, progress, duration: waveformDuration, toggle } = useWaveform({
        id: `audio-${audioUrl}`,
        src: audioUrl,
        height: 40,
        barWidth: 2,
        activeColor: isOwn ? '#34b7f1' : '#4caf50',
        inactiveColor: isOwn ? '#b3e5fc' : '#c8e6c9',
        cursorColor: isOwn ? '#0288d1' : '#2e7d32',
        onPlayStart: () => setPlaying(true),
        onPlayEnd: () => setPlaying(false),
    });

    const formatTime = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const displayDuration = duration || waveformDuration || 0;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                minWidth: '200px',
                maxWidth: '100%',
                p: 1,
            }}
        >
            <AudioPlayButton 
                playing={playing} 
                onToggle={toggle}
                ariaLabel={playing ? 'Pausar audio' : 'Reproducir audio'}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
                {spectrum && Array.isArray(spectrum) && spectrum.length > 0 ? (
                    // Mostrar waveform visual con spectrum
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            height: 40,
                            mb: 0.5,
                        }}
                    >
                        {spectrum.map((value, index) => {
                            const height = Math.max(2, (value / 255) * 40);
                            return (
                                <Box
                                    key={index}
                                    sx={{
                                        width: 2,
                                        height: `${height}px`,
                                        bgcolor: isOwn ? '#34b7f1' : '#4caf50',
                                        borderRadius: 1,
                                        transition: 'height 0.1s ease',
                                        opacity: playing && progress > index / spectrum.length ? 1 : 0.6,
                                    }}
                                />
                            );
                        })}
                    </Box>
                ) : (
                    // Fallback a wavesurfer si está disponible
                    <Box
                        ref={containerRef}
                        sx={{
                            height: 40,
                            width: '100%',
                            mb: 0.5,
                        }}
                    />
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                        {formatTime(displayDuration)}
                    </Typography>
                    {playing && (
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                            {formatTime(progress * displayDuration)} / {formatTime(displayDuration)}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

AudioMessage.propTypes = {
    audioUrl: PropTypes.string.isRequired,
    spectrum: PropTypes.array,
    duration: PropTypes.number,
    isOwn: PropTypes.bool,
};





