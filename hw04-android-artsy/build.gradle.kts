plugins {
    // declare the plugin versions here once, but do NOT apply them at the root
    id("com.android.application")      version "8.9.1" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
}

tasks.register<Delete>("clean") {
    delete(rootProject.buildDir)
}