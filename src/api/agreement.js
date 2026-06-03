import { axios } from "./axios/axiosinstance"

class AgreementApi {

    static GetAgreementDetails = (id) => {
        return axios.get(`agreement/fetch-fallback/${id}`);
    };

    static UpdateAgreementDetails = (id, data) => {
        return axios.put(`agreement/update/${id}`, data);
    };

}

export default AgreementApi;