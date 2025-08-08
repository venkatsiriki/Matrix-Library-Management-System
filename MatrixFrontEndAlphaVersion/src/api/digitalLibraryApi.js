import axios from 'axios';
import { API_URL } from './config';
import { getAuthHeader, formatErrorMessage } from './utils';

export const getPublicResources = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/digital-library/public`, {
      params: filters
    });
    return response.data.data;
  } catch (error) {
    throw new Error(formatErrorMessage(error));
  }
};

export const getResources = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/digital-library`, {
      params: filters,
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    throw new Error(formatErrorMessage(error));
  }
};

export const getResource = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/digital-library/${id}`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    throw new Error(formatErrorMessage(error));
  }
};

export const uploadResource = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/digital-library`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  } catch (error) {
    throw new Error(formatErrorMessage(error));
  }
};

export const updateResource = async (id, data, isMultipart = false) => {
  try {
    const headers = isMultipart
      ? { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
      : { ...getAuthHeader() };
    const response = await axios.put(`${API_URL}/digital-library/${id}`, data, {
      headers
    });
    return response.data.data;
  } catch (error) {
    throw new Error(formatErrorMessage(error));
  }
};

export const deleteResource = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/digital-library/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('API Delete error:', error.response || error);
    throw new Error(formatErrorMessage(error));
  }
};

export const downloadResource = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/digital-library/${id}/download`, {
      headers: getAuthHeader(),
      responseType: 'blob'
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', response.headers['content-disposition'].split('filename=')[1].replace(/"/g, ''));
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(formatErrorMessage(error));
  }
}; 