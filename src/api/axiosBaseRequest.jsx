import axios from "axios";

const axiosBaseRequest = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    // "Content-Type": "application/json",
    "api-key":
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIiwiZXhwIjoxODQyMDgzMDgzfQ.yERXj3EKo9IgJ-XervKKLTYsSu36oLP7Q-zPQfmgRUs",
  },
});

// Optional: request interceptor (auth token add karva mate)
// axiosBaseRequest.interceptors.request.use(

//   (config) => {
//     const token = localStorage.getItem("token"); // agar tame JWT token store karo cho
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// Optional: response interceptor (error handling mate)
// axiosBaseRequest.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error("API Error:", error);
//     return Promise.reject(error);
//   }
// );

export default axiosBaseRequest;
