package com.example.artistsearch

import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment

class DetailsFragment : Fragment(R.layout.fragment_details) {

    private val artistId: String by lazy {
        requireArguments().getString(ARG_ID)!!
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)  // ← important!

        val progress = view.findViewById<ProgressBar>(R.id.progress_details)
        val scroll   = view.findViewById<ScrollView>(R.id.scroll_details)
        val tvName   = view.findViewById<TextView>(R.id.tvName)
        val tvDates  = view.findViewById<TextView>(R.id.tvDates)
        val tvBio    = view.findViewById<TextView>(R.id.tvBio)

        // Show spinner
        progress.visibility = View.VISIBLE
        scroll.visibility   = View.GONE

        // Fetch details
        Network.get("/api/fetchArtistData",
            mapOf("artistId" to artistId),
            onSuccess = { json ->
                progress.visibility = View.GONE
                scroll.visibility   = View.VISIBLE

                // Populate fields (only if non-null)
                tvName.text = json.getString("name")
                val nat = json.optString("nationality", "")
                val bd  = json.optString("birthday", "")
                val dd  = json.optString("deathday", "")
                tvDates.text = listOf(nat, bd, dd)
                    .filter { it.isNotEmpty() }
                    .joinToString(" • ")
                tvBio.text = json.optString("biography", "No biography available.")
            },
            onError = {
                progress.visibility = View.GONE
                Toast.makeText(
                    requireContext(),
                    "Could not load details",
                    Toast.LENGTH_SHORT
                ).show()
            }
        )
    }

    companion object {
        private const val ARG_ID = "artist_id"
        @JvmStatic
        fun newInstance(id: String) = DetailsFragment().apply {
            arguments = Bundle().apply { putString(ARG_ID, id) }
        }
    }
}