import api from './api';
import { API_ENDPOINTS } from '../config/apiConfig';

const { CLIENTE } = API_ENDPOINTS;

const clienteService = {
  list: async () => {
    const response = await api.get(CLIENTE.LIST);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(CLIENTE.GET.replace(':id', id));
    return response.data;
  },
  create: async (data) => {
    const response = await api.post(CLIENTE.CREATE, data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(CLIENTE.UPDATE.replace(':id', id), data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(CLIENTE.DELETE.replace(':id', id));
    return response.data;
  },
};

export default clienteService;
