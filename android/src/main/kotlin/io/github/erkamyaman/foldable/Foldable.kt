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
import androidx.window.layout.WindowMetricsCalculator
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

data class SizeClass(val horizontal: String, val vertical: String)

private const val REGULAR_WIDTH_DP = 600f
private const val REGULAR_HEIGHT_DP = 480f

internal fun sizeClassOf(widthDp: Float, heightDp: Float) = SizeClass(
    horizontal = if (widthDp >= REGULAR_WIDTH_DP) "regular" else "compact",
    vertical = if (heightDp >= REGULAR_HEIGHT_DP) "regular" else "compact"
)

internal fun foldStateOf(fold: FoldingFeature?, density: Float, offsetX: Int, offsetY: Int): FoldState {
    fold ?: return FoldState.FLAT

    val state = when (fold.state) {
        FoldingFeature.State.HALF_OPENED -> "half-opened"
        else -> "flat"
    }

    val orientation = when (fold.orientation) {
        FoldingFeature.Orientation.HORIZONTAL -> "horizontal"
        else -> "vertical"
    }

    val rect = fold.bounds
    val bounds = FoldBounds(
        x = ((rect.left - offsetX) / density).roundToInt(),
        y = ((rect.top - offsetY) / density).roundToInt(),
        width = ((rect.right - rect.left) / density).roundToInt(),
        height = ((rect.bottom - rect.top) / density).roundToInt()
    )

    val occluded = if (fold.occlusionType == FoldingFeature.OcclusionType.FULL) {
        bounds
    } else {
        null
    }

    return FoldState(state, orientation, bounds, occluded, fold.isSeparating)
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

    fun sizeClass(): SizeClass {
        val bounds = WindowMetricsCalculator.getOrCreate().computeCurrentWindowMetrics(activity).bounds
        val density = activity.resources.displayMetrics.density
        return sizeClassOf(bounds.width() / density, bounds.height() / density)
    }

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
        val webViewOffset = IntArray(2).also(webView::getLocationInWindow)
        return foldStateOf(
            info.displayFeatures.filterIsInstance<FoldingFeature>().firstOrNull(),
            activity.resources.displayMetrics.density,
            webViewOffset[0],
            webViewOffset[1]
        )
    }
}
