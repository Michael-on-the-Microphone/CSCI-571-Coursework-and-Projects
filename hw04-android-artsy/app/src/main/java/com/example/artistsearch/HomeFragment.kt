// File: app/src/main/java/com/example/artistsearch/HomeFragment.kt
package com.example.artistsearch

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.text.format.DateUtils
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.android.volley.VolleyError
import org.json.JSONArray
import java.text.SimpleDateFormat
import java.util.*

class HomeFragment : Fragment(R.layout.fragment_home) {

    private lateinit var rvFavorites: RecyclerView
    private lateinit var tvNoFavs: TextView
    private lateinit var loggedOutContainer: View
    private lateinit var loggedInContainer: View

    private val handler = Handler(Looper.getMainLooper())
    private val refreshRunnable = object : Runnable {
        override fun run() {
            rvFavorites.adapter?.notifyDataSetChanged()
            handler.postDelayed(this, DateUtils.SECOND_IN_MILLIS)
        }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // ───────────────────────────────────────────────
        // 1) Show today's date up top
        val tvDate = view.findViewById<TextView>(R.id.tv_date)
        val sdf    = SimpleDateFormat("d MMMM yyyy", Locale.getDefault())
        tvDate.text = sdf.format(Date())
        // ───────────────────────────────────────────────

        val btnLogin          = view.findViewById<Button>(R.id.btn_login_favs)
        tvNoFavs              = view.findViewById(R.id.tv_no_favorites)
        loggedOutContainer    = view.findViewById(R.id.logged_out_container)
        loggedInContainer     = view.findViewById(R.id.logged_in_container)
        rvFavorites           = view.findViewById(R.id.rvFavorites)
        val tvPowered         = view.findViewById<TextView>(R.id.tv_powered)

        btnLogin.setOnClickListener {
            startActivity(Intent(requireContext(), LoginActivity::class.java))
        }
        tvPowered.setOnClickListener {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://www.artsy.net")))
        }

        rvFavorites.layoutManager = LinearLayoutManager(requireContext())

        lifecycleScope.launchWhenStarted {
            AuthManager.loggedIn.collect { isLoggedIn ->
                loggedOutContainer.visibility = if (isLoggedIn) View.GONE else View.VISIBLE
                loggedInContainer.visibility  = if (isLoggedIn) View.VISIBLE else View.GONE

                handler.removeCallbacks(refreshRunnable)
                if (isLoggedIn) loadFavorites()
            }
        }
    }

    override fun onResume() {
        super.onResume()
        if (AuthManager.loggedIn.value) {
            handler.removeCallbacks(refreshRunnable)
            loadFavorites()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        handler.removeCallbacks(refreshRunnable)
    }

    private fun loadFavorites() {
        Network.get(
            path   = "/api/me",
            params = emptyMap(),
            onSuccess = { json ->
                Log.d("HomeFragment", "✅ /api/me: $json")
                val arr  = json.optJSONArray("favorites")
                val list = mutableListOf<Artist>()

                val isoFmt = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
                    timeZone = TimeZone.getTimeZone("UTC")
                }

                arr?.let { a ->
                    for (i in 0 until a.length()) {
                        val o          = a.getJSONObject(i)
                        val id         = o.optString("artistId", o.optString("id"))
                        val name       = o.optString("name")
                        val image      = o.optString("thumbnail", o.optString("image", null))
                        val birthday   = o.optString("birthday", null)
                        val deathday   = o.optString("deathday", null)
                        val nationality= o.optString("nationality", null)
                        val addedAtIso = o.optString("addedAt", null)
                        val addedAtMs  = try {
                            addedAtIso?.let { isoFmt.parse(it)?.time } ?: System.currentTimeMillis()
                        } catch (_: Exception) {
                            System.currentTimeMillis()
                        }

                        list += Artist(
                            id          = id,
                            name        = name,
                            image       = image,
                            birthday    = birthday,
                            deathday    = deathday,
                            nationality = nationality,
                            addedAt     = addedAtMs
                        )
                    }
                }

                rvFavorites.adapter = FavoriteAdapter(list) { artist ->
                    startActivity(
                        Intent(requireContext(), DetailActivity::class.java)
                            .putExtra("artist_id",   artist.id)
                            .putExtra("artist_name", artist.name)
                    )
                }

                tvNoFavs.visibility = if (list.isEmpty()) View.VISIBLE else View.GONE

                // start the live “x seconds ago” ticker
                handler.post(refreshRunnable)
            },
            onError = { err: VolleyError ->
                Log.e("HomeFragment", "❌ /api/me failed", err)
                Toast.makeText(
                    requireContext(),
                    "Error loading favorites: ${err.networkResponse?.statusCode ?: err.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        )
    }
}