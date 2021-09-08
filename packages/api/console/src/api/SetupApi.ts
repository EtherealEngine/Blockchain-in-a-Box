import axios from "axios";
import Endpoints from "../constants/Endpoints";


export const PostSetupData = async (data: any) => {
    // const endpoint = `https://reqres.in/api/users`;
    const endpoint = `${Endpoints.HOST}${Endpoints.SETUP_ORG}`;
    const body = {
        data,
    };
    console.log("API ", body);

    const response = await axios.post<any>(endpoint, body);
    const responseData = response.data;

    if (responseData.error) {
        throw responseData.error;
    }

    return responseData;
};