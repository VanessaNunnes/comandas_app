import api from './api';
import { API_ENDPOINTS } from '../config/apiConfig';

const { PRODUTO } = API_ENDPOINTS;

const produtoService = {
  list: async () => {
    const response = await api.get(PRODUTO.LIST);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(PRODUTO.GET.replace(':id', id));
    return response.data;
  },

  create: async (data) => {
    const response = await api.post(PRODUTO.CREATE, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(PRODUTO.UPDATE.replace(':id', id), data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(PRODUTO.DELETE.replace(':id', id));
    return response.data;
  },
};

export default produtoService;
