import UIKit
import XCTest
@testable import FoldablePlugin

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
}
