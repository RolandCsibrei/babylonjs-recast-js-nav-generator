import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Scene } from "@babylonjs/core/scene";

export function zoomOnScene(scene: Scene, camera: ArcRotateCamera) {
  camera.zoomOn(
    // TODO: refactor this
    scene.meshes.filter(
      (m) =>
        m.name !== "ground" &&
        m.name !== "clip-plane-1" &&
        m.name !== "clip-plane-2"
    )
  );
}
