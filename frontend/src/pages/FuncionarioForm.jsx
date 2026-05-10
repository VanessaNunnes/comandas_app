// FuncionarioForm.jsx

import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import PageLayout from "../components/common/PageLayout";
import { useValidationRules } from '../hooks/useValidationRules';

const FuncionarioForm = () => {
    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const validationRules = useValidationRules();

    const navigate = useNavigate();

    const onSubmit = (data) => {
        console.log("Dados do funcionário:", data);
    };

    const handleCancel = () => {
        navigate('/funcionarios');
    };

    return (
        <PageLayout title="Dados Funcionário">
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>

                <Controller
                    name="nome"
                    control={control}
                    defaultValue=""
                    rules={validationRules.nome}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Nome"
                            fullWidth
                            margin="normal"
                            error={!!errors.nome}
                            helperText={errors.nome?.message}
                        />
                    )}
                />

                <Controller
                    name="matricula"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Matrícula é obrigatória" }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Matrícula"
                            fullWidth
                            margin="normal"
                            error={!!errors.matricula}
                            helperText={errors.matricula?.message}
                        />
                    )}
                />

                <Controller
                    name="cpf"
                    control={control}
                    defaultValue=""
                    rules={{ required: "CPF é obrigatório" }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="CPF"
                            fullWidth
                            margin="normal"
                            error={!!errors.cpf}
                            helperText={errors.cpf?.message}
                        />
                    )}
                />

                <Controller
                    name="telefone"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Telefone é obrigatório" }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Telefone"
                            fullWidth
                            margin="normal"
                            error={!!errors.telefone}
                            helperText={errors.telefone?.message}
                        />
                    )}
                />

                <Controller
                    name="grupo"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Grupo é obrigatório" }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            select
                            label="Grupo"
                            fullWidth
                            margin="normal"
                            error={!!errors.grupo}
                            helperText={errors.grupo?.message}
                        >
                            <MenuItem value={1}>Administrador</MenuItem>
                            <MenuItem value={2}>Funcionário</MenuItem>
                        </TextField>
                    )}
                />

                <Controller
                    name="senha"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Senha é obrigatória" }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            type="password"
                            label="Senha"
                            fullWidth
                            margin="normal"
                            error={!!errors.senha}
                            helperText={errors.senha?.message}
                        />
                    )}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button sx={{ mr: 1 }} onClick={handleCancel}>
                        Cancelar
                    </Button>

                    <Button type="submit" variant="contained">
                        Cadastrar
                    </Button>
                </Box>

            </Box>
        </PageLayout>
    );
};

export default FuncionarioForm;