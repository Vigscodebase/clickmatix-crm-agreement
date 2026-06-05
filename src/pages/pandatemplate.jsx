import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PandaTemplateApi from '../api/pandatemplate';
import PandaDocumentApi from '../api/pandadocument';
import { Editor } from 'pandadoc-editor';

const PandaTemplate = () => {
    const navigate = useNavigate();

    // View control states: 'selection', 'existing', 'system-gallery', 'new', or 'editor-canvas'
    const [viewMode, setViewMode] = useState('selection');
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [activeEditorToken, setActiveEditorToken] = useState('');
    const [activeTemplateName, setActiveTemplateName] = useState('');
    const [activeTemplateId, setActiveTemplateId] = useState('');

    // Dropdown UI Toggles
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    // Form state for creating a new template
    const [newTemplateData, setNewTemplateData] = useState({
        name: '',
        description: '',
        sourcePresetId: ''
    });

    // Safely initialize the interactive editing session canvas when view updates
    useEffect(() => {
        let editorInstance = null;

        if (viewMode === 'editor-canvas' && activeEditorToken) {
            const mountPandaEditor = async () => {
                try {
                    editorInstance = new Editor("panda-editor-canvas-container", {
                        token: activeEditorToken,
                        fieldPlacementOnly: false,
                        hideHeader: true, // Hides native header to use your custom workspace toolbar
                        hideToolbar: false,
                        hideSaveButton: false
                    });

                    await editorInstance.open();
                } catch (err) {
                    console.error("Failed to safely build embedded template canvas:", err);
                    alert("A setup error occurred inside the layout designer canvas wrapper.");
                }
            };

            mountPandaEditor();
        }

        return () => {
            if (editorInstance && typeof editorInstance.destroy === 'function') {
                editorInstance.destroy();
            }
        };
    }, [viewMode, activeEditorToken]);

    const fetchPandaTemplates = async () => {
        setLoading(true);
        setViewMode('existing');
        try {
            const res = await PandaTemplateApi.ListTemplates();
            setTemplates(res.data.results || res.data || []);
        } catch (error) {
            alert(`Failed to load PandaDoc templates: ${error.message}`);
            setViewMode('selection');
        } finally {
            setLoading(false);
        }
    };

    // Shared execution hub for launching editing frames safely
    const handleLaunchEditorCanvas = async (templateId, templateName) => {
        setLoading(true);
        try {
            let targetedName = templateName;
            if (!targetedName) {
                const matchedAsset = templates.find(t => t.id === templateId);
                targetedName = matchedAsset ? matchedAsset.name : 'Custom Workspace Layout';
            }
            setActiveTemplateName(targetedName);
            setActiveTemplateId(templateId);

            const response = await PandaTemplateApi.GetEditingSession(templateId);
            if (response.data?.token) {
                setActiveEditorToken(response.data.token);
                setViewMode('editor-canvas');
            } else {
                throw new Error("Unable to resolve session credential keys.");
            }
        } catch (error) {
            alert(`Failed to launch editor frame: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setNewTemplateData(prev => ({ ...prev, [name]: value }));
    };

    // Handles form submission, provisions the layout model, and launches the editor canvas
    const handleCreateTemplate = async (e) => {
        e.preventDefault();
        if (!newTemplateData.name) {
            alert('Please enter a template name.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await PandaTemplateApi.CreateTemplate(newTemplateData);
            alert('Template provisioned successfully! Opening design workspace layout canvas...');

            // Resolves the newly created ID across various nested payload structures
            const targetId = res.data?.template?.id || res.data?.id || res.data?.results?.id;

            if (targetId) {
                // IMMEDIATELY LAUNCH THE CANVAS SESSION HUB USING THE SAME EDITING FUNCTION
                await handleLaunchEditorCanvas(targetId, newTemplateData.name);
            } else {
                fetchPandaTemplates();
            }
        } catch (error) {
            alert(`Failed to create PandaDoc template: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    // Instantiate a live transactional contract out of this template canvas model
    const handleProvisionDocument = async () => {
        try {
            setLoading(true);
            await PandaDocumentApi.CreateDocument(activeTemplateId, `${activeTemplateName} - Live Contract`);
            alert("Live contract document created from template framework successfully!");
            navigate('/panda-create-document');
        } catch (err) {
            alert(`Failed to instantiate dynamic agreement module template: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTemplateDirectly = () => {
        if (!window.confirm("Are you sure you want to permanently delete this template layout blueprint?")) return;
        alert(`Purging template schema ID reference: [${activeTemplateId}]`);
        setViewMode('existing');
        fetchPandaTemplates();
    };

    if (loading) {
        return <div className="agreement-loading">Loading configuration workspace...</div>;
    }

    return (
        <div className={`agreement-page ${viewMode === 'editor-canvas' ? 'editor-fullscreen-mode' : ''}`}>
            <div className={`agreement-container ${viewMode === 'editor-canvas' ? 'canvas-mode-padding' : 'list-mode-padding'}`}>

                {viewMode !== 'editor-canvas' && (
                    <div className="agreement-header">
                        <h1>Agreement Template Manager</h1>
                        <p>
                            {viewMode === 'selection' && 'Choose an option to manage your assets'}
                            {viewMode === 'existing' && 'Active Custom Account Workspace Layouts'}
                            {viewMode === 'new' && 'Provision a new custom workspace layout template'}
                        </p>
                    </div>
                )}

                {/* VIEW 1: MAIN NAVIGATION MENU */}
                {viewMode === 'selection' && (
                    <div className="template-grid">
                        <div className="template-card" onClick={() => setViewMode('new')} style={{ cursor: 'pointer' }}>
                            <h3>➕ Create New Template</h3>
                            <p>Generate a clean template configuration inside your Clickmatix workspace.</p>
                        </div>

                        {/* FIXED: This now correctly calls fetchPandaTemplates instead of loading a blank new form */}
                        <div className="template-card interactive-card" onClick={fetchPandaTemplates} style={{ cursor: 'pointer' }}>
                            <h3>📋 View Existing Workspace Templates</h3>
                            <p>Fetch, browse, and natively modify your account layout models in real time.</p>
                        </div>
                    </div>
                )}

                {/* VIEW 2: ACTIVE ACCOUNT TEMPLATE LISTINGS */}
                {viewMode === 'existing' && (
                    <>
                        <div className="template-header header-spacing">
                            <h2>Available Account Templates ({templates.length})</h2>
                            <button type="button" className="secondary-btn" onClick={() => setViewMode('selection')}>
                                Back to Menu
                            </button>
                        </div>

                        {templates.length === 0 ? (
                            <div className="panda-empty-notice">No templates found in this workspace context.</div>
                        ) : (
                            <div className="template-grid">
                                {templates.map((template) => (
                                    <div key={template.id} className="template-card vertical-space-between">
                                        <div>
                                            <h3>📄 {template.name}</h3>
                                            <p className="template-id-text">ID: {template.id}</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="primary-btn list-action-fullwidth"
                                            onClick={() => handleLaunchEditorCanvas(template.id, template.name)}
                                        >
                                            ✏️ Edit Layout Canvas
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* VIEW 3: PROVISION NEW TEMPLATE FORM */}
                {viewMode === 'new' && (
                    <form onSubmit={handleCreateTemplate} className="agreement-form">
                        <div className="template-header">
                            <h2>Configure New Deployment</h2>
                            <button type="button" className="secondary-btn" onClick={() => setViewMode('selection')}>
                                Back
                            </button>
                        </div>

                        <fieldset className="form-section">
                            <legend>Workspace Target Parameters</legend>
                            <div className="form-grid">
                                <div className="full-width">
                                    <label>Template Layout Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newTemplateData.name}
                                        onChange={handleFormChange}
                                        required
                                        className="form-control"
                                        placeholder="e.g., Enterprise Service SLA"
                                    />
                                </div>

                                <div className="full-width">
                                    <label>Description/Metadata Notes</label>
                                    <textarea
                                        name="description"
                                        value={newTemplateData.description}
                                        onChange={handleFormChange}
                                        className="form-control textarea-lg"
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <div className="form-actions">
                            <button type="button" className="secondary-btn" onClick={() => setViewMode('selection')}>
                                Cancel
                            </button>
                            <button type="submit" disabled={submitting} className="primary-btn">
                                {submitting ? 'Deploying into PandaDoc...' : 'Confirm & Deploy'}
                            </button>
                        </div>
                    </form>
                )}

                {/* VIEW 4: FULL-BLEED UNIFIED WORKSPACE STUDIO */}
                {viewMode === 'editor-canvas' && (
                    <div className="editor-canvas-workspace full-height-flex">

                        {/* REPLICATED PANDADOC BLUEPRINT TOOLBAR */}
                        <div className="native-pandadoc-header">

                            {/* Left Side Metadata Layout Strings */}
                            <div className="pd-header-left">
                                <button
                                    type="button"
                                    className="pd-exit-arrow-btn"
                                    onClick={() => { setViewMode('existing'); fetchPandaTemplates(); }}
                                >
                                    ←
                                </button>
                                <div className="pd-title-meta-block">
                                    <div className="pd-title-row">
                                        <h2 className="pd-doc-name-heading">{activeTemplateName}</h2>
                                        <span className="pd-doc-badge-tag">TEMPLATES</span>
                                    </div>
                                    <div className="pd-sub-meta-row">
                                        <span className="pd-status-dot dot-draft" />
                                        <span className="pd-meta-text-item text-capitalize">Draft</span>
                                        <span className="pd-meta-divider">•</span>
                                        <span className="pd-meta-text-item">₹ 0.00</span>
                                        <span className="pd-meta-divider">•</span>
                                        <span className="pd-folder-icon">📁</span>
                                        <span className="pd-meta-text-item">All templates</span>
                                        <span className="pd-meta-divider">•</span>
                                        <span className="pd-checkmark-icon">✓</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side Workflow Core Anchors */}
                            <div className="pd-header-right">
                                <div className="pd-avatar-circle">CL</div>

                                <button type="button" className="pd-btn-utility btn-manage-gray">
                                    <span className="pd-icon-spacing">👥</span> Manage
                                </button>

                                <button
                                    type="button"
                                    className="pd-btn-finish-yellow bg-teal-override"
                                    onClick={handleProvisionDocument}
                                >
                                    Create document
                                </button>

                                <div className="pd-vertical-separator" />

                                <button type="button" className="pd-icon-action-btn" title="Comments/Suggestions">💬</button>

                                {/* Dropdown Option List Anchoring Box */}
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
                                            <div className="pd-dropdown-item item-disabled">⚙️ Settings</div>
                                            <div className="pd-dropdown-item item-disabled">🔄 Duplicate Template</div>
                                            <div className="pd-dropdown-divider" />
                                            <div className="pd-dropdown-item item-clickable text-danger" onClick={handleDeleteTemplateDirectly}>🗑️ Delete Template</div>
                                        </div>
                                    )}
                                </div>

                                <div className="pd-vertical-separator" />

                                <div className="pd-avatar-circle circle-mini">GP</div>
                            </div>
                        </div>

                        {/* High Performance Canvas Frame Container utilizing the block layout fix */}
                        <div id="panda-editor-canvas-container" className="flex-canvas-fill" />
                    </div>
                )}

            </div>
        </div>
    );
};

export default PandaTemplate;