// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v16)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(name: "capacitor", path: "../../../node_modules/@capacitor/ios"),
        .package(name: "ErkamyamanCapacitorFoldable", path: "../../../..")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor"),
                .product(name: "ErkamyamanCapacitorFoldable", package: "ErkamyamanCapacitorFoldable")
            ]
        )
    ]
)
