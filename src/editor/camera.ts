import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Scene } from "@babylonjs/core/scene";

export function zoomOnScene(scene: Scene, camera: ArcRotateCamera) {
  camera.zoomOn(scene.meshes);
}
