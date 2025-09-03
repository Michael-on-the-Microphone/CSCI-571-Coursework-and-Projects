package com.example.artistsearch

import android.content.Context
import android.net.Uri
import android.util.Log
import com.android.volley.VolleyError
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley
import org.json.JSONObject

object Network {
    const val BASE = "https://webtechassignment2-455603.uw.r.appspot.com"

    private lateinit var appContext: Context
    lateinit var queue: com.android.volley.RequestQueue
        private set

    /** Call this once from your Application.onCreate() */
    fun init(ctx: Context) {
        appContext = ctx.applicationContext
        queue = Volley.newRequestQueue(appContext)
    }

    /** Read the single saved "token=…" cookie and attach it */
    private fun addCookieHeader(headers: MutableMap<String, String>) {
        appContext
            .getSharedPreferences("app", Context.MODE_PRIVATE)
            .getString("cookie", null)
            ?.let { headers["Cookie"] = it }
    }

    fun get(
        path: String,
        params: Map<String, String>,
        onSuccess: (JSONObject) -> Unit,
        onError: (VolleyError) -> Unit
    ) {
        val url = Uri.parse(BASE + path).buildUpon().apply {
            params.forEach { (k, v) -> appendQueryParameter(k, v) }
        }.build().toString()

        Log.d("Network", "GET → $url")
        val req = object : JsonObjectRequest(
            Method.GET, url, null, onSuccess, onError
        ) {
            override fun getHeaders(): MutableMap<String, String> {
                // start with Volley’s defaults, then add our cookie
                val h = super.getHeaders().toMutableMap()
                addCookieHeader(h)
                Log.d("Network", "→ Request headers: $h")
                return h
            }
        }
        queue.add(req)
    }

    fun post(
        path: String,
        body: JSONObject,
        onSuccess: (JSONObject) -> Unit,
        onError: (VolleyError) -> Unit
    ) {
        val url = BASE + path
        Log.d("Network", "POST → $url   body=$body")

        val req = object : JsonObjectRequest(
            Method.POST, url, body, onSuccess, onError
        ) {
            override fun getHeaders(): MutableMap<String, String> {
                val h = super.getHeaders().toMutableMap()
                addCookieHeader(h)
                Log.d("Network", "→ Request headers: $h")
                return h
            }
        }
        queue.add(req)
    }
}