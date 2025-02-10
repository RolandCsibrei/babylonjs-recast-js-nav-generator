import {
  signalGeneratorIntermediates,
  signalIndexedTriangleInputMeshData,
  signalNavMesh,
  signalNavMeshParameters,
} from "../state/signals";
import { disposeCrowd } from "./crowd-agent";
import { EditorScene } from "./EditorScene";

export function subscribeNavMeshParamaters(editor: EditorScene) {
  signalNavMeshParameters.subscribe(async (navMeshParams) => {
    if (!navMeshParams || !editor.navigation) {
      return;
    }

    // generate the navmesh
    try {
      disposeCrowd(editor);

      signalNavMesh.value?.destroy();

      editor.navigation.createNavMesh(
        editor.getMeshesForNavMeshCreation(),
        navMeshParams
      );

      signalIndexedTriangleInputMeshData.value = {
        positions: editor.navigation.positions,
        indices: editor.navigation.indices,
      };

      signalNavMesh.value = editor.navigation.navMesh ?? null;
      signalGeneratorIntermediates.value =
        editor.navigation.intermediates ?? null;

      // generate the new debug navmesh
      editor.drawDebug();
    } catch (error) {
      console.error(error);
      signalNavMesh.value = null;
    }
  });
}
