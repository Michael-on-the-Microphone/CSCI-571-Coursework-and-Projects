package com.example.artistsearch

import android.app.Dialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.ProgressBar
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.DialogFragment
import androidx.viewpager2.widget.ViewPager2
import com.android.volley.VolleyError
import org.json.JSONArray
import org.json.JSONObject

class CategoryDialogFragment : DialogFragment() {

    companion object {
        private const val ARG_ARTWORK_ID = "artwork_id"
        @JvmStatic
        fun newInstance(artworkId: String) =
            CategoryDialogFragment().apply {
                arguments = Bundle().apply {
                    putString(ARG_ARTWORK_ID, artworkId)
                }
            }
    }

    private val artworkId: String by lazy {
        requireArguments().getString(ARG_ARTWORK_ID)!!
    }

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val ctx = requireContext()
        // Inflate our custom view
        val view = LayoutInflater.from(ctx)
            .inflate(R.layout.dialog_categories, null)
        val progress = view.findViewById<ProgressBar>(R.id.progress_categories)
        val pager    = view.findViewById<ViewPager2>(R.id.vpCategories)
        val adapter  = CategoryAdapter(emptyList())
        pager.adapter = adapter

        // Kick off load
        Network.get(
            path   = "/api/fetchCategories",
            params = mapOf("artworkId" to artworkId),
            onSuccess = { json ->
                // hide spinner, show pager
                progress.visibility = View.GONE
                pager.visibility    = View.VISIBLE

                // parse
                val arr: JSONArray = json.getJSONArray("categories")
                val cats = mutableListOf<Category>()
                for (i in 0 until arr.length()) {
                    val o = arr.getJSONObject(i)
                    cats += Category(
                        name        = o.getString("name"),
                        image       = o.optString("image", null),
                        description = o.optString("description", null)
                    )
                }
                adapter.update(cats)
            },
            onError = { err: VolleyError ->
                progress.visibility = View.GONE
                // show a single “error” card
                val e = listOf(
                    Category("Error",
                        null,
                        "Failed to load categories: ${err.networkResponse?.statusCode
                            ?: err.message}")
                )
                pager.visibility = View.VISIBLE
                adapter.update(e)
            }
        )

        // Build dialog
        return AlertDialog.Builder(ctx)
            .setTitle("Categories")
            .setView(view)
            .setPositiveButton("Close") { dlg, _ -> dlg.dismiss() }
            .create()
    }
}