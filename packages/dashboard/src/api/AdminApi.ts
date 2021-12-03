import axios from "axios";
import Endpoints from "../constants/Endpoints";
import {
  AdminAuthenticationResponse,
  AdminFirstTimeResponse,
  AdminPlainResponse,
} from "../models/Admin";

export const GetAdminFirstTime = async () => {
  const endpoint = `${Endpoints.HOST}${Endpoints.GET_ADMIN_FIRSTTIME}`;
  const response = await axios.get<AdminFirstTimeResponse>(endpoint);
  const responseData = response.data;

  if (responseData.error) {
    throw responseData.error;
  }

  return responseData;
};

export const PostAdminLogin = async (email: string) => {
  const endpoint = `${Endpoints.HOST}${Endpoints.POST_ADMIN_LOGIN}`;
  const body = {
    email,
  };
  const response = await axios.post<AdminPlainResponse>(endpoint, body);
  const responseData = response.data;

  if (responseData.error) {
    throw responseData.error;
  }

  return responseData;
};

export const PostAdminAuthentication = async (payload: string[]) => {
  const endpoint = `${Endpoints.HOST}${Endpoints.POST_ADMIN_AUTHENTICATION}`;
  const body = {
    email: payload[0],
    token: payload[1],
  };
  const response = await axios.post<AdminAuthenticationResponse>(
    endpoint,
    body
  );
  const responseData = response.data;

  if (responseData.error) {
    throw responseData.error;
  }

  return responseData;
};
