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
    var supportsTabletop: Bool { get }
    func fold(in view: UIView?) -> NativeFold?
    func hingeAngle() -> Double?
    func observe(_ view: UIView, onChange: @escaping () -> Void)
}

struct UnsupportedFoldProvider: FoldProvider {
    var isFoldable: Bool { false }
    var supportsTabletop: Bool { false }

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
        self.init(provider: Foldable.defaultProvider())
    }

    private static func defaultProvider() -> FoldProvider {
        #if canImport(UIKit, _underlyingVersion: 9127.1) && !targetEnvironment(macCatalyst)
        if #available(iOS 27.1, *) {
            return ReservedRegionFoldProvider(source: UIKitFoldSource())
        }
        #endif
        return UnsupportedFoldProvider()
    }

    @objc public func isDeviceFoldable() -> Bool {
        return provider.isFoldable
    }

    @objc public func supportsTabletop() -> Bool {
        return provider.supportsTabletop
    }

    public func getFoldState(in view: UIView? = nil) -> [String: Any] {
        guard let fold = provider.fold(in: view) else {
            return ["state": "flat", "isSeparating": false, "posture": "flat"]
        }

        var result: [String: Any] = [
            "state": fold.state,
            "isSeparating": fold.isSeparating,
            "posture": posture(of: fold)
        ]
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

    @objc public func barPlacement(in traits: UITraitCollection) -> [String: Any] {
        return ["verticalBarEdge": verticalBarEdge(of: traits).map { $0 as Any } ?? NSNull()]
    }

    private func verticalBarEdge(of traits: UITraitCollection) -> String? {
        #if canImport(UIKit, _underlyingVersion: 9127.1) && !targetEnvironment(macCatalyst)
        if #available(iOS 27.1, *) {
            switch traits.verticalBarEdge {
            case .leading: return "leading"
            case .trailing: return "trailing"
            default: return nil
            }
        }
        #endif
        return nil
    }

    public func observeChanges(in view: UIView, onChange: @escaping () -> Void) {
        provider.observe(view, onChange: onChange)
    }

    @objc public func sizeClass(
        horizontal: UIUserInterfaceSizeClass,
        vertical: UIUserInterfaceSizeClass,
        width: CGFloat,
        height: CGFloat
    ) -> [String: String] {
        return [
            "horizontal": name(of: horizontal),
            "vertical": name(of: vertical),
            "widthClass": widthClass(of: width),
            "heightClass": heightClass(of: height)
        ]
    }

    private func name(of sizeClass: UIUserInterfaceSizeClass) -> String {
        return sizeClass == .regular ? "regular" : "compact"
    }

    private func widthClass(of width: CGFloat) -> String {
        if width >= 1600 { return "extraLarge" }
        if width >= 1200 { return "large" }
        if width >= 840 { return "expanded" }
        if width >= 600 { return "medium" }
        return "compact"
    }

    private func heightClass(of height: CGFloat) -> String {
        if height >= 900 { return "expanded" }
        if height >= 480 { return "medium" }
        return "compact"
    }

    private func posture(of fold: NativeFold) -> String {
        guard fold.state == "half-opened" else { return "flat" }
        return fold.hingeOrientation == "horizontal" ? "tabletop" : "book"
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
