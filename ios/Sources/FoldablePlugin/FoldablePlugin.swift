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
    private var lastFoldState: [String: Any]?
    private var orientationObserver: NSObjectProtocol?

    @objc override public func load() {
        DispatchQueue.main.async { [weak self] in
            self?.observeChanges()
        }
    }

    deinit {
        if let orientationObserver = orientationObserver {
            NotificationCenter.default.removeObserver(orientationObserver)
            UIDevice.current.endGeneratingDeviceOrientationNotifications()
        }
    }

    @objc func isDeviceFoldable(_ call: CAPPluginCall) {
        call.resolve(["foldable": implementation.isDeviceFoldable()])
    }

    @objc func getFoldState(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            call.resolve(self.currentFoldState())
        }
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

    private func currentFoldState() -> [String: Any] {
        return implementation.getFoldState(in: bridge?.webView)
    }

    private func currentSizeClass() -> [String: String] {
        let traits = bridge?.viewController?.traitCollection ?? UITraitCollection.current
        return implementation.sizeClass(horizontal: traits.horizontalSizeClass, vertical: traits.verticalSizeClass)
    }

    private func observeChanges() {
        guard let view = bridge?.viewController?.view else { return }

        lastFoldState = currentFoldState()
        implementation.observeChanges(in: view) { [weak self] in
            self?.notifyFoldStateIfChanged()
        }

        UIDevice.current.beginGeneratingDeviceOrientationNotifications()
        orientationObserver = NotificationCenter.default.addObserver(
            forName: UIDevice.orientationDidChangeNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.notifyFoldStateIfChanged()
        }

        guard #available(iOS 17.0, *) else { return }

        lastSizeClass = currentSizeClass()
        let traits: [UITrait] = [UITraitHorizontalSizeClass.self, UITraitVerticalSizeClass.self]
        _ = view.registerForTraitChanges(traits) { [weak self] (_: UIView, _: UITraitCollection) in
            self?.notifySizeClassIfChanged()
            self?.notifyFoldStateIfChanged()
        }
    }

    private func notifyFoldStateIfChanged() {
        let foldState = currentFoldState()
        if let last = lastFoldState, (last as NSDictionary).isEqual(to: foldState) { return }

        lastFoldState = foldState
        notifyListeners("foldStateChange", data: foldState)
    }

    private func notifySizeClassIfChanged() {
        let sizeClass = currentSizeClass()
        guard sizeClass != lastSizeClass else { return }

        lastSizeClass = sizeClass
        notifyListeners("sizeClassChange", data: sizeClass)
    }
}
