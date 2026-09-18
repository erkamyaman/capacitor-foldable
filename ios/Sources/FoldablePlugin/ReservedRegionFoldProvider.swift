import UIKit

struct ReservedRegion {
    enum Kind {
        case division
        case occlusion
    }

    var kind: Kind
    var frame: CGRect
    var isActive: Bool
}

enum HingeStatus {
    case closed
    case partiallyOpen
    case fullyOpen
}

protocol FoldSource {
    var hasFold: Bool { get }
    var hingeStatus: HingeStatus? { get }
    var hingeAngle: Double? { get }
    func reservedRegions(in view: UIView) -> [ReservedRegion]
    func observe(_ view: UIView, onChange: @escaping () -> Void)
}

struct ReservedRegionFoldProvider: FoldProvider {
    let source: FoldSource

    var isFoldable: Bool { source.hasFold }
    var supportsTabletop: Bool { source.hasFold }

    func fold(in view: UIView?) -> NativeFold? {
        guard source.hasFold, let view = view else { return nil }
        return nativeFoldOf(regions: source.reservedRegions(in: view), hingeStatus: source.hingeStatus)
    }

    func hingeAngle() -> Double? {
        return source.hingeAngle
    }

    func observe(_ view: UIView, onChange: @escaping () -> Void) {
        source.observe(view, onChange: onChange)
    }
}

func nativeFoldOf(regions: [ReservedRegion], hingeStatus: HingeStatus?) -> NativeFold {
    let divisions = hingeStatus == .closed ? [] : regions.filter { $0.kind == .division }
    let division = divisions.first { $0.isActive } ?? divisions.first
    let isFolded: Bool
    switch hingeStatus {
    case .partiallyOpen?:
        isFolded = division != nil
    case .fullyOpen?:
        isFolded = false
    default:
        isFolded = division?.isActive == true
    }

    var fold = NativeFold(state: isFolded ? "half-opened" : "flat", isSeparating: isFolded)
    if let division = division {
        fold.hingeBounds = division.frame
        fold.hingeOrientation = division.frame.height >= division.frame.width ? "vertical" : "horizontal"
    }
    fold.cameraBounds = regions.filter { $0.kind == .occlusion && $0.isActive }.map { $0.frame }
    fold.activeDisplay = hingeStatus.map { $0 == .closed ? "outer" : "inner" }
    return fold
}
