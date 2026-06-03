import Axios from "axios";

export const axios = Axios.create({
    baseURL: "http://192.168.2.63:7000/",
    headers: { "Content-Type": "application/json" },
});

axios.interceptors.request.use(
    (config) => {
        return Promise.resolve(config);
    },
    (error) => Promise.reject(error)
);

axios.interceptors.response.use(
    (response) => Promise.resolve(response),
    (error) => {
        return Promise.reject(error);
    }
);