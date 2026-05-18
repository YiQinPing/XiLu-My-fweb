import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
});

// 请求拦截：注入 token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("xilu-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截：处理 401 和通用错误
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("xilu-token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
