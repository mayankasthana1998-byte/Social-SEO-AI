import React, { useRef } from 'react';
import { Upload, X, FileVideo, FileImage } from 'lucide-react';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '../constants';
import { FileInput } from '../types';

interface FileUploadProps {
  files: FileInput[];
  setFiles: React.Dispatch<React.SetStateAction<FileInput[]>>;
  multiple?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ files, setFiles, multiple = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to format the display size (e.g., 10GB instead of 10240MB)
  const formattedMaxSize = MAX_FILE_SIZE_MB >= 1024 
    ? `${parseFloat((MAX_FILE_SIZE_MB / 1024).toFixed(2))}GB` 
    : `${MAX_FILE_SIZE_MB}MB`;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles: FileInput[] = [];
      
      Array.from(event.target.files).forEach((file: File) => {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          alert(`File ${file.name} exceeds the ${formattedMaxSize} limit.`);
          return;
        }

        const isVideo = file.type.startsWith('video/');
        const preview = URL.createObjectURL(file);

        newFiles.push({
          file,
          preview,
          type: isVideo ? 'video' : 'image'
        });
      });

      if (multiple) {
        setFiles(prev => [...prev, ...newFiles]);
      } else {
        // Replace existing if not multiple
        setFiles(newFiles);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview); // Cleanup memory
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  return (
    <div className="w-full space-y-4">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-400 hover:bg-slate-800/50 transition-all cursor-pointer group"
      >
        <Upload className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
        <p className="text-sm font-medium">Click to upload {multiple ? 'Files (Batch)' : 'Content'}</p>
        <p className="text-xs text-slate-500 mt-2">Max size: {formattedMaxSize} per file</p>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange} 
          accept="image/*,video/*"
          multiple={multiple}
        />
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.map((f, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
              <button 
                onClick={() => removeFile(idx)}
                className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <X size={14} />
              </button>
              
              <div className="aspect-square flex items-center justify-center bg-slate-900">
                {f.type === 'video' ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <FileVideo className="text-slate-500 w-10 h-10" />
                    <video src={f.preview} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                  </div>
                ) : (
                  <img src={f.preview} alt="preview" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-2 text-xs truncate text-slate-400">
                {f.file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;