package com.example.artistsearch

import android.os.Bundle
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

class ArtworksFragment : Fragment(R.layout.fragment_artworks) {

    private val artistId: String by lazy {
        requireArguments().getString(ARG_ID)!!
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Spinner & RecyclerView
        val progress = view.findViewById<ProgressBar>(R.id.progress_artworks)
        val rv = view.findViewById<RecyclerView>(R.id.rvArtworks).apply {
            layoutManager = LinearLayoutManager(requireContext())
            visibility    = View.GONE
        }

        // Show loading
        progress.visibility = View.VISIBLE

        Network.get(
            path   = "/api/fetchArtworkData",                // ← changed here
            params = mapOf("artistId" to artistId),
            onSuccess = { json ->
                progress.visibility = View.GONE

                // Parse JSON array under "artworks"
                val arr  = json.optJSONArray("artworks")
                val list = mutableListOf<Artwork>()
                if (arr != null) {
                    for (i in 0 until arr.length()) {
                        val o = arr.getJSONObject(i)
                        list += Artwork(
                            id    = o.getString("id"),
                            title = o.getString("title"),
                            image = o.optString("image", null)
                        )
                    }
                }

                if (list.isEmpty()) {
                    // No artworks
                    val tv = TextView(requireContext()).apply {
                        text    = "No Artworks"
                        gravity = Gravity.CENTER
                        setPadding(0, 100, 0, 0)
                    }
                    (view as FrameLayout).addView(tv)
                } else {
                    // Display list
                    rv.adapter = ArtworkAdapter(list) { artwork ->
                        CategoryDialogFragment
                            .newInstance(artwork.id)
                            .show(parentFragmentManager, "catDialog")
                    }
                    rv.visibility = View.VISIBLE
                }
            },
            onError = { err: VolleyError ->
                progress.visibility = View.GONE
                val code = err.networkResponse?.statusCode ?: -1
                Toast.makeText(
                    requireContext(),
                    "Artworks API failed: HTTP $code\n${err.message}",
                    Toast.LENGTH_LONG
                ).show()
                err.printStackTrace()
            }
        )
    }

    companion object {
        private const val ARG_ID = "artist_id"
        @JvmStatic
        fun newInstance(id: String) = ArtworksFragment().apply {
            arguments = Bundle().apply { putString(ARG_ID, id) }
        }
    }
}