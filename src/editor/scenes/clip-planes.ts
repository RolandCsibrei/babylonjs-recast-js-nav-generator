import { UtilityLayerRenderer } from "@babylonjs/core/Rendering/utilityLayerRenderer";
import { EditorScene } from "./EditorScene";
import { AxisDragGizmo } from "@babylonjs/core/Gizmos/axisDragGizmo";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Plane } from "@babylonjs/core/Maths/math.plane";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { signalClipPlanes, SignalSub } from "../state/signals";
import { Nullable } from "@babylonjs/core/types";
import { Observer } from "@babylonjs/core/Misc/observable";
import { Scene } from "@babylonjs/core/scene";

let signalClipPlanesSub: Nullable<SignalSub> = null;
let clipPlanesOnBeforeRenderObserver: Nullable<Observer<Scene>> = null;

export function unsubscribeClipPlanes(editor: EditorScene) {
  signalClipPlanesSub?.();
  signalClipPlanesSub = null;

  if (clipPlanesOnBeforeRenderObserver) {
    editor.scene.onBeforeRenderObservable.remove(
      clipPlanesOnBeforeRenderObserver
    );
    clipPlanesOnBeforeRenderObserver = null;
  }
}

export function subscribeClipPlanes(editor: EditorScene) {
  const rootBB = editor.root?.getHierarchyBoundingVectors(true);
  if (!rootBB) {
    return;
  }

  const utilLayer = new UtilityLayerRenderer(editor.scene);

  const height = Math.abs(rootBB.max.x - rootBB.min.x);
  const width = Math.abs(rootBB.max.z - rootBB.min.z);

  const gizmo1 = new AxisDragGizmo(
    new Vector3(0, 1, 0),
    Color3.Green(),
    utilLayer
  );
  gizmo1.updateGizmoRotationToMatchAttachedMesh = false;
  gizmo1.updateGizmoPositionToMatchAttachedMesh = true;

  let clipPlane1 = Plane.FromPositionAndNormal(
    new Vector3(0, 1, 0),
    new Vector3(0, 1, 0)
  );
  const plane1 = CreatePlane("clip-plane-1", {
    width,
    height,
    sourcePlane: clipPlane1,
  });
  const plane1Material = new StandardMaterial("plane1");
  plane1.visibility = 0.03;
  plane1Material.backFaceCulling = false;
  plane1.material = plane1Material;
  gizmo1.attachedMesh = plane1;

  //

  const gizmo2 = new AxisDragGizmo(
    new Vector3(0, -1, 0),
    Color3.Green(),
    utilLayer
  );
  gizmo2.updateGizmoRotationToMatchAttachedMesh = false;
  gizmo2.updateGizmoPositionToMatchAttachedMesh = true;

  let clipPlane2 = Plane.FromPositionAndNormal(
    new Vector3(0, 1, 0),
    new Vector3(0, -1, 0)
  );
  const plane2 = CreatePlane("clip-plane-2", {
    width,
    height,
    sourcePlane: clipPlane1,
  });
  const plane2Material = new StandardMaterial("plane2");
  plane2.visibility = 0.03;
  plane2Material.backFaceCulling = false;
  plane2.material = plane2Material;
  gizmo2.attachedMesh = plane2;

  if (rootBB) {
    plane1.position.x =
      rootBB.min.x + Math.abs(rootBB.max.x - rootBB.min.x) / 2; // if we got rootBB we get root as well
    plane1.position.y = rootBB.max.y - 1;
    plane1.position.z =
      rootBB.min.z + +Math.abs(rootBB.max.z - rootBB.min.z) / 2;

    plane2.position.x = plane1.position.x;
    plane2.position.y = rootBB.min.y + 1;
    plane2.position.z = plane1.position.z;
  }

  //
  let useClipPlanes = false;
  signalClipPlanesSub = signalClipPlanes.subscribe((options) => {
    useClipPlanes = options?.useClipPlanes ?? false;

    plane1.setEnabled(useClipPlanes);
    gizmo1.attachedMesh = useClipPlanes ? plane1 : null;

    plane2.setEnabled(useClipPlanes);
    gizmo2.attachedMesh = useClipPlanes ? plane2 : null;
  });

  //

  clipPlanesOnBeforeRenderObserver = editor.scene.onBeforeRenderObservable.add(
    () => {
      // const matrix1 = Matrix.Translation(0, plane1.position.y, 0);
      // clipPlane1 = clipPlane1.transform(matrix1);

      // const matrix2 = Matrix.Translation(0, plane2.position.y, 0);
      // clipPlane2 = clipPlane2.transform(matrix2);

      // console.log(clipPlane1.asArray());

      if (!editor.navigationDebug) {
        return;
      }

      if (useClipPlanes) {
        clipPlane1 = Plane.FromPositionAndNormal(
          new Vector3(0, plane1.position.y, 0),
          new Vector3(0, 1, 0)
        );
        editor.navigationDebug.triMaterial.clipPlane = clipPlane1;
        for (const m of editor.navigationDebug.lineMaterials) {
          m.clipPlane = clipPlane1;
        }
        editor.navigationDebug.pointMaterial.clipPlane = clipPlane1;

        clipPlane2 = Plane.FromPositionAndNormal(
          new Vector3(0, plane2.position.y, 0),
          new Vector3(0, -1, 0)
        );
        editor.navigationDebug.triMaterial.clipPlane2 = clipPlane2;
        for (const m of editor.navigationDebug.lineMaterials) {
          m.clipPlane2 = clipPlane2;
        }
        editor.navigationDebug.pointMaterial.clipPlane2 = clipPlane2;
      } else {
        editor.navigationDebug.triMaterial.clipPlane = null;
        editor.navigationDebug.triMaterial.clipPlane2 = clipPlane2;
        for (const m of editor.navigationDebug.lineMaterials) {
          m.clipPlane = null;
        }
        editor.navigationDebug.pointMaterial.clipPlane = null;

        editor.navigationDebug.triMaterial.clipPlane2 = null;
        for (const m of editor.navigationDebug.lineMaterials) {
          m.clipPlane2 = null;
        }
        editor.navigationDebug.pointMaterial.clipPlane2 = null;
      }
    }
  );

  // TODO: refactor - return unsubs here instead of setting them as variables
  // return {

  // }
}
