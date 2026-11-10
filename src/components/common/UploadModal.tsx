import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadCloud, X, CheckCircle2, AlertTriangle, FileSpreadsheet, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { ValidationReport } from '../../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (report: ValidationReport) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ValidationReport | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.csv')) {
        setError('Please select a valid CSV (.csv) file.');
        return;
      }
      setFile(selected);
      setError(null);
      setReport(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const validationReport = await api.validateUpload(file);
      setReport(validationReport);
      if (validationReport.is_valid) {
        onUploadSuccess(validationReport);
      } else {
        setError(validationReport.error_message || 'The uploaded dataset does not satisfy required agricultural schema.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload and validate dataset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-forest">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t('upload.title', 'Upload Custom Mandi Dataset')}</h3>
              <p className="text-xs text-slate-500">{t('upload.supported_format', 'CSV format with Date, State, District, Market, Commodity, and Modal Price')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Zone */}
        {!report ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 hover:border-forest/70 rounded-xl p-8 text-center transition-colors bg-slate-50/60">
              <input
                type="file"
                accept=".csv"
                id="csv-file-input"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center space-y-2">
                <UploadCloud className="w-10 h-10 text-forest/80 animate-pulse" />
                <p className="text-sm font-medium text-slate-700">
                  {file ? (
                    <span className="font-semibold text-forest">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                  ) : (
                    'Click to choose a CSV file or drag & drop here'
                  )}
                </p>
                <p className="text-xs text-slate-400">AGMARKNET, State APMC, or custom CSV</p>
              </label>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!file || loading}
                onClick={handleUpload}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-forest hover:bg-forest-hover disabled:bg-slate-300 rounded-lg shadow-sm transition-colors"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Validating Data...' : 'Validate & Upload Dataset'}
              </button>
            </div>
          </div>
        ) : (
          /* Validation Report View */
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${report.is_valid ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
              {report.is_valid ? (
                <CheckCircle2 className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="text-xs space-y-1">
                <p className="font-bold text-sm">
                  {report.is_valid ? 'Dataset Validated & Activated Successfully' : 'Dataset Validation Failed'}
                </p>
                <p className="text-slate-600">
                  {report.valid_rows} of {report.total_rows} rows satisfied quality rules.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                <p className="text-[11px] text-slate-500 uppercase font-medium">Total Rows</p>
                <p className="text-lg font-bold text-slate-800">{report.total_rows}</p>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 text-center">
                <p className="text-[11px] text-emerald-700 uppercase font-medium">Valid Rows</p>
                <p className="text-lg font-bold text-emerald-900">{report.valid_rows}</p>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100 text-center">
                <p className="text-[11px] text-amber-700 uppercase font-medium">Duplicates</p>
                <p className="text-lg font-bold text-amber-900">{report.duplicate_rows}</p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                <p className="text-[11px] text-slate-500 uppercase font-medium">Rejected</p>
                <p className="text-lg font-bold text-slate-800">{report.rejected_rows}</p>
              </div>
            </div>

            {report.applied_transformations.length > 0 && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 max-h-32 overflow-y-auto">
                <p className="font-semibold text-slate-700">Cleaning Transformations Applied:</p>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                  {report.applied_transformations.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setReport(null);
                  setFile(null);
                }}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Upload Another File
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-forest hover:bg-forest-hover rounded-lg shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
