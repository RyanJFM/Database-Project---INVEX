import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

function CaseManagement() {
  const [cases, setCases] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Drawer 1 (Create Case) States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  // Drawer 2 (Exam Details) States
  const [isExamDrawerOpen, setIsExamDrawerOpen] = useState(false);
  const [isExamDrawerVisible, setIsExamDrawerVisible] = useState(false);
  const [selectedCaseForExam, setSelectedCaseForExam] = useState(null);
  const [examType, setExamType] = useState('clinical'); // 'clinical' or 'postmortem'

  // Drawer 3 (Evidence Tracking) States
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);
  const [isEvidenceDrawerVisible, setIsEvidenceDrawerVisible] = useState(false);
  const [selectedCaseForEvidence, setSelectedCaseForEvidence] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceError, setEvidenceError] = useState(null);

  // Case Form State
  const [formData, setFormData] = useState({
    patient_id: '',
    user_id: '2', // Hardcoded JMO/Doctor ID (e.g. Dr. Wickramasinghe)
    station_id: '1',
    court_id: '1',
    case_type_id: '1',
    case_status_id: '1',
    incident_date: '',
    description: ''
  });

  // Exam Form States
  const [clinicalData, setClinicalData] = useState({
    exam_type_id: '1',
    injury_details: ''
  });
  const [postmortemData, setPostmortemData] = useState({
    cod_category_id: '1',
    cause_of_death: ''
  });

  // Evidence Form State
  const [evidenceFormData, setEvidenceFormData] = useState({
    evidence_type_id: '1',
    storage_id: '1',
    evidence_status_id: '1',
    description: ''
  });

  const [formSubmitError, setFormSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [examSubmitError, setExamSubmitError] = useState(null);
  const [isExamSubmitting, setIsExamSubmitting] = useState(false);

  const [evidenceSubmitError, setEvidenceSubmitError] = useState(null);
  const [isEvidenceSubmitting, setIsEvidenceSubmitting] = useState(false);

  const fetchCasesAndPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const [casesRes, patientsRes] = await Promise.all([
        axios.get('/api/cases'),
        axios.get('/api/patients')
      ]);
      setCases(casesRes.data);
      setPatients(patientsRes.data);
      
      // Auto-select first patient if available and patient_id isn't already set
      if (patientsRes.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          patient_id: String(patientsRes.data[0].patient_id)
        }));
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cases or patients:', err);
      setError(err.message || 'Failed to fetch forensic cases');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCasesAndPatients();
  }, []);

  const openDrawer = () => {
    setIsDrawerOpen(true);
    setTimeout(() => {
      setIsDrawerVisible(true);
    }, 10); // small delay to trigger CSS transition
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
    setTimeout(() => {
      setIsDrawerOpen(false);
      setFormSubmitError(null);
    }, 300); // matching transition duration
  };

  const openExamDrawer = (c) => {
    setSelectedCaseForExam(c);
    // Pre-select toggle based on the case type
    setExamType(c.case_type_id === 2 ? 'postmortem' : 'clinical');
    setIsExamDrawerOpen(true);
    setTimeout(() => {
      setIsExamDrawerVisible(true);
    }, 10);
  };

  const closeExamDrawer = () => {
    setIsExamDrawerVisible(false);
    setTimeout(() => {
      setIsExamDrawerOpen(false);
      setSelectedCaseForExam(null);
      setExamSubmitError(null);
      // Reset forms
      setClinicalData({ exam_type_id: '1', injury_details: '' });
      setPostmortemData({ cod_category_id: '1', cause_of_death: '' });
    }, 300);
  };

  const fetchEvidenceForCase = (caseId) => {
    setEvidenceLoading(true);
    setEvidenceError(null);
    axios.get(`/api/evidence/case/${caseId}`)
      .then((res) => {
        setEvidenceList(res.data);
        setEvidenceLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching evidence:', err);
        setEvidenceError(err.message || 'Failed to fetch evidence list');
        setEvidenceLoading(false);
      });
  };

  const openEvidenceDrawer = (c) => {
    setSelectedCaseForEvidence(c);
    setIsEvidenceDrawerOpen(true);
    fetchEvidenceForCase(c.case_id);
    setTimeout(() => {
      setIsEvidenceDrawerVisible(true);
    }, 10);
  };

  const closeEvidenceDrawer = () => {
    setIsEvidenceDrawerVisible(false);
    setTimeout(() => {
      setIsEvidenceDrawerOpen(false);
      setSelectedCaseForEvidence(null);
      setEvidenceList([]);
      setEvidenceSubmitError(null);
      setEvidenceError(null);
      setEvidenceFormData({
        evidence_type_id: '1',
        storage_id: '1',
        evidence_status_id: '1',
        description: ''
      });
    }, 300);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClinicalChange = (e) => {
    const { name, value } = e.target;
    setClinicalData(prev => ({ ...prev, [name]: value }));
  };

  const handlePostmortemChange = (e) => {
    const { name, value } = e.target;
    setPostmortemData(prev => ({ ...prev, [name]: value }));
  };

  const handleEvidenceChange = (e) => {
    const { name, value } = e.target;
    setEvidenceFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.patient_id) {
      setFormSubmitError('Please select a patient to link the case to.');
      return;
    }
    setIsSubmitting(true);
    setFormSubmitError(null);

    // Hardcode user_id to 2 as requested to represent the logged-in JMO
    const submissionData = {
      ...formData,
      user_id: '2'
    };

    axios.post('/api/cases', submissionData)
      .then(() => {
        setIsSubmitting(false);
        closeDrawer();
        // Reset inputs, keep current dropdown selections
        setFormData(prev => ({
          ...prev,
          incident_date: '',
          description: ''
        }));
        fetchCasesAndPatients(); // Re-fetch the updated list
      })
      .catch((err) => {
        console.error('Error creating case:', err);
        setFormSubmitError(err.response?.data?.details || err.message || 'Failed to create case');
        setIsSubmitting(false);
      });
  };

  const handleExamSubmit = (e) => {
    e.preventDefault();
    if (!selectedCaseForExam) return;

    setIsExamSubmitting(true);
    setExamSubmitError(null);

    const isClinical = examType === 'clinical';
    const endpoint = isClinical 
      ? '/api/exams/clinical' 
      : '/api/exams/postmortem';
    
    const payload = isClinical 
      ? { case_id: selectedCaseForExam.case_id, ...clinicalData }
      : { case_id: selectedCaseForExam.case_id, ...postmortemData };

    axios.post(endpoint, payload)
      .then(() => {
        setIsExamSubmitting(false);
        closeExamDrawer();
        fetchCasesAndPatients(); // Refresh list to register updates
      })
      .catch((err) => {
        console.error('Error submitting exam details:', err);
        setExamSubmitError(err.response?.data?.details || err.message || 'Failed to submit examination details');
        setIsExamSubmitting(false);
      });
  };

  const handleEvidenceSubmit = (e) => {
    e.preventDefault();
    if (!selectedCaseForEvidence) return;

    setIsEvidenceSubmitting(true);
    setEvidenceSubmitError(null);

    const payload = {
      case_id: selectedCaseForEvidence.case_id,
      ...evidenceFormData
    };

    axios.post('/api/evidence', payload)
      .then(() => {
        setIsEvidenceSubmitting(false);
        // Clear description only, keep options selected
        setEvidenceFormData(prev => ({
          ...prev,
          description: ''
        }));
        // Re-fetch list
        fetchEvidenceForCase(selectedCaseForEvidence.case_id);
      })
      .catch((err) => {
        console.error('Error logging evidence:', err);
        setEvidenceSubmitError(err.response?.data?.details || err.message || 'Failed to log evidence');
        setIsEvidenceSubmitting(false);
      });
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    try {
      const date = new Date(dateVal);
      if (isNaN(date.getTime())) return String(dateVal);
      return date.toLocaleDateString();
    } catch {
      return String(dateVal);
    }
  };

  const getStatusColor = (statusId) => {
    switch (parseInt(statusId)) {
      case 1: return '#a855f7'; // Logged: Purple
      case 2: return '#ff9800'; // At Lab: Orange
      case 3: return '#4caf50'; // Returned: Green
      case 4: return '#ef4444'; // Disposed: Red
      default: return '#6b7280';
    }
  };

  const generatePDF = (c) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const patientObj = patients.find(p => p.patient_id === c.patient_id) || {};

    const primaryColor = [168, 85, 247]; // Purple: #a855f7
    const darkColor = [17, 24, 39]; // Charcoal: #111827

    // Top accent bar
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 8, 'F');

    // Header Title
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('INVEX FORENSIC SYSTEM', 20, 24);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text('Office of the Judicial Medical Officer (JMO)', 20, 30);
    doc.text('Department of Forensic Medicine, Teaching Hospital', 20, 35);

    // Separator line
    doc.setDrawColor(229, 231, 235);
    doc.line(20, 40, 190, 40);

    // Report Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...primaryColor);
    doc.text('OFFICIAL MEDICO-LEGAL COURT REPORT', 20, 50);

    // Metadata Table
    const metaData = [
      ['Case ID', `#FC-${c.case_id}`, 'Linked Patient', patientObj.full_name || 'N/A'],
      ['Incident Date', formatDate(c.incident_date), 'Patient NIC', patientObj.nic || 'N/A'],
      ['Case Type', c.case_type_name || 'N/A', 'Gender / DOB', `${patientObj.gender_name || 'N/A'} / ${formatDate(patientObj.dob)}`],
      ['Case Status', c.case_status_name || 'N/A', 'Blood Group', patientObj.blood_group_name || 'N/A'],
      ['Requesting Authority', c.station_name || 'N/A', 'Requesting Court', c.court_name || 'N/A'],
    ];

    autoTable(doc, {
      startY: 55,
      margin: { left: 20, right: 20 },
      theme: 'grid',
      head: [],
      body: metaData,
      styles: {
        fontSize: 9,
        cellPadding: 3.5,
        font: 'helvetica',
        textColor: [17, 24, 39],
        lineColor: [229, 231, 235]
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [249, 250, 251], width: 40 },
        1: { width: 45 },
        2: { fontStyle: 'bold', fillColor: [249, 250, 251], width: 40 },
        3: { width: 45 }
      }
    });

    const tableBottom = doc.lastAutoTable.finalY;

    // incident details heading
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('Incident Details & Medical Observations', 20, tableBottom + 12);

    // incident details body
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...darkColor);
    
    const descText = c.description || 'No description or clinical details recorded for this case.';
    const splitDesc = doc.splitTextToSize(descText, 170);
    doc.text(splitDesc, 20, tableBottom + 18);

    const descBottom = tableBottom + 18 + (splitDesc.length * 5);

    // divider
    doc.setDrawColor(229, 231, 235);
    doc.line(20, descBottom + 12, 190, descBottom + 12);

    // Signatures / JMO Info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...darkColor);
    doc.text('Responsible Judicial Medical Officer (JMO):', 20, descBottom + 22);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Dr. C. Wickramasinghe (JMO)', 20, descBottom + 28);
    doc.text('ID: #USR-2 (Forensic Specialist)', 20, descBottom + 33);

    // signature line
    doc.line(130, descBottom + 28, 185, descBottom + 28);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('JMO Authorized Signature & Stamp', 130, descBottom + 32);

    // Page Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Confidential - Generated for Judicial Proceedings Only', 20, pageHeight - 12);
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, 125, pageHeight - 12);

    doc.save(`Court_Report_FC-${c.case_id}.pdf`);
  };

  return (
    <div style={styles.container}>
      {/* Dynamic CSS Styles Injection for Interactive Hover/Focus/Transitions */}
      <style>{`
        .premium-input {
          padding: 12px 14px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background-color: var(--bg);
          color: var(--text-h);
          font-size: 14px;
          outline: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          box-sizing: border-box;
        }
        .premium-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-bg);
        }
        .premium-input:hover {
          border-color: rgba(168, 85, 247, 0.4);
        }
        .premium-btn-primary {
          background-color: var(--accent);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 12px 20px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .premium-btn-primary:hover:not(:disabled) {
          opacity: 0.95;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px var(--accent-bg);
        }
        .premium-btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }
        .premium-btn-secondary {
          border: 1px solid var(--border);
          background-color: transparent;
          color: var(--text-h);
          border-radius: 8px;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .premium-btn-secondary:hover {
          background-color: var(--border);
          color: var(--text-h);
        }
        .drawer-close-btn {
          border: none;
          background: none;
          font-size: 24px;
          color: var(--text);
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justifyContent: center;
          transition: all 0.2s;
        }
        .drawer-close-btn:hover {
          background-color: var(--border);
          color: var(--text-h);
        }
        /* Custom Scrollbar for Drawer Body */
        .drawer-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .drawer-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .drawer-scroll::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }
        .drawer-scroll::-webkit-scrollbar-thumb:hover {
          background: var(--text);
        }
      `}</style>

      <header style={styles.header}>
        <div style={styles.headerText}>
          <h1 style={styles.title}>Forensic Cases</h1>
          <p style={styles.subtitle}>Log, assign, and update medico-legal cases.</p>
        </div>
        <button className="premium-btn-primary" onClick={openDrawer}>
          <span>+</span> Create Forensic Case
        </button>
      </header>

      {loading && <div style={styles.loading}>Loading case records...</div>}
      {error && <div style={styles.error}>Connection Error: {error}. Make sure the backend server is running and database tables exist.</div>}

      {!loading && !error && (
        <section style={styles.tableCard}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tr}>
                  <th style={styles.th}>Case ID</th>
                  <th style={styles.th}>Linked Patient</th>
                  <th style={styles.th}>JMO / Doctor ID</th>
                  <th style={styles.th}>Police Station</th>
                  <th style={styles.th}>Requesting Court</th>
                  <th style={styles.th}>Case Type</th>
                  <th style={styles.th}>Incident Date</th>
                  <th style={styles.th}>Case Status</th>
                  <th style={styles.th}>Description</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.length === 0 ? (
                  <tr style={styles.tr}>
                    <td colSpan="10" style={{ ...styles.td, textAlign: 'center', color: 'var(--text)' }}>
                      No records found
                    </td>
                  </tr>
                ) : (
                  cases.map((c) => (
                    <tr key={c.case_id} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: 'bold' }}>#{c.case_id}</td>
                      <td style={{ ...styles.td, fontWeight: '500' }}>
                        {c.patient_name || `Patient #${c.patient_id}`}
                      </td>
                      <td style={styles.td}>#USR-{c.user_id}</td>
                      <td style={styles.td}>{c.station_name || 'N/A'}</td>
                      <td style={styles.td}>{c.court_name || 'N/A'}</td>
                      <td style={styles.td}>{c.case_type_name || 'N/A'}</td>
                      <td style={styles.td}>{formatDate(c.incident_date)}</td>
                      <td style={styles.td}>
                        <span style={{ 
                          ...styles.statusBadge, 
                          backgroundColor: 'var(--accent-bg)', 
                          color: 'var(--accent)' 
                        }}>
                          {c.case_status_name || 'Unknown'}
                        </span>
                      </td>
                      <td style={styles.td}>{c.description || 'N/A'}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button 
                            className="premium-btn-secondary" 
                            style={{ padding: '6px 10px', fontSize: '11px', whiteSpace: 'nowrap' }} 
                            onClick={() => openEvidenceDrawer(c)}
                          >
                            📦 Evidence
                          </button>
                          <button 
                            className="premium-btn-secondary" 
                            style={{ padding: '6px 10px', fontSize: '11px', whiteSpace: 'nowrap' }} 
                            onClick={() => openExamDrawer(c)}
                          >
                            ⚕️ Add Exam
                          </button>
                          <button 
                            className="premium-btn-secondary" 
                            style={{ padding: '6px 10px', fontSize: '11px', whiteSpace: 'nowrap' }} 
                            onClick={() => generatePDF(c)}
                          >
                            📄 PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Sliding Side-Panel 1 (Create Forensic Case Drawer) */}
      {isDrawerOpen && (
        <div 
          style={{
            ...styles.drawerOverlay,
            backgroundColor: isDrawerVisible ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0)',
            backdropFilter: isDrawerVisible ? 'blur(8px)' : 'blur(0px)',
          }} 
          onClick={closeDrawer}
        >
          <div 
            style={{
              ...styles.drawer,
              transform: isDrawerVisible ? 'translateX(0)' : 'translateX(100%)',
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={styles.drawerHeader}>
              <div>
                <h2 style={styles.drawerTitle}>Create Forensic Case</h2>
                <p style={styles.drawerSubtitle}>Register a new medico-legal incident record.</p>
              </div>
              <button className="drawer-close-btn" onClick={closeDrawer}>&times;</button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} style={styles.formContainer}>
              {/* Scrollable body */}
              <div className="drawer-scroll" style={styles.drawerBody}>
                {formSubmitError && <div style={styles.formError}>{formSubmitError}</div>}
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Select Patient *</label>
                  <select 
                    name="patient_id" 
                    value={formData.patient_id} 
                    onChange={handleInputChange} 
                    required 
                    className="premium-input"
                  >
                    {patients.length === 0 ? (
                      <option value="">No patients registered. Add a patient first!</option>
                    ) : (
                      patients.map(p => (
                        <option key={p.patient_id} value={p.patient_id}>
                          {p.full_name} (NIC: {p.nic || 'N/A'})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Doctor / JMO ID *</label>
                    <input 
                      type="text" 
                      name="user_id" 
                      value={formData.user_id} 
                      disabled 
                      className="premium-input"
                      style={{ opacity: 0.7, cursor: 'not-allowed' }}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Incident Date</label>
                    <input 
                      type="date" 
                      name="incident_date" 
                      value={formData.incident_date} 
                      onChange={handleInputChange} 
                      className="premium-input"
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Case Type</label>
                    <select 
                      name="case_type_id" 
                      value={formData.case_type_id} 
                      onChange={handleInputChange} 
                      className="premium-input"
                    >
                      <option value="1">Clinical Forensic</option>
                      <option value="2">Postmortem</option>
                      <option value="3">Toxicology</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Case Status</label>
                    <select 
                      name="case_status_id" 
                      value={formData.case_status_id} 
                      onChange={handleInputChange} 
                      className="premium-input"
                    >
                      <option value="1">Open</option>
                      <option value="2">Pending Lab Results</option>
                      <option value="3">Closed</option>
                    </select>
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Police Station</label>
                    <select 
                      name="station_id" 
                      value={formData.station_id} 
                      onChange={handleInputChange} 
                      className="premium-input"
                    >
                      <option value="1">Peradeniya Police</option>
                      <option value="2">Kandy HQ</option>
                      <option value="3">Katugastota Police</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Requesting Court</label>
                    <select 
                      name="court_id" 
                      value={formData.court_id} 
                      onChange={handleInputChange} 
                      className="premium-input"
                    >
                      <option value="1">Kandy Magistrate Court</option>
                      <option value="2">High Court Kandy</option>
                    </select>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Incident Description</label>
                  <textarea 
                    name="description" 
                    rows="3" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    placeholder="Enter details of the forensic clinical report or incident..."
                    className="premium-input"
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  ></textarea>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={styles.drawerFooter}>
                <button type="button" className="premium-btn-secondary" onClick={closeDrawer}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="premium-btn-primary"
                  style={{ minWidth: '150px', justifyContent: 'center' }}
                >
                  {isSubmitting ? 'Creating...' : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sliding Side-Panel 2 (Exam Details Drawer) */}
      {isExamDrawerOpen && (
        <div 
          style={{
            ...styles.drawerOverlay,
            backgroundColor: isExamDrawerVisible ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0)',
            backdropFilter: isExamDrawerVisible ? 'blur(8px)' : 'blur(0px)',
          }} 
          onClick={closeExamDrawer}
        >
          <div 
            style={{
              ...styles.drawer,
              transform: isExamDrawerVisible ? 'translateX(0)' : 'translateX(100%)',
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={styles.drawerHeader}>
              <div>
                <h2 style={styles.drawerTitle}>Add Examination Findings</h2>
                <p style={styles.drawerSubtitle}>
                  Case: #{selectedCaseForExam?.case_id} — {selectedCaseForExam?.patient_name}
                </p>
              </div>
              <button className="drawer-close-btn" onClick={closeExamDrawer}>&times;</button>
            </div>

            {/* Toggle Switch */}
            <div style={{ padding: '20px 24px 0 24px' }}>
              <div style={styles.toggleContainer}>
                <button 
                  type="button" 
                  style={{
                    ...styles.toggleBtn,
                    ...(examType === 'clinical' ? styles.toggleBtnActive : {})
                  }}
                  onClick={() => setExamType('clinical')}
                >
                  Clinical Examination
                </button>
                <button 
                  type="button" 
                  style={{
                    ...styles.toggleBtn,
                    ...(examType === 'postmortem' ? styles.toggleBtnActive : {})
                  }}
                  onClick={() => setExamType('postmortem')}
                >
                  Postmortem / Autopsy
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleExamSubmit} style={styles.formContainer}>
              <div className="drawer-scroll" style={{ ...styles.drawerBody, paddingTop: '10px' }}>
                {examSubmitError && <div style={styles.formError}>{examSubmitError}</div>}

                {examType === 'clinical' ? (
                  <>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Clinical Exam Type *</label>
                      <select 
                        name="exam_type_id" 
                        value={clinicalData.exam_type_id} 
                        onChange={handleClinicalChange} 
                        className="premium-input"
                      >
                        <option value="1">Assault Assessment</option>
                        <option value="2">Accident Trauma</option>
                        <option value="3">Sexual Assault</option>
                      </select>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Injury Details *</label>
                      <textarea 
                        name="injury_details" 
                        rows="8" 
                        value={clinicalData.injury_details} 
                        onChange={handleClinicalChange} 
                        placeholder="Log detailed notes of the abrasions, lacerations, contusions, fractures, or other external/internal traumas observed..."
                        required
                        className="premium-input"
                        style={{ resize: 'vertical', fontFamily: 'inherit' }}
                      ></textarea>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Cause of Death Category *</label>
                      <select 
                        name="cod_category_id" 
                        value={postmortemData.cod_category_id} 
                        onChange={handlePostmortemChange} 
                        className="premium-input"
                      >
                        <option value="1">Natural</option>
                        <option value="2">Accident</option>
                        <option value="3">Homicide</option>
                        <option value="4">Suicide</option>
                      </select>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Cause of Death / Autopsy Notes *</label>
                      <textarea 
                        name="cause_of_death" 
                        rows="8" 
                        value={postmortemData.cause_of_death} 
                        onChange={handlePostmortemChange} 
                        placeholder="State the primary and secondary causes of death, pathological findings, and external autopsy diagnostics..."
                        required
                        className="premium-input"
                        style={{ resize: 'vertical', fontFamily: 'inherit' }}
                      ></textarea>
                    </div>
                  </>
                )}
              </div>

              {/* Actions Footer */}
              <div style={styles.drawerFooter}>
                <button type="button" className="premium-btn-secondary" onClick={closeExamDrawer}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isExamSubmitting} 
                  className="premium-btn-primary"
                  style={{ minWidth: '150px', justifyContent: 'center' }}
                >
                  {isExamSubmitting ? 'Saving Findings...' : 'Save Findings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sliding Side-Panel 3 (Evidence Tracking Drawer) */}
      {isEvidenceDrawerOpen && (
        <div 
          style={{
            ...styles.drawerOverlay,
            backgroundColor: isEvidenceDrawerVisible ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0)',
            backdropFilter: isEvidenceDrawerVisible ? 'blur(8px)' : 'blur(0px)',
          }} 
          onClick={closeEvidenceDrawer}
        >
          <div 
            style={{
              ...styles.drawer,
              transform: isEvidenceDrawerVisible ? 'translateX(0)' : 'translateX(100%)',
              maxWidth: '560px' // slightly wider for double layout
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={styles.drawerHeader}>
              <div>
                <h2 style={styles.drawerTitle}>Evidence & Custody Log</h2>
                <p style={styles.drawerSubtitle}>
                  Case: #{selectedCaseForEvidence?.case_id} — {selectedCaseForEvidence?.patient_name}
                </p>
              </div>
              <button className="drawer-close-btn" onClick={closeEvidenceDrawer}>&times;</button>
            </div>

            <div className="drawer-scroll" style={{ ...styles.drawerBody, paddingBottom: '10px' }}>
              
              {/* Existing Logs Section */}
              <h3 style={styles.sectionSubHeader}>Logged Evidence Items</h3>
              {evidenceLoading && <div style={{ fontSize: '13px', color: 'var(--text)' }}>Retrieving evidence records...</div>}
              {evidenceError && <div style={styles.formError}>Error loading evidence: {evidenceError}</div>}
              
              {!evidenceLoading && !evidenceError && (
                <div style={{ maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }} className="drawer-scroll">
                  {evidenceList.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text)', fontStyle: 'italic' }}>
                      No evidence has been logged for this case yet.
                    </p>
                  ) : (
                    evidenceList.map((item) => (
                      <div key={item.evidence_id} style={styles.evidenceCard}>
                        <div style={{ ...styles.evidenceCardColor, backgroundColor: getStatusColor(item.evidence_status_id) }}></div>
                        <div style={styles.evidenceCardContent}>
                          <div style={styles.evidenceCardHeader}>
                            <span style={styles.evidenceCardId}>#EVD-{item.evidence_id}</span>
                            <span style={{ ...styles.evidenceCardStatus, color: getStatusColor(item.evidence_status_id) }}>
                              {item.evidence_status_name}
                            </span>
                          </div>
                          <p style={styles.evidenceCardDesc}>{item.description || 'No description provided'}</p>
                          <div style={styles.evidenceCardMeta}>
                            <span>📂 {item.evidence_type_name}</span>
                            <span>📍 {item.storage_location_name}</span>
                            <span>📅 {formatDate(item.collected_date)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Form Input Section */}
              <h3 style={{ ...styles.sectionSubHeader, marginTop: '20px' }}>Log New Evidence Item</h3>
              
              <form onSubmit={handleEvidenceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {evidenceSubmitError && <div style={styles.formError}>{evidenceSubmitError}</div>}

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Evidence Type *</label>
                    <select 
                      name="evidence_type_id" 
                      value={evidenceFormData.evidence_type_id} 
                      onChange={handleEvidenceChange} 
                      className="premium-input"
                    >
                      <option value="1">Blood Sample</option>
                      <option value="2">Weapon</option>
                      <option value="3">Clothing</option>
                      <option value="4">Toxicology Swab</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Storage Location *</label>
                    <select 
                      name="storage_id" 
                      value={evidenceFormData.storage_id} 
                      onChange={handleEvidenceChange} 
                      className="premium-input"
                    >
                      <option value="1">Fridge A</option>
                      <option value="2">Evidence Locker 1</option>
                      <option value="3">Cabinet 3</option>
                    </select>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Status *</label>
                  <select 
                    name="evidence_status_id" 
                    value={evidenceFormData.evidence_status_id} 
                    onChange={handleEvidenceChange} 
                    className="premium-input"
                  >
                    <option value="1">Logged</option>
                    <option value="2">At Lab</option>
                    <option value="3">Returned</option>
                    <option value="4">Disposed</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Description / Details</label>
                  <input 
                    type="text" 
                    name="description" 
                    value={evidenceFormData.description} 
                    onChange={handleEvidenceChange} 
                    placeholder="e.g. Swab taken from suspect's right hand"
                    className="premium-input"
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button 
                    type="submit" 
                    disabled={isEvidenceSubmitting} 
                    className="premium-btn-primary"
                    style={{ minWidth: '150px', justifyContent: 'center' }}
                  >
                    {isEvidenceSubmitting ? 'Logging...' : 'Log Evidence'}
                  </button>
                </div>
              </form>
            </div>

            {/* Actions Footer */}
            <div style={styles.drawerFooter}>
              <button type="button" className="premium-btn-secondary" onClick={closeEvidenceDrawer}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '40px',
    fontFamily: 'var(--sans)',
    color: 'var(--text-h)',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'left',
  },
  headerText: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    margin: '0 0 5px 0',
    fontSize: '32px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    margin: 0,
    color: 'var(--text)',
    fontSize: '16px',
  },
  loading: {
    padding: '20px',
    fontSize: '16px',
    color: 'var(--text)',
    textAlign: 'left',
  },
  error: {
    padding: '20px',
    fontSize: '15px',
    color: '#ef4444',
    backgroundColor: 'var(--accent-bg)',
    borderRadius: '8px',
    border: '1px solid var(--accent-border)',
    textAlign: 'left',
    lineHeight: '1.6',
  },
  tableCard: {
    backgroundColor: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: 'var(--shadow)',
    textAlign: 'left',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tr: {
    borderBottom: '1px solid var(--border)',
  },
  th: {
    padding: '12px 16px',
    fontWeight: '600',
    textAlign: 'left',
    color: 'var(--text)',
    fontSize: '14px',
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: 'var(--text-h)',
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },
  drawerOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  drawer: {
    width: '100%',
    maxWidth: '520px',
    height: '100%',
    backgroundColor: 'var(--card-bg)',
    borderLeft: '1px solid var(--border)',
    boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.15)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  drawerHeader: {
    padding: '24px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'left',
  },
  drawerTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-h)',
  },
  drawerSubtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: 'var(--text)',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100% - 93px)', // dynamic height offset for header
    margin: 0,
  },
  drawerBody: {
    padding: '24px',
    flexGrow: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    textAlign: 'left',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-h)',
  },
  drawerFooter: {
    padding: '20px 24px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    backgroundColor: 'var(--card-bg)',
  },
  formError: {
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    lineHeight: '1.4',
  },
  toggleContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    backgroundColor: 'var(--bg)',
    borderRadius: '10px',
    padding: '4px',
    border: '1px solid var(--border)',
    marginBottom: '8px',
  },
  toggleBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text)',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  toggleBtnActive: {
    backgroundColor: 'var(--accent)',
    color: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  // Evidence Card Styles
  evidenceCard: {
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    margin: '0 0 12px 0',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    transition: 'all 0.2s ease',
  },
  evidenceCardColor: {
    width: '4px',
    minWidth: '4px',
  },
  evidenceCardContent: {
    padding: '12px 16px',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'left',
  },
  evidenceCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  evidenceCardId: {
    fontWeight: '700',
    fontSize: '13px',
    color: 'var(--text-h)',
  },
  evidenceCardStatus: {
    fontWeight: '600',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  evidenceCardDesc: {
    margin: 0,
    fontSize: '13.5px',
    color: 'var(--text-h)',
    lineHeight: '1.4',
  },
  evidenceCardMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    fontSize: '11px',
    color: 'var(--text)',
    marginTop: '2px',
  },
  sectionSubHeader: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-h)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '15px 0 10px 0',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '6px',
    textAlign: 'left',
  }
};

export default CaseManagement;
