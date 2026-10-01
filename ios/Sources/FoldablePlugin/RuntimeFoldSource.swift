import ObjectiveC
import UIKit

#if !canImport(UIKit, _underlyingVersion: 9127.0.85) && !targetEnvironment(macCatalyst)
@MainActor
final class RuntimeFoldSource: @preconcurrency FoldSource {
    private weak var view: UIView?
    private var interaction: NSObject?
    private var status: Int?
    private var radians: Double?

    private let divisionKind: AnyObject?
    private let occlusionKind: AnyObject?
    private let available: Bool

    nonisolated init() {
        let respondsToRegions = UIView.instancesRespond(to: Selector(("reservedRegionsOfKind:options:")))
        let kindClass: AnyClass? = NSClassFromString("UIViewReservedRegionKind")
        let interactionClass: AnyClass? = NSClassFromString("UIHingeInteraction")

        available = respondsToRegions && kindClass != nil && interactionClass != nil
        divisionKind = kindClass.flatMap { RuntimeFoldSource.kind($0, "divisionRegionKind") }
        occlusionKind = kindClass.flatMap { RuntimeFoldSource.kind($0, "occlusionRegionKind") }
    }

    var hasFold: Bool {
        guard available else { return false }
        if let status = status, status != 0 { return true }
        guard let view = view else { return false }
        return !regions(kind: divisionKind, in: view).isEmpty
    }

    var hingeStatus: HingeStatus? {
        switch status {
        case 1: return .closed
        case 2: return .partiallyOpen
        case 3: return .fullyOpen
        default: return nil
        }
    }

    var hingeAngle: Double? {
        guard let radians = radians, status != nil, status != 0 else { return nil }
        return radians * 180 / .pi
    }

    func reservedRegions(in view: UIView) -> [ReservedRegion] {
        return regions(kind: divisionKind, in: view).map { read($0, as: .division) }
            + regions(kind: occlusionKind, in: view).map { read($0, as: .occlusion) }
    }

    func observe(_ view: UIView, onChange: @escaping () -> Void) {
        self.view = view
        guard available, let interactionClass = NSClassFromString("UIHingeInteraction") as? NSObject.Type else { return }

        let handler: @convention(block) (AnyObject?, AnyObject?) -> Void = { [weak self] _, update in
            MainActor.assumeIsolated {
                self?.read(update)
                onChange()
            }
        }
        let allocated = interactionClass.perform(Selector(("alloc")))?.takeUnretainedValue() as? NSObject
        let interaction = allocated?
            .perform(Selector(("initWithUpdateHandler:")), with: handler)?
            .takeUnretainedValue() as? NSObject
        guard let interaction = interaction else { return }

        view.perform(Selector(("addInteraction:")), with: interaction)
        self.interaction = interaction
    }

    private func read(_ update: AnyObject?) {
        guard let hinge = update?.value(forKey: "hinge") as AnyObject? else {
            status = nil
            radians = nil
            return
        }
        status = (hinge.value(forKey: "status") as? NSNumber)?.intValue
        radians = (hinge.value(forKey: "angle") as? NSNumber)?.doubleValue
    }

    private func regions(kind: AnyObject?, in view: UIView) -> [AnyObject] {
        guard available, let kind = kind else { return [] }
        let selector = Selector(("reservedRegionsOfKind:options:"))
        typealias Call = @convention(c) (AnyObject, Selector, AnyObject, UInt) -> AnyObject?
        guard let method = view.method(for: selector) else { return [] }
        let call = unsafeBitCast(method, to: Call.self)
        return call(view, selector, kind, 1) as? [AnyObject] ?? []
    }

    private func read(_ region: AnyObject, as kind: ReservedRegion.Kind) -> ReservedRegion {
        let frame = (region.value(forKey: "frame") as? NSValue)?.cgRectValue ?? .zero
        let margins = (region.value(forKey: "margins") as? NSValue)?.uiEdgeInsetsValue ?? .zero
        let isActive = (region.value(forKey: "isActive") as? NSNumber)?.boolValue ?? false
        return ReservedRegion(kind: kind, frame: frame, margins: margins, isActive: isActive)
    }

    nonisolated private static func kind(_ owner: AnyClass, _ name: String) -> AnyObject? {
        let selector = Selector((name))
        guard owner.responds(to: selector) else { return nil }
        return (owner as AnyObject).perform(selector)?.takeUnretainedValue()
    }
}
#endif
