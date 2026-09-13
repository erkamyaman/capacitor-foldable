package io.github.erkamyaman.foldable

import android.app.Activity
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.view.View
import androidx.window.layout.FoldingFeature
import androidx.window.layout.WindowInfoTracker
import androidx.window.layout.WindowLayoutInfo
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.emptyFlow
import kotlinx.coroutines.flow.map
import kotlin.math.roundToInt

data class FoldBounds(val x: Int, val y: Int, val width: Int, val height: Int)

data class FoldState(
    val state: String,
    val hingeOrientation: String? = null,
    val hingeBounds: FoldBounds? = null,
    val occludedBounds: FoldBounds? = null,
    val isSeparating: Boolean = false
) {
    companion object {
        val FLAT = FoldState("flat")
    }
}

class Foldable(private val activity: Activity, private val webView: View) {

    private val tracker = WindowInfoTracker.getOrCreate(activity)
    private val sensorManager = activity.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val hingeSensor: Sensor? =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            sensorManager.getDefaultSensor(Sensor.TYPE_HINGE_ANGLE)
        } else {
            null
        }

    fun isDeviceFoldable(): Boolean {
        if (tracker.supportedPostures.isNotEmpty()) return true

        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.R &&
            activity.packageManager.hasSystemFeature(PackageManager.FEATURE_SENSOR_HINGE_ANGLE)
    }

    fun hasHingeSensor(): Boolean = hingeSensor != null

    fun foldStates(): Flow<FoldState> =
        tracker.windowLayoutInfo(activity).map(::toFoldState).distinctUntilChanged()

    fun hingeAngles(): Flow<Float> {
        val sensor = hingeSensor ?: return emptyFlow()

        return callbackFlow {
            val listener = object : SensorEventListener {
                override fun onSensorChanged(event: SensorEvent) {
                    if (event.values.isEmpty()) return
                    trySend(event.values[0].coerceIn(0f, 360f))
                }

                override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit
            }
            sensorManager.registerListener(listener, sensor, SensorManager.SENSOR_DELAY_NORMAL)
            awaitClose { sensorManager.unregisterListener(listener) }
        }.distinctUntilChanged()
    }

    private fun toFoldState(info: WindowLayoutInfo): FoldState {
        val fold = info.displayFeatures.filterIsInstance<FoldingFeature>().firstOrNull()
            ?: return FoldState.FLAT

        val state = when (fold.state) {
            FoldingFeature.State.HALF_OPENED -> "half-opened"
            else -> "flat"
        }

        val orientation = when (fold.orientation) {
            FoldingFeature.Orientation.HORIZONTAL -> "horizontal"
            else -> "vertical"
        }

        val bounds = toCssPixels(fold.bounds)

        val occluded = if (fold.occlusionType == FoldingFeature.OcclusionType.FULL) {
            bounds
        } else {
            null
        }

        return FoldState(state, orientation, bounds, occluded, fold.isSeparating)
    }

    private fun toCssPixels(bounds: android.graphics.Rect): FoldBounds {
        val density = activity.resources.displayMetrics.density
        val webViewOffset = IntArray(2).also(webView::getLocationInWindow)
        return FoldBounds(
            x = ((bounds.left - webViewOffset[0]) / density).roundToInt(),
            y = ((bounds.top - webViewOffset[1]) / density).roundToInt(),
            width = (bounds.width() / density).roundToInt(),
            height = (bounds.height() / density).roundToInt()
        )
    }
}
