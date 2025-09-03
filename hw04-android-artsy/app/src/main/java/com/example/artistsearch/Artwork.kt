package com.example.artistsearch

/**
 * One artwork returned by /api/fetchArtistArtworks
 */
data class Artwork(
    val id: String,
    val title: String,
    val image: String?    // may be null
)