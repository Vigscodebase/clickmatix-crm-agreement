import { axios } from "./axios/axiosinstance";

class AuthApi {

    static Login = (credentials) => {
        return axios.post("user/login", credentials);
    };

    static ListUsers = () => {
        return axios.get("user/user-listing");
    };

    static CreateUser = (payload) => {
        return axios.post("user/add-user-account", payload);
    };

    static EditUser = (userId, payload) => {
        return axios.patch(`user/edit-single-user/${userId}`, payload);
    };

    static DeleteUser = (userId, payload) => {
        return axios.patch(`user/update-single-user/${userId}`, payload);
    };

}

export default AuthApi;     