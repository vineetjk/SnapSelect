import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clientsAPI, photosAPI, favoritesAPI } from '../services/api';
import { Client, Photo } from '../types';

function Gallery() {
  const { uniqueLink } = useParams<{ uniqueLink: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (uniqueLink) {
      loadGallery();
    }
  }, [uniqueLink]);

  const loadGallery = async () => {
    try {
      const [clientRes, photosRes] = await Promise.all([
        clientsAPI.getByLink(uniqueLink!),
        photosAPI.getByLink(uniqueLink!)
      ]);
      setClient(clientRes.data);
      setPhotos(photosRes.data);
    } catch (error: any) {
      console.error('Failed to load gallery:', error);
      console.error('Error details:', error.response?.data);
      console.error('Status code:', error.response?.status);
      const errorMsg = error.response?.data?.error || 'Gallery not found';
      alert(`Error: ${errorMsg}\n\nThis might be because:\n- Gallery doesn't exist\n- Database was reset (Render free tier)\n- Network issue\n\nCheck browser console for details.`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (photoId: number) => {
    try {
      await favoritesAPI.toggle(photoId, uniqueLink!);
      loadGallery();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDownload = (photoId: number) => {
    const quality = selectedQuality[photoId] || 'medium';
    const url = photosAPI.getDownloadUrl(photoId, quality);
    window.open(url, '_blank');
  };

  if (loading) {
    return <div className="loading">Loading gallery...</div>;
  }

  if (!client) {
    return <div className="empty-state"><h2>Gallery not found</h2></div>;
  }

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h1>{client.name}'s Gallery</h1>
        <p style={{ color: '#666', marginTop: '10px' }}>
          Photos by {client.studio_name}
        </p>
        <div className="gallery-nav">
          <Link to={`/gallery/${uniqueLink}/favorites`} className="btn-primary">
            View Favorites ❤️
          </Link>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="empty-state">
          <h2>No photos yet</h2>
          <p>The photographer hasn't uploaded any photos yet</p>
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
              <div className="photo-overlay">
                <button
                  className={`like-btn ${photo.is_favorite ? 'liked' : ''}`}
                  onClick={() => handleToggleFavorite(photo.id)}
                  title="Like this photo"
                >
                  {photo.is_favorite ? '❤️' : '🤍'}
                </button>
              </div>
              <div className="photo-actions">
                <div className="download-section">
                  <label>Download Quality:</label>
                  <select
                    value={selectedQuality[photo.id] || 'medium'}
                    onChange={(e) =>
                      setSelectedQuality({ ...selectedQuality, [photo.id]: e.target.value })
                    }
                  >
                    <option value="low">Low (Web)</option>
                    <option value="medium">Medium (HD)</option>
                    <option value="high">High (4K)</option>
                    <option value="original">Original</option>
                  </select>
                  <button
                    className="btn-primary btn-small"
                    onClick={() => handleDownload(photo.id)}
                  >
                    Download
                  </button>
                </div>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
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

export default Gallery;
