import Foundation
import UIKit
import Capacitor

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(FoldablePlugin)
public class FoldablePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "FoldablePlugin"
    public let jsName = "Foldable"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isDeviceFoldable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getFoldState", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getHingeAngle", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getSizeClass", returnType: CAPPluginReturnPromise)
    ]
    private let implementation = Foldable()
    private var lastSizeClass: [String: String]?

    @objc override public func load() {
        DispatchQueue.main.async { [weak self] in
            self?.observeSizeClass()
        }
    }

    @objc func isDeviceFoldable(_ call: CAPPluginCall) {
        call.resolve(["foldable": implementation.isDeviceFoldable()])
    }

    /// - TODO: Return a real posture once Apple ships public foldable APIs.
    @objc func getFoldState(_ call: CAPPluginCall) {
        call.resolve(implementation.getFoldState())
    }

    @objc func getHingeAngle(_ call: CAPPluginCall) {
        call.resolve(implementation.getHingeAngle())
    }

    @objc func getSizeClass(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            call.resolve(self.currentSizeClass())
        }
    }

    private func currentSizeClass() -> [String: String] {
        let traits = bridge?.viewController?.traitCollection ?? UITraitCollection.current
        return implementation.sizeClass(horizontal: traits.horizontalSizeClass, vertical: traits.verticalSizeClass)
    }

    private func observeSizeClass() {
        guard #available(iOS 17.0, *), let view = bridge?.viewController?.view else { return }

        lastSizeClass = currentSizeClass()
        let traits: [UITrait] = [UITraitHorizontalSizeClass.self, UITraitVerticalSizeClass.self]
        _ = view.registerForTraitChanges(traits) { [weak self] (_: UIView, _: UITraitCollection) in
            self?.notifySizeClassIfChanged()
        }
    }

    private func notifySizeClassIfChanged() {
        let sizeClass = currentSizeClass()
        guard sizeClass != lastSizeClass else { return }

        lastSizeClass = sizeClass
        notifyListeners("sizeClassChange", data: sizeClass)
    }

    /// - TODO: No-op. `foldStateChange` is never emitted on iOS; there is no public
    ///   API to observe a fold posture, so nothing subscribes and nothing fires.
}
