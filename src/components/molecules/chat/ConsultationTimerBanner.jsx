import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import AddAlarmIcon from '@mui/icons-material/AddAlarm';

export default function ConsultationTimerBanner({
  consultation,
  onEndConsultation,
  onExtendConsultation,
}) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!consultation || !consultation.started_at) {
      setTimeLeft(0);
      return;
    }

    const calculateTimeLeft = () => {
      const startTime = new Date(consultation.started_at).getTime();
      const now = new Date().getTime();
      const durationMs = (consultation.is_extended ? 30 : 15) * 60 * 1000;
      const elapsed = now - startTime;
      const remaining = Math.max(0, Math.floor((durationMs - elapsed) / 1000));
      return remaining;
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [consultation]);

  if (!consultation) return null;

  const isQuestionPhase = consultation.status === 'question_phase';
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isTimeCritical = timeLeft > 0 && timeLeft <= 120;

  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        bgcolor: isTimeCritical ? '#fff3e0' : '#e8f5e9',
        borderBottom: '1px solid',
        borderColor: isTimeCritical ? '#ffe0b2' : '#c8e6c9',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TimerIcon color={isTimeCritical ? 'warning' : 'success'} fontSize="small" />
        {isQuestionPhase ? (
          <Typography variant="body2" fontWeight={600} color="text.secondary">
            Fase de Preguntas: {consultation.initial_question_count || 0}/2 respuestas del consumidor
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight={700} color={isTimeCritical ? 'warning.dark' : 'success.dark'}>
              Tiempo de Consulta: {timeFormatted}
            </Typography>
            {consultation.is_extended && (
              <Chip label="+15m extendida" size="small" color="success" variant="outlined" />
            )}
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
        {!isQuestionPhase && (timeLeft <= 180 || timeLeft === 0) && (
          <Button
            size="small"
            variant="outlined"
            color="success"
            startIcon={<AddAlarmIcon />}
            onClick={onExtendConsultation}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Seguir consulta (+15m)
          </Button>
        )}

        <Button
          size="small"
          variant="contained"
          color="error"
          startIcon={<StopCircleIcon />}
          onClick={onEndConsultation}
          sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
        >
          Terminar Consulta
        </Button>
      </Box>
    </Box>
  );
}
