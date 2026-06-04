import { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from "react-router-dom";
import TemplateApi from '../api/template';
import AgreementApi from '../api/agreement';

const Agreement = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Modal Control States (Kept active for when you migrate the modal code)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeAgreementId, setActiveAgreementId] = useState(null);

    const [formData, setFormData] = useState({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        scope: '',
        pricing: {
            monthlyFee: '',
            setupFee: 0,
        },
        terms: '',
    });

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await TemplateApi.GetAllTemplates();
                setTemplates(res.data.templates || res.data);
            } catch (error) {
                alert(`Failed to load templates: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, [navigate]);

    const handleSelectTemplate = async (templateId) => {
        try {
            const res = await TemplateApi.GetTemplateById(templateId);
            const template = res.data.template || res.data;

            setSelectedTemplate(template);

            setFormData({
                clientName: '',
                clientEmail: '',
                clientPhone: '',
                scope: template.defaultScope || '',
                pricing: template.defaultPricing || {
                    monthlyFee: '',
                    setupFee: 0,
                },
                terms: template.defaultTerms || '',
            });
        } catch (error) {
            alert(`Failed to load template: ${error.message}`);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('pricing.')) {
            const field = name.split('.')[1];

            setFormData({
                ...formData,
                pricing: {
                    ...formData.pricing,
                    [field]: field === 'monthlyFee' || field === 'setupFee'
                        ? parseFloat(value) || 0
                        : value,
                },
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedTemplate) {
            alert('Please select a template');
            return;
        }

        if (!formData.clientName || !formData.clientEmail) {
            alert('Please fill in client name and email');
            return;
        }

        setSubmitting(true);

        try {
            const res = await AgreementApi.UpdateAgreementDetails(selectedTemplate._id, {
                templateId: selectedTemplate._id,
                ...formData,
            });

            const data = res.data;
            const targetId = data.agreementId || data._id;

            /* ==========================================================================
               MODAL POPUP ACTIONS (COMMENTED OUT AS REQUESTED)
               ==========================================================================
            setActiveAgreementId(targetId);
            setIsEditModalOpen(true);
            */

            /* ==========================================================================
               REDIRECT TO AGREEMENT LISTING PAGE 
               (REMOVE THE COMMENTS BELOW ONCE YOUR ROUTE/PAGE IS CREATED)
               ========================================================================== */
            // alert('Agreement created successfully! Redirecting...');
            // navigate('/agreement-listing'); 

        } catch (error) {
            alert(
                error.response?.data?.error ||
                `Failed to create agreement: ${error.message}`
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="agreement-loading">
                Loading templates...
            </div>
        );
    }

    return (
        <div className="agreement-page">
            <div className="agreement-container">

                <div className="agreement-header">
                    <h1>Create Agreement</h1>

                    <p>
                        {selectedTemplate
                            ? 'Step 2: Enter details'
                            : 'Step 1: Select a template'}
                    </p>
                </div>

                {!selectedTemplate ? (
                    <div className="template-grid">
                        {templates.map((template) => (
                            <div
                                key={template._id}
                                className="template-card"
                                onClick={() => handleSelectTemplate(template._id)}
                            >
                                <h3>{template.name}</h3>
                                <p>{template.description}</p>
                                <div className="template-price">
                                    ${template.defaultPricing?.monthlyFee || 0}/month
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="agreement-form">
                        <div className="template-header">
                            <h2>{selectedTemplate.name}</h2>
                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => setSelectedTemplate(null)}
                            >
                                Change Template
                            </button>
                        </div>

                        <fieldset className="form-section">
                            <legend>Client Information</legend>
                            <div className="form-grid">
                                <div>
                                    <label>Client Name *</label>
                                    <input
                                        type="text"
                                        name="clientName"
                                        value={formData.clientName}
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                        placeholder="e.g., Acme Corporation"
                                    />
                                </div>

                                <div>
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="clientEmail"
                                        value={formData.clientEmail}
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                        placeholder="contact@example.com"
                                    />
                                </div>

                                <div className="full-width">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        name="clientPhone"
                                        value={formData.clientPhone}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="form-section">
                            <legend>Scope of Work</legend>
                            <textarea
                                name="scope"
                                value={formData.scope}
                                onChange={handleChange}
                                className="form-control textarea-lg"
                                placeholder="Define the scope of work..."
                            />
                        </fieldset>

                        <fieldset className="form-section">
                            <legend>Pricing</legend>
                            <div className="form-grid">
                                <div>
                                    <label>Monthly Fee</label>
                                    <input
                                        type="number"
                                        name="pricing.monthlyFee"
                                        value={formData.pricing.monthlyFee}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </div>

                                <div>
                                    <label>Setup Fee</label>
                                    <input
                                        type="number"
                                        name="pricing.setupFee"
                                        value={formData.pricing.setupFee}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="form-section no-border">
                            <legend>Terms & Conditions</legend>
                            <textarea
                                name="terms"
                                value={formData.terms}
                                onChange={handleChange}
                                className="form-control textarea-lg"
                                placeholder="Enter terms and conditions..."
                            />
                        </fieldset>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => setSelectedTemplate(null)}
                            >
                                Back
                            </button>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="primary-btn"
                            >
                                {submitting ? 'Creating...' : 'Create Agreement'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* ==========================================================================
               CALLING MODAL IN-PLACE DIRECTLY AS COMPONENT (COMMENTED OUT FOR NOW)
               ==========================================================================
            <EditAgreementModal
                isOpen={isEditModalOpen}
                id={activeAgreementId}
                onClose={() => setIsEditModalOpen(false)}
            />
            */}
        </div>
    );
};


/* ==========================================================================
   INTERNAL INJECTED COMPONENT: EditAgreementModal (Preserved for your new page)
   ========================================================================== */
function EditAgreementModal({ isOpen, onClose, id }) {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [agreement, setAgreement] = useState(null);

    const [scope, setScope] = useState('');
    const [terms, setTerms] = useState('');
    const [monthlyFee, setMonthlyFee] = useState('');

    useEffect(() => {
        if (!id || !isOpen) return;

        const fetchAgreementDetails = async () => {
            setLoading(true);
            try {
                const res = await AgreementApi.GetAgreementDetails(id);
                const data = res.data?.agreement || res.data;
                if (data) {
                    setAgreement(data);
                    setScope(data.scope || '');
                    setTerms(data.terms || '');
                    setMonthlyFee(data.pricing?.monthlyFee || '');
                }
            } catch (error) {
                alert(`Failed to load agreement data: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchAgreementDetails();
    }, [id, isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isOpen && e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [isOpen]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await AgreementApi.UpdateAgreementDetails(id, {
                templateId: agreement.templateId || id,
                clientName: agreement.clientName,
                clientEmail: agreement.clientEmail,
                clientPhone: agreement.clientPhone,
                scope,
                terms,
                pricing: {
                    monthlyFee: parseFloat(monthlyFee) || 0,
                    setupFee: agreement.pricing?.setupFee || 0
                }
            });

            alert('Agreement changes successfully synchronized and updated!');
            onClose();
            navigate('/dashboard');
        } catch (error) {
            alert(`Failed to save adjustments: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="crm-modal-overlay">
            <div className="crm-modal-wrapper">

                <div className="crm-modal-header">
                    <h2>Edit Agreement Content</h2>
                    <button type="button" className="crm-modal-close-icon" onClick={onClose}>
                        &times;
                    </button>
                </div>

                {loading ? (
                    <div className="agreement-loading">Loading agreement parameters...</div>
                ) : !agreement ? (
                    <div className="agreement-loading">Agreement asset data could not be resolved.</div>
                ) : (
                    <div className="crm-modal-body">
                        <p className="crm-modal-client-meta">
                            Client: <strong>{agreement.clientName}</strong> ({agreement.clientEmail})
                        </p>

                        <form onSubmit={handleSave} className="agreement-form">
                            <fieldset className="form-section">
                                <legend>Modify Scope of Work</legend>
                                <textarea
                                    value={scope}
                                    onChange={(e) => setScope(e.target.value)}
                                    className="form-control textarea-lg"
                                    rows={5}
                                />
                            </fieldset>

                            <fieldset className="form-section">
                                <legend>Pricing Adjustments</legend>
                                <div className="form-grid">
                                    <div>
                                        <label>Monthly Service Fee ($)</label>
                                        <input
                                            type="number"
                                            value={monthlyFee}
                                            onChange={(e) => setMonthlyFee(e.target.value)}
                                            className="form-control"
                                        />
                                    </div>
                                </div>
                            </fieldset>

                            <fieldset className="form-section">
                                <legend>Terms & Conditions</legend>
                                <textarea
                                    value={terms}
                                    onChange={(e) => setTerms(e.target.value)}
                                    className="form-control textarea-lg"
                                    rows={5}
                                />
                            </fieldset>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={onClose}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="primary-btn"
                                >
                                    {saving ? 'Synchronizing with GHL...' : 'Save & Update to GHL'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Agreement;