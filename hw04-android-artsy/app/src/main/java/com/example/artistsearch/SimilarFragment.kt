// File: app/src/main/java/com/example/artistsearch/SimilarFragment.kt

package com.example.artistsearch

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.Gravity
import android.view.View
import android.widget.FrameLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.android.volley.VolleyError
import org.json.JSONArray

class SimilarFragment : Fragment(R.layout.fragment_similar) {

    private lateinit var artistId: String
    private lateinit var rv: RecyclerView
    private lateinit var progress: ProgressBar
    private val prefs by lazy {
        requireContext().getSharedPreferences("app", Context.MODE_PRIVATE)
    }

    private val similarList = mutableListOf<Artist>()
    private lateinit var adapter: ArtistAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        artistId = requireArguments().getString(ARG_ID)
            ?: error("Missing artist_id argument")
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        progress = view.findViewById(R.id.progress_similar)

        // 1) Build the adapter exactly like in SearchActivity
        adapter = ArtistAdapter(
            data     = similarList,
            loggedIn = AuthManager.loggedIn.value,
            isFav    = { id ->
                prefs.getStringSet("favs", emptySet())!!.contains(id)
            },
            toggleFav = { id, nowAdding ->
                val set = prefs.getStringSet("favs", mutableSetOf())!!.toMutableSet()
                if (nowAdding) set.add(id) else set.remove(id)
                prefs.edit().putStringSet("favs", set).apply()
                val idx = similarList.indexOfFirst { it.id == id }
                if (idx >= 0) adapter.notifyItemChanged(idx)
            },
            onClick = { artist ->
                startActivity(
                    Intent(requireContext(), DetailActivity::class.java)
                        .putExtra("artist_id",   artist.id)
                        .putExtra("artist_name", artist.name)
                )
            }
        )

        // 2) Wire it up (no longer inside apply{} to avoid surprises)
        rv = view.findViewById(R.id.rvSimilar)
        rv.layoutManager = LinearLayoutManager(requireContext())
        rv.adapter       = adapter
        rv.visibility    = View.GONE

        // DEBUG: did the adapter stick?
        Log.d("SimilarFragment", "onViewCreated — rv.adapter != null? ${rv.adapter != null}")

        loadSimilar()
    }

    private fun loadSimilar() {
        progress.visibility = View.VISIBLE

        Network.get(
            path   = "/api/getSimilarArtistData",
            params = mapOf("artistId" to artistId),
            onSuccess = { json ->
                Log.d("SimilarFragment", "✅ got data: $json")
                progress.visibility = View.GONE
                similarList.clear()

                val arr: JSONArray? =
                    json.optJSONArray("similarArtists")
                        ?: json.optJSONArray("artists")

                arr?.let {
                    for (i in 0 until it.length()) {
                        val o = it.getJSONObject(i)
                        similarList += Artist(
                            id          = o.getString("id"),
                            name        = o.getString("name"),
                            image       = o.optString("image", null),
                            birthday    = o.optString("birthday", null),
                            deathday    = o.optString("deathday", null),
                            nationality = o.optString("nationality", null),
                            addedAt     = 0L
                        )
                    }
                }

                // DEBUG: how many items? and still attached?
                Log.d(
                    "SimilarFragment",
                    "onSuccess — adapter.itemCount=${adapter.itemCount}, rv.adapter!=null? ${rv.adapter != null}"
                )

                if (similarList.isEmpty()) {
                    val tv = TextView(requireContext()).apply {
                        text    = "No Similar Artists"
                        gravity = Gravity.CENTER
                        setPadding(0, 100, 0, 0)
                    }
                    (view as FrameLayout).addView(tv)
                } else {
                    adapter.notifyDataSetChanged()
                    rv.visibility = View.VISIBLE
                }
            },
            onError = { err: VolleyError ->
                progress.visibility = View.GONE
                Toast.makeText(
                    requireContext(),
                    "Error loading similar artists: ${err.networkResponse?.statusCode ?: err.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        )
    }

    companion object {
        private const val ARG_ID = "artist_id"
        @JvmStatic fun newInstance(artistId: String) =
            SimilarFragment().apply {
                arguments = Bundle().apply { putString(ARG_ID, artistId) }
            }
    }
}