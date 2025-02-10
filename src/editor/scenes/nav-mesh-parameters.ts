import {
  signalDebugDrawerControls,
  signalGeneratorIntermediates,
  signalIndexedTriangleInputMeshData,
  signalNavMesh,
  signalNavMeshParameters,
} from "../state/signals";
import { disposeCrowd } from "./crowd-agent";
import { EditorScene } from "./EditorScene";

export function subscribeNavMeshParamaters(editor: EditorScene) {
  // let debugNavMesh: Nullable<Mesh> = null;
  signalNavMeshParameters.subscribe(async (navMeshParams) => {
    if (!navMeshParams || !editor.navigation) {
      return;
    }

    // generate the navmesh
    try {
      disposeCrowd(editor);

      // remove the old debugnnav mesh if exists
      // if (debugNavMesh) {
      //   debugNavMesh.dispose();
      // }

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
      signalDebugDrawerControls.value = {
        ...signalDebugDrawerControls.peek(),
      };

      // debugNavMesh = editor._navigation.createDebugNavMesh(editor._scene);
      // debugNavMesh.name = NAV_MESH_DEBUG_NAME;
      // debugNavMesh.material = editor._debugNavMeshMaterial;
    } catch (error) {
      console.error(error);
      signalNavMesh.value = null;
    }
  });
}
