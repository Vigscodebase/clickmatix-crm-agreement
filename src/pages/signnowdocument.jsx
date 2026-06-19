import { useEffect, useState } from 'react';
import SignNowDocApi from '../api/signnowdocument';
import { useAuth } from '../context/AuthContext';
import { FileText, Eye, Send, Trash2, ArrowLeft, Folder, Check, MoreVertical, Download, Printer, AlertCircle, PenTool } from 'lucide-react';

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

    const canSend = user && ['super_admin', 'admin', 'account_manager'].includes(user.role);

    useEffect(() => {
        fetchDocuments();
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

    const handleSendDocument = async (docId) => {
        if (!canSend) {
            alert("Security Clearance Error: Your account role does not have dispatch privileges.");
            return;
        }
        if (!window.confirm("Are you ready to send this contract document to recipients?")) return;
        try {
            await SignNowDocApi.SendDocument(docId);
            alert("Document dispatched and sent successfully!");

            // Optimistically move layout status on client state tracking to fit tabs
            setDocuments(prevDocs => prevDocs.map(doc =>
                doc.id === docId ? { ...doc, status: 'waiting for others' } : doc
            ));

            if (viewMode === 'editor-canvas') setViewMode('list');
        } catch (error) {
            alert(`Failed to dispatch document: ${error.message}`);
        }
    };

    const handleManualStatusChange = async (docId, newStatus) => {
        if (!canSend) return;
        if (!window.confirm(`Are you sure you want to manually update this document's status to ${newStatus.toUpperCase()}?`)) return;

        setLoading(true);
        try {
            await SignNowDocApi.UpdateStatus(docId, newStatus);

            // CRITICAL FIX: Update state inline directly rather than triggering fetchDocuments().
            // This prevents the un-synced SignNow API list endpoint from discarding your manual selection.
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
        <div className={`agreement-page ${viewMode === 'editor-canvas' ? 'editor-fullscreen-mode' : ''}`}>
            <div className={`agreement-container ${viewMode === 'editor-canvas' ? 'canvas-mode-padding' : 'list-mode-padding'}`}>

                {viewMode === 'list' && (
                    <>
                        <div className="agreement-header header-spacing">
                            <h1 className="dashboard-title">Documents Dashboard</h1>
                            <p className="dashboard-subtitle">Track deployment statuses, client reviews, execution, and audit logs.</p>
                        </div>

                        {/* SCREENSHOT EXACT CATEGORIES */}
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
                                            <th className="table-th">Status</th>
                                            <th className="table-th">Last Modified</th>
                                            <th className="table-th actions-header-th">Actions Framework</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDocuments.map((doc) => {
                                            const cleanStatus = doc.status?.toLowerCase() || 'draft';
                                            const statusClass = `status-${cleanStatus.replace(/\s+/g, '-')}`;

                                            return (
                                                <tr key={doc.id} className="table-body-row">
                                                    <td className="table-td td-primary-bold">
                                                        <div className="flex-layout-align">
                                                            <span className="emoji-icon">
                                                                <FileText size={18} className="sn-icon-vertical-middle" />
                                                            </span>
                                                            <div>{doc.name}</div>
                                                        </div>
                                                    </td>
                                                    <td className="table-td">
                                                        {canSend ? (
                                                            <select
                                                                value={cleanStatus}
                                                                onChange={(e) => handleManualStatusChange(doc.id, e.target.value)}
                                                                className={`status-badge ${statusClass} sn-select-status-override`}
                                                            >
                                                                <option value="unfinished">UNFINISHED</option>
                                                                <option value="waiting for me">WAITING FOR ME</option>
                                                                <option value="waiting for others">WAITING FOR OTHERS</option>
                                                                <option value="signed">SIGNED</option>
                                                                <option value="pending">PENDING</option>
                                                                <option value="draft">DRAFT</option>
                                                                <option value="declined">DECLINED</option>
                                                                <option value="delivery failed">DELIVERY FAILED</option>
                                                                <option value="expiring soon">EXPIRING SOON</option>
                                                                <option value="expired">EXPIRED</option>
                                                            </select>
                                                        ) : (
                                                            <span className={`status-badge ${statusClass}`}>
                                                                {cleanStatus.toUpperCase()}
                                                            </span>
                                                        )}
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

                                                            {cleanStatus === 'draft' && canSend && (
                                                                <button
                                                                    type="button"
                                                                    className="btn-action btn-send-studio"
                                                                    onClick={() => handleSendDocument(doc.id)}
                                                                >
                                                                    <Send size={14} className="sn-icon-margin-right-sm" /> Send
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
                        <div className="native-pandadoc-header">
                            <div className="pd-header-left">
                                <button
                                    type="button"
                                    className="pd-exit-arrow-btn"
                                    onClick={() => { setViewMode('list'); fetchDocuments(); }}
                                >
                                    <ArrowLeft size={16} />
                                </button>
                                <div className="pd-title-meta-block">
                                    <div className="pd-title-row">
                                        <h2 className="pd-doc-name-heading">{activeDocName}</h2>
                                        <span className="pd-doc-badge-tag">DOCUMENTS</span>
                                    </div>
                                    <div className="pd-sub-meta-row">
                                        <span className={`pd-status-dot dot-${activeDocStatus.replace(/\s+/g, '-')}`} />
                                        <span className="pd-meta-text-item text-capitalize">{activeDocStatus}</span>
                                        <span className="pd-meta-divider">•</span>
                                        <span className="pd-meta-text-item">{activeDocCurrency} {activeDocValue}</span>
                                        <span className="pd-meta-divider">•</span>
                                        <span className="pd-folder-icon">
                                            <Folder size={14} className="sn-icon-vertical-middle" />
                                        </span>
                                        <span className="pd-meta-text-item">All documents</span>
                                        <span className="pd-meta-divider">•</span>
                                        <span className="pd-checkmark-icon">
                                            <Check size={14} className="sn-icon-vertical-middle" />
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pd-header-right">
                                {!isPreviewMode && canSend && (
                                    <button
                                        type="button"
                                        className="pd-btn-finish-yellow"
                                        onClick={() => handleSendDocument(activeDocId)}
                                    >
                                        Finish document
                                    </button>
                                )}

                                {isPreviewMode && (
                                    <button
                                        type="button"
                                        className="pd-btn-edit-mode-back"
                                        onClick={() => setIsPreviewMode(false)}
                                    >
                                        Back to Editor
                                    </button>
                                )}

                                <div className="pd-vertical-separator" />

                                <button
                                    type="button"
                                    className={`pd-icon-action-btn ${isPreviewMode ? 'active-tool-btn' : ''}`}
                                    onClick={handleTogglePreviewMode}
                                >
                                    <Eye size={18} />
                                </button>

                                <div className="pd-dropdown-anchor-wrapper">
                                    <button
                                        type="button"
                                        className={`pd-icon-action-btn ${showMoreMenu ? 'active-dropdown-btn' : ''}`}
                                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                                    >
                                        <MoreVertical size={18} />
                                    </button>

                                    {showMoreMenu && (
                                        <div className="pd-context-dropdown-menu">
                                            <div className="pd-dropdown-item item-clickable" onClick={handleDownloadDocument}>
                                                <Download size={14} className="sn-icon-margin-right-md" /> Download
                                            </div>
                                            <div className="pd-dropdown-item item-clickable" onClick={() => window.print()}>
                                                <Printer size={14} className="sn-icon-margin-right-md" /> Print
                                            </div>
                                            <div className="pd-dropdown-divider" />
                                            <div className="pd-dropdown-item item-clickable text-danger" onClick={() => handleDeleteDocument(activeDocId)}>
                                                <Trash2 size={14} className="sn-icon-margin-right-md" /> Delete
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pd-vertical-separator" />
                                <div className="pd-avatar-circle circle-mini">SA</div>
                            </div>
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
                                onLoad={() => setCanvasLoading(false)}
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
        </div>
    );
};

export default SignNowDocument;