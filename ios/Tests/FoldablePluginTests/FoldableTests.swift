import UIKit
import XCTest
@testable import FoldablePlugin

private final class FakeFoldProvider: FoldProvider {
    var isFoldable = true
    var supportsTabletop = true
    var reportedFold: NativeFold?
    var angle: Double?

    func fold(in view: UIView?) -> NativeFold? {
        return reportedFold
    }

    func hingeAngle() -> Double? {
        return angle
    }

    func observe(_ view: UIView, onChange: @escaping () -> Void) {}
}

class FoldableTests: XCTestCase {
    func testIsDeviceFoldableReportsFalseStub() {
        let implementation = Foldable()

        XCTAssertFalse(implementation.isDeviceFoldable())
        XCTAssertFalse(implementation.supportsTabletop())
    }

    func testGetFoldStateReportsFlatStub() {
        let result = Foldable().getFoldState()

        XCTAssertEqual(result["state"] as? String, "flat")
        XCTAssertEqual(result["isSeparating"] as? Bool, false)
        XCTAssertEqual(result["posture"] as? String, "flat")
        XCTAssertNil(result["hingeOrientation"])
        XCTAssertNil(result["occludedBounds"])
    }

    func testSizeClassNamesUIKitSizeClassesAndWindowClasses() {
        let result = Foldable().sizeClass(horizontal: .regular, vertical: .regular, width: 626, height: 890)

        XCTAssertEqual(result["horizontal"], "regular")
        XCTAssertEqual(result["vertical"], "regular")
        XCTAssertEqual(result["widthClass"], "medium")
        XCTAssertEqual(result["heightClass"], "medium")
    }

    func testBarPlacementIsHorizontalWithoutVerticalBars() {
        XCTAssertTrue(Foldable().barPlacement(in: UITraitCollection())["verticalBarEdge"] is NSNull)
    }

    func testGetHingeAngleReportsNullStub() {
        XCTAssertTrue(Foldable().getHingeAngle()["angle"] is NSNull)
    }

    func testGetFoldStateMapsProviderFold() {
        let provider = FakeFoldProvider()
        provider.reportedFold = NativeFold(
            state: "half-opened",
            isSeparating: true,
            hingeOrientation: "vertical",
            hingeBounds: CGRect(x: 400.4, y: 0, width: 20, height: 700),
            activeDisplay: "inner",
            cameraBounds: [CGRect(x: 10, y: 10, width: 40, height: 40)]
        )

        let result = Foldable(provider: provider).getFoldState()

        XCTAssertEqual(result["state"] as? String, "half-opened")
        XCTAssertEqual(result["isSeparating"] as? Bool, true)
        XCTAssertEqual(result["posture"] as? String, "book")
        XCTAssertEqual(result["hingeOrientation"] as? String, "vertical")
        XCTAssertEqual(result["hingeBounds"] as? [String: Int], ["x": 400, "y": 0, "width": 20, "height": 700])
        XCTAssertNil(result["occludedBounds"])
        XCTAssertEqual(result["activeDisplay"] as? String, "inner")
        XCTAssertEqual(result["cameraBounds"] as? [[String: Int]], [["x": 10, "y": 10, "width": 40, "height": 40]])
    }

    func testHorizontalHalfOpenedFoldIsTabletop() {
        let provider = FakeFoldProvider()
        provider.reportedFold = NativeFold(state: "half-opened", isSeparating: true, hingeOrientation: "horizontal")

        XCTAssertEqual(Foldable(provider: provider).getFoldState()["posture"] as? String, "tabletop")
    }

    func testFoldStateOmitsCameraBoundsWhenThereAreNone() {
        let provider = FakeFoldProvider()
        provider.reportedFold = NativeFold(state: "flat", isSeparating: false)

        XCTAssertNil(Foldable(provider: provider).getFoldState()["cameraBounds"])
    }

    func testIsDeviceFoldableAndHingeAngleReadProvider() {
        let provider = FakeFoldProvider()
        provider.angle = 90

        let implementation = Foldable(provider: provider)

        XCTAssertTrue(implementation.isDeviceFoldable())
        XCTAssertTrue(implementation.supportsTabletop())
        XCTAssertEqual(implementation.getHingeAngle()["angle"] as? Double, 90)
    }
}
