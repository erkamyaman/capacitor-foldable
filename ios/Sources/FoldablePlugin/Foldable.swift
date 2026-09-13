import Foundation

/// Stub implementation.
///
/// - TODO: Implement against Apple's foldable ("iPhone Duo") window APIs once they
///   are publicly documented in a released SDK. Until then this reports a fixed
///   flat state rather than guessing at private or unreleased APIs.
@objc public class Foldable: NSObject {
    /// - TODO: Return true on iPhone Duo once the Xcode 27.1 SDK exposes a posture API.
    @objc public func isDeviceFoldable() -> Bool {
        return false
    }

    @objc public func getFoldState() -> [String: Any] {
        return ["state": "flat", "isSeparating": false]
    }

    @objc public func getHingeAngle() -> [String: Any] {
        return ["angle": NSNull()]
    }
}
