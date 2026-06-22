import { useEffect, useState, useRef } from 'react';
import SignNowDocApi from '../api/signnowdocument';
import AuthApi from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { FileText, Eye, Send, Trash2, ArrowLeft, Check, AlertCircle, PenTool } from 'lucide-react';

const SignNowDocument = () => {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState('list');
    const [documents, setDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [canvasLoading, setCanvasLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    const [activeEditorToken, setActiveEditorToken] = useState('');
    const [activeDocName, setActiveDocName] = useState('');
    const [activeDocId, setActiveDocId] = useState('');
    const [activeDocStatus, setActiveDocStatus] = useState('draft');

    const [activeDocValue, setActiveDocValue] = useState('0.00');
    const [activeDocCurrency, setActiveDocCurrency] = useState('₹');

    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    // Track active iframe load redirects
    const iframeLoadCount = useRef(0);

    // Approval Recipient Form Hook States
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalDocId, setApprovalDocId] = useState('');
    const [systemUsers, setSystemUsers] = useState([]);
    const [modalRecipients, setModalRecipients] = useState([]);
    const [selectedRecipientEmail, setSelectedRecipientEmail] = useState('');
    const [signerRole, setSignerRole] = useState('Client'); // DYNAMIC FIX: Role variable defaults to original verification structure
    const [customSubject, setCustomSubject] = useState('Action Required: Your Proposed System Agreement Layout Is Ready for Review');
    const [customMessage, setCustomMessage] = useState('Please review and process execution configurations within your document signature block framework panel.');

    // Restricted strictly to super_admin and account_manager only as requested
    const canSend = user && ['super_admin', 'account_manager'].includes(user.role);

    useEffect(() => {
        fetchDocuments();
    }, []);

    // Intercept explicit message closure events dispatched from parent systems
    useEffect(() => {
        const interceptStudioCloseEvent = (event) => {
            if (event.data?.type === "SIGNNOW_STUDIO_CLOSED") {
                setViewMode('list');
                fetchDocuments();
            }
        };
        window.addEventListener("message", interceptStudioCloseEvent);
        return () => window.removeEventListener("message", interceptStudioCloseEvent);
    }, []);

    useEffect(() => {
        if (activeTab === 'all') {
            setFilteredDocuments(documents);
        } else {
            setFilteredDocuments(documents.filter(doc => {
                const cleanStatus = doc.status?.toLowerCase() || 'draft';
                return cleanStatus === activeTab.toLowerCase();
            }));
        }
    }, [activeTab, documents]);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const res = await SignNowDocApi.ListDocuments();
            setDocuments(res.data.results || res.data || []);
        } catch (error) {
            alert(`Failed to load SignNow documents: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLaunchDocument = async (docId, docName, rawStatus) => {
        setLoading(true);
        setCanvasLoading(true);
        try {
            const targetDoc = documents.find(d => d.id === docId);
            if (targetDoc) {
                setActiveDocValue(targetDoc.amount || '0.00');
                setActiveDocCurrency(targetDoc.currency?.symbol || '₹');
            }

            setActiveDocName(docName);
            setActiveDocId(docId);
            setActiveDocStatus(rawStatus?.toLowerCase() || 'draft');

            const response = await SignNowDocApi.GetDocumentEditingSession(docId);
            if (response.data?.token) {
                iframeLoadCount.current = 0;
                setActiveEditorToken(response.data.token);
                setViewMode('editor-canvas');
                setIsPreviewMode(false);
            } else {
                throw new Error("Unable to resolve engine runtime authorization token keys.");
            }
        } catch (error) {
            alert(`Failed to launch document studio: ${error.message}`);
            setCanvasLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const handleIframeLoadTracking = () => {
        if (viewMode !== 'editor-canvas') return;
        setCanvasLoading(false);
        iframeLoadCount.current += 1;
        if (iframeLoadCount.current > 1) {
            setViewMode('list');
            fetchDocuments();
        }
    };

    const handleSendDocument = async (docId) => {
        if (!canSend) {
            alert("Security Clearance Error: Your account role does not have dispatch privileges.");
            return;
        }
        if (!window.confirm("Are you ready to send this contract document to recipients?")) return;
        try {
            await SignNowDocApi.SendDocument(docId);
            alert("Document dispatched and sent successfully!");

            setDocuments(prevDocs => prevDocs.map(doc =>
                doc.id === docId ? { ...doc, status: 'waiting for others', hasRecipient: false, recipients: [] } : doc
            ));

            if (viewMode === 'editor-canvas') setViewMode('list');
        } catch (error) {
            alert(`Failed to dispatch document: ${error.message}`);
        }
    };

    const handleOpenApprovalModal = async (doc) => {
        setApprovalDocId(doc.id);
        setSelectedRecipientEmail('');
        setSignerRole('Client'); // Re-align template strings upon selection trigger actions
        setModalRecipients(doc.recipients || []);
        setShowApprovalModal(true);
        try {
            const res = await AuthApi.ListUsers();
            setSystemUsers(res.data?.data || []);
        } catch (error) {
            alert(`Failed to load workspace application users: ${error.message}`);
        }
    };

    const handleSaveApprovalRecipient = async (e) => {
        e.preventDefault();
        if (!selectedRecipientEmail) {
            alert("Please pick a valid database user profile recipient.");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                email: selectedRecipientEmail,
                subject: customSubject,
                message: customMessage,
                role: signerRole
            };

            await SignNowDocApi.SaveDocumentRecipient(approvalDocId, payload);
            alert("Recipient context integrated successfully!");

            setDocuments(prevDocs => prevDocs.map(doc => {
                if (doc.id === approvalDocId) {
                    const existingRecipients = doc.recipients || [];
                    const existsIdx = existingRecipients.findIndex(r => r.email === selectedRecipientEmail);
                    let updatedRecipients = [...existingRecipients];

                    if (existsIdx > -1) {
                        updatedRecipients[existsIdx] = payload;
                    } else {
                        updatedRecipients.push(payload);
                    }
                    return { ...doc, hasRecipient: true, recipients: updatedRecipients };
                }
                return doc;
            }));

            setShowApprovalModal(false);
        } catch (error) {
            alert(`Failed to bind approval configuration bounds: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleClearAllRecipients = async () => {
        if (!window.confirm("Are you sure you want to clear all configured recipients for this document?")) return;
        setLoading(true);
        try {
            await SignNowDocApi.SaveDocumentRecipient(approvalDocId, { clearAll: true });
            alert("All saved recipients cleared successfully.");

            setDocuments(prevDocs => prevDocs.map(doc =>
                doc.id === approvalDocId ? { ...doc, hasRecipient: false, recipients: [] } : doc
            ));
            setShowApprovalModal(false);
        } catch (error) {
            alert(`Failed to clear recipients: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleManualStatusChange = async (docId, newStatus) => {
        if (!canSend) return;
        if (!window.confirm(`Are you sure you want to manually update this document's status to ${newStatus.toUpperCase()}?`)) return;

        setLoading(true);
        try {
            await SignNowDocApi.UpdateStatus(docId, newStatus);
            setDocuments(prevDocs => prevDocs.map(doc =>
                doc.id === docId ? { ...doc, status: newStatus.toLowerCase() } : doc
            ));
            alert("Document state contextual metrics updated successfully.");
        } catch (error) {
            alert(`Failed to manually transition document boundaries: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDocument = async (docId) => {
        if (!window.confirm("Are you sure you want to permanently delete this document layout template framework? This action cannot be undone.")) return;
        try {
            await SignNowDocApi.DeleteDocument(docId);
            alert("Document dropped successfully.");
            setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== docId));
            if (viewMode === 'editor-canvas') setViewMode('list');
        } catch (error) {
            alert(`Failed to drop document: ${error.message}`);
        }
    };

    const handleTogglePreviewMode = () => {
        setIsPreviewMode(!isPreviewMode);
        setShowMoreMenu(false);
    };

    const handleDownloadDocument = async () => {
        try {
            setLoading(true);
            setShowMoreMenu(false);
            const response = await SignNowDocApi.DownloadDocumentPdf(activeDocId);

            const fileBlob = new Blob([response.data], { type: 'application/pdf' });
            const temporaryDownloadUrl = window.URL.createObjectURL(fileBlob);

            const downloadAnchorElement = document.createElement('a');
            downloadAnchorElement.href = temporaryDownloadUrl;
            downloadAnchorElement.download = `${activeDocName.replace(/\s+/g, '_')}.pdf`;

            document.body.appendChild(downloadAnchorElement);
            downloadAnchorElement.click();

            document.body.removeChild(downloadAnchorElement);
            window.URL.revokeObjectURL(temporaryDownloadUrl);
        } catch (error) {
            alert(`Failed to download PDF document asset compilation: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`agreement-page`}>
            <div className={`agreement-container ${viewMode === 'editor-canvas' ? 'canvas-mode-padding' : 'list-mode-padding'}`}>

                {viewMode === 'list' && (
                    <>
                        <div className="agreement-header header-spacing">
                            <h1 className="dashboard-title">Documents Dashboard</h1>
                            <p className="dashboard-subtitle">Track deployment statuses, client reviews, execution, and audit logs.</p>
                        </div>

                        <div className="tab-filter-bar">
                            {[
                                { id: 'all', label: 'All Statuses' },
                                { id: 'unfinished', label: 'Unfinished' },
                                { id: 'waiting for me', label: 'Waiting for Me' },
                                { id: 'waiting for others', label: 'Waiting for Others' },
                                { id: 'signed', label: 'Signed' },
                                { id: 'pending', label: 'Pending' },
                                { id: 'draft', label: 'Draft' },
                                { id: 'declined', label: 'Declined' },
                                { id: 'delivery failed', label: 'Delivery Failed' },
                                { id: 'expiring soon', label: 'Expiring Soon' },
                                { id: 'expired', label: 'Expired' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`tab-filter-btn ${activeTab === tab.id ? 'tab-active' : ''}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {filteredDocuments.length === 0 ? (
                            <div className="empty-results-notice">
                                No agreements found matching this target status filter context.
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table className="agreement-data-table">
                                    <thead>
                                        <tr className="table-header-row">
                                            <th className="table-th">Document Name</th>
                                            <th className="table-th">Last Modified</th>
                                            <th className="table-th actions-header-th">Actions Framework</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDocuments.map((doc) => {
                                            const cleanStatus = doc.status?.toLowerCase() || 'draft';

                                            return (
                                                <tr key={doc.id} className="table-body-row">
                                                    <td className="table-td td-primary-bold">
                                                        <div className="flex-layout-align">
                                                            <span className="emoji-icon">
                                                                <FileText size={18} className="sn-icon-vertical-middle" />
                                                            </span>
                                                            <div>
                                                                {doc.name}
                                                                {doc.recipients?.length > 0 && (
                                                                    <div style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#6b7280', marginTop: '2px' }}>
                                                                        Configured Signers: {doc.recipients.map(r => `${r.email} (${r.role || 'Client'})`).join(', ')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="table-td td-muted-date">
                                                        {doc.date_modified ? new Date(doc.date_modified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                                    </td>
                                                    <td className="table-td">
                                                        <div className="actions-button-group">
                                                            <button
                                                                type="button"
                                                                className="btn-action btn-open-studio"
                                                                onClick={() => handleLaunchDocument(doc.id, doc.name, doc.status)}
                                                            >
                                                                <Eye size={14} className="sn-icon-margin-right-sm" /> Open Studio
                                                            </button>

                                                            {canSend && (
                                                                <button
                                                                    type="button"
                                                                    className="btn-action btn-send-studio"
                                                                    disabled={cleanStatus === 'draft' && !doc.hasRecipient}
                                                                    onClick={() => handleSendDocument(doc.id)}
                                                                >
                                                                    <Send size={14} className="sn-icon-margin-right-sm" /> Send
                                                                </button>
                                                            )}

                                                            {cleanStatus === 'draft' && canSend && (
                                                                <button
                                                                    type="button"
                                                                    className="btn-action"
                                                                    style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none' }}
                                                                    onClick={() => handleOpenApprovalModal(doc)}
                                                                >
                                                                    <Check size={14} className="sn-icon-margin-right-sm" /> Ask for Approval
                                                                </button>
                                                            )}

                                                            <button
                                                                type="button"
                                                                className="btn-action btn-delete-studio"
                                                                onClick={() => handleDeleteDocument(doc.id)}
                                                            >
                                                                <Trash2 size={14} className="sn-icon-margin-right-sm" /> Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {viewMode === 'editor-canvas' && (
                    <div className="editor-canvas-workspace full-height-flex">
                        <div className="native-pandadoc-header sn-editor-header-wrapper">
                            <button className="pd-exit-arrow-btn sn-back-btn-none" onClick={() => setViewMode('list')}>
                                <ArrowLeft size={16} />
                            </button>
                            <h2 className="sn-editor-header-title">Template Editor Workspace Studio</h2>
                        </div>

                        <div className="sn-canvas-relative-box">
                            {canvasLoading && !isPreviewMode && (
                                <div className="canvas-loader-overlay">
                                    <div className="canvas-spinner"></div>
                                    <div className="canvas-loader-text">Loading secure document studio editor...</div>
                                </div>
                            )}

                            <iframe
                                src={activeEditorToken}
                                title="SignNow Studio Canvas"
                                className="sn-canvas-iframe-element"
                                onLoad={handleIframeLoadTracking}
                            />
                        </div>

                        {isPreviewMode && (
                            <div className="pd-recipient-preview-overlay">
                                <div className="preview-sticky-alert">
                                    <span>
                                        <AlertCircle size={16} className="sn-icon-margin-right-sm" />
                                        You are viewing this agreement in recipient simulation mode. Toolbars, layouts, and field assignment grids have been safely isolated.
                                    </span>
                                </div>
                                <div className="preview-document-scroll-mock">
                                    <div className="preview-rendered-page-sheet">
                                        <h1 className="preview-sheet-title">{activeDocName}</h1>
                                        <div className="preview-divider-line" />
                                        <p className="preview-body-p">This section replicates the visual appearance of your document framework for end clients.</p>
                                        <div className="preview-mock-field-box">
                                            <span className="field-box-label">Signature Field (Client Signer)</span>
                                            <div className="field-box-stub">
                                                <PenTool size={16} className="sn-icon-margin-right-md" /> Click to sign framework assignment
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL WINDOW FOR RECIPIENT ASSIGNMENT SELECTION */}
            {showApprovalModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 99999
                }}>
                    <div style={{
                        backgroundColor: '#fff', padding: '24px', borderRadius: '8px',
                        width: '100%', maxWidth: '520px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>
                            Configure Document Approval Recipient
                        </h3>
                        <form onSubmit={handleSaveApprovalRecipient}>

                            {modalRecipients.length > 0 && (
                                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                                        Currently Configured Signers ({modalRecipients.length}):
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.8125rem', color: '#4b5563' }}>
                                        {modalRecipients.map((r, idx) => (
                                            <li key={idx} style={{ marginBottom: '4px' }}>
                                                <strong>{r.email}</strong> (Role Name: {r.role || 'Client'})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500, color: '#4b5563' }}>
                                    Select Application User
                                </label>
                                <select
                                    value={selectedRecipientEmail}
                                    onChange={(e) => setSelectedRecipientEmail(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem' }}
                                    required
                                >
                                    <option value="">-- Choose User Profile Reference --</option>
                                    {systemUsers.map(u => (
                                        <option key={u.id} value={u.email}>
                                            {u.name} ({u.email}) - {String(u.role).toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* DYNAMIC FIX FIELD: Maps text tokens directly to clear error 65536 code exceptions */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500, color: '#4b5563' }}>
                                    SignNow Template Role Name (Case Sensitive)
                                </label>
                                <input
                                    type="text"
                                    value={signerRole}
                                    onChange={(e) => setSignerRole(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem' }}
                                    placeholder="e.g. Client, Signer 1"
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500, color: '#4b5563' }}>
                                    Custom Subject Line (Disabled - Plan Upgrade Required)
                                </label>
                                <input
                                    type="text"
                                    value={customSubject}
                                    onChange={(e) => setCustomSubject(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                                    disabled
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500, color: '#4b5563' }}>
                                    Custom Invitation Message (Disabled - Plan Upgrade Required)
                                </label>
                                <textarea
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', minHeight: '80px', resize: 'vertical', backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                                    disabled
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
                                {modalRecipients.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleClearAllRecipients}
                                        style={{ marginRight: 'auto', padding: '10px 14px', border: '1px solid #ef4444', borderRadius: '6px', backgroundColor: '#fff', fontSize: '0.875rem', cursor: 'pointer', color: '#ef4444', fontWeight: 500 }}
                                    >
                                        Clear All
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowApprovalModal(false)}
                                    style={{ padding: '10px 18px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', fontSize: '0.875rem', cursor: 'pointer', color: '#374151' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: '10px 18px', border: 'none', borderRadius: '6px', backgroundColor: '#2563eb', color: '#fff', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500 }}
                                >
                                    Insert Recipient Context
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignNowDocument;