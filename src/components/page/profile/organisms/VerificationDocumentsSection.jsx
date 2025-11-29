import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Grid,
} from '@mui/material';
import { Close, AddAPhoto, DeleteOutline, Verified, School, CardMembership, Description } from '@mui/icons-material';
import { uploadMedia } from '../../../../services/endpoints/media';
import { normalizeStoredToken } from '../../chat/chatUtils';
import { profilesAPI } from '../../../../services/endpoints';
import VerificationBadge from '../molecules/VerificationBadge';

const DOCUMENT_TYPES = {
  TITLE: 'title',
  STUDENT_CARD: 'student_card',
  GRADUATION_LETTER: 'graduation_letter',
};

const DOCUMENT_LABELS = {
  [DOCUMENT_TYPES.TITLE]: 'Título Profesional',
  [DOCUMENT_TYPES.STUDENT_CARD]: 'Carnet de Estudiante',
  [DOCUMENT_TYPES.GRADUATION_LETTER]: 'Carta de Egresado',
};

export default function VerificationDocumentsSection({
  specialistProfile,
  userId,
  onUpdate,
  isOwnProfile = true,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const verificationStatus = specialistProfile?.verification_status || null;
  const verificationType = specialistProfile?.verification_type || null;

  const hasTitle = !!specialistProfile?.verification_title_id;
  const hasStudentCard = !!specialistProfile?.verification_student_card_id;
  const hasGraduationLetter = !!specialistProfile?.verification_graduation_letter_id;
  
  // URLs de los documentos
  const titleUrl = specialistProfile?.verification_title_url || null;
  const studentCardUrl = specialistProfile?.verification_student_card_url || null;
  const graduationLetterUrl = specialistProfile?.verification_graduation_letter_url || null;

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setDocumentType('');
    setFile(null);
    setFilePreview(null);
    setError(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDocumentType('');
    setFile(null);
    setFilePreview(null);
    setError(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!documentType || !file) {
      setError('Por favor selecciona un tipo de documento y un archivo');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const token = normalizeStoredToken(localStorage.getItem('token'));
      
      // Subir archivo al Media Service
      const formData = new FormData();
      formData.append('image', file);
      formData.append('name', DOCUMENT_LABELS[documentType]);
      formData.append('description', `Documento de verificación: ${DOCUMENT_LABELS[documentType]}`);
      formData.append('folder', 'verification');

      const uploadedMedia = await uploadMedia(formData, token);
      
      if (!uploadedMedia || !uploadedMedia.id) {
        throw new Error('No se recibió ID del media después de subir');
      }

      // Determinar qué campo actualizar según el tipo de documento
      const updateData = {};
      if (documentType === DOCUMENT_TYPES.TITLE) {
        updateData.verification_title_id = uploadedMedia.id;
      } else if (documentType === DOCUMENT_TYPES.STUDENT_CARD) {
        updateData.verification_student_card_id = uploadedMedia.id;
      } else if (documentType === DOCUMENT_TYPES.GRADUATION_LETTER) {
        updateData.verification_graduation_letter_id = uploadedMedia.id;
      }

      // Actualizar perfil
      const updatedProfile = await profilesAPI.patchSpecialistByUser(userId, updateData, token);
      
      // Guardar en localStorage como respaldo
      try {
        const backupKey = `verification_backup_${userId}`;
        localStorage.setItem(backupKey, JSON.stringify({
          verification_title_id: updatedProfile?.verification_title_id || specialistProfile?.verification_title_id,
          verification_student_card_id: updatedProfile?.verification_student_card_id || specialistProfile?.verification_student_card_id,
          verification_graduation_letter_id: updatedProfile?.verification_graduation_letter_id || specialistProfile?.verification_graduation_letter_id,
          timestamp: Date.now(),
        }));
      } catch (e) {
        console.warn('No se pudo guardar en localStorage:', e);
      }

      // Notificar actualización
      if (onUpdate) {
        onUpdate(updatedProfile);
      }

      handleCloseDialog();
    } catch (err) {
      console.error('Error al subir documento:', err);
      setError(err.message || 'Error al subir el documento. Por favor intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (type) => {
    if (!window.confirm(`¿Estás seguro de eliminar el ${DOCUMENT_LABELS[type]}?`)) {
      return;
    }

    try {
      const token = normalizeStoredToken(localStorage.getItem('token'));
      
      const updateData = {};
      if (type === DOCUMENT_TYPES.TITLE) {
        updateData.verification_title_id = null;
      } else if (type === DOCUMENT_TYPES.STUDENT_CARD) {
        updateData.verification_student_card_id = null;
      } else if (type === DOCUMENT_TYPES.GRADUATION_LETTER) {
        updateData.verification_graduation_letter_id = null;
      }

      const updatedProfile = await profilesAPI.patchSpecialistByUser(userId, updateData, token);
      
      // Actualizar localStorage
      try {
        const backupKey = `verification_backup_${userId}`;
        localStorage.setItem(backupKey, JSON.stringify({
          verification_title_id: updatedProfile?.verification_title_id || null,
          verification_student_card_id: updatedProfile?.verification_student_card_id || null,
          verification_graduation_letter_id: updatedProfile?.verification_graduation_letter_id || null,
          timestamp: Date.now(),
        }));
      } catch (e) {
        console.warn('No se pudo actualizar localStorage:', e);
      }

      if (onUpdate) {
        onUpdate(updatedProfile);
      }
    } catch (err) {
      console.error('Error al eliminar documento:', err);
      alert('Error al eliminar el documento. Por favor intenta de nuevo.');
    }
  };

  if (!isOwnProfile) {
    // Solo mostrar badge si no es el propio perfil
    return verificationStatus ? (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
        <VerificationBadge
          verificationStatus={verificationStatus}
          verificationType={verificationType}
          size="medium"
        />
      </Box>
    ) : null;
  }

  return (
    <>
      <Paper
        elevation={2}
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          bgcolor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          mb: 2,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#103E68',
                fontSize: '0.95rem',
                mb: 1.5,
              }}
            >
              Documentos de Verificación
            </Typography>
            {verificationStatus && (
              <VerificationBadge
                verificationStatus={verificationStatus}
                verificationType={verificationType}
                size="small"
              />
            )}
          </Box>
        </Box>

        <Grid container spacing={2}>
          {/* Botón de agregar documento - dentro del grid como card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                minHeight: 280,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed',
                borderColor: 'divider',
                bgcolor: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
              onClick={handleOpenDialog}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  p: 3,
                }}
              >
                <AddAPhoto sx={{ fontSize: 36, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.8rem' }}>
                  Agregar Documento
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          {/* Título Profesional */}
          {hasTitle && titleUrl && (
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '2px solid',
                  borderColor: '#1976d2',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1,
                    bgcolor: 'white',
                    borderRadius: '50%',
                    p: 0.5,
                  }}
                >
                  <Verified sx={{ color: '#1976d2', fontSize: 20 }} />
                </Box>
                <CardMedia
                  component="img"
                  image={titleUrl}
                  alt="Título Profesional"
                  sx={{
                    height: 200,
                    objectFit: 'cover',
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    {DOCUMENT_LABELS[DOCUMENT_TYPES.TITLE]}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(DOCUMENT_TYPES.TITLE)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteOutline />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          )}

          {/* Carnet de Estudiante */}
          {hasStudentCard && studentCardUrl && (
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '2px solid',
                  borderColor: '#4caf50',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1,
                    bgcolor: 'white',
                    borderRadius: '50%',
                    p: 0.5,
                  }}
                >
                  <Verified sx={{ color: '#4caf50', fontSize: 20 }} />
                </Box>
                <CardMedia
                  component="img"
                  image={studentCardUrl}
                  alt="Carnet de Estudiante"
                  sx={{
                    height: 200,
                    objectFit: 'cover',
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {DOCUMENT_LABELS[DOCUMENT_TYPES.STUDENT_CARD]}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(DOCUMENT_TYPES.STUDENT_CARD)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteOutline />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          )}

          {/* Carta de Egresado */}
          {hasGraduationLetter && graduationLetterUrl && (
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '2px solid',
                  borderColor: '#1976d2',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1,
                    bgcolor: 'white',
                    borderRadius: '50%',
                    p: 0.5,
                  }}
                >
                  <Verified sx={{ color: '#1976d2', fontSize: 20 }} />
                </Box>
                <CardMedia
                  component="img"
                  image={graduationLetterUrl}
                  alt="Carta de Egresado"
                  sx={{
                    height: 200,
                    objectFit: 'cover',
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {DOCUMENT_LABELS[DOCUMENT_TYPES.GRADUATION_LETTER]}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(DOCUMENT_TYPES.GRADUATION_LETTER)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteOutline />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Dialog para agregar documento */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>Agregar Documento de Verificación</Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="document-type-label" sx={{ fontSize: '0.85rem' }}>
              Selecciona el tipo de documento
            </InputLabel>
            <Select
              labelId="document-type-label"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              label="Selecciona el tipo de documento"
              sx={{
                fontSize: '0.85rem',
                '& .MuiSelect-select': {
                  py: 1.5,
                  px: 2,
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    '& .MuiMenuItem-root': {
                      py: 2,
                      px: 2,
                    },
                  },
                },
              }}
            >
              <MenuItem value={DOCUMENT_TYPES.TITLE}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                  <School sx={{ color: '#1976d2', fontSize: 22 }} />
                  <Typography sx={{ fontSize: '0.85rem' }}>{DOCUMENT_LABELS[DOCUMENT_TYPES.TITLE]}</Typography>
                </Box>
              </MenuItem>
              <MenuItem value={DOCUMENT_TYPES.STUDENT_CARD}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                  <CardMembership sx={{ color: '#4caf50', fontSize: 22 }} />
                  <Typography sx={{ fontSize: '0.85rem' }}>{DOCUMENT_LABELS[DOCUMENT_TYPES.STUDENT_CARD]}</Typography>
                </Box>
              </MenuItem>
              <MenuItem value={DOCUMENT_TYPES.GRADUATION_LETTER}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                  <Description sx={{ color: '#1976d2', fontSize: 22 }} />
                  <Typography sx={{ fontSize: '0.85rem' }}>{DOCUMENT_LABELS[DOCUMENT_TYPES.GRADUATION_LETTER]}</Typography>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mb: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="verification-file-input"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="verification-file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AddAPhoto />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Seleccionar Archivo
              </Button>
            </label>
            {filePreview && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <img
                  src={filePreview}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: 8,
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {file.name}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={uploading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!documentType || !file || uploading}
            startIcon={uploading ? <CircularProgress size={16} /> : null}
          >
            {uploading ? 'Subiendo...' : 'Subir'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

