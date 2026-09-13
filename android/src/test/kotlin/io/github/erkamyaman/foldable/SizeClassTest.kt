package io.github.erkamyaman.foldable

import org.junit.Assert.assertEquals
import org.junit.Test

class SizeClassTest {

    @Test
    fun phoneInPortraitIsCompactWidth() {
        assertEquals(SizeClass("compact", "regular", "compact", "expanded"), sizeClassOf(412f, 915f))
    }

    @Test
    fun phoneInLandscapeIsCompactHeight() {
        assertEquals(SizeClass("regular", "compact", "expanded", "compact"), sizeClassOf(915f, 412f))
    }

    @Test
    fun unfoldedFoldableIsMediumInBothDirections() {
        assertEquals(SizeClass("regular", "regular", "medium", "medium"), sizeClassOf(673f, 841f))
    }

    @Test
    fun largeAndExtraLargeWindows() {
        assertEquals(SizeClass("regular", "regular", "large", "medium"), sizeClassOf(1280f, 800f))
        assertEquals(SizeClass("regular", "regular", "extraLarge", "expanded"), sizeClassOf(1920f, 1080f))
    }

    @Test
    fun breakpointsAreInclusive() {
        assertEquals(SizeClass("regular", "regular", "medium", "medium"), sizeClassOf(600f, 480f))
        assertEquals(SizeClass("regular", "regular", "expanded", "expanded"), sizeClassOf(840f, 900f))
        assertEquals(SizeClass("compact", "compact", "compact", "compact"), sizeClassOf(599.9f, 479.9f))
    }
}
