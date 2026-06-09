import { axios } from "./axios/axiosinstance";

class AuthApi {

    static Login = (credentials) => {
        return axios.post("user/login", credentials);
    };

}

export default AuthApi;     