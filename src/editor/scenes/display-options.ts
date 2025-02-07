import { Color3 } from "@babylonjs/core/Maths/math.color";

import { signalDebugDisplayOptions } from "../state/signals";
import { EditorScene } from "./EditorScene";

export function subscribeDisplayOptions(editor: EditorScene) {
  signalDebugDisplayOptions.subscribe((options) => {
    if (!options) {
      return;
    }

    editor._navMeshGeneratorInputMesh?.setEnabled(
      options.displayNavMeshGenerationInput
    );
    editor._navMeshGeneratorInputMeshMaterial.wireframe =
      options.navMeshGeneratorInputWireframe;
    editor._navMeshGeneratorInputMeshMaterial.alpha =
      options.navMeshGeneratorInputOpacity;
    editor._navMeshGeneratorInputMeshMaterial.emissiveColor =
      Color3.FromHexString(options.navMeshGeneratorInputDebugColor);
  });
}
