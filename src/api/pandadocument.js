import { axios } from "./axios/axiosinstance"

class PandaDocumentApi {

    static ListDocuments = () => {
        return axios.get(`pandadoc/document-listing`);
    };

    static CreateDocument = (templateId, documentName) => {
        return axios.post(`pandadoc/create-document`, {
            template_id: templateId,
            name: documentName || "New Contract Agreement"
        });
    };

    static GetDocumentEditingSession = (documentId) => {
        return axios.post(`pandadoc/create-document-edit`, { document_id: documentId });
    };

    static SendDocument = (documentId, payload = { method: 'email' }) => {
        return axios.post(`pandadoc/send-document`, { document_id: documentId, ...payload });
    };

    static UpdateStatus = (documentId, status) => {
        return axios.patch(`pandadoc/update-status`, {
            document_id: documentId,
            status: status
        });
    };

    static DeleteDocument = (documentId) => {
        return axios.delete(`pandadoc/delete-document/${documentId}`);
    };

    static DownloadDocumentPdf = (documentId) => {
        return axios.get(`pandadoc/download-document/${documentId}`, {
            responseType: 'blob'
        });
    };

}

export default PandaDocumentApi;