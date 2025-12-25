import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { favoritesAPI, clientsAPI, photosAPI } from '../services/api';
import { Client, Photo } from '../types';

function Favorites() {
  const { uniqueLink } = useParams<{ uniqueLink: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [favorites, setFavorites] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (uniqueLink) {
      loadFavorites();
    }
  }, [uniqueLink]);

  const loadFavorites = async () => {
    try {
      const [clientRes, favoritesRes] = await Promise.all([
        clientsAPI.getByLink(uniqueLink!),
        favoritesAPI.getByLink(uniqueLink!)
      ]);
      setClient(clientRes.data);
      setFavorites(favoritesRes.data);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (photoId: number) => {
    const quality = selectedQuality[photoId] || 'medium';
    const url = photosAPI.getDownloadUrl(photoId, quality);
    window.open(url, '_blank');
  };

  if (loading) {
    return <div className="loading">Loading favorites...</div>;
  }

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h1>❤️ Favorite Photos</h1>
        <p style={{ color: '#666', marginTop: '10px' }}>
          {client?.name}'s selected favorites
        </p>
        <div className="gallery-nav">
          <Link to={`/gallery/${uniqueLink}`} className="btn-secondary">
            Back to Gallery
          </Link>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <h2>No favorites yet</h2>
          <p>Like photos in the gallery to see them here</p>
        </div>
      ) : (
        <div className="photo-grid">
          {favorites.map((photo) => (
            <div key={photo.id} className="photo-item">
              <img
                src={`/api/uploads/${photo.filename}`}
                alt={photo.original_filename}
                className="photo-image"
              />
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
