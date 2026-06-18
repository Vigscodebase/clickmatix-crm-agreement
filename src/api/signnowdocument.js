import { axios } from "./axios/axiosinstance"

class signnowtemplateApi {

    static ListDocuments = () => {
        return axios.get(`signnowdoc/document-listing`);
    };

    static CreateDocument = (templateId, name) => {
        return axios.post(`signnowdoc/create-document`, { template_id: templateId, name });
    };

    static GetDocumentEditingSession = (docId) => {
        return axios.post(`signnowdoc/templates/create-document-edit`, { document_id: docId });
    };

    static SendDocument = (docId) => {
        return axios.post(`signnowdoc/send-document`, { document_id: docId });
    };

    static UpdateStatus = (docId, status) => {
        return axios.post(`signnowdoc/update-status`, { document_id: docId, status });
    };

    static DownloadDocumentPdf = (docId) => {
        return axios.get(`signnowdoc/download-document/${docId}`, { responseType: 'blob' });
    };

    static DeleteDocument = (docId) => {
        return axios.get(`signnowdoc/delete-document/${docId}`);
    };

}

export default signnowtemplateApi;