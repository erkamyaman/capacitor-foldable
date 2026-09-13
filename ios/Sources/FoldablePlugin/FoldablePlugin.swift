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
        CAPPluginMethod(name: "getSizeClass", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getDisplayModes", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startRearDisplay", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopRearDisplay", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startDualScreen", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopDualScreen", returnType: CAPPluginReturnPromise)
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
        call.resolve([
            "foldable": implementation.isDeviceFoldable(),
            "supportsTabletop": implementation.supportsTabletop()
        ])
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

    @objc func getDisplayModes(_ call: CAPPluginCall) {
        call.resolve(["rearDisplay": "unsupported", "dualScreen": "unsupported"])
    }

    @objc func startRearDisplay(_ call: CAPPluginCall) {
        call.unavailable("Rear display mode is only available on Android.")
    }

    @objc func stopRearDisplay(_ call: CAPPluginCall) {
        call.resolve()
    }

    @objc func startDualScreen(_ call: CAPPluginCall) {
        call.unavailable("Dual-screen mode is only available on Android.")
    }

    @objc func stopDualScreen(_ call: CAPPluginCall) {
        call.resolve()
    }

    private func currentFoldState() -> [String: Any] {
        return implementation.getFoldState(in: bridge?.webView)
    }

    private func currentSizeClass() -> [String: String] {
        let traits = bridge?.viewController?.traitCollection ?? UITraitCollection.current
        let size = bridge?.viewController?.view.bounds.size ?? .zero
        return implementation.sizeClass(
            horizontal: traits.horizontalSizeClass,
            vertical: traits.verticalSizeClass,
            width: size.width,
            height: size.height
        )
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
            self?.notifySizeClassIfChanged()
        }

        guard #available(iOS 17.0, *) else { return }

        lastSizeClass = currentSizeClass()
        let traits: [UITrait] = [UITraitHorizontalSizeClass.self, UITraitVerticalSizeClass.self]
        MainActor.assumeIsolated {
            _ = view.registerForTraitChanges(traits) { [weak self] (_: UIView, _: UITraitCollection) in
                self?.notifySizeClassIfChanged()
                self?.notifyFoldStateIfChanged()
            }
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
