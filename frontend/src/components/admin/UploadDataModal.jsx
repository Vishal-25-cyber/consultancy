import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertTriangle, CheckCircle } from 'lucide-react';
import { uploadAPI } from '../../utils/superstoreApi';
import toast from 'react-hot-toast';

export default function UploadDataModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const ACCEPTED = ['.xlsx', '.xls', '.csv'];

  function validateFile(f) {
    if (!f) return false;
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    return ACCEPTED.includes(ext);
  }

  function handleFileChange(f) {
    if (!validateFile(f)) {
      toast.error('Only .xlsx, .xls, or .csv files are accepted.');
      return;
    }
    setFile(f);
    setResult(null);
  }

  function onInputChange(e) {
    handleFileChange(e.target.files[0]);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFileChange(e.dataTransfer.files[0]);
  }

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadAPI.uploadExcel(formData);
      const data = res.data;
      setResult({ success: true, ...data });
      toast.success(`${data.imported} orders imported successfully!`);
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed. Please try again.';
      setResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="text-green-600" size={22} />
            <h2 className="text-lg font-semibold text-gray-800">Upload Excel Data</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Warning */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <AlertTriangle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              <strong>Warning:</strong> Uploading a new file will <strong>replace all existing orders</strong> in the database.
            </p>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors select-none
              ${dragging ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={onInputChange}
            />
            <Upload size={32} className="mx-auto mb-2 text-gray-400" />
            {file ? (
              <div>
                <p className="font-medium text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB — click to change</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 font-medium">Drag &amp; drop or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">Accepts .xlsx, .xls, .csv — max 20 MB</p>
              </div>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className={`flex items-start gap-3 rounded-lg px-4 py-3 text-sm
              ${result.success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {result.success
                ? <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
                : <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />}
              <div>
                {result.success ? (
                  <>
                    <p><strong>{result.imported}</strong> orders imported successfully out of {result.totalRows} rows.</p>
                    {result.skipped > 0 && <p className="mt-0.5">{result.skipped} rows skipped.</p>}
                  </>
                ) : (
                  <p>{result.message}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Uploading…
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload &amp; Replace Data
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
