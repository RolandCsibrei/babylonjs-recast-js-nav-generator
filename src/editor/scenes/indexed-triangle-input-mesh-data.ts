import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

import {
  signalDebugDisplayOptions,
  signalIndexedTriangleInputMeshData,
} from "../state/signals";
import { EditorScene } from "./EditorScene";

export function subscribeIndexedTriangleInputMeshData(editor: EditorScene) {
  signalIndexedTriangleInputMeshData.subscribe((data) => {
    if (editor.navMeshGeneratorInputMesh) {
      editor.navMeshGeneratorInputMesh.dispose();
    }

    if (!data) {
      return;
    }

    if (!data.positions || !data.positions) {
      return;
    }

    const vertexData = new VertexData();
    vertexData.positions = data.positions;
    vertexData.indices = data.indices;

    editor.navMeshGeneratorInputMesh = new Mesh("nav-mesh-input");
    vertexData.applyToMesh(editor.navMeshGeneratorInputMesh);

    editor.navMeshGeneratorInputMesh.material =
      editor.navMeshGeneratorInputMeshMaterial;

    signalDebugDisplayOptions.value = { ...signalDebugDisplayOptions.peek() };
  });
}
