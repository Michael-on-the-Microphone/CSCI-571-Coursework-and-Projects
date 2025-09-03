package com.example.artistsearch

import android.app.Application

import java.net.CookieHandler
import java.net.CookieManager


class App : Application() {
    override fun onCreate() {
        super.onCreate()
        Network.init(this)
        AuthManager.init(this)
        CookieHandler.setDefault(CookieManager())

    }
}