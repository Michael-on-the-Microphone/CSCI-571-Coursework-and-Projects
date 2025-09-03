package com.example.artistsearch

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class GeneAdapter(
    private val data: List<Gene>
) : RecyclerView.Adapter<GeneAdapter.VH>() {
    inner class VH(v: View) : RecyclerView.ViewHolder(v) {
        val tvName: TextView = v.findViewById(R.id.tvGeneName)
        val tvDesc: TextView = v.findViewById(R.id.tvGeneDesc)
    }
    override fun onCreateViewHolder(p: ViewGroup, vt: Int) =
        VH(LayoutInflater.from(p.context).inflate(R.layout.item_gene, p, false))
    override fun onBindViewHolder(h: VH, i: Int) {
        h.tvName.text = data[i].name
        h.tvDesc.text = data[i].description
    }
    override fun getItemCount() = data.size
}