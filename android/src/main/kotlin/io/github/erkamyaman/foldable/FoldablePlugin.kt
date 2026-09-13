package io.github.erkamyaman.foldable

import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.repeatOnLifecycle
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

@CapacitorPlugin(name = "Foldable")
class FoldablePlugin : Plugin() {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    private var implementation: Foldable? = null
    private var lastKnownState: FoldState? = null
    private var hingeAngleJob: Job? = null
    private var lastKnownAngle: Float? = null

    override fun load() {
        val activity = this.activity ?: return
        val implementation = Foldable(activity, bridge.webView)
        this.implementation = implementation

        val owner = activity as? LifecycleOwner ?: return
        scope.launch {
            owner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                implementation.foldStates().collect { state ->
                    lastKnownState = state
                    notifyListeners("foldStateChange", state.toJSObject())
                }
            }
        }
    }

    override fun handleOnDestroy() {
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
        val foldable = implementation?.isDeviceFoldable() ?: false
        call.resolve(JSObject().put("foldable", foldable))
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

    private fun updateHingeAngleUpdates() {
        if (!hasListeners(HINGE_ANGLE_CHANGE)) {
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
                        delay(HINGE_ANGLE_FRAME_MS)
                    }
                } finally {
                    lastKnownAngle = null
                }
            }
        }
    }

    private fun angleResult(angle: Float?): JSObject =
        JSObject().put("angle", angle?.toDouble() ?: JSONObject.NULL)

    private fun FoldState.toJSObject(): JSObject = JSObject().apply {
        put("state", state)
        put("isSeparating", isSeparating)
        hingeOrientation?.let { put("hingeOrientation", it) }
        hingeBounds?.let { put("hingeBounds", it.toJSObject()) }
        occludedBounds?.let { put("occludedBounds", it.toJSObject()) }
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
        const val HINGE_ANGLE_FRAME_MS = 16L
    }
}
