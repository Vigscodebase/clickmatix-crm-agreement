import { axios } from "./axios/axiosinstance"

class PandaAgreementApi {

    static ListTemplates = () => {
        return axios.get(`pandadoc/template-listing`);
    };

    static CreateTemplate = (templateData) => {
        return axios.post(`pandadoc/create-template`, templateData);
    };

}

export default PandaAgreementApi;