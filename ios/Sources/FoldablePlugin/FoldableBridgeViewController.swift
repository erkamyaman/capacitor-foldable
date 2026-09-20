import Capacitor
import UIKit

/// Drop-in replacement for `CAPBridgeViewController` that lets JavaScript decide
/// whether iPhone Duo may move bars to the side, through
/// `setVerticalBarBehavior()`. Set this class on the view controller in
/// `Main.storyboard` to use it.
@objc(FoldableBridgeViewController)
public class FoldableBridgeViewController: CAPBridgeViewController {
    /// `nil` leaves the system default in place.
    static var verticalBarsDisabled = false

    static weak var current: FoldableBridgeViewController?

    public override func viewDidLoad() {
        super.viewDidLoad()
        Self.current = self
    }

    #if canImport(UIKit, _underlyingVersion: 9127.0.85) && !targetEnvironment(macCatalyst)
    @available(iOS 27.1, *)
    public override var preferredVerticalBarBehavior: UIVerticalBarBehavior {
        Self.verticalBarsDisabled ? .disabled : .automatic
    }
    #endif

    /// Applies a new behaviour, and returns whether this controller is in use.
    @discardableResult
    static func apply(disabled: Bool) -> Bool {
        verticalBarsDisabled = disabled

        guard let controller = current else { return false }

        #if canImport(UIKit, _underlyingVersion: 9127.0.85) && !targetEnvironment(macCatalyst)
        if #available(iOS 27.1, *) {
            controller.setNeedsUpdateOfVerticalBarConfiguration()
        }
        #endif
        return true
    }
}
