import Foundation

/// Stub implementation.
///
/// - TODO: Implement against Apple's foldable ("iPhone Duo") window APIs once they
///   are publicly documented in a released SDK. Until then this reports a fixed
///   flat state rather than guessing at private or unreleased APIs.
@objc public class Foldable: NSObject {
    @objc public func getFoldState() -> [String: Any] {
        return ["state": "flat"]
    }
}
