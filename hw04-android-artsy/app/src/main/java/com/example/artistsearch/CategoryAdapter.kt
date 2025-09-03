package com.example.artistsearch

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide

class CategoryAdapter(
    private var items: List<Category>
) : RecyclerView.Adapter<CategoryAdapter.VH>() {

    inner class VH(view: View) : RecyclerView.ViewHolder(view) {
        val img: ImageView         = view.findViewById(R.id.imgCategory)
        val name: TextView         = view.findViewById(R.id.tvCategoryName)
        val description: TextView  = view.findViewById(R.id.tvCategoryDesc)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_category, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, pos: Int) {
        val c = items[pos]
        holder.name.text = c.name
        holder.description.text = c.description ?: "—"
        Glide.with(holder.img)
            .load(c.image ?: R.drawable.ic_artsy_logo)
            .placeholder(R.drawable.ic_artsy_logo)
            .into(holder.img)
    }

    override fun getItemCount() = items.size

    fun update(newItems: List<Category>) {
        items = newItems
        notifyDataSetChanged()
    }
}