import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Card, CardContent, Typography, Box, Divider, Chip, CircularProgress } from '@mui/material';
import { FiberNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PageLayout from "../components/common/PageLayout";
import ActionButtons from "../components/common/ActionButtons";
import funcionarioService from '../services/funcionarioService';
import { getGrupoInfo } from '../constants/userGroups';
import showSnackbar from '../utils/snackbar';
import showConfirm from '../utils/confirm';

function FuncionarioList() {
  const navigate = useNavigate();
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFuncionarios = async () => {
    try {
      setLoading(true);
      const data = await funcionarioService.list();
      setFuncionarios(data);
    } catch (error) {
      showSnackbar(error.apiMessage || 'Erro ao carregar funcionários', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFuncionarios();
  }, []);

  const actions = (
    <Button variant="contained" color="primary" onClick={() => navigate('/funcionario')} startIcon={<FiberNew />} sx={{ fontWeight: 600, px: 2, py: 1 }}>
      Novo
    </Button>
  );

  const handleView = (f) => navigate(`/funcionario/view/${f.id}`);
  const handleEdit = (f) => navigate(`/funcionario/edit/${f.id}`);
  const handleDelete = (f) => {
    showConfirm('Excluir Funcionário', `Tem certeza que deseja excluir "${f.nome}"?`,
      async () => {
        try {
          await funcionarioService.delete(f.id);
          showSnackbar('Funcionário excluído com sucesso!', 'success');
          setFuncionarios(prev => prev.filter(x => x.id !== f.id));
        } catch (error) {
          showSnackbar(error.apiMessage || 'Erro ao excluir funcionário', 'error');
        }
      }
    );
  };

  const columns = [
    { headerName: 'ID' }, { headerName: 'Nome' }, { headerName: 'Matrícula' }, { headerName: 'CPF' }, { headerName: 'Telefone' }, { headerName: 'Grupo' }, { headerName: 'Ações' }
  ];

  const renderGrupo = (grupo) => {
    const info = getGrupoInfo(grupo);
    return <Chip label={info.label} color={info.color} size="small" />;
  };

  const renderDesktopRow = (f) => (
    <TableRow key={f.id} hover>
      <TableCell>{f.id}</TableCell>
      <TableCell sx={{ fontWeight: 500 }}>{f.nome}</TableCell>
      <TableCell>{f.matricula}</TableCell>
      <TableCell>{f.cpf}</TableCell>
      <TableCell>{f.telefone}</TableCell>
      <TableCell>{renderGrupo(f.grupo)}</TableCell>
      <TableCell>
        <ActionButtons onView={handleView} onEdit={handleEdit} onDelete={handleDelete} item={f} />
      </TableCell>
    </TableRow>
  );

  const renderMobileCard = (f) => (
    <Card key={f.id} sx={{ mb: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>{f.nome}</Typography>
            <Typography variant="body2" color="text.secondary">ID: {f.id}</Typography>
          </Box>
          {renderGrupo(f.grupo)}
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2"><strong>Matrícula:</strong> {f.matricula}</Typography>
          <Typography variant="body2"><strong>CPF:</strong> {f.cpf}</Typography>
          <Typography variant="body2"><strong>Telefone:</strong> {f.telefone}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <ActionButtons item={f} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <PageLayout title="Funcionários" actions={actions}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Funcionários" actions={actions}>
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
              {funcionarios.map((f) => renderDesktopRow(f))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {funcionarios.map((f) => renderMobileCard(f))}
      </Box>
      {funcionarios.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          Nenhum funcionário cadastrado
        </Typography>
      )}
    </PageLayout>
  );
}

export default FuncionarioList;
