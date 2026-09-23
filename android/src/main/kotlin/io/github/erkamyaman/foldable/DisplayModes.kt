package io.github.erkamyaman.foldable

import android.app.Activity
import android.content.Context
import android.view.View
import android.webkit.WebView
import androidx.core.content.ContextCompat
import androidx.window.area.WindowAreaCapability
import androidx.window.area.WindowAreaController
import androidx.window.area.WindowAreaInfo
import androidx.window.area.WindowAreaPresentationSessionCallback
import androidx.window.area.WindowAreaSession
import androidx.window.area.WindowAreaSessionCallback
import androidx.window.area.WindowAreaSessionPresenter
import androidx.window.core.ExperimentalWindowApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.onEach

data class DisplayModeStatuses(val rearDisplay: String, val dualScreen: String) {
    companion object {
        val UNSUPPORTED = DisplayModeStatuses("unsupported", "unsupported")
    }
}

@OptIn(ExperimentalWindowApi::class)
class DisplayModes(private val activity: Activity) {

    private val controller = WindowAreaController.getOrCreate()
    private val executor = ContextCompat.getMainExecutor(activity)
    private var rearDisplayArea: WindowAreaInfo? = null
    private var rearDisplaySession: WindowAreaSession? = null
    private var dualScreenSession: WindowAreaSessionPresenter? = null
    private var dualScreenContent: WebView? = null

    fun statuses(): Flow<DisplayModeStatuses> =
        controller.windowAreaInfos
            .map { areas -> areas.firstOrNull { it.type == WindowAreaInfo.Type.TYPE_REAR_FACING } }
            .onEach { rearDisplayArea = it }
            .map { area ->
                DisplayModeStatuses(
                    rearDisplay = statusOf(area, WindowAreaCapability.Operation.OPERATION_TRANSFER_ACTIVITY_TO_AREA),
                    dualScreen = statusOf(area, WindowAreaCapability.Operation.OPERATION_PRESENT_ON_AREA)
                )
            }
            .distinctUntilChanged()

    fun startRearDisplay(onStarted: () -> Unit, onEnded: (Throwable?) -> Unit) {
        val area = rearDisplayArea ?: return onEnded(null)

        controller.transferActivityToWindowArea(
            area.token,
            activity,
            executor,
            object : WindowAreaSessionCallback {
                override fun onSessionStarted(session: WindowAreaSession) {
                    rearDisplaySession = session
                    onStarted()
                }

                override fun onSessionEnded(t: Throwable?) {
                    rearDisplaySession = null
                    onEnded(t)
                }
            }
        )
    }

    fun stopRearDisplay() {
        rearDisplaySession?.close()
        rearDisplaySession = null
    }

    fun startDualScreen(createContent: (Context) -> View, onStarted: () -> Unit, onEnded: (Throwable?) -> Unit) {
        dualScreenSession?.let { session ->
            replaceContent(session, createContent)
            onStarted()
            return
        }

        val area = rearDisplayArea ?: return onEnded(null)

        controller.presentContentOnWindowArea(
            area.token,
            activity,
            executor,
            object : WindowAreaPresentationSessionCallback {
                override fun onSessionStarted(session: WindowAreaSessionPresenter) {
                    dualScreenSession = session
                    replaceContent(session, createContent)
                    onStarted()
                }

                override fun onSessionEnded(t: Throwable?) {
                    destroyContent()
                    dualScreenSession = null
                    onEnded(t)
                }

                override fun onContainerVisibilityChanged(isVisible: Boolean) = Unit
            }
        )
    }

    fun stopDualScreen() {
        destroyContent()
        dualScreenSession?.close()
        dualScreenSession = null
    }

    /** A web view left alive keeps its timers and connections running. */
    private fun replaceContent(session: WindowAreaSessionPresenter, createContent: (Context) -> View) {
        destroyContent()
        val content = createContent(session.context)
        dualScreenContent = content as? WebView
        session.setContentView(content)
    }

    private fun destroyContent() {
        dualScreenContent?.apply {
            loadUrl("about:blank")
            destroy()
        }
        dualScreenContent = null
    }

    private fun statusOf(area: WindowAreaInfo?, operation: WindowAreaCapability.Operation): String =
        when (area?.getCapability(operation)?.status) {
            WindowAreaCapability.Status.WINDOW_AREA_STATUS_ACTIVE -> "active"
            WindowAreaCapability.Status.WINDOW_AREA_STATUS_AVAILABLE -> "available"
            WindowAreaCapability.Status.WINDOW_AREA_STATUS_UNAVAILABLE -> "unavailable"
            else -> "unsupported"
        }
}
