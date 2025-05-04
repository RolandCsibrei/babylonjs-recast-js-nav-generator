import {
  signalGeneratorIntermediates,
  signalIndexedTriangleInputMeshData,
  signalIsLoading,
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

    signalIsLoading.value = true;

    // generate the navmesh
    try {
      setTimeout(() => {
        if (!navMeshParams || !editor.navigation) {
          return;
        }

        signalIsLoading.value = true;

        disposeCrowd(editor);

        editor.resetNavigation();

        console.time("gen");
        editor.navigation.createNavMesh(
          editor.getMeshesForNavMeshCreation(),
          navMeshParams
        );
        signalIsLoading.value = false;

        console.timeEnd("gen");

        signalIndexedTriangleInputMeshData.value = {
          positions: editor.navigation.positions,
          indices: editor.navigation.indices,
        };

        signalNavMesh.value = editor.navigation.navMesh ?? null;
        signalGeneratorIntermediates.value =
          editor.navigation.intermediates ?? null;

        // generate the new debug navmesh
        editor.drawDebug();
      }, 20);
    } catch (error) {
      console.error(error);
      signalNavMesh.value = null;
    }
  });
}
