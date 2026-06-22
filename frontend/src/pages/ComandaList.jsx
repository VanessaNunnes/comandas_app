import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, Box, Button, Chip, Typography, Card, CardContent, Divider, IconButton } from '@mui/material';
import { FiberNew, Cancel as CancelIcon, AddCircle, Visibility, Edit, Delete } from '@mui/icons-material';
import PageLayout from '../components/common/PageLayout';
import ActionButtons from '../components/common/ActionButtons';
import comandaService from '../services/comandaService';
import showSnackbar from '../utils/snackbar';
import { getStatusConfig } from '../constants/comandaStatus';
import showConfirm from '../utils/confirm';
import Pagination from '../components/common/Pagination';
import ComandaFilters from '../components/common/ComandaFilters';

function ComandaList() {
  const navigate = useNavigate();

  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ skip: 0, limit: 10, currentPage: 1 });
  const [hasItems, setHasItems] = useState(true);

  const handleView = (comanda) => navigate(`/comanda/view/${comanda.id}`);
  const handleEdit = (comanda) => navigate(`/comanda/edit/${comanda.id}`);
  const handleAddItem = (comanda) => navigate(`/comanda/consumo/${comanda.id}`);

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, skip: 0, currentPage: 1 }));
  };
  const handleClearFilters = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, skip: 0, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    const newSkip = (newPage - 1) * pagination.limit;
    setPagination(prev => ({ ...prev, skip: newSkip, currentPage: newPage }));
  };
  const handleItemsPerPageChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, skip: 0, currentPage: 1 }));
  };

  const handleCancel = (comanda) => {
    showConfirm('Cancelar Comanda', `Tem certeza que deseja cancelar a comanda "${comanda.comanda}"?`,
      async () => {
        try {
          await comandaService.cancel(comanda.id);
          showSnackbar('Comanda cancelada com sucesso!', 'success');
          const updated = comandas.map(c => c.id === comanda.id ? { ...c, status: 2 } : c);
          setComandas(updated);
        } catch (error) {
          const mensagem = error.apiMessage || 'Erro ao cancelar comanda';
          showSnackbar(mensagem, 'error');
        }
      }
    );
  };

  const handleDelete = (comanda) => {
    showConfirm('Excluir Comanda', `Tem certeza que deseja excluir a comanda "${comanda.comanda}"?`,
      async () => {
        try {
          await comandaService.delete(comanda.id);
          showSnackbar('Comanda excluída com sucesso!', 'success');
          const updated = comandas.filter(c => c.id !== comanda.id);
          setComandas(updated);
        } catch (error) {
          const mensagem = error.apiMessage || 'Erro ao excluir comanda';
          showSnackbar(mensagem, 'error');
        }
      }
    );
  };

  const actions = (
    <Button variant="contained" color="primary" onClick={() => navigate('/comanda')} startIcon={<FiberNew />} sx={{ fontWeight: 600, px: 2, py: 1 }}>
      Abrir Comanda
    </Button>
  );

  useEffect(() => {
    const loadComandas = async () => {
      try {
        setLoading(true);
        const data = await comandaService.list({ ...filters, ...pagination });
        setComandas(data);
        setHasItems(data.length > 0);
      } catch (error) {
        const mensagem = error.apiMessage || 'Erro ao carregar comandas';
        showSnackbar(mensagem, 'error');
      } finally {
        setLoading(false);
      }
    };
    loadComandas();
  }, [filters, pagination]);

  const columns = [
    { field: 'comanda', headerName: 'Comanda' },
    { field: 'data_hora', headerName: 'Abertura' },
    { field: 'cliente_id', headerName: 'Cliente' },
    { field: 'status', headerName: 'Status' },
    { field: 'actions', headerName: 'Ações' }
  ];

  const renderDesktopRow = (comanda) => {
    const statusConfig = getStatusConfig(comanda.status);
    return (
      <TableRow key={comanda.id}>
        <TableCell>{comanda.comanda}</TableCell>
        <TableCell>{new Date(comanda.data_hora).toLocaleString('pt-BR')}</TableCell>
        <TableCell>{comanda.cliente_id || '-'}</TableCell>
        <TableCell>
          <Chip label={statusConfig.label || 'Desconhecido'} color={statusConfig.color || 'default'} size="small" />
        </TableCell>
        <TableCell>
          {/* ActionButtons padrão + composição (Adicionar Consumo e Cancelar) */}
          <ActionButtons onView={handleView} onEdit={handleEdit} onDelete={handleDelete} item={comanda}>
            <IconButton size="small" color="success" title="Adicionar Consumo"
              sx={{ width: 40, height: 40, '&:hover': { backgroundColor: 'success.light', color: 'white' } }}
              onClick={() => handleAddItem(comanda)}
            >
              <AddCircle fontSize="small" />
            </IconButton>
            <IconButton size="small" color="warning" title="Cancelar Comanda"
              sx={{ width: 40, height: 40, '&:hover': { backgroundColor: 'warning.light', color: 'white' } }}
              onClick={() => handleCancel(comanda)}
            >
              <CancelIcon fontSize="small" />
            </IconButton>
          </ActionButtons>
        </TableCell>
      </TableRow>
    );
  };

  const renderMobileCard = (comanda) => {
    const statusConfig = getStatusConfig(comanda.status);
    return (
      <Card key={comanda.id} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Comanda {comanda.comanda}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(comanda.data_hora).toLocaleString('pt-BR')}
              </Typography>
            </Box>
            <Chip label={statusConfig.label || 'Desconhecido'} color={statusConfig.color || 'default'} size="small" />
          </Box>
          {comanda.cliente_id && (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Cliente: {comanda.cliente_id}
            </Typography>
          )}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <IconButton size="small" color="primary" title="Visualizar"
              sx={{ width: 40, height: 40, '&:hover': { backgroundColor: 'primary.light', color: 'white' } }}
              onClick={() => handleView(comanda)}>
              <Visibility fontSize="small" />
            </IconButton>
            <IconButton size="small" color="secondary" title="Editar"
              sx={{ width: 40, height: 40, '&:hover': { backgroundColor: 'secondary.light', color: 'white' } }}
              onClick={() => handleEdit(comanda)}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" title="Excluir"
              sx={{ width: 40, height: 40, '&:hover': { backgroundColor: 'error.light', color: 'white' } }}
              onClick={() => handleDelete(comanda)}>
              <Delete fontSize="small" />
            </IconButton>
            <IconButton size="small" color="success" title="Adicionar Consumo"
              sx={{ width: 40, height: 40, '&:hover': { backgroundColor: 'success.light', color: 'white' } }}
              onClick={() => handleAddItem(comanda)}>
              <AddCircle fontSize="small" />
            </IconButton>
            <IconButton size="small" color="warning" title="Cancelar Comanda"
              sx={{ width: 40, height: 40, '&:hover': { backgroundColor: 'warning.light', color: 'white' } }}
              onClick={() => handleCancel(comanda)}>
              <CancelIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <PageLayout title="Comandas" actions={actions}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Typography>Carregando comandas...</Typography>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Comandas" actions={actions}>
      <ComandaFilters onFilter={handleFilter} onClear={handleClearFilters} filters={filters} />

      {/* Desktop */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column, index) => (
                  <TableCell key={index} sx={{ fontWeight: 600 }}>{column.headerName}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {comandas.map((comanda) => renderDesktopRow(comanda))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Mobile */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {comandas.map((comanda) => renderMobileCard(comanda))}
      </Box>

      {comandas.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          Nenhuma comanda encontrada
        </Typography>
      )}

      <Pagination
        currentPage={pagination.currentPage}
        itemsPerPage={pagination.limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        loading={loading}
        hasItems={hasItems}
      />
    </PageLayout>
  );
}

export default ComandaList;
