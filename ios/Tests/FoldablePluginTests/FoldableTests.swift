import XCTest
@testable import FoldablePlugin

class FoldableTests: XCTestCase {
    func testGetFoldStateReportsFlatStub() {
        let implementation = Foldable()

        let result = implementation.getFoldState()

        XCTAssertEqual(result["state"] as? String, "flat")
        XCTAssertNil(result["hingeOrientation"])
        XCTAssertNil(result["occludedBounds"])
    }
}
