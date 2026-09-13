package io.github.erkamyaman.foldable

import android.app.Activity
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Rect
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.view.View
import androidx.core.view.ViewCompat
import androidx.window.layout.FoldingFeature
import androidx.window.layout.SupportedPosture
import androidx.window.layout.WindowInfoTracker
import androidx.window.layout.WindowLayoutInfo
import androidx.window.layout.WindowMetricsCalculator
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.conflate
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.emptyFlow
import kotlin.math.roundToInt

data class FoldBounds(val x: Int, val y: Int, val width: Int, val height: Int)

data class FoldState(
    val state: String,
    val hingeOrientation: String? = null,
    val hingeBounds: FoldBounds? = null,
    val occludedBounds: FoldBounds? = null,
    val isSeparating: Boolean = false,
    val cameraBounds: List<FoldBounds> = emptyList(),
    val posture: String = "flat"
) {
    companion object {
        val FLAT = FoldState("flat")
    }
}

data class SizeClass(
    val horizontal: String,
    val vertical: String,
    val widthClass: String,
    val heightClass: String
)

private const val MEDIUM_WIDTH_DP = 600f
private const val EXPANDED_WIDTH_DP = 840f
private const val LARGE_WIDTH_DP = 1200f
private const val EXTRA_LARGE_WIDTH_DP = 1600f
private const val MEDIUM_HEIGHT_DP = 480f
private const val EXPANDED_HEIGHT_DP = 900f

internal fun sizeClassOf(widthDp: Float, heightDp: Float) = SizeClass(
    horizontal = if (widthDp >= MEDIUM_WIDTH_DP) "regular" else "compact",
    vertical = if (heightDp >= MEDIUM_HEIGHT_DP) "regular" else "compact",
    widthClass = when {
        widthDp >= EXTRA_LARGE_WIDTH_DP -> "extraLarge"
        widthDp >= LARGE_WIDTH_DP -> "large"
        widthDp >= EXPANDED_WIDTH_DP -> "expanded"
        widthDp >= MEDIUM_WIDTH_DP -> "medium"
        else -> "compact"
    },
    heightClass = when {
        heightDp >= EXPANDED_HEIGHT_DP -> "expanded"
        heightDp >= MEDIUM_HEIGHT_DP -> "medium"
        else -> "compact"
    }
)

internal fun foldStateOf(
    fold: FoldingFeature?,
    density: Float,
    offsetX: Int,
    offsetY: Int,
    cutouts: List<Rect> = emptyList()
): FoldState {
    val cameraBounds = cutouts.map { toCssPixels(it, density, offsetX, offsetY) }
    fold ?: return FoldState.FLAT.copy(cameraBounds = cameraBounds)

    val state = when (fold.state) {
        FoldingFeature.State.HALF_OPENED -> "half-opened"
        else -> "flat"
    }

    val orientation = when (fold.orientation) {
        FoldingFeature.Orientation.HORIZONTAL -> "horizontal"
        else -> "vertical"
    }

    val bounds = toCssPixels(fold.bounds, density, offsetX, offsetY)

    val occluded = if (fold.occlusionType == FoldingFeature.OcclusionType.FULL) {
        bounds
    } else {
        null
    }

    val posture = when {
        fold.state != FoldingFeature.State.HALF_OPENED -> "flat"
        fold.orientation == FoldingFeature.Orientation.HORIZONTAL -> "tabletop"
        else -> "book"
    }

    return FoldState(state, orientation, bounds, occluded, fold.isSeparating, cameraBounds, posture)
}

private fun toCssPixels(rect: Rect, density: Float, offsetX: Int, offsetY: Int) = FoldBounds(
    x = ((rect.left - offsetX) / density).roundToInt(),
    y = ((rect.top - offsetY) / density).roundToInt(),
    width = ((rect.right - rect.left) / density).roundToInt(),
    height = ((rect.bottom - rect.top) / density).roundToInt()
)

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
        if (supportedPostures().isNotEmpty()) return true

        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.R &&
            activity.packageManager.hasSystemFeature(PackageManager.FEATURE_SENSOR_HINGE_ANGLE)
    }

    fun supportsTabletop(): Boolean = SupportedPosture.TABLETOP in supportedPostures()

    fun hasHingeSensor(): Boolean = hingeSensor != null

    fun sizeClass(): SizeClass {
        val bounds = WindowMetricsCalculator.getOrCreate().computeCurrentWindowMetrics(activity).bounds
        val density = activity.resources.displayMetrics.density
        return sizeClassOf(bounds.width() / density, bounds.height() / density)
    }

    fun foldStates(): Flow<FoldState> =
        combine(tracker.windowLayoutInfo(activity), webViewLayouts()) { info, _ -> toFoldState(info) }
            .distinctUntilChanged()

    private fun webViewLayouts(): Flow<Unit> = callbackFlow {
        val listener = View.OnLayoutChangeListener { _, _, _, _, _, _, _, _, _ -> trySend(Unit) }
        trySend(Unit)
        webView.addOnLayoutChangeListener(listener)
        awaitClose { webView.removeOnLayoutChangeListener(listener) }
    }.conflate()

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

    private fun supportedPostures(): List<SupportedPosture> =
        runCatching { tracker.supportedPostures }.getOrDefault(emptyList())

    private fun toFoldState(info: WindowLayoutInfo): FoldState {
        val webViewOffset = IntArray(2).also(webView::getLocationInWindow)
        val cutouts = ViewCompat.getRootWindowInsets(webView)?.displayCutout?.boundingRects.orEmpty()
        return foldStateOf(
            info.displayFeatures.filterIsInstance<FoldingFeature>().firstOrNull(),
            activity.resources.displayMetrics.density,
            webViewOffset[0],
            webViewOffset[1],
            cutouts
        )
    }
}
