import {
  ISceneLoaderAsyncResult,
  SceneLoader,
} from "@babylonjs/core/Loading/sceneLoader";
import { Scene } from "@babylonjs/core/scene";
import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders/glTF/2.0/Extensions";

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
