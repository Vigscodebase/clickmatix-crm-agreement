import { useEffect, useState } from 'react';
import PandaDocumentApi from '../api/pandadocument';
import { Editor } from 'pandadoc-editor';

const PandaDocument = () => {
    const [viewMode, setViewMode] = useState('list');
    const [documents, setDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    // Active embedded workspace variables
    const [activeEditorToken, setActiveEditorToken] = useState('');
    const [activeDocName, setActiveDocName] = useState('');
    const [activeDocId, setActiveDocId] = useState('');
    const [activeDocStatus, setActiveDocStatus] = useState('draft');

    // Dynamic Document Value Metadata States
    const [activeDocValue, setActiveDocValue] = useState('0.00');
    const [activeDocCurrency, setActiveDocCurrency] = useState('₹');

    // UI Interactive Menu & View Layer Toggles
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    useEffect(() => {
        if (activeTab === 'all') {
            setFilteredDocuments(documents);
        } else {
            setFilteredDocuments(documents.filter(doc => {
                const cleanStatus = doc.status?.toLowerCase().replace('document.', '') || 'draft';
                return cleanStatus === activeTab.toLowerCase();
            }));
        }
    }, [activeTab, documents]);

    useEffect(() => {
        let editorInstance = null;

        if (viewMode === 'editor-canvas' && activeEditorToken && !isPreviewMode) {
            const mountDocumentEditor = async () => {
                try {
                    editorInstance = new Editor("panda-document-canvas-container", {
                        token: activeEditorToken,
                        fieldPlacementOnly: false,
                        hideHeader: true,
                        hideToolbar: false,
                        hideSaveButton: false
                    });
                    await editorInstance.open();
                } catch (err) {
                    console.error("Failed to safely load document workspace studio:", err);
                    alert("A setup error occurred inside the document engine canvas wrapper.");
                }
            };
            mountDocumentEditor();
        }

        return () => {
            if (editorInstance && typeof editorInstance.destroy === 'function') {
                editorInstance.destroy();
            }
        };
    }, [viewMode, activeEditorToken, isPreviewMode]);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const res = await PandaDocumentApi.ListDocuments();
            setDocuments(res.data.results || res.data || []);
        } catch (error) {
            alert(`Failed to load PandaDoc documents: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLaunchDocument = async (docId, docName, rawStatus) => {
        setLoading(true);
        try {
            // Find target document metadata inside inventory layout cache to read dynamic pricing metrics
            const targetDoc = documents.find(d => d.id === docId);
            if (targetDoc) {
                setActiveDocValue(targetDoc.amount || targetDoc.pricing?.total || '0.00');
                setActiveDocCurrency(targetDoc.currency?.symbol || targetDoc.pricing?.currency || '₹');
            }

            setActiveDocName(docName);
            setActiveDocId(docId);
            setActiveDocStatus(rawStatus?.toLowerCase().replace('document.', '') || 'draft');

            const response = await PandaDocumentApi.GetDocumentEditingSession(docId);
            if (response.data?.token) {
                setActiveEditorToken(response.data.token);
                setViewMode('editor-canvas');
                setIsPreviewMode(false);
            } else {
                throw new Error("Unable to resolve engine runtime authorization token keys.");
            }
        } catch (error) {
            alert(`Failed to launch document studio: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSendDocument = async (docId) => {
        if (!window.confirm("Are you ready to send this contract document to recipients?")) return;
        try {
            await PandaDocumentApi.SendDocument(docId);
            alert("Document dispatched and sent successfully!");
            fetchDocuments();
            if (viewMode === 'editor-canvas') setViewMode('list');
        } catch (error) {
            alert(`Failed to dispatch document: ${error.message}`);
        }
    };

    const handleDeleteDocument = async (docId) => {
        if (!window.confirm("Are you sure you want to permanently delete this document layout template framework? This action cannot be undone.")) return;
        try {
            await PandaDocumentApi.DeleteDocument(docId);
            alert("Document dropped successfully.");
            fetchDocuments();
            if (viewMode === 'editor-canvas') setViewMode('list');
        } catch (error) {
            alert(`Failed to drop document: ${error.message}`);
        }
    };

    // =========================================================================
    // FULL REPLICATED FUNCTIONALITY PIPELINES
    // =========================================================================

    // Toggle full preview interface masking layout components
    const handleTogglePreviewMode = () => {
        setIsPreviewMode(!isPreviewMode);
        setShowMoreMenu(false);
    };

    // Download actual processed high-fidelity PDF from server binary blobs
    const handleDownloadDocument = async () => {
        try {
            setLoading(true);
            setShowMoreMenu(false);
            const response = await PandaDocumentApi.DownloadDocumentPdf(activeDocId);

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

    // Triggers a localized shadow focus layout to print inside the frame container bounds
    const handlePrintDocument = () => {
        setShowMoreMenu(false);
        const iframeTarget = document.querySelector('#panda-document-canvas-container iframe');
        if (iframeTarget) {
            try {
                iframeTarget.contentWindow.focus();
                iframeTarget.contentWindow.print();
            } catch (e) {
                window.print();
            }
        } else {
            window.print();
        }
    };

    if (loading && viewMode !== 'editor-canvas') {
        return <div className="agreement-loading">Loading asset documents context...</div>;
    }

    return (
        <div className={`agreement-page ${viewMode === 'editor-canvas' ? 'editor-fullscreen-mode' : ''}`}>
            <div className={`agreement-container ${viewMode === 'editor-canvas' ? 'canvas-mode-padding' : 'list-mode-padding'}`}>

                {/* LIST DASHBOARD VIEW CONTAINER */}
                {viewMode === 'list' && (
                    <>
                        <div className="agreement-header header-spacing">
                            <h1 className="dashboard-title">Documents Dashboard</h1>
                            <p className="dashboard-subtitle">Track deployment statuses, client reviews, execution, and audit logs.</p>
                        </div>

                        {/* STATUS TAB FILTER BAR */}
                        <div className="tab-filter-bar">
                            {['all', 'draft', 'sent', 'viewed', 'completed'].map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    className={`tab-filter-btn ${activeTab === tab ? 'tab-active' : ''}`}
                                >
                                    {tab === 'all' ? 'All Documents' : tab}
                                </button>
                            ))}
                        </div>

                        {/* DOCUMENTS DATA GRID/TABLE */}
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
                                            const cleanStatus = doc.status?.toLowerCase().replace('document.', '') || 'draft';
                                            const statusClass = `status-${cleanStatus}`;

                                            return (
                                                <tr key={doc.id} className="table-body-row">
                                                    <td className="table-td td-primary-bold">
                                                        <div className="flex-layout-align">
                                                            <span className="emoji-icon">📄</span>
                                                            <div>
                                                                <div>{doc.name}</div>
                                                                <span className="metadata-id-tag">ID: {doc.id}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="table-td">
                                                        <span className={`status-badge ${statusClass}`}>
                                                            {cleanStatus.toUpperCase()}
                                                        </span>
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
                                                                👁️ Open Studio
                                                            </button>

                                                            {cleanStatus === 'draft' && (
                                                                <button
                                                                    type="button"
                                                                    className="btn-action btn-send-studio"
                                                                    onClick={() => handleSendDocument(doc.id)}
                                                                >
                                                                    🚀 Send
                                                                </button>
                                                            )}

                                                            <button
                                                                type="button"
                                                                className="btn-action btn-delete-studio"
                                                                onClick={() => handleDeleteDocument(doc.id)}
                                                            >
                                                                🗑️ Delete
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

                {/* FULL-BLEED NATIVE REPLICATED STUDIO ENGINE LAYOUT */}
                {viewMode === 'editor-canvas' && (
                    <div className="editor-canvas-workspace full-height-flex">

                        <div className="native-pandadoc-header">
                            {/* Left Side Metadata Layout Blocks */}
                            <div className="pd-header-left">
                                <button
                                    type="button"
                                    className="pd-exit-arrow-btn"
                                    onClick={() => { setViewMode('list'); fetchDocuments(); }}
                                >
                                    ←
                                </button>
                                <div className="pd-title-meta-block">
                                    <div className="pd-title-row">
                                        <h2 className="pd-doc-name-heading">{activeDocName}</h2>
                                        <span className="pd-doc-badge-tag">DOCUMENTS</span>
                                    </div>
                                    <div className="pd-sub-meta-row">
                                        <span className={`pd-status-dot dot-${activeDocStatus}`} />
                                        <span className="pd-meta-text-item text-capitalize">{activeDocStatus}</span>
                                        <span className="pd-meta-divider">•</span>
                                        <span className="pd-meta-text-item">{activeDocCurrency} {activeDocValue}</span>
                                        <span className="pd-meta-divider">•</span>
                                        <span className="pd-folder-icon">📁</span>
                                        <span className="pd-meta-text-item">All documents</span>
                                        <span className="pd-meta-divider">•</span>
                                        <span className="pd-checkmark-icon">✓</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side Utility Flow Anchors */}
                            <div className="pd-header-right">
                                {!isPreviewMode && (
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

                                {/* Interactive Action Layout Links */}
                                <button
                                    type="button"
                                    className={`pd-icon-action-btn ${isPreviewMode ? 'active-tool-btn' : ''}`}
                                    title="Preview Mode"
                                    onClick={handleTogglePreviewMode}
                                >
                                    👁️
                                </button>

                                {/* Dropdown More Actions Anchoring Panel */}
                                <div className="pd-dropdown-anchor-wrapper">
                                    <button
                                        type="button"
                                        className={`pd-icon-action-btn ${showMoreMenu ? 'active-dropdown-btn' : ''}`}
                                        title="More Actions"
                                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                                    >
                                        ⋮
                                    </button>

                                    {showMoreMenu && (
                                        <div className="pd-context-dropdown-menu">
                                            {/* ACTIVE FUNCTIONAL INTEGRATIONS */}
                                            <div className="pd-dropdown-item item-clickable" onClick={handleDownloadDocument}>📥 Download</div>
                                            <div className="pd-dropdown-item item-clickable" onClick={handlePrintDocument}>🖨️ Print</div>

                                            <div className="pd-dropdown-divider" />

                                            <div className="pd-dropdown-item item-clickable text-danger" onClick={() => handleDeleteDocument(activeDocId)}>🗑️ Delete</div>
                                        </div>
                                    )}
                                </div>

                                <div className="pd-vertical-separator" />

                                <div className="pd-avatar-circle circle-mini">GP</div>
                            </div>
                        </div>

                        {/* Target Canvas Core Layout Wrapper Panels */}
                        {/* <div className="pd-studio-body-viewport"> */}
                        {/* Render interactive SDK container frame only when not overridden by preview status */}
                        <div
                            id="panda-document-canvas-container"
                            className={`flex-canvas-fill ${isPreviewMode ? 'hide-editor-canvas-view' : ''}`}
                        />

                        {/* HIGH FIDELITY ISOLATED CLIENT SIGNING SIMULATION PREVIEW FRAME */}
                        {isPreviewMode && (
                            <div className="pd-recipient-preview-overlay">
                                <div className="preview-sticky-alert">
                                    <span>👀 You are viewing this agreement in recipient simulation mode. Toolbars, layouts, and field assignment grids have been safely isolated.</span>
                                </div>
                                <div className="preview-document-scroll-mock">
                                    <div className="preview-rendered-page-sheet">
                                        <h1 className="preview-sheet-title">{activeDocName}</h1>
                                        <div className="preview-divider-line" />
                                        <p className="preview-body-p">This section replicates the visual appearance of your document framework for end clients.</p>
                                        <div className="preview-mock-field-box">
                                            <span className="field-box-label">Signature Field (Client Signer)</span>
                                            <div className="field-box-stub">🖊️ Click to sign framework assignment</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* </div> */}

                    </div>
                )}

            </div>
        </div>
    );
};

export default PandaDocument;