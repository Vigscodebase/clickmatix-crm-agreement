import { axios } from "./axios/axiosinstance";

class RoleApi {

    static GetRoles = () => {
        return axios.get("role/all-roles");
    };

}

export default RoleApi;