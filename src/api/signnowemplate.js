import { axios } from "./axios/axiosinstance"

class signnowtemplateApi {

    static ListTemplates = () => {
        return axios.get(`signnowtemp/template-listing`);
    };

    static CreateTemplate = (payload) => {
        return axios.post(`signnowtemp/create-template`, payload);
    };

    static GetTemplateEditingSession = (templateId) => {
        return axios.post(`/signnowtemp/templates/editing-session`, { template_id: templateId });
    };

    static DeleteTemplate = (templateId) => {
        return axios.delete(`/signnowtemp/delete-template/${templateId}`, { template_id: templateId });
    };

}

export default signnowtemplateApi;