

import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: 'http://localhost:5001/api', // Changed from 127.0.0.1 to localhost
    withCredentials: true,
})