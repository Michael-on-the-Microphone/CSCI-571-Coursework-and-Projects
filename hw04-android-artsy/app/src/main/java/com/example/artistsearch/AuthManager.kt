// File: app/src/main/java/com/example/artistsearch/AuthManager.kt
package com.example.artistsearch

import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

object AuthManager {
    private const val PREFS = "auth_prefs"
    private const val KEY_LOGGED_IN = "logged_in"
    private const val KEY_PROFILE_URL = "profile_url"

    private val _loggedIn      = MutableStateFlow(false)
    val loggedIn: StateFlow<Boolean> = _loggedIn

    private val _profileImage = MutableStateFlow<String?>(null)
    val profileImage: StateFlow<String?> = _profileImage

    /** Call once from Application.onCreate() */
    fun init(ctx: Context) {
        val prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        _loggedIn.value = prefs.getBoolean(KEY_LOGGED_IN, false)
        _profileImage.value = prefs.getString(KEY_PROFILE_URL, null)
    }

    /** Persist login flag */
    fun setLoggedIn(ctx: Context, yes: Boolean) {
        val prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        prefs.edit().putBoolean(KEY_LOGGED_IN, yes).apply()
        _loggedIn.value = yes
    }

    /** Persist avatar URL */
    fun setProfileImage(ctx: Context, url: String?) {
        val prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_PROFILE_URL, url).apply()
        _profileImage.value = url
    }

    /** Log out and clear avatar */
    fun logout(ctx: Context) {
        setLoggedIn(ctx, false)
        setProfileImage(ctx, null)
    }
}