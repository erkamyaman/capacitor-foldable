// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "ErkamyamanCapacitorFoldable",
    platforms: [.iOS(.v16)],
    products: [
        .library(
            name: "ErkamyamanCapacitorFoldable",
            targets: ["FoldablePlugin"])
    ],
    dependencies: [
        .package(name: "capacitor", path: "example-app/node_modules/@capacitor/ios")
    ],
    targets: [
        .target(
            name: "FoldablePlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor")
            ],
            path: "ios/Sources/FoldablePlugin",
            resources: [.copy("Resources/PrivacyInfo.xcprivacy")]),
        .testTarget(
            name: "FoldablePluginTests",
            dependencies: ["FoldablePlugin"],
            path: "ios/Tests/FoldablePluginTests")
    ]
)