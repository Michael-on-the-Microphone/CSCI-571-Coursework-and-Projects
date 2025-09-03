// File: app/src/main/java/com/example/artistsearch/ArtistAdapter.kt
package com.example.artistsearch

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.google.android.material.snackbar.Snackbar
import org.json.JSONObject

class ArtistAdapter(
    private var data: List<Artist>,
    loggedIn: Boolean,
    private val isFav: (String) -> Boolean,
    private val toggleFav: (String, Boolean) -> Unit,
    private val onClick: (Artist) -> Unit
) : RecyclerView.Adapter<ArtistAdapter.VH>() {

    // mutable login flag
    private var loggedIn = loggedIn

    /** Call this anytime the login state changes to show/hide stars */
    fun setLoggedIn(isLoggedIn: Boolean) {
        this.loggedIn = isLoggedIn
        notifyDataSetChanged()
    }

    inner class VH(v: View) : RecyclerView.ViewHolder(v) {
        val img: ImageView    = v.findViewById(R.id.imgThumb)
        val name: TextView    = v.findViewById(R.id.tvName)
        val star: ImageButton = v.findViewById(R.id.btnStar)
        init {
            v.setOnClickListener { onClick(data[adapterPosition]) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, vt: Int): VH {
        val v = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_artist, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(h: VH, pos: Int) {
        val a = data[pos]

        // Display name + thumbnail (or fallback logo)
        h.name.text = a.name
        Glide.with(h.img)
            .load(a.image ?: R.drawable.ic_artsy_logo)
            .placeholder(R.drawable.ic_artsy_logo)
            .into(h.img)

        // If not logged in, hide star and skip the rest
        if (!loggedIn) {
            h.star.visibility = View.GONE
            return
        }
        h.star.visibility = View.VISIBLE

        // Show current favorite state
        val wasFav = isFav(a.id)
        h.star.setImageResource(
            if (wasFav) android.R.drawable.btn_star_big_on
            else         android.R.drawable.btn_star_big_off
        )

        h.star.setOnClickListener {
            // Fetch full artist details
            Network.get(
                path   = "/api/fetchArtistData",
                params = mapOf("artistId" to a.id),
                onSuccess = { artistJson ->
                    val thumbnailUrl = artistJson
                        .optJSONObject("image")?.optString("url")
                        ?: artistJson
                            .optJSONObject("_links")
                            ?.optJSONObject("thumbnail")
                            ?.optString("href")

                    val dob = artistJson.optString("birthday", null)
                    val dod = artistJson.optString("deathday", null)
                    val nat = artistJson.optString("nationality", null)

                    val nowAdding = !wasFav
                    val body = JSONObject().apply {
                        put("action", if (nowAdding) "add" else "remove")
                        if (nowAdding) {
                            put("artist", JSONObject().apply {
                                put("artistId",    artistJson.getString("id"))
                                put("name",        artistJson.getString("name"))
                                put("thumbnail",   thumbnailUrl ?: JSONObject.NULL)
                                put("birthday",    dob          ?: JSONObject.NULL)
                                put("deathday",    dod          ?: JSONObject.NULL)
                                put("nationality", nat          ?: JSONObject.NULL)
                            })
                        } else {
                            put("artistId", a.id)
                        }
                    }

                    // Send update to server
                    Network.post(
                        path      = "/api/updateFavorites",
                        body      = body,
                        onSuccess = {
                            toggleFav(a.id, nowAdding)
                            h.star.setImageResource(
                                if (nowAdding) android.R.drawable.btn_star_big_on
                                else           android.R.drawable.btn_star_big_off
                            )
                            Snackbar.make(
                                h.itemView,
                                if (nowAdding) "Added to favorites" else "Removed from favorites",
                                Snackbar.LENGTH_SHORT
                            ).show()
                        },
                        onError = { err ->
                            val code = err.networkResponse?.statusCode
                            Snackbar.make(
                                h.itemView,
                                "Error ${code ?: ""}: ${err.message}",
                                Snackbar.LENGTH_LONG
                            ).show()
                        }
                    )
                },
                onError = { err ->
                    Snackbar.make(
                        h.itemView,
                        "Failed to load artist details: ${err.message}",
                        Snackbar.LENGTH_LONG
                    ).show()
                }
            )
        }
    }

    override fun getItemCount() = data.size
}