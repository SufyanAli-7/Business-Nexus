import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Download, Trash2, Share2, Eye, PenTool, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface DocumentItem {
  _id: string;
  id?: string;
  name: string;
  url: string;
  type: string;
  size: string;
  uploadedBy: string;
  version: number;
  status: 'pending' | 'signed' | 'approved';
  signatureUrl?: string;
  signatureSignedAt?: string;
  shared: boolean;
  createdAt: string;
}

export const DocumentsPage: React.FC = () => {
  const { backendUrl } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [signDoc, setSignDoc] = useState<DocumentItem | null>(null);
  
  // Signature Drawing Pad state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchDocuments = () => {
    if (!backendUrl) return;
    axios.get(`${backendUrl}/api/document`)
      .then(res => {
        if (res.data.success) {
          setDocuments(res.data.documents);
        }
      })
      .catch(err => {
        console.error("Error loading documents:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchDocuments();
  }, [backendUrl]);

  // Handle file upload
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    const toastId = toast.loading('Uploading document...');

    try {
      if (!backendUrl) return;
      const res = await axios.post(`${backendUrl}/api/document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        toast.success('Document uploaded successfully!', { id: toastId });
        fetchDocuments();
      } else {
        toast.error('Upload failed.', { id: toastId });
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error('Error uploading document.', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Mark share toggle
  const handleShareToggle = async (id: string) => {
    try {
      if (!backendUrl) return;
      const res = await axios.put(`${backendUrl}/api/document/${id}/share`);
      if (res.data.success) {
        toast.success(res.data.document.shared ? 'Document shared publicly' : 'Document unshared');
        setDocuments(prev => prev.map(doc => doc._id === id ? { ...doc, shared: res.data.document.shared } : doc));
      }
    } catch (err) {
      console.error("Share error:", err);
      toast.error('Error updating share status');
    }
  };

  // Delete document
  const handleDeleteDoc = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      if (!backendUrl) return;
      const res = await axios.delete(`${backendUrl}/api/document/${id}`);
      if (res.data.success) {
        toast.success('Document deleted successfully');
        setDocuments(prev => prev.filter(doc => doc._id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error('Error deleting document');
    }
  };

  // Signature drawing canvas functions
  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const startDrawingTouch = (e: React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.beginPath();
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    setIsDrawing(true);
  };

  const drawTouch = (e: React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !signDoc) return;
    
    const signatureData = canvas.toDataURL('image/png');
    const toastId = toast.loading('Saving e-signature...');

    try {
      if (!backendUrl) return;
      const res = await axios.put(`${backendUrl}/api/document/${signDoc._id}/sign`, {
        signatureData
      });

      if (res.data.success) {
        toast.success('Document e-signed successfully!', { id: toastId });
        setSignDoc(null);
        fetchDocuments();
      }
    } catch (err) {
      console.error("Sign error:", err);
      toast.error('Failed to sign document.', { id: toastId });
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Storage info estimates
  const storageLimit = 20; // 20 GB limit
  const totalUsedBytes = documents.reduce((acc, doc) => {
    const num = parseFloat(doc.size);
    return acc + (isNaN(num) ? 0 : num * 1024 * 1024);
  }, 0);
  const usedGb = (totalUsedBytes / (1024 * 1024 * 1024)).toFixed(3);
  const usedPercentage = Math.min(100, Math.max(1, (parseFloat(usedGb) / storageLimit) * 100)).toFixed(1);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage your startup's important files with e-signature verification</p>
        </div>
        
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.xlsx,.xls,.doc,.docx,.png,.jpg,.jpeg"
          />
          <Button leftIcon={<Upload size={18} />} onClick={handleUploadClick} disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Storage info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Storage Chamber</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used Space</span>
                <span className="font-medium text-gray-900">{usedGb} GB</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-primary-600 rounded-full" style={{ width: `${usedPercentage}%` }}></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available</span>
                <span className="font-medium text-gray-900">{(storageLimit - parseFloat(usedGb)).toFixed(3)} GB</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Search Filters</h3>
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </CardBody>
        </Card>
        
        {/* Document list */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">All Files</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {filteredDocs.length > 0 ? (
                  filteredDocs.map(doc => (
                    <div
                      key={doc._id}
                      className="flex items-center p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors duration-200"
                    >
                      <div className="p-2 bg-primary-50 rounded-lg mr-4">
                        <FileText size={24} className="text-primary-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {doc.name}
                          </h3>
                          {doc.shared && (
                            <Badge variant="secondary" size="sm">Shared</Badge>
                          )}
                          <Badge variant={doc.status === 'signed' ? 'success' : 'warning'} size="sm" rounded>
                            {doc.status === 'signed' ? 'Signed' : 'Pending Signature'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{doc.type}</span>
                          <span>{doc.size}</span>
                          <span>Uploaded {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}</span>
                          <span>v{doc.version}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-gray-600 hover:text-gray-900"
                          aria-label="Preview"
                          onClick={() => setPreviewDoc(doc)}
                        >
                          <Eye size={18} />
                        </Button>

                        {doc.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 text-primary-600 hover:text-primary-800"
                            aria-label="Sign Document"
                            onClick={() => setSignDoc(doc)}
                          >
                            <PenTool size={18} />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-gray-600 hover:text-gray-900"
                          aria-label="Download"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <Download size={18} />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`p-2 ${doc.shared ? 'text-secondary-600' : 'text-gray-400'} hover:text-secondary-800`}
                          aria-label="Share"
                          onClick={() => handleShareToggle(doc._id)}
                        >
                          <Share2 size={18} />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-error-600 hover:text-error-700"
                          aria-label="Delete"
                          onClick={() => handleDeleteDoc(doc._id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FileText size={48} className="text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
                    <p className="text-gray-500 mt-1">Upload start-up plans, pitch decks or sheets.</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Signature Modal */}
      {signDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-2">E-Sign Chamber</h3>
            <p className="text-sm text-gray-500 mb-4">Draw your signature in the frame below for {signDoc.name}:</p>
            
            <div className="border border-gray-300 rounded bg-gray-50 overflow-hidden">
              <canvas
                ref={canvasRef}
                width={380}
                height={200}
                className="cursor-crosshair bg-white w-full"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawingTouch}
                onTouchMove={drawTouch}
                onTouchEnd={stopDrawing}
              />
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <Button variant="ghost" size="sm" onClick={clearCanvas}>
                Clear Board
              </Button>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setSignDoc(null)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={saveSignature}>
                  Apply Signature
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full h-[90vh] shadow-xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 truncate">{previewDoc.name}</h3>
              <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)}>
                Close
              </Button>
            </div>
            
            <div className="flex-1 bg-gray-100 rounded overflow-hidden relative">
              {previewDoc.type === 'PDF' ? (
                <iframe
                  src={previewDoc.url}
                  className="w-full h-full border-none"
                  title="Document Preview"
                />
              ) : previewDoc.type === 'Image' ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img src={previewDoc.url} alt={previewDoc.name} className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                  <FileText size={64} className="text-gray-400 mb-3" />
                  <p className="text-gray-700 font-medium">Preview not available for {previewDoc.type} files.</p>
                  <Button variant="primary" size="sm" className="mt-4" onClick={() => window.open(previewDoc.url, '_blank')}>
                    Download to view
                  </Button>
                </div>
              )}
            </div>

            {previewDoc.status === 'signed' && previewDoc.signatureUrl && (
              <div className="mt-4 p-4 border border-success-200 bg-success-50 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-success-900 flex items-center gap-1">
                    <CheckCircle size={16} className="text-success-600" />
                    E-Signed Document
                  </h4>
                  <p className="text-xs text-success-700">
                    Verified signature registered on {previewDoc.signatureSignedAt ? new Date(previewDoc.signatureSignedAt).toLocaleString() : ''}
                  </p>
                </div>
                
                <div className="bg-white p-2 border border-gray-200 rounded">
                  <img src={previewDoc.signatureUrl} alt="E-Signature" className="h-10 object-contain max-w-[120px]" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};