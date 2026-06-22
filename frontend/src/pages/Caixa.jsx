import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Checkbox, TextField, Button, Divider, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Avatar
} from '@mui/material';
import { PointOfSale, Search, ReceiptLong } from '@mui/icons-material';
import PageLayout from '../components/common/PageLayout';
import recebimentoService from '../services/recebimentoService';
import showSnackbar from '../utils/snackbar';
import { useAuth } from '../context/AuthContext';

const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0));

function Caixa() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [comandas, setComandas] = useState([]);       
  const [selectedIds, setSelectedIds] = useState([]);  
  const [numeroInput, setNumeroInput] = useState('');
  const [detalhe, setDetalhe] = useState(null);        
  const [loading, setLoading] = useState(true);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [desconto, setDesconto] = useState('');
  const [acrescimo, setAcrescimo] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await recebimentoService.dashboard();
      setComandas(data);
    } catch (error) {
      showSnackbar(error.apiMessage || 'Erro ao carregar comandas abertas', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard();
  }, [loadDashboard]);

  // Carregar detalhe (conferência) sempre que a seleção mudar
  useEffect(() => {
    const loadDetalhe = async () => {
      if (selectedIds.length === 0) {
        setDetalhe(null);
        return;
      }
      try {
        setLoadingDetalhe(true);
        const data = await recebimentoService.detalhar(selectedIds);
        setDetalhe(data);
      } catch (error) {
        showSnackbar(error.apiMessage || 'Erro ao detalhar comandas', 'error');
      } finally {
        setLoadingDetalhe(false);
      }
    };
    loadDetalhe();
  }, [selectedIds]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleAddByNumero = () => {
    const numero = numeroInput.trim();
    if (!numero) return;
    const found = comandas.find(c => String(c.comanda).toLowerCase() === numero.toLowerCase());
    if (!found) {
      showSnackbar(`Comanda "${numero}" não encontrada entre as abertas`, 'warning');
      return;
    }
    if (!selectedIds.includes(found.id)) {
      setSelectedIds(prev => [...prev, found.id]);
    }
    setNumeroInput('');
  };

  const subtotal = detalhe ? Number(detalhe.total_geral) : 0;
  const descontoNum = Number(desconto) || 0;
  const acrescimoNum = Number(acrescimo) || 0;
  const valorFinal = Math.max(0, subtotal - descontoNum + acrescimoNum);

  const handleFinalizar = async () => {
    if (selectedIds.length === 0) {
      showSnackbar('Selecione ao menos uma comanda', 'warning');
      return;
    }
    if (valorFinal < 0) {
      showSnackbar('Valor final não pode ser negativo', 'error');
      return;
    }
    try {
      setProcessing(true);
      const primeira = detalhe?.comandas?.find(c => c.cliente);
      const cliente_id = primeira?.cliente?.id || null;
      const payload = {
        comandas_ids: selectedIds,
        cliente_id,
        funcionario_id: user?.id,
        desconto_valor: descontoNum,
        acrescimo_valor: acrescimoNum,
      };
      const result = await recebimentoService.receber(payload);
      showSnackbar('Recebimento realizado com sucesso!', 'success');
      navigate(`/caixa/comprovante/${result.recebimento_id}`);
    } catch (error) {
      showSnackbar(error.apiMessage || 'Erro ao processar recebimento', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Caixa">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Caixa">
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>

        {/* COLUNA 1 - Dashboard de comandas abertas */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PointOfSale /> Comandas Abertas
          </Typography>

          {/* Selecionar por número */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              size="small" fullWidth label="Número da comanda"
              value={numeroInput}
              onChange={(e) => setNumeroInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddByNumero(); } }}
            />
            <Button variant="outlined" startIcon={<Search />} onClick={handleAddByNumero}>
              Selecionar
            </Button>
          </Box>

          {comandas.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              Nenhuma comanda aberta
            </Typography>
          ) : (
            comandas.map((c) => {
              const selected = selectedIds.includes(c.id);
              return (
                <Card
                  key={c.id}
                  onClick={() => toggleSelect(c.id)}
                  sx={{
                    mb: 1.5, cursor: 'pointer',
                    border: selected ? '2px solid' : '1px solid',
                    borderColor: selected ? 'primary.main' : 'divider',
                    backgroundColor: selected ? 'primary.50' : 'background.paper'
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Checkbox checked={selected} onChange={() => toggleSelect(c.id)} onClick={(e) => e.stopPropagation()} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Comanda {c.comanda}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {c.cliente ? `Cliente: ${c.cliente.nome}` : 'Cliente não identificado'} · {c.quantidade_produtos} itens
                      </Typography>
                    </Box>
                    <Chip label={formatCurrency(c.total)} color="success" />
                  </CardContent>
                </Card>
              );
            })
          )}
        </Box>

        {/* COLUNA 2 - Conferência e recebimento */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptLong /> Conferência {selectedIds.length > 0 && `(${selectedIds.length} comanda(s))`}
          </Typography>

          {loadingDetalhe ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : !detalhe || selectedIds.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              Selecione uma ou mais comandas para conferência
            </Typography>
          ) : (
            <>
              {detalhe.comandas.map((c) => (
                <Box key={c.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Comanda {c.comanda} {c.cliente ? `· ${c.cliente.nome}` : ''}
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Produto</TableCell>
                          <TableCell align="center">Qtd</TableCell>
                          <TableCell align="right">Unit.</TableCell>
                          <TableCell align="right">Subtotal</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {c.itens.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {item.produto?.foto && (
                                <Avatar
                                  variant="rounded"
                                  src={String(item.produto.foto).startsWith('data:') ? item.produto.foto : `data:image/*;base64,${item.produto.foto}`}
                                  alt={item.nome}
                                  sx={{ width: 32, height: 32 }}
                                />
                              )}
                              {item.nome}
                            </TableCell>
                            <TableCell align="center">{item.quantidade}</TableCell>
                            <TableCell align="right">{formatCurrency(item.valor_unitario)}</TableCell>
                            <TableCell align="right">{formatCurrency(item.subtotal)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="body2" sx={{ textAlign: 'right', mt: 0.5, fontWeight: 600 }}>
                    Subtotal: {formatCurrency(c.subtotal)}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              {/* Desconto / Acréscimo */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Desconto (R$)" type="number" size="small" fullWidth
                  value={desconto} onChange={(e) => setDesconto(e.target.value)}
                  inputProps={{ min: 0, step: '0.01' }}
                />
                <TextField
                  label="Acréscimo (R$)" type="number" size="small" fullWidth
                  value={acrescimo} onChange={(e) => setAcrescimo(e.target.value)}
                  inputProps={{ min: 0, step: '0.01' }}
                />
              </Box>

              {/* Resumo */}
              <Box sx={{ p: 2, backgroundColor: 'grey.100', borderRadius: 1, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">{formatCurrency(subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Desconto:</Typography>
                  <Typography variant="body2" color="error.main">- {formatCurrency(descontoNum)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Acréscimo:</Typography>
                  <Typography variant="body2" color="success.main">+ {formatCurrency(acrescimoNum)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Total:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatCurrency(valorFinal)}</Typography>
                </Box>
              </Box>

              <Button
                variant="contained" color="success" fullWidth size="large"
                onClick={handleFinalizar} disabled={processing}
                startIcon={<PointOfSale />}
              >
                {processing ? 'Processando...' : 'Finalizar Recebimento'}
              </Button>
            </>
          )}
        </Box>
      </Box>
    </PageLayout>
  );
}

export default Caixa;
