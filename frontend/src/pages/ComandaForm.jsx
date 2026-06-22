import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { TextField, Button, Box, CircularProgress } from '@mui/material';
import PageLayout from "../components/common/PageLayout";
import { useValidationRules } from '../hooks/useValidationRules';
import comandaService from '../services/comandaService';
import showSnackbar from '../utils/snackbar';
import { useAuth } from '../context/AuthContext';
import ComandaValidator, { useComandaValidation } from '../components/common/ComandaValidator';

const ComandaForm = () => {
  const { id, opr } = useParams(); 
  const navigate = useNavigate();
  const { user } = useAuth();

  const { control, handleSubmit, formState: { errors, dirtyFields }, reset } = useForm({
    defaultValues: {
      comanda: '',
      data_hora: new Date().toISOString().slice(0, 16),
      cliente_id: '',
      funcionario_id: user?.id || ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const validationRules = useValidationRules();
  const isReadOnly = opr === 'view';
  const title = opr === 'view' ? `Visualizar Comanda: ${id}` : id ? `Editar Comanda: ${id}` : 'Nova Comanda';

  const { dialog: comandaDialog, validateComanda, closeDialog, clearField } = useComandaValidation(comandaService, id);

  const handleDialogCancel = () => {
    closeDialog();
    clearField();
    reset(prev => ({ ...prev, comanda: '' }));
  };
  const handleDialogView = (comanda) => {
    closeDialog();
    navigate(`/comanda/view/${comanda.id}`);
  };
  const handleDialogEdit = (comanda) => {
    closeDialog();
    navigate(`/comanda/edit/${comanda.id}`);
  };
  const handleCancel = () => {
    navigate('/comandas');
  };

  useEffect(() => {
    const loadComanda = async () => {
      if (id && id !== 'new') {
        try {
          const data = await comandaService.getById(id);
          if (data.data_hora) {
            const dataAbertura = new Date(data.data_hora);
            data.data_hora = dataAbertura.toISOString().slice(0, 16);
          }
          reset({
            comanda: data.comanda ?? '',
            data_hora: data.data_hora,
            cliente_id: data.cliente_id ?? '',
            funcionario_id: data.funcionario_id ?? ''
          });
        } catch (error) {
          const mensagem = error.apiMessage || 'Erro ao carregar comanda';
          showSnackbar(mensagem, 'error');
        } finally {
          setLoadingData(false);
        }
      } else {
        reset({
          comanda: '',
          data_hora: new Date().toISOString().slice(0, 16),
          cliente_id: '',
          funcionario_id: user?.id || ''
        });
        setLoadingData(false);
      }
    };
    loadComanda();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const comandaData = {
        comanda: data.comanda,
        cliente_id: data.cliente_id ? Number(data.cliente_id) : null,
        funcionario_id: id && id !== 'new' ? Number(data.funcionario_id) : (user?.id || null),
        status: 0
      };

      if (id && id !== 'new') {
        await comandaService.update(id, comandaData);
        showSnackbar('Comanda atualizada com sucesso!', 'success');
      } else {
        await comandaService.create(comandaData);
        showSnackbar('Comanda aberta com sucesso!', 'success');
      }
      navigate('/comandas');
    } catch (error) {
      const mensagem = error.apiMessage || 'Erro ao salvar comanda';
      showSnackbar(mensagem, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <PageLayout title={title}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={title}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 600, mx: 'auto' }}>
        {/* Campo Número da Comanda */}
        <Controller
          name="comanda"
          control={control}
          rules={{ required: validationRules.required || 'Comanda é obrigatória' }}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value || ''}
              fullWidth
              label="Comanda"
              margin="normal"
              error={!!errors.comanda}
              helperText={errors.comanda?.message || 'Número da comanda deve ser único e estar disponível'}
              disabled={loading || isReadOnly}
              onBlur={() => {
                if (!isReadOnly) {
                  const isNovaComanda = !id || id === 'new';
                  if (isNovaComanda || dirtyFields.comanda) {
                    validateComanda(field.value);
                  }
                }
              }}
            />
          )}
        />

        {/* Campo Data e Hora (apenas visualização) */}
        {isReadOnly && (
          <Controller
            name="data_hora"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ? new Date(field.value).toLocaleString('pt-BR') : ''}
                fullWidth
                label="Data e Hora de Abertura"
                margin="normal"
                disabled={true}
              />
            )}
          />
        )}

        {/* Campo Funcionário (apenas visualização) */}
        {isReadOnly && (
          <Controller
            name="funcionario_id"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={`ID: ${field.value || 'N/A'}`}
                fullWidth
                label="Funcionário Responsável"
                margin="normal"
                disabled={true}
              />
            )}
          />
        )}

        {/* Campo Identificação do Cliente (opcional) */}
        <Controller
          name="cliente_id"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value || ''}
              fullWidth
              label="Identificação do Cliente (opcional)"
              margin="normal"
              placeholder="ID do cliente"
              type="number"
              error={!!errors.cliente_id}
              helperText={errors.cliente_id?.message}
              disabled={loading || isReadOnly}
            />
          )}
        />

        {/* Botões de ação */}
        {!isReadOnly && (
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={handleCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Salvando...' : (id ? 'Atualizar' : 'Abrir Comanda')}
            </Button>
          </Box>
        )}

        {isReadOnly && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={handleCancel} disabled={loading}>
              Voltar
            </Button>
          </Box>
        )}
      </Box>

      {/* Diálogo de comanda em uso */}
      <ComandaValidator
        open={comandaDialog.open}
        onClose={handleDialogCancel}
        existingRecord={comandaDialog.record}
        recordType="comanda"
        onView={handleDialogView}
        onEdit={handleDialogEdit}
      />
    </PageLayout>
  );
};

export default ComandaForm;
