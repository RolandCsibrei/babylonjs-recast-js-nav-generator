import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { signalModelBlob, signalNavMeshParameters } from "./editor/signals";
import { loadDefaultModel, loadModelFromBlob } from "./editor/scene-loader";

import { init as initRecast } from "recast-navigation";

import { RecastNavigationJSPlugin } from "./editor/plugin/RecastNavigationJSPlugin";
import { hookInspector } from "./editor/inspector";

export const MAIN_LIGHT_NAME = "main-light";

export class EditorScene {
  private _engine!: Engine;
  private _scene!: Scene;
  private _ui!: AdvancedDynamicTexture;
  private _navigation!: RecastNavigationJSPlugin;

  constructor(private _canvas: HTMLCanvasElement) {
    const { engine, scene } = this._createScene(this._canvas);
    if (!engine) {
      throw new Error("Unable to create babylon.js engine!");
    }

    if (!scene) {
      throw new Error("Unable to create babylon.js scene!");
    }

    this._engine = engine;
    this._scene = scene;
    this._ui = AdvancedDynamicTexture.CreateFullscreenUI("ui");
  }

  public async init() {
    await this._initNavigation();

    await loadDefaultModel();

    this._runRenderLoop();

    // debugger;
    this._scene.onReadyObservable.addOnce(async () => {
      // ready
    });
  }

  public get engine() {
    return this._engine;
  }

  public get scene() {
    return this._scene;
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

    this._hookSignals(scene);

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
    this._scene.getEngine().runRenderLoop(() => {
      this._scene.render();
    });
  }

  private _removeAllNodes() {
    this._scene.transformNodes.forEach((n) => n.dispose(false, true));
    this._scene.meshes.forEach((m) => m.dispose(false, true));
  }

  private _hookSignals(scene: Scene) {
    hookInspector(scene);

    signalNavMeshParameters.subscribe(async (navMeshParams) => {
      if (!navMeshParams) {
        return;
      }

      this._navigation.createNavMesh(scene.meshes as Mesh[], navMeshParams);
      this._navigation.createDebugNavMesh(this._scene);
    });

    // TODO: unsubscribe
    signalModelBlob.subscribe(async (blob) => {
      if (blob) {
        this._removeAllNodes();
        await loadModelFromBlob(blob, "model.glb", scene);
      }
    });
  }
}
