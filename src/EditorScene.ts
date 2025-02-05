import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { GLTF2Export } from "@babylonjs/serializers/glTF/2.0/glTFSerializer";
import { GridMaterial } from "@babylonjs/materials/grid/gridMaterial";
import {
  signalClippingPlanes,
  signalDebugDisplayOptions,
  signalModelBlob,
  signalNavMesh,
  signalNavMeshParameters,
  signGlbDisplayOptions,
} from "./editor/signals";
import { loadDefaultGlb, loadModelFromBlob } from "./editor/scene-loader";

import { exportNavMesh, init as initRecast } from "recast-navigation";

import { RecastNavigationJSPlugin } from "./editor/plugin/RecastNavigationJSPlugin";
import { hookInspector } from "./editor/inspector";
import { zoomOnScene } from "./editor/camera";

import { download } from "./download";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { Plane } from "@babylonjs/core/Maths/math.plane";
import { UtilityLayerRenderer } from "@babylonjs/core/Rendering/utilityLayerRenderer";
import { AxisDragGizmo } from "@babylonjs/core/Gizmos/axisDragGizmo";

export const MAIN_LIGHT_NAME = "main-light";
const NAV_MESH_NAME = "nav-mesh";

export class EditorScene {
  private _engine: Engine;
  private _scene: Scene;
  private _camera: ArcRotateCamera;
  private _ui: AdvancedDynamicTexture;
  private _navigation!: RecastNavigationJSPlugin;
  private _debugNavMeshMaterial: StandardMaterial;

  private _debugNavMesh!: Mesh; // TODO: move to hook

  constructor(private _canvas: HTMLCanvasElement) {
    const { engine, scene, camera } = this._createScene(this._canvas);

    if (!engine) {
      throw new Error("Unable to create babylon.js engine!");
    }

    if (!scene) {
      throw new Error("Unable to create babylon.js scene!");
    }

    this._engine = engine;
    this._scene = scene;
    this._camera = camera;
    this._ui = AdvancedDynamicTexture.CreateFullscreenUI("ui");
    this._debugNavMeshMaterial = this._createDebugNavMeshMaterial();
  }

  public async init() {
    await this._initNavigation();

    await loadDefaultGlb();

    this._hookSignals();

    // this._createGround();
    zoomOnScene(this.scene, this.camera);

    this._runRenderLoop();

    // debugger;
    this.scene.onReadyObservable.addOnce(async () => {
      // ready
    });
  }

  public get engine() {
    return this._engine;
  }

  public get scene() {
    return this._scene;
  }

  public get camera() {
    return this._camera;
  }

  public get ui() {
    return this._ui;
  }

  public get navigation() {
    return this._navigation;
  }

  private async _initNavigation() {
    await initRecast();

    this._navigation = new RecastNavigationJSPlugin();
  }

  private _createScene(canvas: HTMLCanvasElement) {
    const engine = new Engine(canvas);
    const scene = new Scene(engine);

    const light = new HemisphericLight(
      MAIN_LIGHT_NAME,
      new Vector3(0, 1, 0),
      scene
    );
    light.intensity = 0.7;

    //

    const camera = new ArcRotateCamera("main", 0, 0, 50, Vector3.Zero());
    camera.attachControl();

    window.addEventListener("resize", () => {
      engine.resize();
    });

    return {
      camera,
      scene,
      engine,
    };
  }

  private _runRenderLoop() {
    this.scene.getEngine().runRenderLoop(() => {
      this.scene.render();
    });
  }

  private _createGround() {
    const groundMesh = CreateGround("ground", { width: 1000, height: 1000 });
    const groundMaterial = new GridMaterial("grid");
    groundMaterial.lineColor = new Color3(0.1, 0.1, 0.1);
    groundMaterial.mainColor = new Color3(0.25, 0.25, 0.25);
    groundMesh.material = groundMaterial;
  }

  private _createDebugNavMeshMaterial() {
    const material = new StandardMaterial("debug-nav-mesh");
    material.disableLighting = true;
    return material;
  }

  private _removeExistingModels() {
    const transformNodeIdstoDispose = this.scene.transformNodes.map(
      (n) => n.id
    );
    const meshNodeIdstoDispose = this.scene.meshes.map((n) => n.id);
    this._diposeNodes([...transformNodeIdstoDispose, ...meshNodeIdstoDispose]);
  }

  private _diposeNodes(ids: string[]) {
    for (const id of ids) {
      this.scene.getNodeById(id)?.dispose();
    }
  }

  private _hookSignals() {
    hookInspector(this.scene);

    this._hookModelBlob();
    this._hookNavMeshParamaters();
    this._hookDisplayModel();
    this._hookDisplayOptions();
    this._hookClipPlanes();
  }

  private _hookClipPlanes() {
    const utilLayer = new UtilityLayerRenderer(this.scene);
    // const rootBB = root.getHierarchyBoundingVectors(true);

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

    this.scene.onBeforeRenderObservable.add(() => {
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
        this._debugNavMeshMaterial.clipPlane = clipPlane1;
      } else {
        this._debugNavMeshMaterial.clipPlane = null;
      }

      if (useClipPlane2) {
        clipPlane2 = Plane.FromPositionAndNormal(
          new Vector3(0, plane2.position.y, 0),
          new Vector3(0, -1, 0)
        );
        this._debugNavMeshMaterial.clipPlane2 = clipPlane2;
      } else {
        this._debugNavMeshMaterial.clipPlane2 = null;
      }
    });
  }

  private _hookDisplayModel() {
    signGlbDisplayOptions.subscribe((options) => {
      const roots = this.scene.meshes.filter((m) => m.name === "__root__");
      for (const m of roots) {
        m.setEnabled(options?.displayModel ?? false);
      }
    });
  }

  private _hookDisplayOptions() {
    signalDebugDisplayOptions.subscribe((options) => {
      if (!options) {
        return;
      }

      this._debugNavMeshMaterial.wireframe =
        options.navMeshGeneratorInputWireframe;
      this._debugNavMeshMaterial.alpha = options.navMeshGeneratorInputOpacity;
      this._debugNavMeshMaterial.emissiveColor = Color3.FromHexString(
        options.navMeshGeneratorInputDebugColor
      );
    });
  }

  private _hookNavMeshParamaters() {
    signalNavMeshParameters.subscribe(async (navMeshParams) => {
      if (!navMeshParams) {
        return;
      }

      // generate the navmesh
      try {
        // remove the old debugnnav mesh if exists
        if (this._debugNavMesh) {
          this._debugNavMesh.dispose();
        }

        const meshes = this.scene.meshes.filter(
          (m) => m.parent?.name === "__root__"
        ) as Mesh[];
        this._navigation.createNavMesh(meshes, navMeshParams);
        signalNavMesh.value = this._navigation.navMesh ?? null;

        // generate the new debug navmesh
        this._debugNavMesh = this._navigation.createDebugNavMesh(this.scene);
        this._debugNavMesh.name = NAV_MESH_NAME;
        this._debugNavMesh.material = this._debugNavMeshMaterial;
      } catch (error) {
        console.error(error);
        signalNavMesh.value = null;
      }
    });
  }

  private _hookModelBlob() {
    // TODO: unsubscribe
    signalModelBlob.subscribe(async (blob) => {
      this._removeExistingModels();

      if (blob) {
        await loadModelFromBlob(blob, "model.glb", this.scene);
      } else {
        await loadDefaultGlb();
      }

      zoomOnScene(this.scene, this.camera);
    });
  }

  public exportAsRecastNavMesh() {
    if (!this.navigation.navMesh) {
      return;
    }
    const navMeshExport = exportNavMesh(this.navigation.navMesh);
    download(navMeshExport, "application/octet-stream", "navmesh.bin");
  }

  public async exportAsGlb() {
    const glb = await GLTF2Export.GLBAsync(this.scene, "navmesh.glb", {
      shouldExportNode: function (node) {
        return node.name === NAV_MESH_NAME;
      },
    });
    glb.downloadFiles();
  }
}
