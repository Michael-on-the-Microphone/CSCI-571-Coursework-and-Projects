package com.example.artistsearch

import android.content.Context.MODE_PRIVATE
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.core.view.isVisible
import androidx.viewpager2.widget.ViewPager2
import com.android.volley.VolleyError
import com.google.android.material.snackbar.Snackbar
import com.google.android.material.tabs.TabLayout
import com.google.android.material.tabs.TabLayoutMediator
import org.json.JSONObject

class DetailActivity : AppCompatActivity() {
    private lateinit var toolbar: Toolbar
    private lateinit var tabLayout: TabLayout
    private lateinit var viewPager: ViewPager2
    private lateinit var favoriteIcon: MenuItem

    private val prefs by lazy { getSharedPreferences("app", MODE_PRIVATE) }
    private val loggedIn get() = AuthManager.loggedIn.value

    private lateinit var artistId: String
    private lateinit var artistName: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_detail)

        artistId   = intent.getStringExtra("artist_id")!!
        artistName = intent.getStringExtra("artist_name")!!

        // --- Toolbar setup ---
        toolbar = findViewById(R.id.toolbar_detail)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = artistName

        // --- ViewPager + Tabs ---
        tabLayout = findViewById(R.id.tab_layout)
        viewPager = findViewById(R.id.view_pager)
        viewPager.adapter = DetailPagerAdapter(this, artistId, loggedIn)

        TabLayoutMediator(tabLayout, viewPager) { tab, pos ->
            when (pos) {
                0 -> {
                    tab.text = "Details"
                    tab.setIcon(R.drawable.ic_info)
                }
                1 -> {
                    tab.text = "Artworks"
                    tab.setIcon(R.drawable.ic_artwork)
                }
                2 -> {
                    tab.text = "Similar"
                    tab.setIcon(R.drawable.ic_similar)
                }
            }
        }.attach()
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_detail, menu)
        favoriteIcon = menu.findItem(R.id.action_favorite)
        // only show the star if we're logged in
        favoriteIcon.isVisible = loggedIn
        updateFavoriteIcon()
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean = when (item.itemId) {
        android.R.id.home -> {
            finish()
            true
        }
        R.id.action_favorite -> {
            val currentlyFav = isFavorite(artistId)
            val action = if (currentlyFav) "remove" else "add"
            // build payload
            val payload = JSONObject().apply {
                put("action", action)
                if (!currentlyFav) {
                    put("artist", JSONObject().apply {
                        put("artistId", artistId)
                        put("name", artistName)
                    })
                } else {
                    put("artistId", artistId)
                }
            }
            // fire the update
            Network.post(
                path = "/api/updateFavorites",
                body = payload,
                onSuccess = {
                    toggleLocalFavorite(artistId)
                    updateFavoriteIcon()
                    Snackbar.make(
                        viewPager,
                        if (!currentlyFav) "Added to favorites" else "Removed from favorites",
                        Snackbar.LENGTH_SHORT
                    ).show()
                },
                onError = { err: VolleyError ->
                    Snackbar.make(
                        viewPager,
                        "Error ${err.networkResponse?.statusCode ?: ""}: ${err.message}",
                        Snackbar.LENGTH_LONG
                    ).show()
                }
            )
            true
        }
        else -> super.onOptionsItemSelected(item)
    }

    private fun updateFavoriteIcon() {
        if (!::favoriteIcon.isInitialized) return
        val iconRes = if (isFavorite(artistId)) {
            R.drawable.ic_star_filled
        } else {
            R.drawable.ic_star_border
        }
        favoriteIcon.setIcon(iconRes)
    }

    private fun isFavorite(id: String): Boolean =
        prefs.getStringSet("favs", emptySet())!!.contains(id)

    private fun toggleLocalFavorite(id: String) {
        val set = prefs.getStringSet("favs", mutableSetOf())!!.toMutableSet()
        if (set.contains(id)) set.remove(id) else set.add(id)
        prefs.edit().putStringSet("favs", set).apply()
    }
}