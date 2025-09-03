// File: app/src/main/java/com/example/artistsearch/RegisterActivity.kt
package com.example.artistsearch

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
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

class RegisterActivity : AppCompatActivity() {

    private lateinit var tilName: TextInputLayout
    private lateinit var tilEmail: TextInputLayout
    private lateinit var tilPassword: TextInputLayout
    private lateinit var etName: TextInputEditText
    private lateinit var etEmail: TextInputEditText
    private lateinit var etPassword: TextInputEditText
    private lateinit var btnRegister: Button
    private lateinit var progressRegister: ProgressBar
    private lateinit var tvErrorRegister: TextView
    private lateinit var tvLoginLink: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        // Toolbar
        val toolbar = findViewById<Toolbar>(R.id.toolbarRegister)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        // View bindings
        tilName          = findViewById(R.id.tilName)
        tilEmail         = findViewById(R.id.tilEmail)
        tilPassword      = findViewById(R.id.tilPassword)
        etName           = findViewById(R.id.etName)
        etEmail          = findViewById(R.id.etEmail)
        etPassword       = findViewById(R.id.etPassword)
        btnRegister      = findViewById(R.id.btnRegister)
        progressRegister = findViewById(R.id.progressRegister)
        tvErrorRegister  = findViewById(R.id.tvErrorRegister)
        tvLoginLink      = findViewById(R.id.tvLoginLink)

        // hide server-error initially
        tvErrorRegister.visibility = View.GONE

        // Inline validation on focus + clear on typing
        etName.setOnFocusChangeListener { _, hasFocus ->
            if (hasFocus && etName.text.isNullOrBlank()) {
                tilName.error = "Full name cannot be empty"
            }
        }
        etEmail.setOnFocusChangeListener { _, hasFocus ->
            if (hasFocus && etEmail.text.isNullOrBlank()) {
                tilEmail.error = "Email cannot be empty"
            }
        }
        etPassword.setOnFocusChangeListener { _, hasFocus ->
            if (hasFocus && etPassword.text.isNullOrBlank()) {
                tilPassword.error = "Password cannot be empty"
            }
        }

        val clearWatcher = object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                tilName.error = null
                tilEmail.error = null
                tilPassword.error = null
                tvErrorRegister.visibility = View.GONE
            }
            override fun afterTextChanged(s: Editable?) {}
        }
        etName.addTextChangedListener(clearWatcher)
        etEmail.addTextChangedListener(clearWatcher)
        etPassword.addTextChangedListener(clearWatcher)

        // Already have an account?
        tvLoginLink.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }

        // Register button
        btnRegister.setOnClickListener {
            // clear previous errors
            tilName.error     = null
            tilEmail.error    = null
            tilPassword.error = null
            tvErrorRegister.visibility = View.GONE

            val name     = etName.text.toString().trim()
            val email    = etEmail.text.toString().trim()
            val password = etPassword.text.toString()

            // client-side validation
            var ok = true
            if (name.isBlank()) {
                tilName.error = "Full name cannot be empty"
                ok = false
            }
            if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                tilEmail.error = "Invalid email format"
                ok = false
            }
            if (password.length < 6) {
                tilPassword.error = "Password must be ≥ 6 characters"
                ok = false
            }
            if (!ok) return@setOnClickListener

            // show spinner + disable
            progressRegister.visibility = View.VISIBLE
            btnRegister.isEnabled = false

            // build payload
            val body = JSONObject().apply {
                put("fullname", name)
                put("email", email)
                put("password", password)
            }

            val url = "${Network.BASE}/api/register"
            val req = object : JsonObjectRequest(
                Request.Method.POST, url, body,
                Response.Listener {
                    // MARK LOGGED IN
                    AuthManager.setLoggedIn(this, true)
                    progressRegister.visibility = View.GONE
                    Snackbar.make(btnRegister, "Registered successfully", Snackbar.LENGTH_SHORT).show()

// fire MainActivity and clear Login/Register off the stack:
                    Intent(this, MainActivity::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_NEW_TASK
                    }.also { startActivity(it) }
                },
                Response.ErrorListener { err ->
                    progressRegister.visibility = View.GONE
                    btnRegister.isEnabled = true

                    val code = err.networkResponse?.statusCode
                    tvErrorRegister.text = when (code) {
                        409 -> "Email already in use"
                        else -> err.networkResponse
                            ?.let { "Error $it: ${err.message}" }
                            ?: "Registration failed: ${err.message}"
                    }
                    tvErrorRegister.visibility = View.VISIBLE
                }
            ) {
                override fun parseNetworkResponse(response: NetworkResponse): Response<JSONObject> {
                    // persist cookie
                    response.headers
                        ?.entries
                        ?.firstOrNull { it.key.equals("Set-Cookie", ignoreCase = true) }
                        ?.value
                        ?.let { raw ->
                            val cookie = raw.substringBefore(';')
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