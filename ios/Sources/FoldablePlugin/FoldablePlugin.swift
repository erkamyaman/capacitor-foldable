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
        CAPPluginMethod(name: "getBarPlacement", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startRearDisplay", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopRearDisplay", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startDualScreen", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopDualScreen", returnType: CAPPluginReturnPromise)
    ]
    private let implementation = Foldable()
    private var lastSizeClass: [String: String]?
    private var lastFoldState: [String: Any]?
    private var lastBarPlacement: [String: Any]?
    private var lastHingeAngle: Double?
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
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            call.resolve([
                "foldable": self.implementation.isDeviceFoldable(),
                "supportsTabletop": self.implementation.supportsTabletop()
            ])
        }
    }

    @objc func getFoldState(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            call.resolve(self.currentFoldState())
        }
    }

    @objc func getHingeAngle(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            call.resolve(self.implementation.getHingeAngle())
        }
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

    @objc func getBarPlacement(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            call.resolve(self.currentBarPlacement())
        }
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

    private func currentBarPlacement() -> [String: Any] {
        return implementation.barPlacement(in: bridge?.viewController?.traitCollection ?? UITraitCollection.current)
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
        lastBarPlacement = currentBarPlacement()
        implementation.observeChanges(in: view) { [weak self] in
            self?.notifyFoldStateNowAndAfterSettling()
            self?.notifyHingeAngleIfChanged()
        }

        UIDevice.current.beginGeneratingDeviceOrientationNotifications()
        orientationObserver = NotificationCenter.default.addObserver(
            forName: UIDevice.orientationDidChangeNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.notifyFoldStateNowAndAfterSettling()
            self?.notifySizeClassIfChanged()
            self?.notifyBarPlacementIfChanged()
        }

        guard #available(iOS 17.0, *) else { return }

        lastSizeClass = currentSizeClass()
        MainActor.assumeIsolated {
            var traits: [UITrait] = [UITraitHorizontalSizeClass.self, UITraitVerticalSizeClass.self]
            #if canImport(UIKit, _underlyingVersion: 9127.0.85) && !targetEnvironment(macCatalyst)
            if #available(iOS 27.1, *) {
                traits += UITraitCollection.systemTraitsAffectingVerticalBarEdge
            }
            #endif
            _ = view.registerForTraitChanges(traits) { [weak self] (_: UIView, _: UITraitCollection) in
                self?.notifySizeClassIfChanged()
                self?.notifyFoldStateNowAndAfterSettling()
                self?.notifyBarPlacementIfChanged()
            }
        }
    }

    private func notifyHingeAngleIfChanged() {
        guard let angle = implementation.getHingeAngle()["angle"] as? Double, angle != lastHingeAngle else { return }

        lastHingeAngle = angle
        notifyListeners("hingeAngleChange", data: ["angle": angle])
    }

    private func notifyBarPlacementIfChanged() {
        let placement = currentBarPlacement()
        if let last = lastBarPlacement, (last as NSDictionary).isEqual(to: placement) { return }

        lastBarPlacement = placement
        notifyListeners("barPlacementChange", data: placement)
    }

    private func notifyFoldStateNowAndAfterSettling() {
        notifyFoldStateIfChanged()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
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
