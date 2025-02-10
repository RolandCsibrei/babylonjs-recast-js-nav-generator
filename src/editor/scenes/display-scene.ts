import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { signalSceneDisplayOptions } from "../state/signals";
import { EditorScene } from "./EditorScene";

export function subscribeDisplayScenel(editor: EditorScene) {
  const groundMesh = editor._createGround();
  const axisViewer = editor.createAxisViewer();

  signalSceneDisplayOptions.subscribe((options) => {
    if (!options) {
      return;
    }

    groundMesh.setEnabled(options.displayGround);

    axisViewer.xAxis.setEnabled(options.displayAxis);
    axisViewer.yAxis.setEnabled(options.displayAxis);
    axisViewer.zAxis.setEnabled(options.displayAxis);

    axisViewer.yAxis.scaling = editor.scaling;
    axisViewer.xAxis.scaling = editor.scaling;
    axisViewer.zAxis.scaling = editor.scaling;
  });
}
