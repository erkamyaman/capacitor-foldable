# Testing a foldable layout

## iPhone Duo simulator

Needs the iOS 27.1 runtime, which the device type refuses to go below, and Xcode 27.1 to build against the 27.1 SDK. Build against the 27.0 SDK and the app fills more of the inner display but still leaves gaps; build against anything older and it runs in compatibility mode inside a black border with no fold reported. In Xcode 27 the simulator lives inside **DeviceHub.app**, not `Simulator.app`.

```bash
open "$(dirname "$(xcode-select -p)")/Applications/DeviceHub.app"
npx cap run ios     # pick the iPhone Duo
```

If several Xcodes are installed, check `xcode-select -p` first, or set `DEVELOPER_DIR` to the 27.1 one for the build, or the app compiles against the wrong SDK and reports no fold.

Fold it with the hinge slider in DeviceHub; hold Option for finer control. The inner and outer displays are separate windows.

Screenshots from the terminal, where display 1 is the outer screen and display 3 the inner. The ids are not guaranteed, so `xcrun simctl io <udid> enumerate` lists them:

```bash
xcrun simctl io <udid> screenshot --display=3 inner.png
```

Driving the hinge from the terminal is far more repeatable than dragging the slider, using [`hinge`](https://github.com/artemnovichkov/hinge):

```bash
hinge -d <udid> sweep 180 60 2   # 180 to 60 degrees over 2 seconds
hinge -d <udid> get
```

Sweep rather than jumping: an instant change can confuse the simulator's display switching.

Known limitation: taps and key input do not land on the Duo simulator through automation ([XcodeBuildMCP #537](https://github.com/getsentry/XcodeBuildMCP/issues/537)), so scripted UI tests cannot drive it yet. Screenshots work from the terminal with an explicit `--display`; through tooling that cannot pass one, a folded screenshot comes back black because it always targets the inner panel.

## Android foldable emulator

Create a Pixel 9 Pro Fold or 7.6" foldable AVD, then fold it from the extended controls, or:

```bash
adb emu fold                             # folded
adb emu unfold                           # unfolded
adb shell cmd device_state print-states  # this device's state ids
adb shell cmd device_state state <id>    # force one, ids differ per device
adb shell cmd device_state state reset   # release the override
adb emu sensor set hinge-angle0 90       # a specific angle
```

`adb emu` only talks to an emulator; `cmd device_state` works on real devices too. The state ids are device specific, so print them rather than guessing.

## What to actually check

- Open flat, half open, and closed, so you see **both displays**. These are hands-on checks in DeviceHub, since scripted drivers cannot tap the Duo. A layout only ever seen flat has not been tested.
- Nothing interactive sits inside the fold band: `var(--fold-width)` wide from `var(--fold-left)`, or `var(--fold-height)` tall from `var(--fold-top)` for a horizontal fold.
- The app survives being folded shut and opened again, which on iOS suspends and resumes the web view.
- Text stays readable when the window is short and wide (the inner display held sideways, 951 x 669) and when it is tall and narrow (the outer display upright, 466 x 678). Both panels rotate, so check the other orientation of each.
