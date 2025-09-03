// File: app/src/main/java/com/example/artistsearch/FavoriteAdapter.kt
package com.example.artistsearch

import android.text.format.DateUtils
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class FavoriteAdapter(
    private val items: List<Artist>,
    private val onClick: (Artist) -> Unit
) : RecyclerView.Adapter<FavoriteAdapter.VH>() {

    inner class VH(view: View) : RecyclerView.ViewHolder(view) {
        private val nameView    = view.findViewById<TextView>(R.id.tvFavName)
        private val detailsView = view.findViewById<TextView>(R.id.tvFavDetails)
        private val timeView    = view.findViewById<TextView>(R.id.tvFavTime)
        private val arrowView   = view.findViewById<ImageView>(R.id.ivFavArrow)

        fun bind(artist: Artist) {
            nameView.text = artist.name

            // nationality & birthday
            val parts = mutableListOf<String>()
            artist.nationality?.takeIf { it.isNotBlank() }?.let { parts += it }
            artist.birthday?.takeIf    { it.isNotBlank() }?.let { parts += it }
            detailsView.text = parts.joinToString(", ")

            // relative time (e.g. “5 minutes ago”)
            timeView.text = DateUtils.getRelativeTimeSpanString(
                artist.addedAt,
                System.currentTimeMillis(),
                DateUtils.SECOND_IN_MILLIS
            )

            itemView.setOnClickListener { onClick(artist) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_favorite, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount() = items.size
}