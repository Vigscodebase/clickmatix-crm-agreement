import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PandaTemplateApi from '../api/pandatemplate';
import PandaDocumentApi from '../api/pandadocument';
import { Editor } from 'pandadoc-editor';
import { FilePlus, FolderOpen, FileText, Pencil, ArrowLeft, Folder, Check, MoreVertical, Settings, Copy, Trash2 } from 'lucide-react';

const PandaTemplate = () => {
    const navigate = useNavigate();

    // View control states: 'selection', 'existing', or 'editor-canvas'
    const [viewMode, setViewMode] = useState('selection');
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [canvasLoading, setCanvasLoading] = useState(false);
    const [activeEditorToken, setActiveEditorToken] = useState('');
    const [activeTemplateName, setActiveTemplateName] = useState('');
    const [activeTemplateId, setActiveTemplateId] = useState('');

    // Dropdown UI Toggles
    const [showMoreMenu, setShowMoreMenu] = useState(false);

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
                    setCanvasLoading(false); // Drop template loading view layer mask smoothly
                } catch (err) {
                    console.error("Failed to safely build embedded template canvas:", err);
                    alert("A setup error occurred inside the layout designer canvas wrapper.");
                    setCanvasLoading(false);
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

    // Shared execution hub for launching editing frames safely from the list view
    const handleLaunchEditorCanvas = async (templateId, templateName) => {
        setLoading(true);
        setCanvasLoading(true);
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
            setCanvasLoading(false);
        } finally {
            setLoading(false);
        }
    };

    // INSTANT CREATION FLOW (Mimics native PandaDoc behavior)
    // Completely bypasses the configuration form, provisions in background, and loads canvas.
    const handleInstantCreateTemplate = async () => {
        setLoading(true);
        setCanvasLoading(true);

        // Generate a standard placeholder name just like PandaDoc does
        const placeholderName = `Untitled Template - ${new Date().toLocaleDateString()}`;
        const templatePayload = {
            name: placeholderName,
            description: "Instantly deployed via Workspace Hub"
        };

        try {
            const res = await PandaTemplateApi.CreateTemplate(templatePayload);

            // Extract the newly generated layout details from your backend unified payload response
            const targetId = res.data?.template?.id || res.data?.id || res.data?.results?.id;
            const targetToken = res.data?.token;

            if (targetId && targetToken) {
                // Instantly inject the active tokens and step directly onto the Canvas Editor stage
                setActiveTemplateName(placeholderName);
                setActiveTemplateId(targetId);
                setActiveEditorToken(targetToken);
                setViewMode('editor-canvas');
            } else {
                throw new Error("API responded without creating a proper identity or session token wrapper.");
            }
        } catch (error) {
            alert(`Failed to instantly build testing blueprint layout: ${error.message}`);
            setViewMode('selection');
            setCanvasLoading(false);
        } finally {
            setLoading(false);
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

    const handleDeleteTemplateDirectly = async () => {
        if (!window.confirm("Are you sure you want to permanently delete this template layout blueprint? This will completely purge it from your workspace environment.")) return;

        setLoading(true);
        setShowMoreMenu(false);
        try {
            await PandaTemplateApi.DeleteTemplate(activeTemplateId);
            alert(`Successfully purged layout workspace blueprint: [${activeTemplateId}]`);

            // Return back to the selection dashboard menu cleanly
            setViewMode('selection');
        } catch (error) {
            alert(`Failed to delete template workspace blueprint: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && viewMode !== 'editor-canvas') {
        return <div className="agreement-loading">Processing your workspace environment...</div>;
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
                        </p>
                    </div>
                )}

                {/* VIEW 1: MAIN NAVIGATION MENU */}
                {viewMode === 'selection' && (
                    <div className="template-grid">
                        <div className="template-card" onClick={handleInstantCreateTemplate} style={{ cursor: 'pointer' }}>
                            <h3>
                                <FilePlus size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Create New Template
                            </h3>
                            <p>Instantly generate and open a brand new layout workspace context.</p>
                        </div>

                        <div className="template-card interactive-card" onClick={fetchPandaTemplates} style={{ cursor: 'pointer' }}>
                            <h3>
                                <FolderOpen size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> View Existing Workspace Templates
                            </h3>
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
                                            <h3>
                                                <FileText size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> {template.name}
                                            </h3>
                                        </div>
                                        <button
                                            type="button"
                                            className="primary-btn list-action-fullwidth"
                                            onClick={() => handleLaunchEditorCanvas(template.id, template.name)}
                                        >
                                            <Pencil size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Edit Layout Canvas
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* VIEW 3: FULL-BLEED UNIFIED WORKSPACE STUDIO */}
                {viewMode === 'editor-canvas' && (
                    <div className="editor-canvas-workspace full-height-flex">

                        {/* REPLICATED PANDADOC BLUEPRINT TOOLBAR */}
                        <div className="native-pandadoc-header">

                            {/* Left Side Metadata Layout Strings */}
                            <div className="pd-header-left">
                                <button
                                    type="button"
                                    className="pd-exit-arrow-btn"
                                    onClick={() => { setViewMode('selection'); }}
                                >
                                    <ArrowLeft size={16} />
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
                                        <span className="pd-folder-icon">
                                            <Folder size={14} style={{ verticalAlign: 'middle' }} />
                                        </span>
                                        <span className="pd-meta-text-item">All templates</span>
                                        <span className="pd-meta-divider">•</span>
                                        <span className="pd-checkmark-icon">
                                            <Check size={14} style={{ verticalAlign: 'middle' }} />
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side Workflow Core Anchors */}
                            <div className="pd-header-right">
                                <button
                                    type="button"
                                    className="pd-btn-finish-yellow bg-teal-override"
                                    onClick={handleProvisionDocument}
                                >
                                    Create document
                                </button>

                                <div className="pd-vertical-separator" />

                                {/* Dropdown Option List Anchoring Box */}
                                <div className="pd-dropdown-anchor-wrapper">
                                    <button
                                        type="button"
                                        className={`pd-icon-action-btn ${showMoreMenu ? 'active-dropdown-btn' : ''}`}
                                        title="More Actions"
                                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                                    >
                                        <MoreVertical size={18} />
                                    </button>

                                    {showMoreMenu && (
                                        <div className="pd-context-dropdown-menu">
                                            <div className="pd-dropdown-item item-disabled">
                                                <Settings size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Settings
                                            </div>
                                            <div className="pd-dropdown-item item-disabled">
                                                <Copy size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Duplicate Template
                                            </div>
                                            <div className="pd-dropdown-divider" />
                                            {/* Destructive Delete Action Hooked to API */}
                                            <div className="pd-dropdown-item item-clickable text-danger" onClick={handleDeleteTemplateDirectly}>
                                                <Trash2 size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Delete Template
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pd-vertical-separator" />

                                <div className="pd-avatar-circle circle-mini">GP</div>
                            </div>
                        </div>

                        {/* Structural Layout Box Isolating Padding-Left Bug Variables */}
                        <div style={{ position: 'relative', flex: 1, width: '100%', height: 'calc(100vh - 56px)' }}>
                            {canvasLoading && (
                                <div className="canvas-loader-overlay">
                                    <div className="canvas-spinner"></div>
                                    <div className="canvas-loader-text">Loading secure template canvas engine...</div>
                                </div>
                            )}

                            {/* Canvas Frame Container */}
                            <div id="panda-editor-canvas-container" className="flex-canvas-fill" />
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default PandaTemplate;