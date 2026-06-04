import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PandaTemplateApi from '../api/pandatemplate';

const PandaTemplate = () => {
    const navigate = useNavigate();

    // View control: 'selection', 'existing', or 'new'
    const [viewMode, setViewMode] = useState('selection');
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state for creating a new template
    const [newTemplateData, setNewTemplateData] = useState({
        name: '',
        description: '',
    });

    // Fetch existing templates from PandaDoc (via your backend)
    const fetchPandaTemplates = async () => {
        setLoading(true);
        setViewMode('existing');
        try {
            const res = await PandaApi.ListTemplates();
            // PandaDoc usually nests list returns inside a 'results' array
            setTemplates(res.data.results || res.data || []);
        } catch (error) {
            alert(`Failed to load PandaDoc templates: ${error.message}`);
            setViewMode('selection');
        } finally {
            setLoading(false);
        }
    };

    // Handle input changes for the creation form
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setNewTemplateData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Submit new template data to PandaDoc (via your backend)
    const handleCreateTemplate = async (e) => {
        e.preventDefault();
        if (!newTemplateData.name) {
            alert('Please enter a template name.');
            return;
        }

        setSubmitting(true);
        try {
            await PandaApi.CreateTemplate(newTemplateData);
            alert('Template successfully created in PandaDoc!');

            // Refresh list and jump to existing templates view
            fetchPandaTemplates();
        } catch (error) {
            alert(`Failed to create PandaDoc template: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="agreement-loading">
                Loading PandaDoc configurations...
            </div>
        );
    }

    return (
        <div className="agreement-page">
            <div className="agreement-container">

                <div className="agreement-header">
                    <h1>Agreement Template Manager</h1>
                    <p>
                        {viewMode === 'selection' && 'Choose an option to manage your legal assets'}
                        {viewMode === 'existing' && 'Viewing active Agreement templates'}
                        {viewMode === 'new' && 'Provision a new Agreement template asset'}
                    </p>
                </div>

                {/* STEP 1: INITIAL SELECTION VIEW */}
                {viewMode === 'selection' && (
                    <div className="template-grid">
                        <div
                            className="template-card"
                            onClick={() => setViewMode('new')}
                            style={{ cursor: 'pointer' }}
                        >
                            <h3>➕ Create New Template</h3>
                            <p>Generate a clean template configuration inside your Clickmatix workspace.</p>
                        </div>

                        <div
                            className="template-card"
                            onClick={fetchPandaTemplates}
                            style={{ cursor: 'pointer' }}
                        >
                            <h3>📋 View Existing Templates</h3>
                            <p>Fetch and browse your active template layouts synced from Clickmatix.</p>
                        </div>
                    </div>
                )}

                {/* STEP 2A: EXISTING TEMPLATES LISTING VIEW */}
                {viewMode === 'existing' && (
                    <>
                        <div className="template-header" style={{ marginBottom: '20px' }}>
                            <h2>Available Templates ({templates.length})</h2>
                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => setViewMode('selection')}
                            >
                                Change Mode
                            </button>
                        </div>

                        {templates.length === 0 ? (
                            <div className="agreement-loading">No templates found in this workspace.</div>
                        ) : (
                            <div className="template-grid">
                                {templates.map((template) => (
                                    <div key={template.id} className="template-card">
                                        <h3>{template.name}</h3>
                                        <p>ID: {template.id}</p>
                                        <div className="template-price">
                                            Status: {template.status || 'Active'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* STEP 2B: CREATE NEW TEMPLATE FORM VIEW */}
                {viewMode === 'new' && (
                    <form onSubmit={handleCreateTemplate} className="agreement-form">
                        <div className="template-header">
                            <h2>New PandaDoc Setup</h2>
                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => setViewMode('selection')}
                            >
                                Cancel
                            </button>
                        </div>

                        <fieldset className="form-section">
                            <legend>Template Configurations</legend>
                            <div className="form-grid">
                                <div className="full-width">
                                    <label>Template Name *</label>
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
                                    <label>Internal Description</label>
                                    <textarea
                                        name="description"
                                        value={newTemplateData.description}
                                        onChange={handleFormChange}
                                        className="form-control textarea-lg"
                                        placeholder="Describe what scenarios this template applies to..."
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => setViewMode('selection')}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="primary-btn"
                            >
                                {submitting ? 'Creating in PandaDoc...' : 'Provision Template'}
                            </button>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
};

export default PandaTemplate;