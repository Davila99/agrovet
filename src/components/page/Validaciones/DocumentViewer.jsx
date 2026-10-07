/**
 * DocumentViewer — Modal lightbox para visualizar documentos de verificación.
 * Soporta imágenes y PDFs. Accesible con teclas (Escape para cerrar).
 */
import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';

const DOC_TYPE_LABELS = {
  title: 'Título Profesional',
  student: 'Carnet de Estudiante',
  graduated: 'Carta de Egresado',
};

export default function DocumentViewer({ open, onClose, document, docType }) {
  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!document) return null;

  const isImage = document.url && /\.(jpg|jpeg|png|gif|webp)$/i.test(document.url);
  const isPdf = document.url && /\.pdf$/i.test(document.url);
  const label = DOC_TYPE_LABELS[docType] || 'Documento';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: '#0f172a',
          color: '#f1f5f9',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#1e293b',
          py: 1.5,
          px: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DescriptionIcon sx={{ color: '#60a5fa' }} />
          <Typography variant="subtitle1" fontWeight={700} color="#f1f5f9">
            {label}
          </Typography>
          <Chip
            label={docType?.toUpperCase()}
            size="small"
            sx={{ bgcolor: '#1d4ed8', color: '#fff', fontWeight: 700, fontSize: '0.65rem' }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {document.url && (
            <IconButton
              size="small"
              component="a"
              href={document.url}
              target="_blank"
              download
              sx={{ color: '#60a5fa', '&:hover': { bgcolor: 'rgba(96,165,250,0.1)' } }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: '#94a3b8', '&:hover': { color: '#f1f5f9', bgcolor: 'rgba(255,255,255,0.05)' } }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, bgcolor: '#0f172a' }}>
        {isImage && (
          <Box
            component="img"
            src={document.url}
            alt={label}
            sx={{
              maxWidth: '100%',
              maxHeight: '75vh',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        )}
        {isPdf && (
          <Box sx={{ width: '100%', height: '75vh' }}>
            <iframe
              src={document.url}
              title={label}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </Box>
        )}
        {!isImage && !isPdf && document.url && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <DescriptionIcon sx={{ fontSize: 64, color: '#475569', mb: 2 }} />
            <Typography color="#94a3b8" mb={2}>
              Vista previa no disponible para este tipo de archivo.
            </Typography>
            <Typography
              component="a"
              href={document.url}
              target="_blank"
              sx={{ color: '#60a5fa', textDecoration: 'underline', cursor: 'pointer' }}
            >
              Abrir documento
            </Typography>
          </Box>
        )}
        {!document.url && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <DescriptionIcon sx={{ fontSize: 64, color: '#475569', mb: 2 }} />
            <Typography color="#94a3b8">URL de documento no disponible.</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
