// File: app/src/main/java/com/example/artistsearch/SearchActivity.kt
package com.example.artistsearch

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.SearchView
import androidx.appcompat.widget.Toolbar
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.android.volley.VolleyError
import kotlinx.coroutines.launch
import org.json.JSONArray

class SearchActivity : AppCompatActivity() {

    private lateinit var rv: RecyclerView
    private lateinit var progress: ProgressBar
    private lateinit var artistAdapter: ArtistAdapter

    private val searchResults = mutableListOf<Artist>()
    private val prefs by lazy { getSharedPreferences("app", MODE_PRIVATE) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_search)

        // 1) Toolbar + back arrow
        findViewById<Toolbar>(R.id.toolbar_search).also { tb ->
            setSupportActionBar(tb)
            supportActionBar?.setDisplayHomeAsUpEnabled(true)
        }

        // 2) RecyclerView setup
        rv = findViewById(R.id.rvResults)
        rv.layoutManager = LinearLayoutManager(this)
        rv.visibility    = View.GONE

        // 3) Adapter
        artistAdapter = ArtistAdapter(
            data     = searchResults,
            loggedIn = AuthManager.loggedIn.value,
            isFav    = { id -> prefs.getStringSet("favs", emptySet())!!.contains(id) },
            toggleFav = { id, nowAdding ->
                val set = prefs.getStringSet("favs", mutableSetOf())!!.toMutableSet()
                if (nowAdding) set.add(id) else set.remove(id)
                prefs.edit().putStringSet("favs", set).apply()
                searchResults.indexOfFirst { it.id == id }
                    .takeIf { it >= 0 }
                    ?.let { artistAdapter.notifyItemChanged(it) }
            },
            onClick = { artist ->
                startActivity(
                    Intent(this, DetailActivity::class.java)
                        .putExtra("artist_id",   artist.id)
                        .putExtra("artist_name", artist.name)
                )
            }
        )
        rv.adapter = artistAdapter

        // 4) Observe login state to refresh stars
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                AuthManager.loggedIn.collect { artistAdapter.setLoggedIn(it) }
            }
        }

        // 5) Spinner
        progress = findViewById(R.id.progress)
        progress.visibility = View.GONE
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_search, menu)
        val item = menu.findItem(R.id.action_search)
        val sv   = item.actionView as SearchView
        item.expandActionView()

        // restore any passed-in query
        intent.getStringExtra("query")?.let { sv.setQuery(it, false) }

        sv.queryHint             = "Search artists…"
        sv.isIconified           = false
        sv.requestFocus()

        // no little submit arrow
        sv.setSubmitButtonEnabled(false)

        // set keyboard action to "Search"
        val searchEditText = sv.findViewById<EditText>(androidx.appcompat.R.id.search_src_text)
        searchEditText.imeOptions = EditorInfo.IME_ACTION_SEARCH

        sv.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(q: String?): Boolean {
                // also allow submit via Enter
                val text = q.orEmpty().trim()
                if (text.length >= 3) {
                    triggerSearch(text)
                } else {
                    Toast.makeText(
                        this@SearchActivity,
                        "Type at least 3 characters to search",
                        Toast.LENGTH_SHORT
                    ).show()
                }
                sv.clearFocus()
                return true
            }

            override fun onQueryTextChange(q: String?): Boolean {
                // live search as you type
                val text = q.orEmpty().trim()
                if (text.length >= 3) {
                    triggerSearch(text)
                }
                return true
            }
        })

        return true
    }

    private fun triggerSearch(query: String) {
        progress.visibility = View.VISIBLE
        rv.visibility       = View.GONE
        performSearch(query)
    }

    private fun performSearch(query: String) {
        Network.get(
            path   = "/api/searchArtists",
            params = mapOf("query" to query),
            onSuccess = { json ->
                progress.visibility = View.GONE
                searchResults.clear()

                val arr: JSONArray = json.getJSONArray("artists")
                for (i in 0 until arr.length()) {
                    val o = arr.getJSONObject(i)
                    val img = o.optString("image", "")
                        .takeIf { it.isNotBlank() }

                    searchResults += Artist(
                        id          = o.getString("id"),
                        name        = o.getString("name"),
                        image       = img,
                        birthday    = null,
                        deathday    = null,
                        nationality = null,
                        addedAt     = 0L  // placeholder
                    )
                }

                artistAdapter.notifyDataSetChanged()
                rv.visibility = View.VISIBLE
            },
            onError = { err: VolleyError ->
                progress.visibility = View.GONE
                Toast.makeText(
                    this,
                    "Search failed: ${err.networkResponse?.statusCode ?: err.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        )
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean =
        if (item.itemId == android.R.id.home) {
            finish(); true
        } else super.onOptionsItemSelected(item)

    @Suppress("DEPRECATION")
    override fun onBackPressed() {
        // skip default SearchView collapse animation
        finish()
    }
}