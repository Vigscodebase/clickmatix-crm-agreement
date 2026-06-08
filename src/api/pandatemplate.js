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

    static DeleteTemplate = (templateId) => {
        return axios.delete(`pandatemp/delete-template/${templateId}`);
    };

}

export default PandaAgreementApi;