import UIKit
import XCTest
@testable import FoldablePlugin

private final class FakeFoldSource: FoldSource {
    var hasFold = true
    var hingeStatus: HingeStatus?
    var hingeAngle: Double?
    var regions: [ReservedRegion] = []

    func reservedRegions(in view: UIView) -> [ReservedRegion] {
        return regions
    }

    func observe(_ view: UIView, onChange: @escaping () -> Void) {}
}

class ReservedRegionFoldProviderTests: XCTestCase {
    private let view = UIView(frame: CGRect(x: 0, y: 0, width: 626, height: 890))

    private func foldState(_ source: FakeFoldSource) -> [String: Any] {
        return Foldable(provider: ReservedRegionFoldProvider(source: source)).getFoldState(in: view)
    }

    func testActiveVerticalDivisionIsHalfOpenedBook() {
        let source = FakeFoldSource()
        source.hingeStatus = .partiallyOpen
        source.regions = [ReservedRegion(kind: .division, frame: CGRect(x: 313, y: 0, width: 0, height: 890), isActive: true)]

        let result = foldState(source)

        XCTAssertEqual(result["state"] as? String, "half-opened")
        XCTAssertEqual(result["isSeparating"] as? Bool, true)
        XCTAssertEqual(result["posture"] as? String, "book")
        XCTAssertEqual(result["hingeOrientation"] as? String, "vertical")
        XCTAssertEqual(result["hingeBounds"] as? [String: Int], ["x": 313, "y": 0, "width": 0, "height": 890])
        XCTAssertEqual(result["activeDisplay"] as? String, "inner")
    }

    func testActiveHorizontalDivisionIsTabletop() {
        let source = FakeFoldSource()
        source.regions = [ReservedRegion(kind: .division, frame: CGRect(x: 0, y: 313, width: 890, height: 0), isActive: true)]

        let result = foldState(source)

        XCTAssertEqual(result["posture"] as? String, "tabletop")
        XCTAssertEqual(result["hingeOrientation"] as? String, "horizontal")
    }

    func testInactiveDivisionIsFlatWithHinge() {
        let source = FakeFoldSource()
        source.hingeStatus = .fullyOpen
        source.regions = [ReservedRegion(kind: .division, frame: CGRect(x: 313, y: 0, width: 0, height: 890), isActive: false)]

        let result = foldState(source)

        XCTAssertEqual(result["state"] as? String, "flat")
        XCTAssertEqual(result["isSeparating"] as? Bool, false)
        XCTAssertEqual(result["posture"] as? String, "flat")
        XCTAssertEqual(result["hingeOrientation"] as? String, "vertical")
        XCTAssertNotNil(result["hingeBounds"])
    }

    func testActiveDivisionWinsOverInactiveOne() {
        let source = FakeFoldSource()
        source.regions = [
            ReservedRegion(kind: .division, frame: CGRect(x: 313, y: 0, width: 0, height: 890), isActive: false),
            ReservedRegion(kind: .division, frame: CGRect(x: 0, y: 445, width: 626, height: 0), isActive: true)
        ]

        XCTAssertEqual(foldState(source)["posture"] as? String, "tabletop")
    }

    func testClosedHingeIsOuterDisplayWithoutFold() {
        let source = FakeFoldSource()
        source.hingeStatus = .closed
        source.regions = [ReservedRegion(kind: .division, frame: CGRect(x: 233, y: 0, width: 0, height: 678), isActive: false)]

        let result = foldState(source)

        XCTAssertEqual(result["state"] as? String, "flat")
        XCTAssertNil(result["hingeBounds"])
        XCTAssertEqual(result["activeDisplay"] as? String, "outer")
    }

    func testActiveOcclusionsBecomeCameraBounds() {
        let source = FakeFoldSource()
        source.regions = [
            ReservedRegion(kind: .occlusion, frame: CGRect(x: 280, y: 10, width: 60, height: 30), isActive: true),
            ReservedRegion(kind: .occlusion, frame: CGRect(x: 500, y: 10, width: 40, height: 40), isActive: false)
        ]

        let result = foldState(source)

        XCTAssertEqual(result["cameraBounds"] as? [[String: Int]], [["x": 280, "y": 10, "width": 60, "height": 30]])
        XCTAssertNil(result["activeDisplay"])
    }

    func testDeviceWithoutFoldReportsStub() {
        let source = FakeFoldSource()
        source.hasFold = false
        source.regions = [ReservedRegion(kind: .division, frame: CGRect(x: 313, y: 0, width: 0, height: 890), isActive: true)]

        let implementation = Foldable(provider: ReservedRegionFoldProvider(source: source))

        XCTAssertFalse(implementation.isDeviceFoldable())
        XCTAssertFalse(implementation.supportsTabletop())
        XCTAssertEqual(implementation.getFoldState(in: view)["state"] as? String, "flat")
        XCTAssertNil(implementation.getFoldState(in: view)["hingeBounds"])
    }

    func testHingeAngleComesFromSource() {
        let source = FakeFoldSource()
        source.hingeAngle = 95

        let implementation = Foldable(provider: ReservedRegionFoldProvider(source: source))

        XCTAssertEqual(implementation.getHingeAngle()["angle"] as? Double, 95)
    }
}
