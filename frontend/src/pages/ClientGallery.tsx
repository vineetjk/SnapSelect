import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { photosAPI } from '../services/api';
import { Photo } from '../types';

function ClientGallery() {
  const { clientId } = useParams<{ clientId: string }>();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (clientId) {
      loadPhotos();
    }
  }, [clientId]);

  const loadPhotos = async () => {
    try {
      const response = await photosAPI.getByClient(Number(clientId));
      setPhotos(response.data);
    } catch (error) {
      console.error('Failed to load photos:', error);
      alert('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setUploading(true);
    try {
      await photosAPI.upload(Number(clientId), selectedFiles);
      setSelectedFiles(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      loadPhotos();
      alert('Photos uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleSelection = async (photoId: number) => {
    try {
      await photosAPI.toggleSelection(photoId);
      loadPhotos();
    } catch (error) {
      console.error('Failed to toggle selection:', error);
    }
  };

  const handleDelete = async (photoId: number) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }
    try {
      await photosAPI.delete(photoId);
      loadPhotos();
    } catch (error) {
      console.error('Failed to delete photo:', error);
      alert('Failed to delete photo');
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Manage Client Photos</h1>
        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '15px' }}>Upload Photos</h2>
        <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
          <p>Click to select photos or drag and drop</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="file-input"
          />
        </div>
        {selectedFiles && selectedFiles.length > 0 && (
          <div className="selected-files">
            <p>Selected {selectedFiles.length} file(s)</p>
            <ul className="file-list">
              {Array.from(selectedFiles).map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
            <button
              className="btn-primary"
              onClick={handleUpload}
              disabled={uploading}
              style={{ marginTop: '10px' }}
            >
              {uploading ? 'Uploading...' : 'Upload Photos'}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading photos...</div>
      ) : photos.length === 0 ? (
        <div className="empty-state">
          <h2>No photos yet</h2>
          <p>Upload photos to get started</p>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="photo-item">
              <img
                src={`/api/uploads/${photo.filename}`}
                alt={photo.original_filename}
                className="photo-image"
              />
              <div className="photo-actions">
                <p style={{ fontSize: '14px', marginBottom: '10px', color: '#666' }}>
                  {photo.original_filename}
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className={`btn-small ${photo.is_selected ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleToggleSelection(photo.id)}
                  >
                    {photo.is_selected ? 'Selected ✓' : 'Select'}
                  </button>
                  <button
                    className="btn-small btn-danger"
                    onClick={() => handleDelete(photo.id)}
                  >
                    Delete
                  </button>
                </div>
                <p style={{ fontSize: '12px', marginTop: '5px', color: '#999' }}>
                  {photo.like_count || 0} likes
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClientGallery;
