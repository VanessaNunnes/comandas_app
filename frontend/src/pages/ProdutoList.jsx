import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Card, CardContent, Typography, Box, Divider, Avatar, CircularProgress } from '@mui/material';
import { FiberNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PageLayout from "../components/common/PageLayout";
import ActionButtons from "../components/common/ActionButtons";
import produtoService from '../services/produtoService';
import showSnackbar from '../utils/snackbar';
import showConfirm from '../utils/confirm';

function ProdutoList() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProdutos = async () => {
    try {
      setLoading(true);
      const data = await produtoService.list();
      setProdutos(data);
    } catch (error) {
      showSnackbar(error.apiMessage || 'Erro ao carregar produtos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProdutos();
  }, []);

  const actions = (
    <Button variant="contained" color="primary" onClick={() => navigate('/produto')} startIcon={<FiberNew />} sx={{ fontWeight: 600, px: 2, py: 1 }}>
      Novo
    </Button>
  );

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
  const handleView = (produto) => navigate(`/produto/view/${produto.id}`);
  const handleEdit = (produto) => navigate(`/produto/edit/${produto.id}`);
  const handleDelete = (produto) => {
    showConfirm('Excluir Produto', `Tem certeza que deseja excluir "${produto.nome}"?`,
      async () => {
        try {
          await produtoService.delete(produto.id);
          showSnackbar('Produto excluído com sucesso!', 'success');
          setProdutos(prev => prev.filter(p => p.id !== produto.id));
        } catch (error) {
          showSnackbar(error.apiMessage || 'Erro ao excluir produto', 'error');
        }
      }
    );
  };

  const columns = [
    { field: 'foto', headerName: 'Foto' },
    { field: 'id', headerName: 'ID' },
    { field: 'nome', headerName: 'Nome' },
    { field: 'descricao', headerName: 'Descrição' },
    { field: 'valor_unitario', headerName: 'Valor Unitário' },
    { field: 'actions', headerName: 'Ações' }
  ];

  const renderDesktopRow = (produto) => (
    <TableRow key={produto.id} hover>
      <TableCell>
        <Avatar variant="rounded" src={produto.foto || undefined} alt={produto.nome} sx={{ width: 44, height: 44, bgcolor: 'grey.200' }} />
      </TableCell>
      <TableCell>{produto.id}</TableCell>
      <TableCell sx={{ fontWeight: 500 }}>{produto.nome}</TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {produto.descricao}
        </Typography>
      </TableCell>
      <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>{formatCurrency(produto.valor_unitario)}</TableCell>
      <TableCell>
        <ActionButtons onView={handleView} onEdit={handleEdit} onDelete={handleDelete} item={produto} />
      </TableCell>
    </TableRow>
  );

  const renderMobileCard = (produto) => (
    <Card key={produto.id} sx={{ mb: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar variant="rounded" src={produto.foto || undefined} alt={produto.nome} sx={{ width: 60, height: 60, bgcolor: 'grey.200' }} />
            <Box>
              <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>{produto.nome}</Typography>
              <Typography variant="body2" color="text.secondary">ID: {produto.id}</Typography>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>Descrição:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{produto.descricao}</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">Valor Unitário:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>{formatCurrency(produto.valor_unitario)}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <ActionButtons item={produto} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <PageLayout title="Produtos" actions={actions}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Produtos" actions={actions}>
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
              {produtos.map((produto) => renderDesktopRow(produto))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {produtos.map((produto) => renderMobileCard(produto))}
      </Box>
      {produtos.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          Nenhum produto cadastrado
        </Typography>
      )}
    </PageLayout>
  );
}

export default ProdutoList;
