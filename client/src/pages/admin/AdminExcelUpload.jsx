import React, { useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle2, AlertCircle, Upload, HelpCircle } from 'lucide-react';
import api from '../../api/client';

export default function AdminExcelUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose an Excel or CSV file first');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/products/bulk-import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResult(res.data);
      setFile(null);
    } catch (err) {
      console.error('Excel upload error:', err);
      setError(err.response?.data?.message || 'Failed to process Excel file. Verify sheet columns format.');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    window.location.href = '/api/products/template';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Title */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            <span>Bulk Game Import from Excel Sheet</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload a spreadsheet containing dozens or hundreds of games to insert or update their prices in bulk.
          </p>
        </div>

        <button
          type="button"
          onClick={downloadTemplate}
          className="whitespace-nowrap bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-300 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-purple-400" />
          <span>Download Excel Template (.xlsx)</span>
        </button>
      </div>

      {/* Notifications */}
      {result && (
        <div className="p-5 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-start gap-3 shadow-neon-green">
          <CheckCircle2 className="w-5 h-5 text-xbox-neon shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white">Excel Processed Successfully!</h4>
            <p>{result.message}</p>
            <div className="flex gap-4 pt-1 font-mono text-[11px]">
              <span className="text-emerald-400">New Games Added: {result.inserted}</span>
              <span className="text-cyan-400">Existing Games Updated: {result.updated}</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-3xl p-8 sm:p-12 text-center transition-all bg-slate-950/50">
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center mx-auto shadow-neon-purple">
                <Upload className="w-8 h-8" />
              </div>

              {file ? (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-400 block">Selected File:</span>
                  <p className="font-mono text-sm text-white font-bold bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 inline-block">
                    {file.name}
                  </p>
                  <div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Remove & choose another file
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-2">
                  <span className="text-sm font-bold text-white block">Click to select an Excel spreadsheet or drag & drop</span>
                  <span className="text-xs text-slate-400 block">Supports .xlsx, .xls, and .csv</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!file || uploading}
            className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
              !file || uploading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-xbox-neon to-emerald-400 hover:from-emerald-400 text-black shadow-neon-green hover:scale-[1.01]'
            }`}
          >
            {uploading ? (
              <span>Importing & updating catalog...</span>
            ) : (
              <>
                <FileSpreadsheet className="w-5 h-5" />
                <span>Start Bulk Import ⚡</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Guide to Columns */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3 text-xs">
        <h3 className="font-bold text-white flex items-center gap-1.5 text-sm">
          <HelpCircle className="w-4 h-4 text-purple-400" />
          <span>Expected Spreadsheet Column Headers:</span>
        </h3>
        <p className="text-slate-400 leading-relaxed">
          The parser automatically detects standard column names:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 font-mono">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <strong className="text-emerald-400 block">Game Title:</strong>
            <span className="text-slate-300">Title or Game Title</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <strong className="text-purple-400 block">Category:</strong>
            <span className="text-slate-300">Category or Genre</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <strong className="text-emerald-400 block">Sign Price:</strong>
            <span className="text-slate-300">Price_Sign or Sign Price</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <strong className="text-cyan-400 block">Home Price:</strong>
            <span className="text-slate-300">Price_Home or Home Price</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <strong className="text-amber-400 block">Full Price:</strong>
            <span className="text-slate-300">Price_Full or Full Price</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <strong className="text-purple-300 block">Poster Image URL:</strong>
            <span className="text-slate-300">Image_Url or Image</span>
          </div>
        </div>
      </div>

    </div>
  );
}
