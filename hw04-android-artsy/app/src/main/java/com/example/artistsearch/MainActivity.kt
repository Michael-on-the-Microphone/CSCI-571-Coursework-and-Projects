// File: app/src/main/java/com/example/artistsearch/MainActivity.kt
package com.example.artistsearch
import android.content.Intent

import android.graphics.drawable.Drawable
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.PopupMenu
import androidx.appcompat.widget.Toolbar
import androidx.lifecycle.lifecycleScope
import com.android.volley.Request
import com.android.volley.toolbox.JsonObjectRequest
import com.bumptech.glide.Glide
import com.bumptech.glide.request.target.CustomTarget
import com.bumptech.glide.request.transition.Transition
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var toolbar: Toolbar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        toolbar = findViewById(R.id.toolbar)
        setSupportActionBar(toolbar)

        // show HomeFragment
        supportFragmentManager
            .beginTransaction()
            .replace(R.id.fragment_container, HomeFragment())
            .commit()

        // redraw menu whenever login *or* avatar changes
        lifecycleScope.launch {
            combine(AuthManager.loggedIn, AuthManager.profileImage) { loggedIn, _ ->
                loggedIn
            }.collect {
                invalidateOptionsMenu()
            }
        }
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_main, menu)
        return true
    }

    override fun onPrepareOptionsMenu(menu: Menu): Boolean {
        val userItem = menu.findItem(R.id.action_user)
        if (AuthManager.loggedIn.value) {
            // load their avatar
            AuthManager.profileImage.value?.let { url ->
                Glide.with(this)
                    .asDrawable()
                    .load(url)
                    .circleCrop()
                    .into(object : CustomTarget<Drawable>(48,48) {
                        override fun onResourceReady(
                            resource: Drawable,
                            transition: Transition<in Drawable>?
                        ) {
                            userItem.icon = resource
                        }
                        override fun onLoadCleared(placeholder: Drawable?) {
                            userItem.icon = placeholder
                        }
                    })
            } ?: run {
                // fallback if no URL
                userItem.setIcon(R.drawable.ic_person)
            }
        } else {
            // generic person when logged out
            userItem.setIcon(R.drawable.ic_person)
        }
        return super.onPrepareOptionsMenu(menu)
    }

    override fun onOptionsItemSelected(item: MenuItem) = when(item.itemId) {
        R.id.action_search -> {
            startActivity(Intent(this, SearchActivity::class.java))
            true
        }
        R.id.action_user  -> {
            if (AuthManager.loggedIn.value) {
                showUserMenu(toolbar)
            } else {
                startActivity(Intent(this, LoginActivity::class.java))
            }
            true
        }
        else -> super.onOptionsItemSelected(item)
    }

    private fun showUserMenu(anchor: View) {
        PopupMenu(this, anchor).apply {
            menu.add("Log out")
                .setOnMenuItemClickListener {
                    AuthManager.logout(this@MainActivity)
                    Snackbar.make(anchor, "Logged out successfully", Snackbar.LENGTH_SHORT).show()
                    true
                }
            menu.add("Delete account")
                .setOnMenuItemClickListener {
                    val url = "${Network.BASE}/api/deleteUser"
                    val req = JsonObjectRequest(
                        Request.Method.DELETE, url, null,
                        { _ ->
                            AuthManager.logout(this@MainActivity)
                            Snackbar.make(anchor, "Deleted account successfully", Snackbar.LENGTH_SHORT).show()
                        },
                        { err ->
                            val code = err.networkResponse?.statusCode
                            val msg  = code?.let { "Error $it" } ?: (err.message ?: "Unknown")
                            Snackbar.make(anchor, "Failed to delete account: $msg", Snackbar.LENGTH_LONG).show()
                        }
                    )
                    Network.queue.add(req)
                    true
                }
            show()
        }
    }
}