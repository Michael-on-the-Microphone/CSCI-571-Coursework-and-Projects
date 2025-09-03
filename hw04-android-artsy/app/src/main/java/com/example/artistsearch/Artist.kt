package com.example.artistsearch

data class Artist(
    val id: String,
    val name: String,
    val image: String?,
    val birthday: String?,
    val deathday: String?,
    val nationality: String?,
    val addedAt: Long
)