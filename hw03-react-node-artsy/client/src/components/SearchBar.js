import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Modal, Tabs, Tab, Spinner } from 'react-bootstrap';
import { searchArtists, fetchArtistData, fetchArtworkData, fetchCategories, getSimilarArtistData } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import './ArtworkCard.css';
import './Modal.css';

const SearchBar = () => {
  const { user, addToFavorites, removeFromFavorites, isInFavorites } = useAuth();
  const { artistId } = useParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [similarArtists, setSimilarArtists] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Load artist details from URL parameter
  useEffect(() => {
    if (artistId) {
      const loadArtistFromUrl = async () => {
        try {
          setLoading(true);
          // Fetch artist data using the ID from URL
          const artistInfo = await fetchArtistData(artistId);
          const artworkData = await fetchArtworkData(artistId);

          // Set the artist data
          setSelectedArtist({
            ...artistInfo,
            id: artistId
          });
          setArtworks(artworkData.artworks || []);

          // Fetch similar artists for all users
          setLoadingSimilar(true);
          try {
            const similarData = await getSimilarArtistData(artistId);
            setSimilarArtists(similarData.similarArtists || []);
          } catch (error) {
            console.error("Similar artists fetch failed:", error);
            setSimilarArtists([]);
          } finally {
            setLoadingSimilar(false);
          }
        } catch (err) {
          console.error("Failed to load artist from URL:", err);
          // If artist not found, redirect to home
          navigate('/');
        } finally {
          setLoading(false);
        }
      };

      loadArtistFromUrl();
    }
  }, [artistId, user, navigate]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    console.log("Searching for:", query);
    setSearchLoading(true);
    try {
      // Use the API service to search for artists
      const data = await searchArtists(query);
      console.log("Search response:", data);
      setArtists(data.artists || []);
      setSelectedArtist(null);
      // Store the query that was actually searched
      setSearchedQuery(query);
    } catch (err) {
      console.error("Search failed:", err);
      alert(`Search failed: ${err.message}. Check console for details.`);
      setArtists([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleArtistClick = async (artist) => {
    try {
      setLoading(true);
      // Fetch artist data
      const artistInfo = await fetchArtistData(artist.id);
      const artworkData = await fetchArtworkData(artist.id);

      // Update URL without triggering a full page reload
      window.history.pushState({}, '', `/artist/${artist.id}`);

      // Set the artist data
      setSelectedArtist({
        ...artistInfo,
        name: artist.name,
        image: artist.image,
        id: artist.id
      });
      setArtworks(artworkData.artworks || []);

      // Fetch similar artists
      setLoadingSimilar(true);
      try {
        const similarData = await getSimilarArtistData(artist.id);
        setSimilarArtists(similarData.similarArtists || []);
      } catch (error) {
        console.error("Similar artists fetch failed:", error);
        setSimilarArtists([]);
      } finally {
        setLoadingSimilar(false);
      }
    } catch (err) {
      console.error("Artist data fetch failed:", err);
      alert(`Failed to fetch artist data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSearchedQuery('');
    setArtists([]);
    setSelectedArtist(null);
    setArtworks([]);
    setCategories([]);
    setSimilarArtists([]);
  };

  // Handle adding artist to favorites
  const handleAddToFavorites = async (e, artist) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Prevent card click event
    console.log('Adding artist to favorites:', artist);
    await addToFavorites(artist);
  };

  // Handle removing artist from favorites
  const handleRemoveFromFavorites = async (e, artistId) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Prevent card click event
    await removeFromFavorites(artistId);
  };

  const openCategories = async (artwork) => {
    try {
      // Set the selected artwork for the modal
      setSelectedArtwork(artwork);
      // Show the modal first
      setShowModal(true);
      // Start loading categories
      setLoadingCategories(true);
      setCategories([]);

      // Use the API service to fetch categories
      const data = await fetchCategories(artwork.id);
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Categories fetch failed:", err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Handle form submission (Enter key press)
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page refresh
    handleSearch();
  };

  return (
    <Container className="my-4">
      <Form className="mb-4" onSubmit={handleSubmit}>
        <div className="d-flex">
          <Form.Control
            type="text"
            placeholder="Please enter an artist name."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow-1"
            style={{
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              minHeight: '44px'
            }}
            disabled={searchLoading}
          />
          <div className="d-flex">
            <Button
              variant="primary"
              type="submit"
              className="d-flex align-items-center justify-content-center"
              style={{
                borderRadius: 0,
                minHeight: '44px',
                minWidth: '80px',
                backgroundColor: query.trim() ? '#024d93' : '#688cbc',
                borderColor: query.trim() ? '#024d93' : '#688cbc'
              }}
              disabled={!query.trim() || searchLoading}
            >
              <span>Search</span>
              {searchLoading && (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="ms-2"
                />
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={handleClear}
              style={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                minHeight: '44px',
                minWidth: '70px'
              }}
              disabled={searchLoading}
            >
              <span>Clear</span>
            </Button>
          </div>
        </div>
      </Form>

      {artists.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-3">Search Results for "{searchedQuery}"</h3>
          <div className="mb-4"
               style={{
                 overflowX: 'auto',
                 WebkitOverflowScrolling: 'touch',
                 scrollbarWidth: 'none',
                 msOverflowStyle: 'none',
                 paddingBottom: '10px'
               }}>
            <div className="d-flex pb-2" style={{ minWidth: 'min-content' }}>
              {artists.map((artist) => (
                <div key={artist.id} className="me-3" style={{ display: 'inline-block', width: '160px', flexShrink: 0 }}>
                  <Card
                    className="shadow-sm position-relative artist-hover-card"
                    style={{ width: '160px' }}
                    onClick={() => handleArtistClick(artist)}
                  >
                    {user && (
                      <div className="position-absolute top-0 end-0 m-2">
                        <div
                          className="d-flex justify-content-center align-items-center rounded-circle bg-primary"
                          style={{ width: '30px', height: '30px', cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            isInFavorites(artist.id)
                              ? handleRemoveFromFavorites(e, artist.id)
                              : handleAddToFavorites(e, artist);
                          }}
                        >
                          <i className={`bi ${isInFavorites(artist.id) ? 'bi-star-fill text-warning' : 'bi-star text-white'}`}></i>
                        </div>
                      </div>
                    )}
                    <Card.Img
                      variant="top"
                      src={artist.image && !artist.image.includes('/assets/shared/missing_image.png')
                        ? artist.image
                        : '/artsy_logo.svg'}
                      alt={artist.name}
                      style={{
                        height: '160px',
                        objectFit: (artist.image && !artist.image.includes('/assets/shared/missing_image.png')) ? 'cover' : 'contain',
                        padding: (artist.image && !artist.image.includes('/assets/shared/missing_image.png')) ? '0' : '30px',
                        backgroundColor: (artist.image && !artist.image.includes('/assets/shared/missing_image.png')) ? 'transparent' : '#f8f9fa'
                      }}
                    />
                    <Card.Body className="p-2 text-white text-center artist-card-body" style={{ backgroundColor: '#205375' }}>
                      <Card.Title
                        className="mb-0"
                        style={{
                          fontSize: '1rem',
                          whiteSpace: 'normal',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: '1.2'
                        }}
                      >
                        {artist.name}
                      </Card.Title>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : selectedArtist && (
        <div className="w-100">
          <Tabs
            defaultActiveKey="info"
            className="mb-3 w-100 custom-tabs"
            style={{
              display: 'flex',
              border: 'none',
              outline: 'none',
              boxShadow: 'none'
            }}
            fill
          >
            <Tab eventKey="info" title={<div className="w-100 py-2">Artist Info</div>}>
              <div className="text-center">
                <div className="d-flex align-items-center justify-content-center mt-3">
                  <h2 className="mb-0 me-3">{selectedArtist.name}</h2>
                  {user && (
                    <i
                      className={`bi ${isInFavorites(selectedArtist.id) ? 'bi-star-fill text-warning' : 'bi-star'}`}
                      style={{ fontSize: '1.5rem', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.preventDefault();
                        isInFavorites(selectedArtist.id)
                          ? handleRemoveFromFavorites(e, selectedArtist.id)
                          : handleAddToFavorites(e, selectedArtist);
                      }}
                    ></i>
                  )}
                </div>
                <div
                  className="text-muted mb-3"
                  dangerouslySetInnerHTML={{
                    __html: `${selectedArtist.nationality || ''}, ${selectedArtist.birthday || ''} ${selectedArtist.deathday ? '– ' + selectedArtist.deathday : ''}`
                  }}
                />
                <div className="mt-4 text-justify">
                  {selectedArtist.biography ?
                    (() => {
                      // Process the biography text
                      const bioText = selectedArtist.biography;

                      // Split by common paragraph separators and filter out empty paragraphs
                      const paragraphs = bioText
                        .split(/\n\n|\r\n\r\n|\n\r\n\r|\r\r/)
                        .filter(para => para.trim() !== '');

                      // If no paragraphs were found after splitting, treat the entire biography as one paragraph
                      if (paragraphs.length === 0) {
                        return (
                          <div
                            style={{ lineHeight: '1.6', marginBottom: '1rem', textAlign: 'justify' }}
                            dangerouslySetInnerHTML={{ __html: bioText }}
                          />
                        );
                      }

                      // Otherwise, render each paragraph
                      return paragraphs.map((paragraph, index) => (
                        <div
                          key={index}
                          style={{ lineHeight: '1.6', marginBottom: '1rem', textAlign: 'justify' }}
                          dangerouslySetInnerHTML={{ __html: paragraph }}
                        />
                      ));
                    })()
                    : <p style={{ lineHeight: '1.6', marginBottom: '1rem', textAlign: 'justify' }}>No biography available.</p>
                  }
                </div>

                {/* Similar Artists Section */}
                  <div className="mt-5">
                    <h3 className="text-start mb-4">Similar Artists</h3>
                    {loadingSimilar ? (
                      <div className="text-center py-3">
                        <Spinner animation="border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </Spinner>
                      </div>
                    ) : similarArtists.length > 0 ? (
                      <div className="mb-4"
                           style={{
                             overflowX: 'auto',
                             WebkitOverflowScrolling: 'touch',
                             scrollbarWidth: 'none',
                             msOverflowStyle: 'none',
                             paddingBottom: '10px'
                           }}>
                        <div className="d-flex pb-2" style={{ minWidth: 'min-content' }}>
                          {similarArtists.map((artist) => (
                            <div key={artist.id} className="me-3" style={{ display: 'inline-block', width: '160px', flexShrink: 0 }}>
                              <Card
                                className="shadow-sm position-relative artist-hover-card"
                                style={{ width: '160px' }}
                                onClick={() => handleArtistClick(artist)}
                              >
                                {user && (
                                  <div className="position-absolute top-0 end-0 m-2">
                                    <div
                                      className="d-flex justify-content-center align-items-center rounded-circle bg-primary"
                                      style={{ width: '30px', height: '30px', cursor: 'pointer' }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        isInFavorites(artist.id)
                                          ? handleRemoveFromFavorites(e, artist.id)
                                          : handleAddToFavorites(e, artist);
                                      }}
                                    >
                                      <i className={`bi ${isInFavorites(artist.id) ? 'bi-star-fill text-warning' : 'bi-star text-white'}`}></i>
                                    </div>
                                  </div>
                                )}
                                <Card.Img
                                  variant="top"
                                  src={artist.image && !artist.image.includes('/assets/shared/missing_image.png')
                                    ? artist.image
                                    : '/artsy_logo.svg'}
                                  alt={artist.name}
                                  style={{
                                    height: '160px',
                                    objectFit: (artist.image && !artist.image.includes('/assets/shared/missing_image.png')) ? 'cover' : 'contain',
                                    padding: (artist.image && !artist.image.includes('/assets/shared/missing_image.png')) ? '0' : '30px',
                                    backgroundColor: (artist.image && !artist.image.includes('/assets/shared/missing_image.png')) ? 'transparent' : '#f8f9fa'
                                  }}
                                />
                                <Card.Body className="p-2 text-white text-center artist-card-body" style={{ backgroundColor: '#205375' }}>
                                  <Card.Title
                                    className="mb-0"
                                    style={{
                                      fontSize: '1rem',
                                      whiteSpace: 'normal',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      lineHeight: '1.2'
                                    }}
                                  >
                                    {artist.name}
                                  </Card.Title>
                                </Card.Body>
                              </Card>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <p>No similar artists found.</p>
                      </div>
                    )}
                  </div>
              </div>
            </Tab>
            <Tab eventKey="artworks" title={<div className="w-100 py-2">Artworks</div>}>
              {artworks.length === 0 ? (
                <div className="alert alert-danger bg-danger-subtle text-danger mt-3">
                  No artworks.
                </div>
              ) : (
                <div className="row">
                  {artworks.map((art) => (
                    <div key={art.id} className="artwork-card col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                      <div className="card h-100 shadow-sm rounded overflow-hidden border-0 d-flex flex-column">
                        <div className="artwork-image-container" style={{ height: '300px', overflow: 'hidden' }}>
                          <img
                            src={art.image && !art.image.includes('/assets/shared/missing_image.png')
                              ? art.image
                              : '/artsy_logo.svg'}
                            alt={art.title}
                            className="w-100 h-100"
                            style={{
                              objectFit: (art.image && !art.image.includes('/assets/shared/missing_image.png')) ? 'cover' : 'contain',
                              padding: (art.image && !art.image.includes('/assets/shared/missing_image.png')) ? '0' : '30px',
                              backgroundColor: (art.image && !art.image.includes('/assets/shared/missing_image.png')) ? 'transparent' : '#f8f9fa'
                            }}
                          />
                        </div>
                        <div className="d-flex flex-column" style={{ flex: '1 0 auto' }}>
                          <div className="p-3 text-center" style={{ flex: '1 0 auto' }}>
                            <h6 className="mb-0">{art.title}{art.date ? `, ${art.date}` : ''}</h6>
                          </div>
                          <button
                            className="btn btn-primary w-100 rounded-0 rounded-bottom"
                            style={{
                              backgroundColor: '#024d93',
                              borderColor: '#024d93',
                              borderTopLeftRadius: '0',
                              borderTopRightRadius: '0'
                            }}
                            onClick={() => openCategories(art)}
                          >
                            View categories
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Tab>

          </Tabs>
        </div>
      )}

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        contentClassName="p-0"
        fullscreen="sm-down"
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={() => setShowModal(false)}
          aria-label="Close"
        >
          ×
        </button>

        <Modal.Body className="pt-4">
          {/* Artwork Info Section */}
          {selectedArtwork && (
            <div className="mb-3">
              <div className="d-flex align-items-start">
                <div style={{ width: '50px', marginRight: '15px', flexShrink: 0 }}>
                  <img
                    src={selectedArtwork.image && !selectedArtwork.image.includes('/assets/shared/missing_image.png')
                      ? selectedArtwork.image
                      : '/artsy_logo.svg'}
                    alt={selectedArtwork.title}
                    className="img-fluid rounded"
                    style={{
                      width: '100%',
                      height: 'auto',
                      objectFit: (selectedArtwork.image && !selectedArtwork.image.includes('/assets/shared/missing_image.png')) ? 'cover' : 'contain',
                      padding: (selectedArtwork.image && !selectedArtwork.image.includes('/assets/shared/missing_image.png')) ? '0' : '15px',
                      backgroundColor: (selectedArtwork.image && !selectedArtwork.image.includes('/assets/shared/missing_image.png')) ? 'transparent' : '#f8f9fa'
                    }}
                  />
                </div>
                <div className="d-flex flex-column">
                  <h5 className="mb-1">{selectedArtwork.title}</h5>
                  <p className="text-muted mb-0">{selectedArtwork.date}</p>
                </div>
              </div>
            </div>
          )}

          <hr className="my-3" />

          {/* Categories Section */}
          {loadingCategories ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : categories.length === 0 ? (
            <div className="alert alert-danger bg-danger-subtle text-danger">
              No categories.
            </div>
          ) : (
            <Row>
              {categories.map((cat, idx) => (
                <Col key={idx} xs={12} sm={6} md={4} className="mb-3">
                  <Card className="h-100 shadow-sm">
                    <Card.Img
                      variant="top"
                      src={cat.image}
                      style={{ height: '180px', objectFit: 'cover' }}
                    />
                    <Card.Body className="p-2">
                      <Card.Text className="text-center mb-0">{cat.name}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default SearchBar;
