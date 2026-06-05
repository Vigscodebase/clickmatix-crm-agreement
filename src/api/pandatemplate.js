import { axios } from "./axios/axiosinstance"

class PandaAgreementApi {

    static ListTemplates = () => {
        return axios.get(`pandatemp/template-listing`);
    };

    static CreateTemplate = (templateData) => {
        return axios.post(`pandatemp/create-template`, templateData);
    };

    static GetEditingSession = (templateId) => {
        return axios.post(`pandatemp/create-template-edit`, { template_id: templateId });
    };

}

export default PandaAgreementApi;