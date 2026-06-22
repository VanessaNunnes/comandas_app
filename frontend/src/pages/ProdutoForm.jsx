import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, InputLabel, Avatar, CircularProgress } from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PageLayout from "../components/common/PageLayout";
import { useValidationRules } from '../hooks/useValidationRules';
import produtoService from '../services/produtoService';
import showSnackbar from '../utils/snackbar';

const ProdutoForm = () => {
  const { id, opr } = useParams();
  const navigate = useNavigate();
  const { control, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: { nome: '', descricao: '', valor_unitario: '', foto: null }
  });
  const validationRules = useValidationRules();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);

  const isReadOnly = opr === 'view';
  const title = opr === 'view' ? `Visualizar Produto: ${id}` : id ? `Editar Produto: ${id}` : 'Novo Produto';
  const foto = watch('foto');

  useEffect(() => {
    const load = async () => {
      if (id) {
        try {
          const data = await produtoService.getById(id);
          reset({
            nome: data.nome ?? '',
            descricao: data.descricao ?? '',
            valor_unitario: data.valor_unitario ?? '',
            foto: data.foto ?? null,
          });
        } catch (error) {
          showSnackbar(error.apiMessage || 'Erro ao carregar produto', 'error');
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
        descricao: data.descricao,
        valor_unitario: Number(data.valor_unitario),
        foto: data.foto || null,
      };
      if (id) {
        await produtoService.update(id, payload);
        showSnackbar('Produto atualizado com sucesso!', 'success');
      } else {
        await produtoService.create(payload);
        showSnackbar('Produto cadastrado com sucesso!', 'success');
      }
      navigate('/produtos');
    } catch (error) {
      showSnackbar(error.apiMessage || 'Erro ao salvar produto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Armazena a foto como data URL base64 (ex: data:image/jpeg;base64,...)
        setValue('foto', reader.result, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => navigate('/produtos');

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
        <Controller
          name="nome" control={control}
          rules={validationRules.nome}
          render={({ field }) => (
            <TextField {...field} label="Nome" fullWidth margin="normal"
              error={!!errors.nome} helperText={errors.nome?.message} disabled={loading || isReadOnly} />
          )}
        />
        <Controller
          name="descricao" control={control}
          rules={validationRules.descricao}
          render={({ field }) => (
            <TextField {...field} label="Descrição" fullWidth margin="normal" multiline rows={3}
              error={!!errors.descricao} helperText={errors.descricao?.message} disabled={loading || isReadOnly} />
          )}
        />
        <Controller
          name="valor_unitario" control={control}
          rules={validationRules.valor_unitario}
          render={({ field }) => (
            <TextField {...field} label="Valor Unitário" fullWidth margin="normal" type="number"
              inputProps={{ step: "0.01", min: "0" }}
              error={!!errors.valor_unitario} helperText={errors.valor_unitario?.message} disabled={loading || isReadOnly} />
          )}
        />

        {/* Foto do produto (base64) */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <InputLabel sx={{ mb: 1 }}>Foto do Produto</InputLabel>
          {foto && (
            <Avatar variant="rounded" src={foto} alt="Pré-visualização" sx={{ width: 100, height: 100, mb: 1, bgcolor: 'grey.200' }} />
          )}
          {!isReadOnly && (
            <>
              <input id="foto-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              <label htmlFor="foto-upload">
                <Button variant="outlined" component="span" startIcon={<PhotoCameraIcon />} disabled={loading}>
                  {foto ? 'Trocar Foto' : 'Selecionar Foto'}
                </Button>
              </label>
            </>
          )}
        </Box>

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

export default ProdutoForm;
