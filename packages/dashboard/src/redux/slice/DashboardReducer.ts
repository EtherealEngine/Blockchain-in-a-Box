import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type DashboardState = {
    sideChaninLoading: boolean,
    getSideChainUrlData: any,
    userDataLoading: boolean,
    userSavedSuccesssfully: any,
    userListLoading: Boolean,
    userList: []
};

const initialState = {
    getSideChainUrlData: {},
    sideChaninLoading: false,
    userDataLoading: false,
    userSavedSuccesssfully: null,
    userListLoading: false,
    userList: []
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
            state.getSideChainUrlData = { ...action.payload?.User }
            state.sideChaninLoading = false;
        },
        getSideChainUrlFaliure(state) {
            state.sideChaninLoading = false
        },
        addUserDetails(state, action: PayloadAction<any>) {
            state.userDataLoading = true
        },
        addUserDetailsSuccess(state, action: PayloadAction<any>) {
            console.log("REDUCER DASH USER SUCC ", action);
            state.userDataLoading = false
            state.userSavedSuccesssfully = true;
        },
        addUserDetailsFailure(state, action: PayloadAction<any>) {
            console.log("REDUCER DASH USER FAIl ", action);
            state.userDataLoading = false
            state.userSavedSuccesssfully = false;

        },
        getUserList(state) {
            state.userListLoading = true
        },
        getUserListSuccess(state, action: PayloadAction<any>) {
            state.userList = action.payload;
            state.userListLoading = false
        },
        getUserListFaliure(state, action: PayloadAction<any>) {
            state.userList = [...action.payload.Data] as any;
            state.userListLoading = false
        }

    },
});

export const { getSideChainUrlSuccess, getSideChainUrl, getSideChainUrlFaliure,
    addUserDetails, addUserDetailsSuccess, addUserDetailsFailure,
    getUserList, getUserListSuccess, getUserListFaliure } = dashboardReducer.actions;

export default dashboardReducer.reducer;
