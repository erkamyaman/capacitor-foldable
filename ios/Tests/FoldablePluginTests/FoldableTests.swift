import UIKit
import XCTest
@testable import FoldablePlugin

private final class FakeFoldProvider: FoldProvider {
    var isFoldable = true
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
        XCTAssertFalse(Foldable().isDeviceFoldable())
    }

    func testGetFoldStateReportsFlatStub() {
        let implementation = Foldable()

        let result = implementation.getFoldState()

        XCTAssertEqual(result["state"] as? String, "flat")
        XCTAssertEqual(result["isSeparating"] as? Bool, false)
        XCTAssertNil(result["hingeOrientation"])
        XCTAssertNil(result["occludedBounds"])
    }

    func testSizeClassNamesUIKitSizeClasses() {
        let result = Foldable().sizeClass(horizontal: .regular, vertical: .compact)

        XCTAssertEqual(result["horizontal"], "regular")
        XCTAssertEqual(result["vertical"], "compact")
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
        XCTAssertEqual(result["hingeOrientation"] as? String, "vertical")
        XCTAssertEqual(result["hingeBounds"] as? [String: Int], ["x": 400, "y": 0, "width": 20, "height": 700])
        XCTAssertNil(result["occludedBounds"])
        XCTAssertEqual(result["activeDisplay"] as? String, "inner")
        XCTAssertEqual(result["cameraBounds"] as? [[String: Int]], [["x": 10, "y": 10, "width": 40, "height": 40]])
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
        XCTAssertEqual(implementation.getHingeAngle()["angle"] as? Double, 90)
    }
}
