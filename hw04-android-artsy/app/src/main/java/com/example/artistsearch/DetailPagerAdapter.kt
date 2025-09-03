package com.example.artistsearch

import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentActivity
import androidx.viewpager2.adapter.FragmentStateAdapter

/**
 * Adapter now shows only 2 pages when logged-out, 3 when logged-in.
 */
class DetailPagerAdapter(
    fa: FragmentActivity,
    private val artistId: String,
    private val loggedIn: Boolean
) : FragmentStateAdapter(fa) {

    override fun getItemCount() = if (loggedIn) 3 else 2

    override fun createFragment(position: Int): Fragment = when (position) {
        0 -> DetailsFragment.newInstance(artistId)
        1 -> ArtworksFragment.newInstance(artistId)
        2 -> SimilarFragment.newInstance(artistId)  // only used when loggedIn
        else -> throw IllegalStateException("Invalid position $position")
    }
}