import UIKit

#if canImport(UIKit, _underlyingVersion: 9127.0.85) && !targetEnvironment(macCatalyst)
@available(iOS 27.1, *)
@MainActor
final class UIKitFoldSource: @preconcurrency FoldSource {
    private weak var view: UIView?
    private var interaction: UIHingeInteraction?
    private var hinge: (status: UIHinge.Status, angle: CGFloat)?

    nonisolated init() {}

    var hasFold: Bool {
        if let status = hinge?.status, status != .unknown { return true }
        guard let view = view else { return false }
        return !view.reservedRegions(kind: .division, options: .includeInactive).isEmpty
    }

    var hingeStatus: HingeStatus? {
        switch hinge?.status {
        case .closed: return .closed
        case .partiallyOpen: return .partiallyOpen
        case .fullyOpen: return .fullyOpen
        default: return nil
        }
    }

    var hingeAngle: Double? {
        guard let hinge = hinge, hinge.status != .unknown else { return nil }
        return Double(hinge.angle) * 180 / .pi
    }

    func reservedRegions(in view: UIView) -> [ReservedRegion] {
        let divisions = view.reservedRegions(kind: .division, options: .includeInactive).map {
            ReservedRegion(kind: .division, frame: $0.frame, margins: $0.margins, isActive: $0.isActive)
        }
        let occlusions = view.reservedRegions(kind: .occlusion, options: .includeInactive).map {
            ReservedRegion(kind: .occlusion, frame: $0.frame, margins: $0.margins, isActive: $0.isActive)
        }
        return divisions + occlusions
    }

    func observe(_ view: UIView, onChange: @escaping () -> Void) {
        self.view = view
        let interaction = UIHingeInteraction { [weak self] _, update in
            self?.hinge = update.hinge.map { ($0.status, $0.angle) }
            onChange()
        }
        view.addInteraction(interaction)
        self.interaction = interaction
    }
}
#endif
