import Foundation
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
        CAPPluginMethod(name: "getHingeAngle", returnType: CAPPluginReturnPromise)
    ]
    private let implementation = Foldable()

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

    /// - TODO: No-op. `foldStateChange` is never emitted on iOS; there is no public
    ///   API to observe a fold posture, so nothing subscribes and nothing fires.
}
