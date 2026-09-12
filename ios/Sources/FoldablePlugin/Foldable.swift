import Foundation

@objc public class Foldable: NSObject {
    @objc public func echo(_ value: String) -> String {
        print(value)
        return value
    }
}
