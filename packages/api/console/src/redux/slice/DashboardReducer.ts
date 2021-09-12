import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type DashboardState = {
    sideChaninLoading: boolean,
    getSideChainUrlData: any
};

const initialState = {
    getSideChainUrlData: {},
    sideChaninLoading: false
} as DashboardState;

const dashboardReducer = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        getSideChainUrl(state) {
            console.log("getSideChainUrl reducer ");

            state.sideChaninLoading = true;
        },
        getSideChainUrlSuccess(state, action: PayloadAction<any>) {
            console.log("REDUCER DASH SUCC ", action);
            state.getSideChainUrlData = { ...action.payload?.User }
            state.sideChaninLoading = false;
        },
        getSideChainUrlFaliure(state) {
            state.sideChaninLoading = false
        },

    },
});

export const { getSideChainUrlSuccess, getSideChainUrl, getSideChainUrlFaliure } = dashboardReducer.actions;

export default dashboardReducer.reducer;
