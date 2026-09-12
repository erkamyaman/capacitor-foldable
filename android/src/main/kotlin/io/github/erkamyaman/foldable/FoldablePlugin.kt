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
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeoutOrNull

@CapacitorPlugin(name = "Foldable")
class FoldablePlugin : Plugin() {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    private var implementation: Foldable? = null
    private var lastKnownState: FoldState? = null

    override fun load() {
        val activity = this.activity ?: return
        val implementation = Foldable(activity)
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

    private fun FoldState.toJSObject(): JSObject = JSObject().apply {
        put("state", state)
        hingeOrientation?.let { put("hingeOrientation", it) }
        occludedBounds?.let { bounds ->
            put(
                "occludedBounds",
                JSObject().apply {
                    put("x", bounds.x)
                    put("y", bounds.y)
                    put("width", bounds.width)
                    put("height", bounds.height)
                }
            )
        }
    }

    private companion object {
        const val FIRST_EMISSION_TIMEOUT_MS = 1_000L
    }
}
