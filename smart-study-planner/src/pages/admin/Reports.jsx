import React, { useState } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';

const Reports = () => {
  const today      = new Date().toISOString().split('T')[0];
  const weekAgo    = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  const [startDate, setStartDate]   = useState(weekAgo);
  const [endDate,   setEndDate]     = useState(today);
  const [report,    setReport]      = useState(null);
  const [loading,   setLoading]     = useState(false);
  const [exporting, setExporting]   = useState(false);

  const handleGenerate = async () => {
    if (!startDate || !endDate) { toast.warn('Select date range'); return; }
    setLoading(true); setReport(null);
    try {
      const res = await adminService.generateReport(startDate, endDate);
      setReport(res.data.data);
      toast.success('Report generated');
    } catch { toast.error('Failed to generate report'); }
    finally { setLoading(false); }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const res = await adminService.exportReport('activity', format);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `report.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch { toast.error('Export failed'); }
    finally { setExporting(false); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Reports</h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="admin-btn admin-btn-primary" onClick={() => handleExport('csv')} disabled={exporting}>
            Export CSV
          </button>
          <button className="admin-btn" onClick={() => handleExport('pdf')} disabled={exporting}>
            Export PDF
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="admin-card" style={{ marginBottom: 24, padding: 20 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Generate Activity Report</h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 600 }}>From</label>
            <input type="date" className="admin-input" value={startDate}
              onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 600 }}>To</label>
            <input type="date" className="admin-input" value={endDate}
              onChange={e => setEndDate(e.target.value)} />
          </div>
          <button className="admin-btn admin-btn-primary" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating…' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Report Output */}
      {report && (
        <div className="admin-card">
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>
            Report: {startDate} → {endDate}
          </h3>
          <table className="admin-table">
            <thead>
              <tr><th>Metric</th><th>Value</th></tr>
            </thead>
            <tbody>
              {Object.entries(report).map(([k, v]) => (
                <tr key={k}>
                  <td>{k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</td>
                  <td>{String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!report && !loading && (
        <div className="admin-card">
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-6)' }}>
            Select a date range and click "Generate Report" to view activity data.
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;
