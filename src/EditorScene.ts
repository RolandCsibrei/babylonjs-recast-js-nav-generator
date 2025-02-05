import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import {
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
import { Color3, StandardMaterial } from "@babylonjs/core";
import { download } from "./download";
import { GLTF2Export } from "@babylonjs/serializers/glTF/2.0/glTFSerializer";

export const MAIN_LIGHT_NAME = "main-light";
const NAV_MESH_NAME = "nav-mesh";

export class EditorScene {
  private _engine: Engine;
  private _scene: Scene;
  private _camera: ArcRotateCamera;
  private _ui: AdvancedDynamicTexture;
  private _navigation!: RecastNavigationJSPlugin;
  private _debugNavMeshMaterial: StandardMaterial;

  private _debugNavMesh: Mesh;

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
          (m) => m.name !== "__root__"
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
