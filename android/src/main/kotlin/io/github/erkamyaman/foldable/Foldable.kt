package io.github.erkamyaman.foldable

import android.app.Activity
import androidx.window.layout.FoldingFeature
import androidx.window.layout.WindowInfoTracker
import androidx.window.layout.WindowLayoutInfo
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlin.math.roundToInt

data class FoldBounds(val x: Int, val y: Int, val width: Int, val height: Int)

data class FoldState(
    val state: String,
    val hingeOrientation: String? = null,
    val occludedBounds: FoldBounds? = null
) {
    companion object {
        val FLAT = FoldState("flat")
    }
}

class Foldable(private val activity: Activity) {

    private val tracker = WindowInfoTracker.getOrCreate(activity)

    fun foldStates(): Flow<FoldState> =
        tracker.windowLayoutInfo(activity).map(::toFoldState).distinctUntilChanged()

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

        val occluded = if (fold.occlusionType == FoldingFeature.OcclusionType.FULL) {
            toCssPixels(fold.bounds)
        } else {
            null
        }

        return FoldState(state, orientation, occluded)
    }

    private fun toCssPixels(bounds: android.graphics.Rect): FoldBounds {
        val density = activity.resources.displayMetrics.density
        return FoldBounds(
            x = (bounds.left / density).roundToInt(),
            y = (bounds.top / density).roundToInt(),
            width = (bounds.width() / density).roundToInt(),
            height = (bounds.height() / density).roundToInt()
        )
    }
}
