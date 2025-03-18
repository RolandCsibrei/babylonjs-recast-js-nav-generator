import {
  PointerEventTypes,
  PointerInfo,
} from "@babylonjs/core/Events/pointerEvents";
import { Observer } from "@babylonjs/core/Misc/observable";

import { signalNavMesh, signalObstacleMode } from "../state/signals";
import { EditorScene } from "./EditorScene";
import { NAV_MESH_DEBUG_NAME } from "../../plugin/RecastNavigationJSPluginDebug";
import {
  Color3,
  CreateBox,
  IVector3Like,
  StandardMaterial,
} from "@babylonjs/core";

export function subscribeObstacles(editor: EditorScene) {
  let onPointerObservableObserver: Observer<PointerInfo>;
  const signalObstacleModeSub = signalObstacleMode.subscribe((on) => {
    if (!on) {
      if (onPointerObservableObserver) {
        editor.scene.onPointerObservable.remove(onPointerObservableObserver);
      }
      return;
    }

    onPointerObservableObserver = subscribeObstacletTargetPicker(editor);
  });
}

function subscribeObstacletTargetPicker(editor: EditorScene) {
  const pointerEventTypes = [PointerEventTypes.POINTERUP];
  // TODO: unreg
  return editor.scene.onPointerObservable.add((pi: PointerInfo) => {
    if (!pointerEventTypes.includes(pi.type)) {
      return;
    }

    if (
      pi.pickInfo?.pickedMesh?.name === NAV_MESH_DEBUG_NAME &&
      pi.pickInfo.pickedPoint
    ) {
      if (pi.event.button === 0) {
        addObstacle(pi.pickInfo.pickedPoint);
        signalObstacleMode.value = false;
      }
    }
  });

  function addObstacle(position: IVector3Like) {
    if (!editor.navigation) {
      return;
    }

    const boxObstacleMesh = CreateBox("obstacle-box", {
      width: 4,
      height: 4,
      depth: 4,
    });
    boxObstacleMesh.position.set(position.x, position.y, position.z);
    const material = new StandardMaterial("obstacle");
    boxObstacleMesh.material = material;
    material.emissiveColor = Color3.Red();
    material.wireframe = true;

    editor.navigation.addBoxObstacle(
      position,
      {
        x: 40,
        y: 40,
        z: 40,
      },
      0
    );

    editor.navigation.updateTileCache();
    if (editor.navigation.navMesh) {
      signalNavMesh.value = editor.navigation.navMesh;
    }
  }
}
