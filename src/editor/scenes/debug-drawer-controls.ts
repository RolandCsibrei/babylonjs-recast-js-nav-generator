import { signalDebugDrawerControls, signalNavMesh } from "../state/signals";
import { EditorScene } from "./EditorScene";

export function subscribeDebugDrawerControls(editor: EditorScene) {
  signalDebugDrawerControls.subscribe((controls) => {
    const navMesh = signalNavMesh.peek();
    if (
      !editor.navigationDebug ||
      !navMesh ||
      !controls?.navMeshDebugDrawOption
    ) {
      return;
    }

    editor.navigationDebug?.debugDrawerParentNode.setEnabled(
      controls.navMeshDebugDraw
    );

    if (controls.navMeshDebugDraw) {
      editor.drawDebug();
    }
  });
}
