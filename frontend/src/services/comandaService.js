import api from './api';
import { API_ENDPOINTS } from '../config/apiConfig';

const { COMANDA } = API_ENDPOINTS;

const comandaService = {
  list: async (params = {}) => {
    const { skip = 0, limit = 100, id, comanda, status, funcionario_id, cliente_id, data_inicio, data_fim } = params;
    const queryParams = new URLSearchParams();
    queryParams.append('skip', skip);
    queryParams.append('limit', limit);
    if (id !== undefined && id !== null && id !== '') queryParams.append('id', id);
    if (comanda !== undefined && comanda !== null && comanda !== '') queryParams.append('comanda', comanda);
    if (status !== undefined && status !== null && status !== '') queryParams.append('status', status);
    if (funcionario_id !== undefined && funcionario_id !== null && funcionario_id !== '') queryParams.append('funcionario_id', funcionario_id);
    if (cliente_id !== undefined && cliente_id !== null && cliente_id !== '') queryParams.append('cliente_id', cliente_id);
    if (data_inicio !== undefined && data_inicio !== null && data_inicio !== '') queryParams.append('data_inicio', data_inicio);
    if (data_fim !== undefined && data_fim !== null && data_fim !== '') queryParams.append('data_fim', data_fim);
    const response = await api.get(`${COMANDA.LIST}?${queryParams.toString()}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(COMANDA.GET.replace(':id', id));
    return response.data;
  },

  checkEmUso: async (comanda, id = null) => {
    const params = { comanda, status: 0 };
    if (id) {
      params.exclude_id = id;
    }
    const response = await api.get(`${COMANDA.LIST}?${new URLSearchParams(params).toString()}`);
    const comandas = response.data || response;
    return comandas.length > 0 ? comandas[0] : null;
  },

  create: async (comandaData) => {
    const response = await api.post(COMANDA.CREATE, comandaData);
    return response.data;
  },

  update: async (id, comandaData) => {
    const response = await api.put(COMANDA.UPDATE.replace(':id', id), comandaData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(COMANDA.DELETE.replace(':id', id));
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.put(COMANDA.CANCEL.replace(':id', id));
    return response.data;
  },

  fechar: async (id) => {
    const response = await api.put(COMANDA.UPDATE.replace(':id', id), { status: 1 });
    return response.data;
  },

  addItem: async (comandaId, itemData) => {
    const response = await api.post(COMANDA.ADD_ITEM.replace(':id', comandaId), itemData);
    return response.data;
  },

  listItems: async (comandaId, params = {}) => {
    const { skip = 0, limit = 100 } = params;
    const queryParams = new URLSearchParams();
    queryParams.append('skip', skip);
    queryParams.append('limit', limit);
    const response = await api.get(`${COMANDA.LIST_ITEMS.replace(':id', comandaId)}?${queryParams.toString()}`);
    return response.data;
  },

  updateItem: async (itemId, itemData) => {
    const response = await api.put(COMANDA.UPDATE_ITEM.replace(':id', itemId), itemData);
    return response.data;
  },

  removeItem: async (itemId) => {
    const response = await api.delete(COMANDA.REMOVE_ITEM.replace(':id', itemId));
    return response.data;
  }
};

export default comandaService;
