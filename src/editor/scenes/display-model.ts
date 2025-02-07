import { signGlbDisplayOptions } from "../state/signals";
import { EditorScene } from "./EditorScene";

export function subscribeDisplayModel(editor: EditorScene) {
  const groundMesh = editor._createGround();

  signGlbDisplayOptions.subscribe((options) => {
    if (!options) {
      return;
    }

    const roots = editor._scene.meshes.filter((m) => m.name === "__root__");
    for (const m of roots) {
      m.setEnabled(options.displayModel);
    }

    //
    groundMesh.setEnabled(options.displayGround);
  });
}
