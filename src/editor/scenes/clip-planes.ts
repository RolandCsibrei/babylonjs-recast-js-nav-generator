import { UtilityLayerRenderer } from "@babylonjs/core/Rendering/utilityLayerRenderer";
import { EditorScene } from "./EditorScene";
import { AxisDragGizmo } from "@babylonjs/core/Gizmos/axisDragGizmo";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Plane } from "@babylonjs/core/Maths/math.plane";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { signalClippingPlanes } from "../state/signals";

export function subscribeClipPlanes(editor: EditorScene) {
  const utilLayer = new UtilityLayerRenderer(editor._scene);

  // const root = signalIndexedTriangleInputMesh.value
  // if (root) {

  //   const rootBB = root.getHierarchyBoundingVectors(true);
  // }

  //

  const gizmo1 = new AxisDragGizmo(
    new Vector3(0, 1, 0),
    Color3.FromHexString("#00b894"),
    utilLayer
  );
  gizmo1.updateGizmoRotationToMatchAttachedMesh = false;
  gizmo1.updateGizmoPositionToMatchAttachedMesh = true;

  let clipPlane1 = Plane.FromPositionAndNormal(
    new Vector3(0, 1, 0),
    new Vector3(0, 1, 0)
  );
  const plane1 = CreatePlane("clip-plane-1", {
    size: 1000,
    sourcePlane: clipPlane1,
  });
  const plane1Material = new StandardMaterial("plane1");
  plane1.visibility = 0.12;
  plane1Material.backFaceCulling = false;
  plane1.material = plane1Material;
  gizmo1.attachedMesh = plane1;

  //

  const gizmo2 = new AxisDragGizmo(
    new Vector3(0, -1, 0),
    Color3.FromHexString("#b89400"),
    utilLayer
  );
  gizmo2.updateGizmoRotationToMatchAttachedMesh = false;
  gizmo2.updateGizmoPositionToMatchAttachedMesh = true;

  let clipPlane2 = Plane.FromPositionAndNormal(
    new Vector3(0, 1, 0),
    new Vector3(0, -1, 0)
  );
  const plane2 = CreatePlane("clip-plane-2", {
    size: 1000,
    sourcePlane: clipPlane1,
  });
  const plane2Material = new StandardMaterial("plane2");
  plane2.visibility = 0.12;
  plane2Material.backFaceCulling = false;
  plane2.material = plane2Material;
  gizmo2.attachedMesh = plane2;

  //
  let useClipPlane1 = false;
  let useClipPlane2 = false;
  signalClippingPlanes.subscribe((options) => {
    useClipPlane1 = options?.useClipPlane1 ?? false;
    useClipPlane2 = options?.useClipPlane2 ?? false;

    plane1.setEnabled(useClipPlane1);
    gizmo1.attachedMesh = useClipPlane1 ? plane1 : null;

    plane2.setEnabled(useClipPlane2);
    gizmo2.attachedMesh = useClipPlane2 ? plane2 : null;
  });

  //

  editor._scene.onBeforeRenderObservable.add(() => {
    // const matrix1 = Matrix.Translation(0, plane1.position.y, 0);
    // clipPlane1 = clipPlane1.transform(matrix1);

    // const matrix2 = Matrix.Translation(0, plane2.position.y, 0);
    // clipPlane2 = clipPlane2.transform(matrix2);

    // console.log(clipPlane1.asArray());

    if (useClipPlane1) {
      clipPlane1 = Plane.FromPositionAndNormal(
        new Vector3(0, plane1.position.y, 0),
        new Vector3(0, 1, 0)
      );
      editor._debugNavMeshMaterial.clipPlane = clipPlane1;
    } else {
      editor._debugNavMeshMaterial.clipPlane = null;
    }

    if (useClipPlane2) {
      clipPlane2 = Plane.FromPositionAndNormal(
        new Vector3(0, plane2.position.y, 0),
        new Vector3(0, -1, 0)
      );
      editor._debugNavMeshMaterial.clipPlane2 = clipPlane2;
    } else {
      editor._debugNavMeshMaterial.clipPlane2 = null;
    }
  });
}
