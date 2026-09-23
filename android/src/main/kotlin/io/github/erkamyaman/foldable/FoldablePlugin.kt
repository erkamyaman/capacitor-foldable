package io.github.erkamyaman.foldable

import android.annotation.SuppressLint
import android.content.Context
import android.net.Uri
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.repeatOnLifecycle
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.conflate
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeoutOrNull
import org.json.JSONObject
import java.net.URL

@CapacitorPlugin(name = "Foldable")
class FoldablePlugin : Plugin() {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    private var implementation: Foldable? = null
    private var displayModes: DisplayModes? = null
    private var lastKnownState: FoldState? = null
    private var hingeAngleJob: Job? = null
    private var foldingJob: Job? = null
    private var isFolding = false
    private var lastKnownAngle: Float? = null
    private var lastSizeClass: SizeClass? = null
    private var lastDisplayModes: DisplayModeStatuses? = null

    override fun load() {
        val activity = this.activity ?: return
        val implementation = Foldable(activity, bridge.webView)
        this.implementation = implementation
        val displayModes = DisplayModes(activity)
        this.displayModes = displayModes

        lastSizeClass = implementation.sizeClass()
        bridge.webView.addOnLayoutChangeListener { _, _, _, _, _, _, _, _, _ -> notifySizeClassIfChanged() }

        val owner = activity as? LifecycleOwner ?: return
        scope.launch {
            owner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                implementation.foldStates().collect { state ->
                    lastKnownState = state
                    notifyListeners("foldStateChange", state.toJSObject())
                }
            }
        }
        scope.launch {
            owner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                displayModes.statuses().collect { statuses ->
                    lastDisplayModes = statuses
                    notifyListeners(DISPLAY_MODE_CHANGE, statuses.toJSObject())
                }
            }
        }
    }

    override fun handleOnDestroy() {
        displayModes?.stopRearDisplay()
        displayModes?.stopDualScreen()
        scope.cancel()
    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    override fun addListener(call: PluginCall) {
        super.addListener(call)
        scope.launch { updateHingeAngleUpdates() }
    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    override fun removeListener(call: PluginCall) {
        super.removeListener(call)
        scope.launch { updateHingeAngleUpdates() }
    }

    @PluginMethod
    override fun removeAllListeners(call: PluginCall) {
        super.removeAllListeners(call)
        scope.launch { updateHingeAngleUpdates() }
    }

    @PluginMethod
    fun isDeviceFoldable(call: PluginCall) {
        val implementation = this.implementation
        call.resolve(
            JSObject()
                .put("foldable", implementation?.isDeviceFoldable() ?: false)
                .put("supportsTabletop", implementation?.supportsTabletop() ?: false)
        )
    }

    @PluginMethod
    fun setVerticalBarBehavior(call: PluginCall) {
        call.resolve(JSObject().put("applied", false))
    }

    @PluginMethod
    fun getReservedRegions(call: PluginCall) {
        call.resolve(JSObject().put("regions", JSArray()))
    }

    @PluginMethod
    fun getFoldState(call: PluginCall) {
        lastKnownState?.let {
            call.resolve(it.toJSObject())
            return
        }

        val implementation = this.implementation
        if (implementation == null) {
            call.resolve(FoldState.FLAT.toJSObject())
            return
        }

        scope.launch {
            val state = withTimeoutOrNull(FIRST_EMISSION_TIMEOUT_MS) {
                implementation.foldStates().first()
            } ?: FoldState.FLAT
            lastKnownState = state
            call.resolve(state.toJSObject())
        }
    }

    @PluginMethod
    fun getHingeAngle(call: PluginCall) {
        lastKnownAngle?.let {
            call.resolve(angleResult(it))
            return
        }

        val implementation = this.implementation
        if (implementation == null || !implementation.hasHingeSensor()) {
            call.resolve(angleResult(null))
            return
        }

        scope.launch {
            val angle = withTimeoutOrNull(FIRST_EMISSION_TIMEOUT_MS) {
                implementation.hingeAngles().firstOrNull()
            }
            call.resolve(angleResult(angle))
        }
    }

    @PluginMethod
    fun getSizeClass(call: PluginCall) {
        val sizeClass = implementation?.sizeClass() ?: sizeClassOf(0f, 0f)
        call.resolve(sizeClass.toJSObject())
    }

    @PluginMethod
    fun getBarPlacement(call: PluginCall) {
        call.resolve(JSObject().put("verticalBarEdge", JSONObject.NULL))
    }

    @PluginMethod
    fun getDisplayModes(call: PluginCall) {
        lastDisplayModes?.let {
            call.resolve(it.toJSObject())
            return
        }

        val displayModes = this.displayModes ?: return call.resolve(DisplayModeStatuses.UNSUPPORTED.toJSObject())

        scope.launch {
            val statuses = withTimeoutOrNull(FIRST_EMISSION_TIMEOUT_MS) {
                displayModes.statuses().first()
            } ?: DisplayModeStatuses.UNSUPPORTED
            call.resolve(statuses.toJSObject())
        }
    }

    @PluginMethod
    fun startRearDisplay(call: PluginCall) {
        val displayModes = this.displayModes ?: return call.unavailable("Rear display mode needs an activity.")

        scope.launch {
            when (lastDisplayModes?.rearDisplay) {
                "active" -> call.resolve()
                "available" -> {
                    val settle = Settle(call, "Rear display mode")
                    displayModes.startRearDisplay(settle::started, settle::ended)
                }
                else -> call.unavailable("Rear display mode is not available on this device right now.")
            }
        }
    }

    @PluginMethod
    fun stopRearDisplay(call: PluginCall) {
        scope.launch {
            displayModes?.stopRearDisplay()
            call.resolve()
        }
    }

    @PluginMethod
    fun startDualScreen(call: PluginCall) {
        val url = call.getString("url") ?: return call.reject("url is required.")
        val target = resolveUrl(url)
            ?: return call.reject("url must be a page in this app, or a data: URL you built yourself.")
        val displayModes = this.displayModes ?: return call.unavailable("Dual-screen mode needs an activity.")

        scope.launch {
            when (lastDisplayModes?.dualScreen) {
                "available", "active" -> {
                    val settle = Settle(call, "Dual-screen mode")
                    displayModes.startDualScreen({ context -> dualScreenWebView(context, target) }, settle::started, settle::ended)
                }
                else -> call.unavailable("Dual-screen mode is not available on this device right now.")
            }
        }
    }

    @PluginMethod
    fun stopDualScreen(call: PluginCall) {
        scope.launch {
            displayModes?.stopDualScreen()
            call.resolve()
        }
    }

    private fun notifySizeClassIfChanged() {
        val sizeClass = implementation?.sizeClass() ?: return
        if (sizeClass == lastSizeClass) return

        lastSizeClass = sizeClass
        notifyListeners(SIZE_CLASS_CHANGE, sizeClass.toJSObject())
    }

    private fun updateHingeAngleUpdates() {
        if (!hasListeners(HINGE_ANGLE_CHANGE) && !hasListeners(FOLDING_CHANGE)) {
            hingeAngleJob?.cancel()
            hingeAngleJob = null
            lastKnownAngle = null
            return
        }
        if (hingeAngleJob != null) return

        val implementation = this.implementation ?: return
        val owner = activity as? LifecycleOwner ?: return
        hingeAngleJob = scope.launch {
            owner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                try {
                    implementation.hingeAngles().conflate().collect { angle ->
                        lastKnownAngle = angle
                        notifyListeners(HINGE_ANGLE_CHANGE, angleResult(angle))
                        notifyFolding()
                        delay(HINGE_ANGLE_FRAME_MS)
                    }
                } finally {
                    lastKnownAngle = null
                }
            }
        }
    }

    /** `true` while the hinge keeps moving, `false` once it has been still for a moment. */
    private fun notifyFolding() {
        if (!isFolding) {
            isFolding = true
            notifyListeners(FOLDING_CHANGE, JSObject().put("folding", true))
        }

        foldingJob?.cancel()
        foldingJob = scope.launch {
            delay(FOLDING_SETTLE_MS)
            isFolding = false
            notifyListeners(FOLDING_CHANGE, JSObject().put("folding", false))
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun dualScreenWebView(context: Context, url: String): WebView = WebView(context).apply {
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
                bridge.localServer.shouldInterceptRequest(request)

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean =
                !isAppUrl(request.url.toString())
        }
        loadUrl(url)
    }

    /**
     * The page on the other display shares the app's web view profile, so it is
     * kept to the app's own origin: anything else is refused rather than loaded.
     */
    private fun resolveUrl(url: String): String? {
        if (url.startsWith("//")) return null

        val scheme = Uri.parse(url).scheme
        if (scheme == null) return URL(URL(bridge.appUrl), url).toString().takeIf(::isAppUrl)
        if (!scheme.equals("http", true) && !scheme.equals("https", true) && scheme != "data") return null

        return url.takeIf { scheme == "data" || isAppUrl(it) }
    }

    private fun isAppUrl(url: String): Boolean {
        val app = Uri.parse(bridge.appUrl)
        val target = Uri.parse(url)
        return target.scheme == app.scheme && target.host == app.host && target.port == app.port
    }

    private inner class Settle(private val call: PluginCall, private val mode: String) {
        private var settled = false

        fun started() {
            if (settled) return
            settled = true
            call.resolve()
        }

        fun ended(error: Throwable?) {
            if (settled) return
            settled = true
            call.reject(error?.message ?: "$mode ended before it started.")
        }
    }

    private fun angleResult(angle: Float?): JSObject =
        JSObject().put("angle", angle?.toDouble() ?: JSONObject.NULL)

    private fun FoldState.toJSObject(): JSObject = JSObject().apply {
        put("state", state)
        put("isSeparating", isSeparating)
        put("posture", posture)
        hingeOrientation?.let { put("hingeOrientation", it) }
        hingeBounds?.let { put("hingeBounds", it.toJSObject()) }
        occludedBounds?.let { put("occludedBounds", it.toJSObject()) }
        if (cameraBounds.isNotEmpty()) {
            put("cameraBounds", JSArray().apply { cameraBounds.forEach { put(it.toJSObject()) } })
        }
    }

    private fun SizeClass.toJSObject(): JSObject = JSObject().apply {
        put("horizontal", horizontal)
        put("vertical", vertical)
        put("widthClass", widthClass)
        put("heightClass", heightClass)
    }

    private fun DisplayModeStatuses.toJSObject(): JSObject = JSObject().apply {
        put("rearDisplay", rearDisplay)
        put("dualScreen", dualScreen)
    }

    private fun FoldBounds.toJSObject(): JSObject = JSObject().apply {
        put("x", x)
        put("y", y)
        put("width", width)
        put("height", height)
    }

    private companion object {
        const val FIRST_EMISSION_TIMEOUT_MS = 1_000L
        const val HINGE_ANGLE_CHANGE = "hingeAngleChange"
        const val FOLDING_CHANGE = "foldingChange"
        const val FOLDING_SETTLE_MS = 500L
        const val HINGE_ANGLE_FRAME_MS = 16L
        const val SIZE_CLASS_CHANGE = "sizeClassChange"
        const val DISPLAY_MODE_CHANGE = "displayModeChange"
    }
}
