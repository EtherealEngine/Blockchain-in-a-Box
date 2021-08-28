import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SetupState = {
  organizationName: string;
  sideChainUrl: string;
  sideChainMnemonic: string;
  treasuryMnemonic: string;
  currencyContractName: string;
  currencyContractSymbol: string;
  currencyContractMarketCap: string;
  assetContractName: string;
  assetContractSymbol: string;
  assetContractDescription: string;
  assetMintable: boolean;
  mintingFee: number;
  mainnetMnemonic: string;
  infuraProjectId: string;
  infuraApiKey: string;
  polygonMaticMnemonic: string;
  polygonVigilApiKey: string;
  isLoading: boolean;
  error: string;
};

const initialState = {
  organizationName: "",
  sideChainUrl: "",
  sideChainMnemonic: "",
  treasuryMnemonic: "",
  currencyContractName: "",
  currencyContractSymbol: "",
  currencyContractMarketCap: "",
  assetContractName: "",
  assetContractSymbol: "",
  assetContractDescription: "",
  assetMintable: false,
  mintingFee: 10,
  mainnetMnemonic: "",
  infuraProjectId: "",
  infuraApiKey: "",
  polygonMaticMnemonic: "",
  polygonVigilApiKey: "",
} as SetupState;

const setupReducer = createSlice({
  name: "setup",
  initialState,
  reducers: {
    setOrganizationName(state, action: PayloadAction<string>) {
      state.organizationName = action.payload;
    },
    setSideChainUrl(state, action: PayloadAction<string>) {
      state.sideChainUrl = action.payload;
    },
    setSideChainMnemonic(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.sideChainMnemonic = action.payload;
    },
    setTreasuryMnemonic(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.treasuryMnemonic = action.payload;
    },
    setCurrencyContractName(state, action: PayloadAction<string>) {
      state.currencyContractName = action.payload;
    },
    setCurrencyContractSymbol(state, action: PayloadAction<string>) {
      state.currencyContractSymbol = action.payload;
    },
    setCurrencyContractMarketCap(state, action: PayloadAction<string>) {
      state.currencyContractMarketCap = action.payload;
    },
    setAssetContractName(state, action: PayloadAction<string>) {
      state.assetContractName = action.payload;
    },
    setAssetContractSymbol(state, action: PayloadAction<string>) {
      state.assetContractSymbol = action.payload;
    },
    setAssetContractDescription(state, action: PayloadAction<string>) {
      state.assetContractDescription = action.payload;
    },
    setAssetMintable(state, action: PayloadAction<boolean>) {
      state.assetMintable = action.payload;
    },
    setMintingFee(state, action: PayloadAction<number>) {
      state.mintingFee = action.payload;
    },
    setMainnetMnemonic(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.mainnetMnemonic = action.payload;
    },
    setInfuraProjectId(state, action: PayloadAction<string>) {
      state.infuraProjectId = action.payload;
    },
    setInfuraApiKey(state, action: PayloadAction<string>) {
      state.infuraApiKey = action.payload;
    },
    setPolygonMaticMnemonic(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.polygonMaticMnemonic = action.payload;
    },
    setPolygonVigilApiKey(state, action: PayloadAction<string>) {
      state.polygonVigilApiKey = action.payload;
    },
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  setOrganizationName,
  setSideChainUrl,
  setSideChainMnemonic,
  setTreasuryMnemonic,
  setCurrencyContractName,
  setCurrencyContractSymbol,
  setCurrencyContractMarketCap,
  setAssetContractName,
  setAssetContractSymbol,
  setAssetContractDescription,
  setAssetMintable,
  setMintingFee,
  setMainnetMnemonic,
  setInfuraProjectId,
  setInfuraApiKey,
  setPolygonMaticMnemonic,
  setPolygonVigilApiKey,
  setIsLoading,
  setError
} = setupReducer.actions;

export default setupReducer.reducer;
