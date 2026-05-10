// ClienteList.jsx

import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Card,
    CardContent,
    Typography,
    Box,
    Divider
} from '@mui/material';

import { FiberNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import PageLayout from "../components/common/PageLayout";
import ActionButtons from "../components/common/ActionButtons";

function ClienteList() {

    const navigate = useNavigate();

    const clientes = [
        {
            id: 1,
            nome: 'João Silva',
            cpf: '111.111.111-11',
            telefone: '(47) 99999-9999'
        },
        {
            id: 2,
            nome: 'Maria Oliveira',
            cpf: '222.222.222-22',
            telefone: '(47) 98888-8888'
        }
    ];

    const actions = (
        <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/cliente')}
            startIcon={<FiberNew />}
            sx={{ fontWeight: 600, px: 2, py: 1 }}
        >
            Novo
        </Button>
    );

    const handleView = (cliente) => {
        console.log("Visualizar cliente:", cliente);
    };

    const handleEdit = (cliente) => {
        navigate(`/cliente/${cliente.id}`);
    };

    const handleDelete = (cliente) => {
        console.log("Excluir cliente:", cliente);
    };

    const columns = [
        { field: 'id', headerName: 'ID' },
        { field: 'nome', headerName: 'Nome' },
        { field: 'cpf', headerName: 'CPF' },
        { field: 'telefone', headerName: 'Telefone' },
        {
            field: 'actions',
            headerName: 'Ações',
            renderCell: (params) => (
                <ActionButtons
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    item={params.row}
                />
            )
        }
    ];

    const renderDesktopRow = (cliente) => (
        <TableRow key={cliente.id} hover>

            <TableCell>
                {cliente.id}
            </TableCell>

            <TableCell sx={{ fontWeight: 500 }}>
                {cliente.nome}
            </TableCell>

            <TableCell>
                {cliente.cpf}
            </TableCell>

            <TableCell>
                {cliente.telefone}
            </TableCell>

            <TableCell>
                <ActionButtons
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    item={cliente}
                />
            </TableCell>

        </TableRow>
    );

    const renderMobileCard = (cliente) => (
        <Card key={cliente.id} sx={{ mb: 2, elevation: 2 }}>

            <CardContent sx={{ p: 2 }}>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2
                    }}
                >
                    <Box>

                        <Typography
                            variant="h6"
                            sx={{
                                fontSize: '1.1rem',
                                fontWeight: 600
                            }}
                        >
                            {cliente.nome}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            ID: {cliente.id}
                        </Typography>

                    </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 2 }}>

                    <Typography variant="body2">
                        <strong>CPF:</strong> {cliente.cpf}
                    </Typography>

                    <Typography variant="body2">
                        <strong>Telefone:</strong> {cliente.telefone}
                    </Typography>

                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>

                    <ActionButtons
                        item={cliente}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />

                </Box>

            </CardContent>

        </Card>
    );

    return (
        <PageLayout title="Clientes" actions={actions}>

            <Box sx={{ display: { xs: 'none', md: 'block' } }}>

                <TableContainer component={Paper}>

                    <Table>

                        <TableHead>
                            <TableRow>

                                {columns.map((column, index) => (
                                    <TableCell
                                        key={index}
                                        sx={{ fontWeight: 600 }}
                                    >
                                        {column.headerName}
                                    </TableCell>
                                ))}

                            </TableRow>
                        </TableHead>

                        <TableBody>

                            {clientes.map((cliente) =>
                                renderDesktopRow(cliente)
                            )}

                        </TableBody>

                    </Table>

                </TableContainer>

            </Box>

            <Box sx={{ display: { xs: 'block', md: 'none' } }}>

                {clientes.map((cliente) =>
                    renderMobileCard(cliente)
                )}

            </Box>

        </PageLayout>
    );
}

export default ClienteList;