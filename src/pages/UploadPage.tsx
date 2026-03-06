import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, File, Link as LinkIcon, CheckCircle, AlertCircle, Sparkles, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ id: string; originalName: string } | null>(null);
  const navigate = useNavigate();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
      setUploadedFile(null);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setUploadedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setUploadedFile(response.file);
          setFile(null);
        } else {
          setError('Failed to upload file. Please try again.');
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        setError('Network error occurred during upload.');
        setUploading(false);
      };

      xhr.send(formData);
    } catch (err) {
      setError('An unexpected error occurred.');
      setUploading(false);
    }
  };

  const copyLink = () => {
    if (uploadedFile) {
      const link = `${window.location.origin}/file/${uploadedFile.id}`;
      navigator.clipboard.writeText(link);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="atmosphere-bg"></div>
      
      <button 
        onClick={() => navigate('/admin')}
        className="absolute top-6 right-6 p-3 glass-button text-zinc-400 hover:text-white rounded-xl z-20"
        title="Admin Dashboard"
      >
        <Settings className="w-5 h-5" />
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-xl w-full glass-panel rounded-3xl overflow-hidden relative z-10"
      >
        <div className="p-10 text-center border-b border-white/5 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-indigo-500 rounded-b-full opacity-50 blur-[2px]"></div>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl mb-6 border border-indigo-500/20"
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Stream<span className="text-indigo-400">Box</span></h1>
          <p className="text-zinc-400 font-light text-lg">Upload any file and get a direct stream link instantly.</p>
          <p className="text-zinc-500 font-light text-sm mt-2" dir="rtl">ارفع أي ملف واحصل على رابط بث مباشر فوراً.</p>
        </div>

        <div className="p-10">
          {!uploadedFile ? (
            <div className="space-y-8">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`glass-input rounded-2xl p-12 text-center relative overflow-hidden ${
                  isDragging ? 'drag-active' : ''
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                
                {file ? (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center space-y-4"
                  >
                    <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                      <File className="w-10 h-10" />
                    </div>
                    <div className="text-white font-medium truncate max-w-xs text-lg">{file.name}</div>
                    <div className="text-zinc-400 text-sm bg-black/30 px-3 py-1 rounded-full">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                    <button 
                      onClick={(e) => { e.preventDefault(); setFile(null); }}
                      className="text-sm text-red-400 hover:text-red-300 font-medium mt-4 transition-colors"
                      disabled={uploading}
                    >
                      Remove file
                    </button>
                  </motion.div>
                ) : (
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center space-y-5 block w-full h-full">
                    <div className="p-5 bg-white/5 rounded-2xl text-indigo-400 border border-white/5 shadow-inner">
                      <Upload className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg">
                        <span className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">Click to browse</span>
                        <span className="text-zinc-400"> or drag and drop</span>
                      </div>
                      <div className="text-sm text-zinc-500 font-light" dir="rtl">
                        <span className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">اضغط للاختيار</span>
                        <span> أو اسحب وأفلت الملف هنا</span>
                      </div>
                      <p className="text-xs text-zinc-600 font-light mt-2">Supports files up to 2GB / يدعم ملفات حتى 2 جيجابايت</p>
                    </div>
                  </label>
                )}
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-3 text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-sm"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {uploading && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-zinc-400 font-medium">
                    <span>Uploading to secure cloud...</span>
                    <span className="text-indigo-400">{progress}%</span>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden border border-white/5 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-indigo-600 to-purple-500 h-full rounded-full transition-all duration-300 relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`w-full py-4 px-6 rounded-2xl font-medium text-white transition-all duration-300 flex items-center justify-center space-x-2 ${
                  !file || uploading
                    ? 'bg-white/5 text-zinc-500 cursor-not-allowed border border-white/5'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] border border-indigo-500/50'
                }`}
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    <span>Processing... / جاري المعالجة...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    <span>Upload File / رفع الملف</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center space-y-8"
            >
              <div className="flex justify-center">
                <div className="p-5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <CheckCircle className="w-14 h-14" />
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Ready to Stream! / جاهز للبث!</h3>
                <p className="text-zinc-400">{uploadedFile.originalName}</p>
              </div>

              <div className="bg-black/40 p-5 rounded-2xl border border-white/10 flex items-center space-x-4">
                <div className="flex-1 truncate text-sm text-zinc-300 text-left font-mono">
                  {window.location.origin}/file/{uploadedFile.id}
                </div>
                <button 
                  onClick={copyLink}
                  className="p-3 bg-white/10 border border-white/10 rounded-xl text-white hover:bg-white/20 transition-colors"
                  title="Copy Link"
                >
                  <LinkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate(`/file/${uploadedFile.id}`)}
                  className="flex-1 py-4 px-6 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-500 transition-colors shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                >
                  View & Stream / عرض وبث
                </button>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="flex-1 py-4 px-6 glass-button text-white rounded-xl font-medium"
                >
                  Upload Another / رفع ملف آخر
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
