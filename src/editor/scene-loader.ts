import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Scene } from "@babylonjs/core/scene";
import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders/glTF/2.0/Extensions";

export async function loadModelFromBlob(
  blob: Blob,
  filename: string,
  scene: Scene
): Promise<void | null> {
  try {
    if (blob) {
      const file = new File([blob], filename, {
        type: "application/octet-stream",
      });

      await SceneLoader.ImportMeshAsync("", "", file, scene);
      return;
    }
  } catch (e) {
    console.error("Failed to load from blob:", filename, e);
  }

  return null;
}

export async function loadDefaultModel() {
  await SceneLoader.ImportMeshAsync("", "/model/", "dungeon.glb");
}
