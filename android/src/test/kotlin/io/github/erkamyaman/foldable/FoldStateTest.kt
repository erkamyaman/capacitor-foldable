package io.github.erkamyaman.foldable

import android.graphics.Rect
import androidx.window.layout.FoldingFeature
import androidx.window.layout.FoldingFeature.OcclusionType
import androidx.window.layout.FoldingFeature.Orientation
import androidx.window.layout.FoldingFeature.State
import org.junit.Assert.assertEquals
import org.junit.Test

class FoldStateTest {

    private fun rect(left: Int, top: Int, right: Int, bottom: Int) = Rect().also {
        it.left = left
        it.top = top
        it.right = right
        it.bottom = bottom
    }

    private fun fold(
        left: Int,
        top: Int,
        right: Int,
        bottom: Int,
        foldState: State = State.HALF_OPENED,
        foldOrientation: Orientation = Orientation.VERTICAL,
        occlusion: OcclusionType = OcclusionType.NONE
    ): FoldingFeature = object : FoldingFeature {
        override val bounds = rect(left, top, right, bottom)
        override val state = foldState
        override val orientation = foldOrientation
        override val occlusionType = occlusion
        override val isSeparating = foldState == State.HALF_OPENED || occlusion == OcclusionType.FULL
    }

    @Test
    fun noFoldIsFlat() {
        assertEquals(FoldState.FLAT, foldStateOf(null, density = 2f, offsetX = 0, offsetY = 0))
    }

    @Test
    fun halfOpenedVerticalFoldIsBookAndSeparates() {
        val result = foldStateOf(fold(840, 0, 840, 1800), density = 2f, offsetX = 0, offsetY = 0)

        assertEquals(
            FoldState(
                "half-opened",
                "vertical",
                FoldBounds(420, 0, 0, 900),
                null,
                isSeparating = true,
                posture = "book"
            ),
            result
        )
    }

    @Test
    fun halfOpenedHorizontalFoldIsTabletop() {
        val result = foldStateOf(
            fold(0, 900, 1600, 900, foldOrientation = Orientation.HORIZONTAL),
            density = 2f,
            offsetX = 0,
            offsetY = 0
        )

        assertEquals("tabletop", result.posture)
    }

    @Test
    fun flatSeamlessFoldDoesNotSeparate() {
        val result = foldStateOf(fold(840, 0, 840, 1800, State.FLAT), density = 2f, offsetX = 0, offsetY = 0)

        assertEquals(
            FoldState("flat", "vertical", FoldBounds(420, 0, 0, 900), null, isSeparating = false),
            result
        )
    }

    @Test
    fun hingeWithAGapIsOccludedAndSeparates() {
        val hinge = fold(0, 1000, 1600, 1040, State.FLAT, Orientation.HORIZONTAL, OcclusionType.FULL)
        val bounds = FoldBounds(0, 500, 800, 20)

        assertEquals(
            FoldState("flat", "horizontal", bounds, bounds, isSeparating = true),
            foldStateOf(hinge, density = 2f, offsetX = 0, offsetY = 0)
        )
    }

    @Test
    fun boundsAreRelativeToTheWebView() {
        val result = foldStateOf(fold(840, 0, 840, 1800), density = 2f, offsetX = 40, offsetY = 100)

        assertEquals(FoldBounds(400, -50, 0, 900), result.hingeBounds)
    }

    @Test
    fun displayCutoutsBecomeCameraBoundsRelativeToTheWebView() {
        val result = foldStateOf(
            null,
            density = 2f,
            offsetX = 0,
            offsetY = 100,
            cutouts = listOf(rect(500, 0, 580, 80))
        )

        assertEquals("flat", result.state)
        assertEquals(listOf(FoldBounds(250, -50, 40, 40)), result.cameraBounds)
    }
}
