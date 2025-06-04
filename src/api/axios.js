import axios from 'axios';


const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "https://todocardapp-b9d4015df0d8.herokuapp.com/",
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});
// Add a request interceptor to include authentication token if needed
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add authentication token here if needed
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
    (error) => {
        // Handle request error
        return Promise.reject(error);
  }
);

export default axiosInstance;