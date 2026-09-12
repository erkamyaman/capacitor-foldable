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
        CAPPluginMethod(name: "getFoldState", returnType: CAPPluginReturnPromise)
    ]
    private let implementation = Foldable()

    /// - TODO: Return a real posture once Apple ships public foldable APIs.
    @objc func getFoldState(_ call: CAPPluginCall) {
        call.resolve(implementation.getFoldState())
    }

    /// - TODO: No-op. `foldStateChange` is never emitted on iOS; there is no public
    ///   API to observe a fold posture, so nothing subscribes and nothing fires.
}
