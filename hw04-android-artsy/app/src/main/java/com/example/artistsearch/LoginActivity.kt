// File: app/src/main/java/com/example/artistsearch/LoginActivity.kt
package com.example.artistsearch

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.util.Patterns
import android.view.MenuItem
import android.view.View
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import com.android.volley.NetworkResponse
import com.android.volley.Request
import com.android.volley.Response
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley
import com.google.android.material.snackbar.Snackbar
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import org.json.JSONObject

class LoginActivity : AppCompatActivity() {

    private lateinit var tilEmail: TextInputLayout
    private lateinit var tilPassword: TextInputLayout
    private lateinit var etEmail: TextInputEditText
    private lateinit var etPassword: TextInputEditText
    private lateinit var btnLogin: Button
    private lateinit var progressLogin: ProgressBar
    private lateinit var tvErrorLogin: TextView
    private lateinit var tvRegisterLink: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        // Toolbar
        val toolbar = findViewById<Toolbar>(R.id.toolbarLogin)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        // Views
        tilEmail       = findViewById(R.id.tilEmail)
        tilPassword    = findViewById(R.id.tilPassword)
        etEmail        = findViewById(R.id.etEmail)
        etPassword     = findViewById(R.id.etPassword)
        btnLogin       = findViewById(R.id.btnLogin)
        progressLogin  = findViewById(R.id.progressLogin)
        tvErrorLogin   = findViewById(R.id.tvErrorLogin)
        tvRegisterLink = findViewById(R.id.tvRegisterLink)

        // clear errors as soon as user types
        val clearErrorWatcher = object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                tilEmail.error = null
                tilPassword.error = null
                tvErrorLogin.visibility = View.GONE
            }
            override fun afterTextChanged(s: Editable?) {}
        }
        etEmail.addTextChangedListener(clearErrorWatcher)
        etPassword.addTextChangedListener(clearErrorWatcher)

        // Register link
        tvRegisterLink.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        // Login button
        btnLogin.setOnClickListener {
            // 1) Clear previous errors
            tilEmail.error    = null
            tilPassword.error = null
            tvErrorLogin.visibility = View.GONE

            val email    = etEmail.text.toString().trim()
            val password = etPassword.text.toString()

            // 2) Client validation
            var ok = true
            if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                tilEmail.error = "Invalid email format"
                ok = false
            }
            if (password.isBlank()) {
                tilPassword.error = "Password cannot be empty"
                ok = false
            }
            if (!ok) return@setOnClickListener

            // 3) Show spinner + disable button
            progressLogin.visibility = View.VISIBLE
            btnLogin.isEnabled = false

            // 4) Build JSON body
            val body = JSONObject().apply {
                put("email", email)
                put("password", password)
            }

            // 5) Fire request
            val url = "${Network.BASE}/api/login"
            val req = object : JsonObjectRequest(
                Request.Method.POST, url, body,
                Response.Listener { responseJson ->
                    // MARK LOGGED IN
                    AuthManager.setLoggedIn(this, true)

                    // Persist avatar URL if provided
                    val profileUrl = responseJson.optString("profileImageUrl", null)
                    profileUrl?.let { AuthManager.setProfileImage(this, it) }

                    // Feedback + finish
                    progressLogin.visibility = View.GONE
                    Snackbar.make(btnLogin, "Logged in successfully", Snackbar.LENGTH_SHORT).show()
                    finish()
                },
                Response.ErrorListener { err ->
                    progressLogin.visibility = View.GONE
                    btnLogin.isEnabled = true

                    val code = err.networkResponse?.statusCode
                    tvErrorLogin.text = when (code) {
                        401 -> "Username or password is incorrect"
                        else -> code
                            ?.let { "Error $it: ${err.message}" }
                            ?: "Login failed: ${err.message}"
                    }
                    tvErrorLogin.visibility = View.VISIBLE
                }
            ) {
                // Intercept Set-Cookie (case-insensitive) and save only "token=…"
                override fun parseNetworkResponse(response: NetworkResponse): Response<JSONObject> {
                    response.headers
                        ?.entries
                        ?.firstOrNull { it.key.equals("Set-Cookie", ignoreCase = true) }
                        ?.value
                        ?.let { raw ->
                            val cookie = raw.substringBefore(';')
                            Log.d("LoginActivity", "Captured cookie: $cookie")
                            getSharedPreferences("app", MODE_PRIVATE)
                                .edit()
                                .putString("cookie", cookie)
                                .apply()
                        }
                    return super.parseNetworkResponse(response)
                }
            }

            Volley.newRequestQueue(this).add(req)
        }
    }

    override fun onOptionsItemSelected(item: MenuItem) =
        when (item.itemId) {
            android.R.id.home -> { finish(); true }
            else              -> super.onOptionsItemSelected(item)
        }
}