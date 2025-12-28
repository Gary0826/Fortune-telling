import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Clipboard } from 'lucide-react';
import { UploadedImage } from '../types';

interface FileUploadProps {
  label: string;
  image: UploadedImage | null;
  onImageChange: (image: UploadedImage | null) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, image, onImageChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('請上傳圖片檔案 (Please upload an image file).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageChange({
        file,
        previewUrl: result,
        base64: result,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    if (e.clipboardData && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      processFile(file);
    }
  };

  // Add global paste listener for this component when focused or generally active
  // Note: Local paste is safer to avoid conflict with other inputs
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      
      {image ? (
        <div className="relative group rounded-lg overflow-hidden border border-slate-600 bg-slate-800">
          <img src={image.previewUrl} alt="Preview" className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
          <button 
            onClick={() => onImageChange(null)}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-md"
          >
            <X size={16} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-xs text-white p-2 truncate">
            {image.file.name}
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors h-48
            ${isDragging ? 'border-agency-accent bg-agency-accent/10' : 'border-slate-600 hover:border-agency-accent hover:bg-slate-800'}
          `}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => e.target.files && processFile(e.target.files[0])} 
            className="hidden" 
            accept="image/*"
          />
          <Upload className="text-slate-400 mb-3" size={32} />
          <p className="text-sm text-slate-300 font-medium text-center">點擊或拖曳圖片至此</p>
          <p className="text-xs text-slate-500 mt-2 text-center">支援 JPG, PNG, WEBP</p>
          <div className="flex items-center gap-2 mt-4 text-xs text-agency-accent">
            <Clipboard size={12} />
            <span>支援剪貼簿直接貼上 (Ctrl+V)</span>
          </div>
        </div>
      )}
    </div>
  );
};