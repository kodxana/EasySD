import axios from 'axios';

const BASE_URL = 'https://api.runpod.ai/v1';

const createJob = async (apiKey, params) => {
    const response = await axios.post(`${BASE_URL}/stable-diffusion-v1/run`, { input: params }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
  
    return response.data;
  };  

const getJobStatus = async (apiKey, jobId) => {
  const response = await axios.get(`${BASE_URL}/stable-diffusion-v1/status/${jobId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  return response.data;
};

export default {
  createJob,
  getJobStatus,
};
