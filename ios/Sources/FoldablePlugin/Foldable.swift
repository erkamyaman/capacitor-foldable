import Foundation
import UIKit

struct NativeFold {
    var state: String
    var isSeparating: Bool
    var hingeOrientation: String?
    var hingeBounds: CGRect?
    var occludedBounds: CGRect?
    var activeDisplay: String?
    var cameraBounds: [CGRect] = []
}

protocol FoldProvider {
    var isFoldable: Bool { get }
    func fold(in view: UIView?) -> NativeFold?
    func hingeAngle() -> Double?
    func observe(_ view: UIView, onChange: @escaping () -> Void)
}

/// - TODO: Replace with a provider backed by Apple's foldable ("iPhone Duo") APIs once
///   they are publicly documented in a released SDK. Until then this reports no fold
///   rather than guessing at private or unreleased APIs.
struct UnsupportedFoldProvider: FoldProvider {
    var isFoldable: Bool { false }

    func fold(in view: UIView?) -> NativeFold? {
        return nil
    }

    func hingeAngle() -> Double? {
        return nil
    }

    func observe(_ view: UIView, onChange: @escaping () -> Void) {}
}

@objc public class Foldable: NSObject {
    private let provider: FoldProvider

    init(provider: FoldProvider) {
        self.provider = provider
        super.init()
    }

    override public convenience init() {
        self.init(provider: UnsupportedFoldProvider())
    }

    @objc public func isDeviceFoldable() -> Bool {
        return provider.isFoldable
    }

    public func getFoldState(in view: UIView? = nil) -> [String: Any] {
        guard let fold = provider.fold(in: view) else {
            return ["state": "flat", "isSeparating": false]
        }

        var result: [String: Any] = ["state": fold.state, "isSeparating": fold.isSeparating]
        result["hingeOrientation"] = fold.hingeOrientation
        result["hingeBounds"] = fold.hingeBounds.map(bounds(of:))
        result["occludedBounds"] = fold.occludedBounds.map(bounds(of:))
        result["activeDisplay"] = fold.activeDisplay
        if !fold.cameraBounds.isEmpty {
            result["cameraBounds"] = fold.cameraBounds.map(bounds(of:))
        }
        return result
    }

    @objc public func getHingeAngle() -> [String: Any] {
        return ["angle": provider.hingeAngle().map { $0 as Any } ?? NSNull()]
    }

    public func observeChanges(in view: UIView, onChange: @escaping () -> Void) {
        provider.observe(view, onChange: onChange)
    }

    @objc public func sizeClass(horizontal: UIUserInterfaceSizeClass, vertical: UIUserInterfaceSizeClass) -> [String: String] {
        return ["horizontal": name(of: horizontal), "vertical": name(of: vertical)]
    }

    private func name(of sizeClass: UIUserInterfaceSizeClass) -> String {
        return sizeClass == .regular ? "regular" : "compact"
    }

    private func bounds(of rect: CGRect) -> [String: Int] {
        return [
            "x": Int(rect.origin.x.rounded()),
            "y": Int(rect.origin.y.rounded()),
            "width": Int(rect.size.width.rounded()),
            "height": Int(rect.size.height.rounded())
        ]
    }
}
