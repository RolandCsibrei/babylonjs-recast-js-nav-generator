import { Engine } from "@babylonjs/core/Engines/engine";
import {
  ISceneLoaderAsyncResult,
  SceneLoader,
} from "@babylonjs/core/Loading/sceneLoader";
import { FilesInput } from "@babylonjs/core/Misc/filesInput";
import { Tools } from "@babylonjs/core/Misc/tools";
import { Scene } from "@babylonjs/core/scene";
import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders/glTF/2.0/Extensions";
import { signalModelBlob } from "../state/signals";

export async function loadModelFromBlob(
  blob: Blob,
  filename: string,
  scene: Scene
): Promise<ISceneLoaderAsyncResult | null> {
  try {
    if (blob) {
      const file = new File([blob], filename, {
        type: "application/octet-stream",
      });

      return await SceneLoader.ImportMeshAsync("", "", file, scene);
    }
  } catch (e) {
    console.error("Failed to load from blob:", filename, e);
  }

  return null;
}

export async function loadDefaultGlbSmall() {
  return await SceneLoader.ImportMeshAsync("", "/model/", "dungeon.glb");
}

export async function loadDefaultGlbBig() {
  return await SceneLoader.ImportMeshAsync("", "/model/", "navmesh-test.glb");
}

export function createFilesInput(
  engine: Engine,
  scene: Scene,
  canvas: HTMLCanvasElement
) {
  const filesInput = new FilesInput(
    engine,
    scene,
    null,
    null,
    null,
    null,
    function () {
      Tools.ClearLogCache();
    },
    null,
    null
  );
  filesInput.onProcessFileCallback = function (file: File) {
    file.arrayBuffer().then((buffer) => {
      signalModelBlob.value = new Blob([buffer], { type: "model/gltf-binary" });
    });
    return true;
  };

  filesInput.reload = function () {};
  filesInput.monitorElementForDragNDrop(canvas);

  return filesInput;
}
