'use client'

import { useState } from 'react'

interface FileDropZoneProps {
  selectedFile: File | null
  isProcessing: boolean
  onFileSelect: (file: File) => void
}

export default function FileDropZone({ selectedFile, isProcessing, onFileSelect }: FileDropZoneProps) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      const fileName = file.name.toLowerCase()
      if (fileName.endsWith('.json') || fileName.endsWith('.csv')) {
        onFileSelect(file)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const fileName = file.name.toLowerCase()
      if (fileName.endsWith('.json') || fileName.endsWith('.csv')) {
        onFileSelect(file)
      }
    }
  }

  const validateFile = (file: File): boolean => {
    const maxSize = 15 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/json', 'text/csv'];
    
    if (file.size > maxSize) return false;
    if (!allowedTypes.includes(file.type)) return false;
    return true;
  };

  return (
    <div
      className={`file-dropzone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept=".json,.csv"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <div className="dropzone-content">
        {isProcessing ? (
          <div className="file-processing">
            <div className="processing-spinner">⟳</div>
            <div className="processing-text">Processing file...</div>
          </div>
        ) : selectedFile ? (
          <div className="file-selected">
            <div className="file-icon">📄</div>
            <div className="file-name">{selectedFile.name}</div>
            <div className="file-size">{Math.round(selectedFile.size / 1024)} KB</div>
          </div>
        ) : (
          <div className="dropzone-text">
            click to select or drop your CSV / JSON file here
          </div>
        )}
      </div>
    </div>
  )
} 