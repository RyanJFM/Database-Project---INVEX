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
    }, 10);
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
    setTimeout(() => {
      setIsDrawerOpen(false);
      setFormSubmitError(null);
    }, 300);
  };

  const openExamDrawer = (c) => {
    setSelectedCaseForExam(c);
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

    const submissionData = {
      ...formData,
      user_id: '2'
    };

    axios.post('/api/cases', submissionData)
      .then(() => {
        setIsSubmitting(false);
        closeDrawer();
        setFormData(prev => ({
          ...prev,
          incident_date: '',
          description: ''
        }));
        fetchCasesAndPatients();
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
        fetchCasesAndPatients();
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
        setEvidenceFormData(prev => ({
          ...prev,
          description: ''
        }));
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

  const generatePDF = (c) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const patientObj = patients.find(p => p.patient_id === c.patient_id) || {};

    const primaryColor = [79, 70, 229]; // Indigo: #4f46e5
    const darkColor = [17, 24, 39]; // Charcoal: #111827

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 8, 'F');

    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('INVEX FORENSIC SYSTEM', 20, 24);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text('Office of the Judicial Medical Officer (JMO)', 20, 30);
    doc.text('Department of Forensic Medicine, Teaching Hospital', 20, 35);

    doc.setDrawColor(229, 231, 235);
    doc.line(20, 40, 190, 40);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...primaryColor);
    doc.text('OFFICIAL MEDICO-LEGAL COURT REPORT', 20, 50);

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

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('Incident Details & Medical Observations', 20, tableBottom + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...darkColor);
    
    const descText = c.description || 'No description or clinical details recorded for this case.';
    const splitDesc = doc.splitTextToSize(descText, 170);
    doc.text(splitDesc, 20, tableBottom + 18);

    const descBottom = tableBottom + 18 + (splitDesc.length * 5);

    doc.setDrawColor(229, 231, 235);
    doc.line(20, descBottom + 12, 190, descBottom + 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...darkColor);
    doc.text('Responsible Judicial Medical Officer (JMO):', 20, descBottom + 22);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Dr. C. Wickramasinghe (JMO)', 20, descBottom + 28);
    doc.text('ID: #USR-2 (Forensic Specialist)', 20, descBottom + 33);

    doc.line(130, descBottom + 28, 185, descBottom + 28);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('JMO Authorized Signature & Stamp', 130, descBottom + 32);

    const pageHeight = doc.internal.pageSize.height;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Confidential - Generated for Judicial Proceedings Only', 20, pageHeight - 12);
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, 125, pageHeight - 12);

    doc.save(`Court_Report_FC-${c.case_id}.pdf`);
  };

  // SVGs
  const AddIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  const EvidenceIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08" />
      <polygon points="12 22.08 21 17.08 21 6.92 12 12 12 22.08" />
      <polygon points="12 12 21 6.92 12 1.92 3 6.92 12 12" />
    </svg>
  );

  const ExamIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );

  const PdfIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );

  return (
    <div style={styles.container}>
      <style>{`
        .premium-input {
          padding: 10px 14px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          background-color: #ffffff;
          color: #111827;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
          box-sizing: border-box;
        }
        .premium-input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
        }
        .premium-btn-primary {
          background-color: #4f46e5;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(79, 70, 229, 0.15);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .premium-btn-primary:hover:not(:disabled) {
          background-color: #4338ca;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
        }
        .premium-btn-secondary {
          border: 1px solid #d1d5db;
          background-color: #ffffff;
          color: #374151;
          border-radius: 8px;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .premium-btn-secondary:hover {
          background-color: #f9fafb;
          border-color: #c7d2fe;
          color: #4f46e5;
        }
        .action-btn-group {
          display: flex;
          gap: 6px;
          justify-content: flex-end;
          align-items: center;
        }
        .action-btn {
          display: inline-flex;
          align-items: center;
          border: 1px solid #e5e7eb;
          background-color: #ffffff;
          color: #4b5563;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .action-btn:hover {
          border-color: #4f46e5;
          color: #4f46e5;
          background-color: rgba(79, 70, 229, 0.02);
        }
        .drawer-close-btn {
          border: none;
          background: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justifyContent: center;
          transition: all 0.2s;
        }
        .drawer-close-btn:hover {
          background-color: #f3f4f6;
          color: #111827;
        }
        .drawer-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .drawer-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .drawer-scroll::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 4px;
        }
        .drawer-scroll::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
        .toggle-btn {
          flex: 1;
          padding: 10px;
          border: 1px solid #e5e7eb;
          background-color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.15s;
        }
        .toggle-btn.active {
          background-color: #e0e7ff;
          border-color: #c7d2fe;
          color: #4f46e5;
        }
        .toggle-btn:first-child {
          border-top-left-radius: 6px;
          border-bottom-left-radius: 6px;
          border-right: none;
        }
        .toggle-btn:last-child {
          border-top-right-radius: 6px;
          border-bottom-right-radius: 6px;
        }
      `}</style>

      {/* Header Area */}
      <header style={styles.header}>
        <div style={styles.headerText}>
          <h1 style={styles.title}>Forensic Cases</h1>
          <p style={styles.subtitle}>Create, update, and manage JMO incident case files and reports.</p>
        </div>
        <button className="premium-btn-primary" onClick={openDrawer}>
          <AddIcon /> Create Forensic Case
        </button>
      </header>

      {loading && <div style={styles.loading}>Loading case files...</div>}
      {error && <div style={styles.error}>Connection Error: {error}. Check backend server.</div>}

      {/* Cases Table */}
      {!loading && !error && (
        <section style={styles.tableCard}>
          <div className="table-wrapper">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Linked Patient</th>
                  <th>JMO / Doctor</th>
                  <th>Police Station</th>
                  <th>Requesting Court</th>
                  <th>Case Type</th>
                  <th>Incident Date</th>
                  <th>Case Status</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', color: '#9ca3af', padding: '30px' }}>
                      No forensic case files logged.
                    </td>
                  </tr>
                ) : (
                  cases.map((c) => (
                    <tr key={c.case_id}>
                      <td style={{ fontWeight: '600', color: '#4f46e5' }}>#FC-{c.case_id}</td>
                      <td style={{ fontWeight: '500', color: '#111827' }}>
                        {c.patient_name || `Patient #${c.patient_id}`}
                      </td>
                      <td>JMO-{c.user_id}</td>
                      <td>{c.station_name || '—'}</td>
                      <td>{c.court_name || '—'}</td>
                      <td>{c.case_type_name || '—'}</td>
                      <td>{formatDate(c.incident_date)}</td>
                      <td>
                        <span style={{ 
                          ...styles.statusBadge, 
                          ...(c.case_status_name === 'Open' ? styles.badgeOpen : 
                              c.case_status_name === 'Closed' ? styles.badgeClosed : 
                              styles.badgePending) 
                        }}>
                          {c.case_status_name || 'Unknown'}
                        </span>
                      </td>
                      <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.description || '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-btn-group">
                          <button className="action-btn" onClick={() => openEvidenceDrawer(c)}>
                            <EvidenceIcon /> Evidence
                          </button>
                          <button className="action-btn" onClick={() => openExamDrawer(c)}>
                            <ExamIcon /> Add Exam
                          </button>
                          <button className="action-btn" onClick={() => generatePDF(c)}>
                            <PdfIcon /> PDF
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

      {/* Drawer 1: Create Case Drawer */}
      {isDrawerOpen && (
        <div 
          style={{
            ...styles.drawerOverlay,
            backgroundColor: isDrawerVisible ? 'rgba(17, 24, 39, 0.4)' : 'rgba(17, 24, 39, 0)',
            backdropFilter: isDrawerVisible ? 'blur(4px)' : 'blur(0px)',
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
            <div style={styles.drawerHeader}>
              <div>
                <h2 style={styles.drawerTitle}>Create Forensic Case</h2>
                <p style={styles.drawerSubtitle}>Create a new legal/medical inquiry case.</p>
              </div>
              <button className="drawer-close-btn" onClick={closeDrawer}>
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={styles.formContainer}>
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
                          {p.full_name} (NIC: {p.nic || '—'})
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
                      value={`JMO Specialist #${formData.user_id}`} 
                      disabled 
                      className="premium-input"
                      style={{ opacity: 0.8, backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
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
                    placeholder="Enter observations, request details, or MLEF summary..."
                    className="premium-input"
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  ></textarea>
                </div>
              </div>

              <div style={styles.drawerFooter}>
                <button type="button" className="premium-btn-secondary" onClick={closeDrawer}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="premium-btn-primary"
                  style={{ minWidth: '130px', justifyContent: 'center' }}
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer 2: Exam Details Drawer */}
      {isExamDrawerOpen && (
        <div 
          style={{
            ...styles.drawerOverlay,
            backgroundColor: isExamDrawerVisible ? 'rgba(17, 24, 39, 0.4)' : 'rgba(17, 24, 39, 0)',
            backdropFilter: isExamDrawerVisible ? 'blur(4px)' : 'blur(0px)',
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
            <div style={styles.drawerHeader}>
              <div>
                <h2 style={styles.drawerTitle}>Record Medical Examination</h2>
                <p style={styles.drawerSubtitle}>Case: #FC-{selectedCaseForExam?.case_id} ({selectedCaseForExam?.patient_name})</p>
              </div>
              <button className="drawer-close-btn" onClick={closeExamDrawer}>
                <CloseIcon />
              </button>
            </div>

            {/* Segment Controller */}
            <div style={{ padding: '20px 30px 0 30px', display: 'flex' }}>
              <button 
                type="button" 
                className={`toggle-btn ${examType === 'clinical' ? 'active' : ''}`}
                onClick={() => setExamType('clinical')}
              >
                Clinical Exam
              </button>
              <button 
                type="button" 
                className={`toggle-btn ${examType === 'postmortem' ? 'active' : ''}`}
                onClick={() => setExamType('postmortem')}
              >
                Postmortem / Autopsy
              </button>
            </div>

            <form onSubmit={handleExamSubmit} style={styles.formContainer}>
              <div className="drawer-scroll" style={styles.drawerBody}>
                {examSubmitError && <div style={styles.formError}>{examSubmitError}</div>}

                {examType === 'clinical' ? (
                  <>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Clinical Assessment Type</label>
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
                      <label style={styles.label}>Injury & Observations *</label>
                      <textarea 
                        name="injury_details" 
                        rows="6" 
                        value={clinicalData.injury_details} 
                        onChange={handleClinicalChange} 
                        required
                        placeholder="Log detailed description of wounds, fractures, abrasions, etc..."
                        className="premium-input"
                        style={{ resize: 'vertical', fontFamily: 'inherit' }}
                      ></textarea>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Cause of Death Category</label>
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
                      <label style={styles.label}>Anatomical & Cause of Death Details *</label>
                      <textarea 
                        name="cause_of_death" 
                        rows="6" 
                        value={postmortemData.cause_of_death} 
                        onChange={handlePostmortemChange} 
                        required
                        placeholder="State anatomical findings and official opinion on cause of death..."
                        className="premium-input"
                        style={{ resize: 'vertical', fontFamily: 'inherit' }}
                      ></textarea>
                    </div>
                  </>
                )}
              </div>

              <div style={styles.drawerFooter}>
                <button type="button" className="premium-btn-secondary" onClick={closeExamDrawer}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isExamSubmitting} 
                  className="premium-btn-primary"
                  style={{ minWidth: '130px', justifyContent: 'center' }}
                >
                  {isExamSubmitting ? 'Saving...' : 'Save Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer 3: Evidence Log Drawer */}
      {isEvidenceDrawerOpen && (
        <div 
          style={{
            ...styles.drawerOverlay,
            backgroundColor: isEvidenceDrawerVisible ? 'rgba(17, 24, 39, 0.4)' : 'rgba(17, 24, 39, 0)',
            backdropFilter: isEvidenceDrawerVisible ? 'blur(4px)' : 'blur(0px)',
          }} 
          onClick={closeEvidenceDrawer}
        >
          <div 
            style={{
              ...styles.drawer,
              transform: isEvidenceDrawerVisible ? 'translateX(0)' : 'translateX(100%)',
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.drawerHeader}>
              <div>
                <h2 style={styles.drawerTitle}>Evidence & Exhibits Log</h2>
                <p style={styles.drawerSubtitle}>Case: #FC-{selectedCaseForEvidence?.case_id} ({selectedCaseForEvidence?.patient_name})</p>
              </div>
              <button className="drawer-close-btn" onClick={closeEvidenceDrawer}>
                <CloseIcon />
              </button>
            </div>

            <div className="drawer-scroll" style={{ ...styles.drawerBody, paddingBottom: '0' }}>
              {/* Evidence Logged List */}
              <div style={styles.evidenceListContainer}>
                <h4 style={styles.subSectionTitle}>Logged Exhibits</h4>
                {evidenceLoading ? (
                  <div style={styles.miniLabel}>Loading chain of custody...</div>
                ) : evidenceError ? (
                  <div style={styles.miniError}>{evidenceError}</div>
                ) : evidenceList.length === 0 ? (
                  <div style={styles.emptyStateText}>No physical evidence logs created yet.</div>
                ) : (
                  <div style={styles.evidenceList}>
                    {evidenceList.map(e => (
                      <div key={e.evidence_id} style={styles.evidenceItem}>
                        <div style={styles.evidenceHeader}>
                          <span style={styles.evidenceType}>{e.evidence_type_name}</span>
                          <span style={{ 
                            ...styles.evidenceStatus, 
                            ...(e.evidence_status_id === 1 ? styles.badgeOpen : 
                                e.evidence_status_id === 3 ? styles.badgeClosed : 
                                styles.badgePending)
                          }}>
                            {e.evidence_status_name}
                          </span>
                        </div>
                        <p style={styles.evidenceDesc}>{e.description || 'No description recorded.'}</p>
                        <div style={styles.evidenceMeta}>
                          Loc: <b>{e.storage_location_name}</b> | Logged: {new Date(e.collected_date).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Log Form Divider */}
              <div style={styles.divider}></div>

              {/* Add Evidence Form */}
              <form onSubmit={handleEvidenceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '30px' }}>
                <h4 style={styles.subSectionTitle}>Log New Exhibit</h4>
                {evidenceSubmitError && <div style={styles.formError}>{evidenceSubmitError}</div>}
                
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Exhibit Type</label>
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
                    <label style={styles.label}>Storage Unit</label>
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

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Initial Status</label>
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
                    <label style={styles.label}>Description & Notes</label>
                    <input 
                      type="text" 
                      name="description" 
                      value={evidenceFormData.description} 
                      onChange={handleEvidenceChange} 
                      placeholder="e.g. Sealed blood vial with barcode"
                      className="premium-input"
                    />
                  </div>
                </div>

                <button type="submit" disabled={isEvidenceSubmitting} className="premium-btn-primary" style={{ justifyContent: 'center' }}>
                  {isEvidenceSubmitting ? 'Logging...' : 'Log Exhibit'}
                </button>
              </form>
            </div>
            
            <div style={styles.drawerFooter}>
              <button type="button" className="premium-btn-secondary" onClick={closeEvidenceDrawer}>
                Close
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
    padding: '32px 40px',
    fontFamily: 'var(--sans)',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
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
    margin: '0 0 6px 0',
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    margin: 0,
    color: '#6b7280',
    fontSize: '14px',
  },
  loading: {
    padding: '24px',
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'left',
  },
  error: {
    padding: '16px',
    fontSize: '14px',
    color: '#ef4444',
    backgroundColor: '#fef2f2',
    borderRadius: '8px',
    border: '1px solid #fee2e2',
    textAlign: 'left',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03)',
    textAlign: 'left',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #f0f0f0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  trHead: {
    backgroundColor: '#fafafa',
    borderBottom: '1px solid #f0f0f0',
  },
  tr: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s',
  },
  th: {
    padding: '14px 20px',
    fontWeight: '600',
    textAlign: 'left',
    color: '#4b5563',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  td: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#4b5563',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '50px',
    fontSize: '11px',
    fontWeight: '600',
  },
  badgeOpen: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
  },
  badgeClosed: {
    backgroundColor: '#d1fae5',
    color: '#059669',
  },
  badgePending: {
    backgroundColor: '#dbeafe',
    color: '#2563eb',
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
    backgroundColor: '#ffffff',
    borderLeft: '1px solid #e5e7eb',
    boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.08)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  drawerHeader: {
    padding: '24px 30px',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'left',
  },
  drawerTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
  },
  drawerSubtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#6b7280',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    margin: 0,
    overflow: 'hidden',
  },
  drawerBody: {
    padding: '30px',
    flexGrow: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
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
    color: '#374151',
  },
  drawerFooter: {
    padding: '20px 30px',
    borderTop: '1px solid #f3f4f6',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    backgroundColor: '#fafafa',
  },
  formError: {
    color: '#ef4444',
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    borderRadius: '6px',
    padding: '12px',
    fontSize: '13px',
    lineHeight: '1.4',
  },
  evidenceListContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  subSectionTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 6px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  evidenceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '260px',
    overflowY: 'auto',
  },
  evidenceItem: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  evidenceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  evidenceType: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#111827',
  },
  evidenceStatus: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
  },
  evidenceDesc: {
    margin: '4px 0',
    fontSize: '13px',
    color: '#4b5563',
  },
  evidenceMeta: {
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '2px',
  },
  divider: {
    height: '1px',
    backgroundColor: '#f0f0f0',
    margin: '12px 0',
  },
  emptyStateText: {
    fontSize: '13px',
    color: '#9ca3af',
    fontStyle: 'italic',
    padding: '16px 0',
  },
  miniLabel: {
    fontSize: '12px',
    color: '#6b7280',
  },
  miniError: {
    fontSize: '12px',
    color: '#ef4444',
  }
};

export default CaseManagement;
