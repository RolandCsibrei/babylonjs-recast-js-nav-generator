import { Color3 } from "@babylonjs/core/Maths/math.color";

import { signalDebugDisplayOptions } from "../state/signals";
import { EditorScene } from "./EditorScene";

export function subscribeDisplayOptions(editor: EditorScene) {
  signalDebugDisplayOptions.subscribe((options) => {
    if (!options) {
      return;
    }

    editor.navMeshGeneratorInputMesh?.setEnabled(
      options.displayNavMeshGenerationInput
    );
    editor.navMeshGeneratorInputMeshMaterial.wireframe =
      options.navMeshGeneratorInputWireframe;
    editor.navMeshGeneratorInputMeshMaterial.alpha =
      options.navMeshGeneratorInputOpacity;
    editor.navMeshGeneratorInputMeshMaterial.emissiveColor =
      Color3.FromHexString(options.navMeshGeneratorInputDebugColor);
  });
}
