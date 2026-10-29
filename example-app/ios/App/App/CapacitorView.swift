import SwiftUI
import Capacitor
import FoldablePlugin

public struct CapacitorView: UIViewControllerRepresentable {
    public func makeUIViewController(context: Context) -> CAPBridgeViewController {
        FoldableBridgeViewController()
    }

    public func updateUIViewController(_ vc: CAPBridgeViewController, context: Context) {}
}
