package com.example.artistsearch
import android.widget.Toast
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide

/**
 * Shows a horizontal list of artworks with “View categories” buttons.
 */
class ArtworkAdapter(
    private val data: List<Artwork>,
    private val onCategoriesClick: (Artwork) -> Unit
) : RecyclerView.Adapter<ArtworkAdapter.VH>() {

    inner class VH(view: View) : RecyclerView.ViewHolder(view) {
        val imgArtwork: ImageView   = view.findViewById(R.id.imgArtwork)
        val tvTitle: TextView       = view.findViewById(R.id.tvArtworkTitle)
        val btnCategories: Button   = view.findViewById(R.id.btnViewCategories)

        init {
            btnCategories.setOnClickListener {
                val art = data[adapterPosition]

                // DEBUG: confirm button press
                Log.d("ArtworkAdapter", "View categories clicked for artwork id=${art.id}")

                // Optional: user-visible feedback
                Toast.makeText(
                    itemView.context,
                    "Clicked categories for ${art.title}",
                    Toast.LENGTH_SHORT
                ).show()

                // Proceed with actual callback
                onCategoriesClick(art)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_artwork, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val art = data[position]
        holder.tvTitle.text = art.title
        Glide.with(holder.imgArtwork)
            .load(art.image ?: R.drawable.ic_artsy_logo)
            .placeholder(R.drawable.ic_artsy_logo)
            .into(holder.imgArtwork)
    }

    override fun getItemCount() = data.size
}