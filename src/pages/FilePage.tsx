import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Play, File, AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface FileRecord {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadDate: number;
}

export function FilePage() {
  const { id } = useParams<{ id: string }>();
  const [file, setFile] = useState<FileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const response = await fetch(`/api/files/${id}`);
        if (response.ok) {
          const data = await response.json();
          setFile(data);
        } else {
          setError('File not found or has been deleted.');
        }
      } catch (err) {
        setError('Failed to fetch file details.');
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="atmosphere-bg"></div>
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="atmosphere-bg"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-panel rounded-3xl p-10 text-center space-y-8 relative z-10"
        >
          <div className="flex justify-center">
            <div className="p-5 bg-red-500/10 text-red-400 rounded-full border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <AlertCircle className="w-14 h-14" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-3">Oops!</h2>
            <p className="text-zinc-400 text-lg">{error || 'Something went wrong.'}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 px-6 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-500 transition-colors shadow-[0_0_20px_rgba(99,102,241,0.4)]"
          >
            Go back home
          </button>
        </motion.div>
      </div>
    );
  }

  const isVideo = file.mimeType.startsWith('video/');
  const isAudio = file.mimeType.startsWith('audio/');
  const isImage = file.mimeType.startsWith('image/');
  const canStream = isVideo || isAudio;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="atmosphere-bg"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl w-full glass-panel rounded-3xl overflow-hidden relative z-10"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-zinc-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Upload / عودة
          </button>
          <div className="text-sm text-zinc-500 font-mono">
            {formatDate(file.uploadDate)}
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-28 h-28 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                {isImage ? (
                  <img src={`/api/stream/${file.id}`} alt={file.originalName} className="w-full h-full object-cover rounded-3xl" />
                ) : isVideo ? (
                  <Play className="w-12 h-12 ml-1" />
                ) : (
                  <File className="w-12 h-12" />
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 truncate tracking-tight" title={file.originalName}>
                {file.originalName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400 font-mono">
                <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">{formatSize(file.size)}</span>
                <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">{file.mimeType}</span>
              </div>
            </div>
          </div>

          {canStream && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-10 bg-black/60 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 aspect-video flex items-center justify-center relative group"
            >
              {isVideo ? (
                <video 
                  controls 
                  className="w-full h-full object-contain"
                  src={`/api/stream/${file.id}`}
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full max-w-2xl px-8">
                  <div className="w-32 h-32 mx-auto bg-indigo-500/20 rounded-full flex items-center justify-center mb-8 animate-pulse">
                    <Play className="w-12 h-12 text-indigo-400 ml-2" />
                  </div>
                  <audio 
                    controls 
                    className="w-full"
                    src={`/api/stream/${file.id}`}
                    preload="metadata"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </motion.div>
          )}

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href={`/api/download/${file.id}`}
              download={file.originalName}
              className="flex-1 flex items-center justify-center py-4 px-6 bg-indigo-600 text-white rounded-2xl font-medium hover:bg-indigo-500 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]"
            >
              <Download className="w-5 h-5 mr-2" />
              Download File / تحميل الملف
            </a>
            
            {!canStream && !isImage && (
              <a
                href={`/api/stream/${file.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center py-4 px-6 glass-button text-white rounded-2xl font-medium"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Open in Browser / فتح في المتصفح
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
