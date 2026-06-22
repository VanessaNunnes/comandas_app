import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Divider, Button, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Print, ArrowBack } from '@mui/icons-material';
import PageLayout from '../components/common/PageLayout';
import recebimentoService from '../services/recebimentoService';
import showSnackbar from '../utils/snackbar';

const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0));

function Comprovante() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comprovante, setComprovante] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await recebimentoService.comprovante(id);
        setComprovante(data);
      } catch (error) {
        showSnackbar(error.apiMessage || 'Erro ao carregar comprovante', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <PageLayout title="Comprovante">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (!comprovante) {
    return (
      <PageLayout title="Comprovante">
        <Typography>Comprovante não encontrado.</Typography>
        <Button sx={{ mt: 2 }} variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/caixa')}>Voltar ao Caixa</Button>
      </PageLayout>
    );
  }

  const { cabecalho, cliente, funcionario, comandas, resumo_valores, recebimento, rodape, data_emissao } = comprovante;

  return (
    <PageLayout title="Comprovante de Recebimento">
      <Paper elevation={2} sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
        {/* Cabeçalho */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{cabecalho?.empresa || 'Comandas do Zé'}</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{cabecalho?.titulo || 'COMPROVANTE DE RECEBIMENTO'}</Typography>
          <Typography variant="body2" color="text.secondary">
            Recebimento Nº {recebimento?.id} · {data_emissao ? new Date(data_emissao).toLocaleString('pt-BR') : ''}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {/* Funcionário / Cliente */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2"><strong>Funcionário:</strong> {funcionario?.nome || '-'}</Typography>
          <Typography variant="body2"><strong>Cliente:</strong> {cliente?.nome || 'Não identificado'}</Typography>
          {recebimento?.data_hora && (
            <Typography variant="body2"><strong>Data/Hora:</strong> {new Date(recebimento.data_hora).toLocaleString('pt-BR')}</Typography>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />

        {/* Comandas e itens */}
        {comandas?.map((c) => (
          <Box key={c.id} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Comanda {c.comanda}</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell align="center">Qtd</TableCell>
                  <TableCell align="right">Unit.</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {c.itens?.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.produto}</TableCell>
                    <TableCell align="center">{item.quantidade}</TableCell>
                    <TableCell align="right">{formatCurrency(item.valor_unitario)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.subtotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 600 }}>
              Subtotal comanda: {formatCurrency(c.subtotal)}
            </Typography>
          </Box>
        ))}
        <Divider sx={{ mb: 2 }} />

        {/* Resumo de valores */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Subtotal:</Typography>
            <Typography variant="body2">{formatCurrency(resumo_valores?.subtotal)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Desconto:</Typography>
            <Typography variant="body2" color="error.main">- {formatCurrency(resumo_valores?.desconto)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Acréscimo:</Typography>
            <Typography variant="body2" color="success.main">+ {formatCurrency(resumo_valores?.acrescimo)}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Valor Final:</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatCurrency(resumo_valores?.valor_final)}</Typography>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
          {rodape?.mensagem || 'Obrigado pela preferência!'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }} className="no-print">
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/caixa')}>Voltar ao Caixa</Button>
          <Button variant="contained" startIcon={<Print />} onClick={() => window.print()}>Imprimir</Button>
        </Box>
      </Paper>
    </PageLayout>
  );
}

export default Comprovante;
