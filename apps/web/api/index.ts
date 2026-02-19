import { env } from "@/env";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
});

export default axiosInstance;
export * from "./auth.api";
