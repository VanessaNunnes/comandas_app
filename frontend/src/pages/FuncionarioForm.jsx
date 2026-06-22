import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, MenuItem, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PageLayout from "../components/common/PageLayout";
import { useValidationRules } from '../hooks/useValidationRules';
import funcionarioService from '../services/funcionarioService';
import { GROUP_OPTIONS } from '../constants/userGroups';
import showSnackbar from '../utils/snackbar';

const FuncionarioForm = () => {
  const { id, opr } = useParams();
  const navigate = useNavigate();
  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { nome: '', matricula: '', cpf: '', telefone: '', grupo: '', senha: '' }
  });
  const validationRules = useValidationRules();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);
  const isReadOnly = opr === 'view';
  const isEdit = !!id;
  const title = opr === 'view' ? `Visualizar Funcionário: ${id}` : id ? `Editar Funcionário: ${id}` : 'Novo Funcionário';

  useEffect(() => {
    const load = async () => {
      if (id) {
        try {
          const data = await funcionarioService.getById(id);
          reset({
            nome: data.nome ?? '',
            matricula: data.matricula ?? '',
            cpf: data.cpf ?? '',
            telefone: data.telefone ?? '',
            grupo: data.grupo ?? '',
            senha: '',
          });
        } catch (error) {
          showSnackbar(error.apiMessage || 'Erro ao carregar funcionário', 'error');
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
        matricula: String(data.matricula),
        cpf: String(data.cpf).replace(/\D/g, ''),
        telefone: String(data.telefone).replace(/\D/g, ''),
        grupo: Number(data.grupo),
      };
      // senha: obrigatória na criação; no update só envia se preenchida
      if (data.senha) {
        payload.senha = data.senha;
      }
      if (id) {
        await funcionarioService.update(id, payload);
        showSnackbar('Funcionário atualizado com sucesso!', 'success');
      } else {
        await funcionarioService.create(payload);
        showSnackbar('Funcionário cadastrado com sucesso!', 'success');
      }
      navigate('/funcionarios');
    } catch (error) {
      showSnackbar(error.apiMessage || 'Erro ao salvar funcionário', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate('/funcionarios');

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
        <Controller name="matricula" control={control} rules={{ required: "Matrícula é obrigatória" }}
          render={({ field }) => (
            <TextField {...field} label="Matrícula" fullWidth margin="normal"
              error={!!errors.matricula} helperText={errors.matricula?.message} disabled={loading || isReadOnly} />
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
        <Controller name="grupo" control={control} rules={{ required: "Grupo é obrigatório" }}
          render={({ field }) => (
            <TextField {...field} select label="Grupo" fullWidth margin="normal"
              error={!!errors.grupo} helperText={errors.grupo?.message} disabled={loading || isReadOnly}>
              {GROUP_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          )}
        />
        {!isReadOnly && (
          <Controller name="senha" control={control}
            rules={isEdit ? {} : { required: "Senha é obrigatória", minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' } }}
            render={({ field }) => (
              <TextField {...field} type="password" label={isEdit ? "Senha (deixe em branco para manter)" : "Senha"} fullWidth margin="normal"
                error={!!errors.senha} helperText={errors.senha?.message} disabled={loading} />
            )}
          />
        )}
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

export default FuncionarioForm;
