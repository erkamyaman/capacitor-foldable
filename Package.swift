// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "ErkamyamanCapacitorFoldable",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "ErkamyamanCapacitorFoldable",
            targets: ["FoldablePlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", "7.0.0"..<"8.0.0")
    ],
    targets: [
        .target(
            name: "FoldablePlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/FoldablePlugin"),
        .testTarget(
            name: "FoldablePluginTests",
            dependencies: ["FoldablePlugin"],
            path: "ios/Tests/FoldablePluginTests")
    ]
)