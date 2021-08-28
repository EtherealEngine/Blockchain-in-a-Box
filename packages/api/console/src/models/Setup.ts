
export interface SetupMnemonicResponse {
  status: string;
  mnemonic: string;
  error: string;
}

export interface SetupVerifyMnemonicResponse {
  status: string;
  isValid: boolean;
  error: string;
}
