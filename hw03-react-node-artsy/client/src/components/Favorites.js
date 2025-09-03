import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import RelativeTime from './RelativeTime';

const Favorites = () => {
  const { user, removeFromFavorites } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  // Sort favorites by addedAt in descending order (newest first)
  const sortedFavorites = [...(user.favorites || [])].sort((a, b) => {
    return new Date(b.addedAt) - new Date(a.addedAt);
  });

  console.log('Favorites data:', sortedFavorites);

  const handleArtistClick = (artistId) => {
    navigate(`/artist/${artistId}`);
  };

  const handleRemoveFavorite = async (e, artistId) => {
    e.stopPropagation(); // Prevent triggering the card click
    await removeFromFavorites(artistId);
  };

  return (
    <Container className="my-4">
      <h2 className="mb-4">My Favorite Artists</h2>

      {sortedFavorites.length === 0 ? (
        <div className="text-center py-5">
          <p>You haven't added any artists to your favorites yet.</p>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
            Search for Artists
          </button>
        </div>
      ) : (
        <Row>
          {sortedFavorites.map((artist) => (
            <Col key={artist.artistId} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <div
                className="rounded position-relative overflow-hidden shadow-sm"
                style={{ height: '250px', cursor: 'pointer', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                onClick={() => handleArtistClick(artist.artistId)}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div
                  className="position-absolute w-100 h-100"
                  style={{
                    backgroundImage: `url(${artist.thumbnail && !artist.thumbnail.includes('/assets/shared/missing_image.png')
                      ? artist.thumbnail
                      : '/artsy_logo.svg'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(8px) brightness(0.5) saturate(0.8)',
                    top: 0,
                    left: 0,
                    zIndex: 0
                  }}
                ></div>
                <div className="position-relative h-100 d-flex flex-column justify-content-between p-3 text-white" style={{ zIndex: 1 }}>
                  {/* Top section */}
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="fw-bold fs-4">{artist.name}</div>
                  </div>

                  {/* Middle section */}
                  <div className="mt-2">
                    <div className="fs-5 fw-medium">{artist.birthday || '?'} - {artist.deathday || ''}</div>
                    <div className="fs-6 opacity-75">{artist.nationality || 'Unknown'}</div>
                  </div>

                  {/* Bottom section */}
                  <div className="d-flex justify-content-between align-items-end">
                    <div className="small opacity-75">
                      Added <RelativeTime date={artist.addedAt} />
                    </div>
                    <button
                      className="btn btn-link text-white p-0 text-decoration-none"
                      style={{ opacity: 0.8 }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                      onMouseOut={(e) => e.currentTarget.style.opacity = 0.8}
                      onClick={(e) => handleRemoveFavorite(e, artist.artistId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Favorites;
