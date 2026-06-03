import { axios } from "./axios/axiosinstance"

class TemplateApi {

    static GetAllTemplates = () => {
        return axios.get(`template/template-listing`);
    };

    static GetTemplateById = (id) => {
        return axios.get(`template/get-single-template/${id}`);
    };

}

export default TemplateApi;