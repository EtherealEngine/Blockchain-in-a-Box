import axios from 'axios';
import Endpoints from '../constants/Endpoints';
import { AdminFirstTimeResponse } from '../models/Admin';

export const GetAdminFirstTime = async () => {
  const endpoint = `${Endpoints.HOST}${Endpoints.GET_ADMIN_FIRSTTIME}`;
  const response = await axios.get<AdminFirstTimeResponse>(endpoint);
  const responseData = response.data;
  return responseData;
};
