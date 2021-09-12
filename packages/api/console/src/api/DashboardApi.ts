import axios from "axios";
import Endpoints from "../constants/Endpoints";


export const GetSideChaninData = async () => {
    // const endpoint = `https://reqres.in/api/users`;
    let email = localStorage.getItem('email')
    const endpoint = `${Endpoints.HOST}${Endpoints.ONBOARDING_DATA}?email=${email}`;


    const response = await axios.get<any>(endpoint);
    const responseData = response.data;

    if (responseData.error) {
        throw responseData.error;
    }

    return responseData;
};