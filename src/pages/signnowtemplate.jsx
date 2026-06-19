import { useState, useEffect, useRef } from 'react';
import SignNowTempApi from '../api/signnowemplate';
import { FileText, PlusCircle, FolderOpen, ArrowLeft, Trash2, X } from 'lucide-react';

const SignNowTemplateManager = () => {
    const [viewMode, setViewMode] = useState('menu'); // menu | template-grid | template-editor
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeEditorUrl, setActiveEditorUrl] = useState('');

    // Modal Specific State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');

    const iframeLoadCount = useRef(0);

    useEffect(() => {
        if (viewMode === 'template-grid') {
            fetchTemplates();
        }
    }, [viewMode]);

    useEffect(() => {
        const interceptStudioCloseEvent = (event) => {
            if (event.data?.type === "SIGNNOW_STUDIO_CLOSED") {
                setViewMode('template-grid');
                fetchTemplates();
            }
        };
        window.addEventListener("message", interceptStudioCloseEvent);
        return () => window.removeEventListener("message", interceptStudioCloseEvent);
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await SignNowTempApi.ListTemplates();
            setTemplates(response.data.results || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setNewTemplateName('');
        setIsModalOpen(true);
    };

    const handleCloseAndResetModal = () => {
        setNewTemplateName('');
        setIsModalOpen(false);
    };

    const handleConfirmCreateTemplate = async () => {
        const autoName = `Template Asset — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        const finalTemplateName = newTemplateName.trim() || autoName;

        setIsModalOpen(false);
        setLoading(true);
        try {
            const response = await SignNowTempApi.CreateTemplate({
                name: finalTemplateName,
                description: 'Generated via Express CRM Asset Manager'
            });

            if (response.data?.token) {
                iframeLoadCount.current = 0;
                setActiveEditorUrl(response.data.token);
                setViewMode('template-editor');
            }
        } catch (error) {
            alert(`Failed to generate template payload reference: ${error.message}`);
        } finally {
            setLoading(false);
            setNewTemplateName('');
        }
    };

    const handleEditTemplateLayout = async (templateId) => {
        setLoading(true);
        try {
            const response = await SignNowTempApi.GetTemplateEditingSession(templateId);
            if (response.data?.token) {
                iframeLoadCount.current = 0;
                setActiveEditorUrl(response.data.token);
                setViewMode('template-editor');
            }
        } catch (error) {
            alert(`Failed to launch workspace template studio canvas: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTemplate = async (templateId) => {
        if (!window.confirm("Are you sure you want to permanently delete this layout template framework? This action cannot be undone.")) return;

        setLoading(true);
        try {
            await SignNowTempApi.DeleteTemplate(templateId);
            await fetchTemplates();
        } catch (error) {
            alert(`Failed to drop layout template: ${error.message}`);
            setLoading(false);
        }
    };

    const handleIframeLoadTracking = () => {
        if (viewMode !== 'template-editor') return;

        iframeLoadCount.current += 1;

        if (iframeLoadCount.current > 1) {
            setViewMode('template-grid');
            fetchTemplates();
        }
    };

    if (loading && viewMode !== 'template-editor') {
        return <div className="agreement-loading">Processing layout templates context matrix...</div>;
    }

    return (
        <div className="agreement-page">
            <div className="agreement-container list-mode-padding">

                {/* MENU VIEW BLOCK */}
                {viewMode === 'menu' && (
                    <>
                        <div className="agreement-header header-spacing">
                            <h1 className="dashboard-title">Agreement Template Manager</h1>
                            <p className="dashboard-subtitle">Choose an option to manage your assets</p>
                        </div>

                        <div className="sn-menu-grid">
                            <div className="menu-card item-clickable sn-menu-card" onClick={handleOpenCreateModal}>
                                <div className="sn-menu-card-inner">
                                    <PlusCircle size={24} className="sn-blue-brand-icon" />
                                    <div>
                                        <h3 className="sn-menu-card-title">Create New Template</h3>
                                        <p className="sn-menu-card-desc">Instantly generate and open a brand new layout workspace context.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="menu-card item-clickable sn-menu-card" onClick={() => setViewMode('template-grid')}>
                                <div className="sn-menu-card-inner">
                                    <FolderOpen size={24} className="sn-blue-brand-icon" />
                                    <div>
                                        <h3 className="sn-menu-card-title">View Existing Workspace Templates</h3>
                                        <p className="sn-menu-card-desc">Fetch, browse, and natively modify your account layout models in real time.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* GRID INVENTORY VIEW BLOCK */}
                {viewMode === 'template-grid' && (
                    <>
                        <div className="agreement-header header-spacing sn-header-actions-row">
                            <div>
                                <h1 className="dashboard-title">Agreement Template Manager</h1>
                                <p className="dashboard-subtitle">Active Custom Account Workspace Layouts</p>
                            </div>
                            <button className="btn-back-menu sn-btn-back-menu" onClick={() => setViewMode('menu')}>
                                Back to Menu
                            </button>
                        </div>

                        <h3 className="sn-grid-section-title">Available Account Templates ({templates.length})</h3>

                        <div className="sn-template-cards-grid">
                            {templates.map(tmpl => (
                                <div key={tmpl.id} className="sn-template-card-container">
                                    <div className="sn-template-card-title-row">
                                        <FileText size={18} className="sn-muted-gray-icon" />
                                        <h4 className="sn-template-card-title-text">{tmpl.name}</h4>
                                    </div>

                                    <div className="sn-template-card-actions-wrapper">
                                        <button onClick={() => handleEditTemplateLayout(tmpl.id)} className="sn-btn-card-edit">
                                            <FileText size={14} /> Edit
                                        </button>
                                        <button onClick={() => handleDeleteTemplate(tmpl.id)} className="sn-btn-card-delete" title="Permanently Drop Template">
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* WORKSPACE IFRAME CANVAS EDITING RUNTIME */}
                {viewMode === 'template-editor' && (
                    <div className="editor-canvas-workspace full-height-flex">
                        <div className="native-pandadoc-header sn-editor-header-wrapper">
                            <button className="pd-exit-arrow-btn sn-back-btn-none" onClick={() => setViewMode('template-grid')}>
                                <ArrowLeft size={16} />
                            </button>
                            <h2 className="sn-editor-header-title">Template Editor Workspace Studio</h2>
                        </div>
                        <div className="sn-canvas-relative-box">
                            <iframe
                                src={activeEditorUrl}
                                title="SignNow Embedded Studio Workspace"
                                className="sn-canvas-iframe-element"
                                onLoad={handleIframeLoadTracking}
                            />
                        </div>
                    </div>
                )}

                {/* COMPONENT MODAL OVERLAY WRAPPER */}
                {isModalOpen && (
                    <div
                        className="sn-modal-overlay"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                    >
                        <div
                            className="sn-modal-container"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sn-modal-header">
                                <h3 className="sn-modal-title">Create New Agreement Template</h3>
                                <button
                                    onClick={handleCloseAndResetModal}
                                    className="sn-modal-close-icon-btn"
                                    title="Close Dialog"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="sn-modal-body">
                                <label className="sn-modal-input-label">
                                    Template Name
                                </label>
                                <input
                                    type="text"
                                    value={newTemplateName}
                                    onChange={(e) => setNewTemplateName(e.target.value)}
                                    onKeyDown={(e) => {
                                        e.stopPropagation();
                                        if (e.key === 'Enter') handleConfirmCreateTemplate();
                                    }}
                                    placeholder="e.g., Enterprise NDA Workspace Model"
                                    className="sn-modal-text-input-field"
                                    autoFocus
                                />
                                <p className="sn-modal-input-hint-text">
                                    Leave empty to automatically fall back to the system's baseline date nomenclature framework.
                                </p>
                            </div>

                            <div className="sn-modal-footer">
                                <button
                                    onClick={handleCloseAndResetModal}
                                    className="sn-modal-cancel-btn"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmCreateTemplate}
                                    className="sn-modal-save-btn"
                                >
                                    Save Template
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default SignNowTemplateManager;