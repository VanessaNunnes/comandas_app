import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Card, CardContent, Typography, Box, Divider, CircularProgress } from '@mui/material';
import { FiberNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PageLayout from "../components/common/PageLayout";
import ActionButtons from "../components/common/ActionButtons";
import clienteService from '../services/clienteService';
import showSnackbar from '../utils/snackbar';
import showConfirm from '../utils/confirm';

function ClienteList() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const data = await clienteService.list();
      setClientes(data);
    } catch (error) {
      showSnackbar(error.apiMessage || 'Erro ao carregar clientes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadClientes();
  }, []);

  const actions = (
    <Button variant="contained" color="primary" onClick={() => navigate('/cliente')} startIcon={<FiberNew />} sx={{ fontWeight: 600, px: 2, py: 1 }}>
      Novo
    </Button>
  );

  const handleView = (cliente) => navigate(`/cliente/view/${cliente.id}`);
  const handleEdit = (cliente) => navigate(`/cliente/edit/${cliente.id}`);
  const handleDelete = (cliente) => {
    showConfirm('Excluir Cliente', `Tem certeza que deseja excluir "${cliente.nome}"?`,
      async () => {
        try {
          await clienteService.delete(cliente.id);
          showSnackbar('Cliente excluído com sucesso!', 'success');
          setClientes(prev => prev.filter(c => c.id !== cliente.id));
        } catch (error) {
          showSnackbar(error.apiMessage || 'Erro ao excluir cliente', 'error');
        }
      }
    );
  };

  const columns = [
    { headerName: 'ID' }, { headerName: 'Nome' }, { headerName: 'CPF' }, { headerName: 'Telefone' }, { headerName: 'Ações' }
  ];

  const renderDesktopRow = (cliente) => (
    <TableRow key={cliente.id} hover>
      <TableCell>{cliente.id}</TableCell>
      <TableCell sx={{ fontWeight: 500 }}>{cliente.nome}</TableCell>
      <TableCell>{cliente.cpf}</TableCell>
      <TableCell>{cliente.telefone}</TableCell>
      <TableCell>
        <ActionButtons onView={handleView} onEdit={handleEdit} onDelete={handleDelete} item={cliente} />
      </TableCell>
    </TableRow>
  );

  const renderMobileCard = (cliente) => (
    <Card key={cliente.id} sx={{ mb: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>{cliente.nome}</Typography>
          <Typography variant="body2" color="text.secondary">ID: {cliente.id}</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2"><strong>CPF:</strong> {cliente.cpf}</Typography>
          <Typography variant="body2"><strong>Telefone:</strong> {cliente.telefone}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <ActionButtons item={cliente} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <PageLayout title="Clientes" actions={actions}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Clientes" actions={actions}>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column, index) => (
                  <TableCell key={index} sx={{ fontWeight: 600 }}>{column.headerName}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {clientes.map((cliente) => renderDesktopRow(cliente))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {clientes.map((cliente) => renderMobileCard(cliente))}
      </Box>
      {clientes.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          Nenhum cliente cadastrado
        </Typography>
      )}
    </PageLayout>
  );
}

export default ClienteList;
