import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PageLayout from "../components/common/PageLayout";
import { useValidationRules } from '../hooks/useValidationRules';
import clienteService from '../services/clienteService';
import showSnackbar from '../utils/snackbar';

const ClienteForm = () => {
  const { id, opr } = useParams();
  const navigate = useNavigate();
  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { nome: '', cpf: '', telefone: '' }
  });
  const validationRules = useValidationRules();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);
  const isReadOnly = opr === 'view';
  const title = opr === 'view' ? `Visualizar Cliente: ${id}` : id ? `Editar Cliente: ${id}` : 'Novo Cliente';

  useEffect(() => {
    const load = async () => {
      if (id) {
        try {
          const data = await clienteService.getById(id);
          reset({ nome: data.nome ?? '', cpf: data.cpf ?? '', telefone: data.telefone ?? '' });
        } catch (error) {
          showSnackbar(error.apiMessage || 'Erro ao carregar cliente', 'error');
        } finally {
          setLoadingData(false);
        }
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        nome: data.nome,
        cpf: String(data.cpf).replace(/\D/g, ''),
        telefone: String(data.telefone).replace(/\D/g, ''),
      };
      if (id) {
        await clienteService.update(id, payload);
        showSnackbar('Cliente atualizado com sucesso!', 'success');
      } else {
        await clienteService.create(payload);
        showSnackbar('Cliente cadastrado com sucesso!', 'success');
      }
      navigate('/clientes');
    } catch (error) {
      showSnackbar(error.apiMessage || 'Erro ao salvar cliente', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate('/clientes');

  if (loadingData) {
    return (
      <PageLayout title={title}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={title}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 600, mx: 'auto' }}>
        <Controller name="nome" control={control} rules={validationRules.nome}
          render={({ field }) => (
            <TextField {...field} label="Nome" fullWidth margin="normal"
              error={!!errors.nome} helperText={errors.nome?.message} disabled={loading || isReadOnly} />
          )}
        />
        <Controller name="cpf" control={control} rules={{ required: "CPF é obrigatório" }}
          render={({ field }) => (
            <TextField {...field} label="CPF" fullWidth margin="normal"
              error={!!errors.cpf} helperText={errors.cpf?.message} disabled={loading || isReadOnly} />
          )}
        />
        <Controller name="telefone" control={control} rules={{ required: "Telefone é obrigatório" }}
          render={({ field }) => (
            <TextField {...field} label="Telefone" fullWidth margin="normal"
              error={!!errors.telefone} helperText={errors.telefone?.message} disabled={loading || isReadOnly} />
          )}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button sx={{ mr: 1 }} onClick={handleCancel} disabled={loading}>
            {isReadOnly ? 'Voltar' : 'Cancelar'}
          </Button>
          {!isReadOnly && (
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Salvando...' : (id ? 'Atualizar' : 'Cadastrar')}
            </Button>
          )}
        </Box>
      </Box>
    </PageLayout>
  );
};

export default ClienteForm;
