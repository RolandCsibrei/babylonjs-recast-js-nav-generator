import { signGlbDisplayOptions } from "../state/signals";
import { EditorScene } from "./EditorScene";

export function subscribeDisplayModel(editor: EditorScene) {
  signGlbDisplayOptions.subscribe((options) => {
    if (!options) {
      return;
    }

    const roots = editor.scene.meshes.filter((m) => m.name === "__root__");
    for (const m of roots) {
      m.setEnabled(options.displayModel);
    }
  });
}
