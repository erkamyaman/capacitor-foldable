package io.github.erkamyaman.foldable

import org.junit.Assert.assertEquals
import org.junit.Test

class SizeClassTest {

    @Test
    fun phoneInPortraitIsCompactWidth() {
        assertEquals(SizeClass("compact", "regular"), sizeClassOf(412f, 915f))
    }

    @Test
    fun phoneInLandscapeIsCompactHeight() {
        assertEquals(SizeClass("regular", "compact"), sizeClassOf(915f, 412f))
    }

    @Test
    fun unfoldedFoldableIsRegular() {
        assertEquals(SizeClass("regular", "regular"), sizeClassOf(673f, 841f))
    }

    @Test
    fun breakpointsAreInclusive() {
        assertEquals(SizeClass("regular", "regular"), sizeClassOf(600f, 480f))
        assertEquals(SizeClass("compact", "compact"), sizeClassOf(599.9f, 479.9f))
    }
}
