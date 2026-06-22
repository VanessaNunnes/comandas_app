import { useState } from 'react';
import { Dialog, DialogContent, DialogActions, DialogTitle, Typography, Box, Button } from '@mui/material';

const ComandaValidator = ({ open, onClose, existingRecord, recordType = 'comanda', onView, onEdit }) => {
  const handleCancel = () => {
    if (onClose && onClose.clearField) {
      onClose.clearField();
    }
    onClose();
  };

  const handleView = () => {
    if (onView && existingRecord) {
      onView(existingRecord);
    }
    handleCancel();
  };

  const handleEdit = () => {
    if (onEdit && existingRecord) {
      onEdit(existingRecord);
    }
    handleCancel();
  };

  return (
    <Dialog open={open} onClose={handleCancel} aria-labelledby="unique-dialog-title" aria-describedby="unique-dialog-description" maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, color: 'white', backgroundColor: 'error.main', mb: 2 }}>
        Registro já existente em {recordType}
      </DialogTitle>
      <DialogContent id="unique-dialog-description">
        <Box sx={{ p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
          {existingRecord?.id && (
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              ID: {existingRecord.id}
            </Typography>
          )}
          {existingRecord?.comanda && (
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Comanda: {existingRecord.comanda}
            </Typography>
          )}
          {existingRecord?.data_hora && (
            <Typography variant="subtitle2" sx={{ fontWeight: 500, mt: 1 }}>
              Abertura: {new Date(existingRecord.data_hora).toLocaleString('pt-BR')}
            </Typography>
          )}
          {existingRecord?.status !== undefined && (
            <Typography variant="body2" color="text.secondary">
              Status: {existingRecord.status === 1 ? 'Fechada' : existingRecord.status === 2 ? 'Cancelada' : 'Aberta'}
            </Typography>
          )}
          {existingRecord?.cliente_id && (
            <Typography variant="body2" color="text.secondary">
              Cliente: {existingRecord.cliente_id}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} variant="outlined">
          Fechar
        </Button>
        {onView && (
          <Button onClick={handleView} variant="contained" color="primary">
            Visualizar
          </Button>
        )}
        {onEdit && (
          <Button onClick={handleEdit} variant="contained" color="primary">
            Editar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useComandaValidation = (service, currentId = null) => {
  const [dialog, setDialog] = useState({ open: false, record: null });

  const validateComanda = async (comandaValue) => {
    if (!comandaValue) return; 
    try {
      const comanda = await service.checkEmUso(comandaValue, currentId);
      if (comanda) {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.blur) {
          activeElement.blur();
        }
        setDialog({ open: true, record: comanda });
        setTimeout(() => {
          const firstButton = document.querySelector('[role="dialog"] button');
          if (firstButton) {
            firstButton.focus();
          }
        }, 100);
      }
    } catch (error) {
      console.error('Erro ao validar campo:', error);
    }
  };

  const closeDialog = () => {
    setDialog({ open: false, record: null });
  };

  const clearField = () => {
    setDialog({ open: false, record: null });
  };

  return { dialog, validateComanda, closeDialog, clearField };
};

export default ComandaValidator;
