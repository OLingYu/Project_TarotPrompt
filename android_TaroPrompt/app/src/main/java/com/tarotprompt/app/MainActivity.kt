package com.tarotprompt.app

import android.annotation.SuppressLint
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.graphics.Color
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity

/**
 * TarotPrompt Android 版主界面。
 *
 * 适配思路：WebView 加载打包在 assets 中的离线网页（零后端、零联网），
 * 并通过 JavaScript 桥（AndroidBridge）提供原生能力：
 *   - copyText()：可靠的一键复制（WebView 中 navigator.clipboard / execCommand 并不可靠）
 *   - showToast()：原生 Toast 提示
 * 返回键：先交给网页层（handleAndroidBack）处理视图回退，欢迎页则退到后台。
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        // 与网页深色主题一致的底色，避免白屏闪烁
        webView.setBackgroundColor(Color.parseColor("#14121A"))

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            loadWithOverviewMode = true
            useWideViewPort = true
            builtInZoomControls = false
            setSupportZoom(false)
        }

        // 所有页面均在应用内加载（本项目无外链）
        webView.webViewClient = object : WebViewClient() {}
        webView.webChromeClient = WebChromeClient()
        webView.addJavascriptInterface(AndroidBridge(), "AndroidBridge")

        webView.loadUrl("file:///android_asset/index.html")

        // 返回键：网页层优先处理视图回退，否则退到系统后台（保留应用状态）
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                webView.evaluateJavascript(
                    "(function(){try{if(window.TarotPrompt&&typeof TarotPrompt.handleAndroidBack==='function'){return TarotPrompt.handleAndroidBack()?'true':'false';}}catch(e){}return 'false';})();"
                ) { result ->
                    val handled = result?.trim()?.trim('"') == "true"
                    if (!handled) {
                        moveTaskToBack(true)
                    }
                }
            }
        })
    }

    /** 供网页 JavaScript 调用的原生桥 */
    inner class AndroidBridge {

        @JavascriptInterface
        fun copyText(text: String): Boolean {
            return try {
                val cm = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                cm.setPrimaryClip(ClipData.newPlainText("TarotPrompt", text))
                true
            } catch (e: Exception) {
                false
            }
        }

        @JavascriptInterface
        fun showToast(message: String) {
            runOnUiThread {
                Toast.makeText(this@MainActivity, message, Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
