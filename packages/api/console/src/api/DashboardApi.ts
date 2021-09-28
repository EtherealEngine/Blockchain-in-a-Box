import axios from "axios";
import Endpoints from "../constants/Endpoints";

let email = localStorage.getItem('email')

export const GetSideChaninData = async () => {
    // const endpoint = `https://reqres.in/api/users`;
    console.log("EMAIL ", email);


    const endpoint = `${Endpoints.HOST}${Endpoints.ONBOARDING_DATA}?email=${email}`;


    const response = await axios.get<any>(endpoint);
    const responseData = response.data;

    if (responseData.error) {
        throw responseData.error;
    }

    return responseData;
};

export const GetUserListData = async () => {
    // const endpoint = `https://reqres.in/api/users`;

    const endpoint = `${Endpoints.HOST}${Endpoints.ADD_USER}?email=${email}`;


    const response = await axios.get<any>(endpoint);
    const responseData = response.data.Data;

    if (responseData.error) {
        throw responseData.error;
    }

    return responseData;
};

export const AddUserDataApi = async (data: any) => {
    // const endpoint = `https://reqres.in/api/users`;
    let email = localStorage.getItem('email')
    const endpoint = `${Endpoints.HOST}${Endpoints.ADD_USER}`;

    data = { ...data, email }



    const response = await axios.post<any>(endpoint, data);
    console.log("USER DATA ", response);

    const responseData = response.data;

    if (responseData.error) {
        throw responseData.error;
    }

    return responseData;
};

export const DeploymentAPI = async (data: any) => {
    // const endpoint = `https://reqres.in/api/users`;
    const endpoint = `${Endpoints.HOST}${Endpoints.DEPLOYMENT}`;

    data = { networkType: data, email }



    const response = await axios.post<any>(endpoint, data);
    console.log("DEPLOYMENT", response);

    const responseData = response.data;

    if (responseData.error) {
        throw responseData.error;
    }

    return responseData;
};