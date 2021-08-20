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
    configureSidechain(state, action: PayloadAction<string[]>) {
      state.organizationName = action.payload[0];
      state.sideChainUrl = action.payload[1];
    },
    configureSigningAuthority(state, action: PayloadAction<string>) {
      state.sideChainMnemonic = action.payload;
    },
    configureTreasury(state, action: PayloadAction<any[]>) {
      state.treasuryMnemonic = action.payload[0] as string;
      state.currencyContractName = action.payload[1] as string;
      state.currencyContractSymbol = action.payload[2] as string;
      state.currencyContractMarketCap = action.payload[3] as string;
      state.assetContractName = action.payload[4] as string;
      state.assetContractSymbol = action.payload[5] as string;
      state.assetContractDescription = action.payload[6] as string;
      state.assetMintable = action.payload[7] as boolean;
      state.mintingFee = action.payload[8] as number;
    },
    configureMainnet(state, action: PayloadAction<string>) {
      state.mainnetMnemonic = action.payload;
    },
    configureInfura(state, action: PayloadAction<string[]>) {
      state.infuraProjectId = action.payload[0] as string;
      state.infuraApiKey = action.payload[1] as string;
    },
    configurePolygon(state, action: PayloadAction<String>) {
      state.polygonMaticMnemonic = action.payload as string;
    },
    configurePolygonVigil(state, action: PayloadAction<String>) {
      state.polygonVigilApiKey = action.payload as string;
    },
  },
});

export const {
  configureSidechain,
  configureSigningAuthority,
  configureTreasury,
} = setupReducer.actions;

export default setupReducer.reducer;
