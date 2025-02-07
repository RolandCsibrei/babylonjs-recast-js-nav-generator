import { KeyboardEventTypes, Scene } from "@babylonjs/core";
import { signalIsInspectorOpen } from "../state/signals";

export function hookInspector(scene: Scene) {
  scene.onKeyboardObservable.add((kbInfo) => {
    switch (kbInfo.type) {
      case KeyboardEventTypes.KEYUP:
        if (kbInfo.event.code === "KeyI" && kbInfo.event.altKey === true) {
          signalIsInspectorOpen.value = !signalIsInspectorOpen.peek();
          break;
        }
        break;
    }
  });

  // TODO: unhook
  signalIsInspectorOpen.subscribe((open) => {
    toggleInspector(scene, open);
  });
}

const inspectorLoaded = false;

export async function toggleInspector(scene: Scene, open: boolean) {
  if (!inspectorLoaded) {
    await import("@babylonjs/core/Debug/debugLayer");
    await import("@babylonjs/inspector");
  }

  if (open) {
    enableInspector(scene);
  } else {
    disableInspector(scene);
  }
}

export function enableInspector(scene: Scene) {
  scene.debugLayer.show({
    embedMode: true,
    globalRoot: document.getElementById("inspector") ?? undefined,
    skipDefaultFontLoading: true,
  });
}

export function disableInspector(scene: Scene) {
  scene.debugLayer.hide();
}
