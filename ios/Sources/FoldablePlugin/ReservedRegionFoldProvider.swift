import UIKit

struct ReservedRegion {
    enum Kind {
        case division
        case occlusion
    }

    var kind: Kind
    var frame: CGRect
    var margins: UIEdgeInsets = .zero
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
        return nativeFoldOf(
            regions: source.reservedRegions(in: view),
            hingeStatus: source.hingeStatus,
            hingeAngle: source.hingeAngle
        )
    }

    func hingeAngle() -> Double? {
        return source.hingeAngle
    }

    func hingeStatus() -> String? {
        switch source.hingeStatus {
        case .closed?: return "closed"
        case .partiallyOpen?: return "partiallyOpen"
        case .fullyOpen?: return "fullyOpen"
        case nil: return nil
        }
    }

    func observe(_ view: UIView, onChange: @escaping () -> Void) {
        source.observe(view, onChange: onChange)
    }
}

/// UIKit updates the hinge status lazily, so the angle decides when it disagrees.
private let foldedAngles = 20.0...160.0

func nativeFoldOf(
    regions: [ReservedRegion],
    hingeStatus: HingeStatus?,
    hingeAngle: Double? = nil
) -> NativeFold {
    // UIKit can keep reporting `closed` while the phone is already open, so the
    // angle wins wherever it is known.
    let isClosed = hingeAngle.map { $0 < foldedAngles.lowerBound } ?? (hingeStatus == .closed)
    let divisions = isClosed ? [] : regions.filter { $0.kind == .division }
    let division = divisions.first { $0.isActive } ?? divisions.first
    let isFolded: Bool
    if let angle = hingeAngle, division != nil {
        isFolded = foldedAngles.contains(angle)
    } else {
        switch hingeStatus {
        case .partiallyOpen?:
            isFolded = division != nil
        case .fullyOpen?:
            isFolded = false
        default:
            isFolded = division?.isActive == true
        }
    }

    var fold = NativeFold(state: isFolded ? "half-opened" : "flat", isSeparating: isFolded)
    if let division = division {
        fold.hingeBounds = division.frame
        fold.hingeMargins = division.margins
        fold.hingeOrientation = division.frame.height >= division.frame.width ? "vertical" : "horizontal"
    }
    fold.cameraBounds = regions.filter { $0.kind == .occlusion && $0.isActive }.map { $0.frame }
    fold.regions = regions
    let onInnerDisplay = regions.contains { $0.kind == .division }
    fold.activeDisplay = hingeStatus.map { _ in isClosed || !onInnerDisplay ? "outer" : "inner" }
    return fold
}
