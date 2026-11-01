import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let sessionEndedHandler = null;

export const setSessionEndedHandler = (handler) => {
  sessionEndedHandler = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.code === "SESSION_ENDED") {
      sessionEndedHandler?.();
    }

    return Promise.reject(error);
  },
);

export default api;
