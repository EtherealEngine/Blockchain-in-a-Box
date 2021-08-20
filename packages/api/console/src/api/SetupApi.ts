import axios from "axios";
import Endpoints from "../constants/Endpoints";
import { SetupMnemonicResponse, SetupVerifyMnemonicResponse } from "../models/Setup";

export const GetSetupMnemonic = async () => {
  const endpoint = `${Endpoints.HOST}${Endpoints.GET_SETUP_MNEMONIC}`;
  const response = await axios.get<SetupMnemonicResponse>(endpoint);
  const responseData = response.data;

  if (responseData.error) {
    throw responseData.error;
  }

  return responseData;
};

export const PostSetupVerifyMnemonic = async (mnemonic: string) => {
  const endpoint = `${Endpoints.HOST}${Endpoints.POST_SETUP_VERIFY_MNEMONIC}`;
  const body = {
    mnemonic,
  };
  const response = await axios.post<SetupVerifyMnemonicResponse>(endpoint, body);
  const responseData = response.data;

  if (responseData.error) {
    throw responseData.error;
  }

  return responseData;
};
