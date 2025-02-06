import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { GLTF2Export } from "@babylonjs/serializers/glTF/2.0/glTFSerializer";
import { GridMaterial } from "@babylonjs/materials/grid/gridMaterial";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { Plane } from "@babylonjs/core/Maths/math.plane";
import { UtilityLayerRenderer } from "@babylonjs/core/Rendering/utilityLayerRenderer";
import { AxisDragGizmo } from "@babylonjs/core/Gizmos/axisDragGizmo";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { ICrowd } from "@babylonjs/core/Navigation/INavigationEngine";
import { CreateCapsule } from "@babylonjs/core/Meshes/Builders/capsuleBuilder";
import {
  PointerEventTypes,
  PointerInfo,
} from "@babylonjs/core/Events/pointerEvents";
import { CreateGreasedLine } from "@babylonjs/core/Meshes/Builders/greasedLineBuilder";
import { ISceneLoaderAsyncResult } from "@babylonjs/core/Loading/sceneLoader.js";
import { Nullable } from "@babylonjs/core/types";

import { exportNavMesh, init as initRecast } from "recast-navigation";

import {
  AgentControls,
  signalClippingPlanes,
  signalDebugDisplayOptions,
  signalModelBlob,
  signalNavMesh,
  signalNavMeshParameters,
  signalTestAgentControls,
  signalTestAgentStart,
  signalTestAgentTarget,
  signGlbDisplayOptions,
} from "./editor/signals";
import { loadDefaultGlb, loadModelFromBlob } from "./editor/scene-loader";
import { RecastNavigationJSPlugin } from "./plugin/RecastNavigationJSPlugin";
import { hookInspector } from "./editor/inspector";
import { setCameraLimits, zoomOnScene } from "./editor/camera";
import { download } from "./download";

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

  private _crowd!: ICrowd; // TODO: move to hook
  private _agent?: {
    idx: number;
    transform: TransformNode;
    mesh: Mesh;
    target?: Mesh;
  };

  constructor(private _canvas: HTMLCanvasElement) {
    const { engine, scene, camera } = this._createScene(this._canvas);

    if (!engine) {
      throw new Error("Unable to create babylon.js engine!");
    }

    if (!scene) {
      throw new Error("Unable to create babylon.js scene!");
    }

    scene.clearColor = new Color4(0.1, 0.1, 0.1, 1);

    this._engine = engine;
    this._scene = scene;
    this._camera = camera;
    this._ui = AdvancedDynamicTexture.CreateFullscreenUI("ui");
    this._debugNavMeshMaterial = this._createDebugNavMeshMaterial();
  }

  public async init() {
    await this._initNavigation();

    await loadDefaultGlb();

    this._subscribeSignals();

    zoomOnScene(this.scene, this.camera);

    this._runRenderLoop();

    // debugger;
    this.scene.onReadyObservable.addOnce(async () => {
      // ready
    });
  }

  // TODO: remove getters
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
    setCameraLimits(camera, {
      panningSensitivity: 15,
    });
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
    groundMaterial.backFaceCulling = false;
    groundMesh.position.y = -0.01;
    groundMesh.visibility = 0.8;
    return groundMesh;
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

  private _subscribeSignals() {
    hookInspector(this.scene);

    this._subscribeModelBlob();
    this._subscribeNavMeshParamaters();
    this._subscribeDisplayModel();
    this._subscribeDisplayOptions();
    this._subscribeClipPlanes();
    this._subscribeTestAgent();
    this._subscribeTestAgentTargetPicker();
    this._subscribeAgentMovement();
  }

  private _subscribeTestAgentTargetPicker() {
    const pointerEventTypes = [PointerEventTypes.POINTERUP];
    // TODO: unreg
    this.scene.onPointerObservable.add((pi: PointerInfo) => {
      if (!pointerEventTypes.includes(pi.type)) {
        return;
      }

      if (
        pi.pickInfo?.pickedMesh?.name === NAV_MESH_NAME &&
        pi.pickInfo.pickedPoint
      ) {
        if (pi.event.button === 0) {
          signalTestAgentTarget.value = pi.pickInfo.pickedPoint;
        }
        if (pi.event.button === 2) {
          signalTestAgentStart.value = pi.pickInfo.pickedPoint;
        }
      }
    });
  }

  private _subscribeAgentMovement() {
    this._scene.onBeforeRenderObservable.add(() => {
      if (!this._agent) {
        {
          return;
        }
      }

      const deltaTime = this._scene.getEngine().getDeltaTime() / 1000; // DeltaTime in seconds
      this._crowd.update(deltaTime);
      this._agent.transform.position = this._crowd.getAgentPosition(
        this._agent.idx
      );
    });
  }

  private _subscribeTestAgent() {
    signalTestAgentControls.subscribe((controls) => {
      if (!controls || !signalNavMesh.value) {
        return;
      }

      this._createCrowdAndAgent(controls);
    });

    //

    signalTestAgentStart.subscribe((position) => {
      if (!position || !this._agent) {
        return;
      }
      const positionOnNavMesh = this.navigation.getClosestPoint(position);
      this._crowd.agentTeleport(this._agent?.idx, positionOnNavMesh);
    });

    //

    const lineColor = Color3.Blue();

    signalTestAgentTarget.subscribe((position) => {
      if (!position || !this._agent) {
        return;
      }

      const targetOnNavMesh = this.navigation.getClosestPoint(position);
      this._crowd.agentGoto(this._agent?.idx, targetOnNavMesh);

      const pathPoints = this.navigation.computePath(
        this._crowd.getAgentPosition(this._agent.idx),
        targetOnNavMesh
      );

      this._scene.getMeshByName("path-line")?.dispose();

      const pathLine = CreateGreasedLine(
        "path-line",
        {
          points: pathPoints,
        },
        {
          color: lineColor,
          width: 0.2,
        }
      );
      pathLine.renderingGroupId = 2;
    });
  }

  private _disposeCrowd() {
    if (this._crowd && this._agent?.idx) {
      this._crowd.removeAgent(this._agent?.idx);
      this._crowd.dispose();
    }
  }

  private _updateCrowdAgentParams(controls: AgentControls) {
    if (!this._agent) {
      return;
    }

    this._crowd.updateAgentParameters(
      this._agent.idx,
      this._agentControlsToAgentParameters(controls)
    );
  }

  private _agentControlsToAgentParameters(controls: AgentControls) {
    return {
      radius: controls.agentRadius, // Agent radius, controls how close it can get to obstacles
      height: controls.agentHeight, // Agent height
      maxSpeed: controls.agentMaxSpeed, // Agent speed
      maxAcceleration: controls.agentMaxAcceleration, // Maximum acceleration
      collisionQueryRange: controls.agentRadius * 2, // How far the agent will look ahead for collisions
      pathOptimizationRange: controls.agentRadius * 3, // Range for path optimization
      separationWeight: 4.0, // Avoidance behavior separation weight
      obstacleAvoidanceType: 3, // High quality avoidance
    };
  }

  private _createCrowdAndAgent(controls: AgentControls) {
    if (!this._navigation) {
      return;
    }

    if (this._agent) {
      this._updateCrowdAgentParams(controls);
      return;
    }

    const crowd = this._navigation.createCrowd(
      1,
      controls.agentRadius,
      this._scene
    );

    this._crowd = crowd;

    // const targetCube = CreateBox(
    //   "target-cube",
    //   { size: 0.1, height: 0.1 },
    //   this._scene
    // );

    // create agents
    const height = 2;
    const singleAgentMesh = CreateCapsule(
      "single-agent",
      { height, radius: 0.3 },
      this._scene
    );
    singleAgentMesh.position.y = height / 2;

    const matAgent = new StandardMaterial("agent", this._scene);

    // const variation = Math.random();
    // matAgent.diffuseColor = new Color3(
    //   0.4 + variation * 0.6,
    //   0.3,
    //   1.0 - variation * 0.3
    // );
    matAgent.diffuseColor = Color3.Red();
    singleAgentMesh.material = matAgent;

    const randomPos = this._navigation.getClosestPoint(new Vector3(-20, 0, 0));

    const transform = new TransformNode("agent-parent");
    singleAgentMesh.parent = transform;

    const agentIndex = crowd.addAgent(
      randomPos,
      this._agentControlsToAgentParameters(controls),
      transform
    );
    this._agent = {
      idx: agentIndex,
      transform: transform,
      mesh: singleAgentMesh,
      // target: targetCube,
    };
  }

  private _subscribeClipPlanes() {
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

  private _subscribeDisplayModel() {
    const groundMesh = this._createGround();

    signGlbDisplayOptions.subscribe((options) => {
      if (!options) {
        return;
      }

      const roots = this.scene.meshes.filter((m) => m.name === "__root__");
      for (const m of roots) {
        m.setEnabled(options.displayModel);
      }

      //
      groundMesh.setEnabled(options.displayGround);
    });
  }

  private _subscribeDisplayOptions() {
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

  private _subscribeNavMeshParamaters() {
    signalNavMeshParameters.subscribe(async (navMeshParams) => {
      if (!navMeshParams) {
        return;
      }

      // generate the navmesh
      try {
        this._disposeCrowd();

        // remove the old debugnnav mesh if exists
        if (this._debugNavMesh) {
          this._debugNavMesh.dispose();
        }

        this._navigation.createNavMesh(
          this._getMeshesForNavMeshCreation(),
          navMeshParams
        );
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

  private _getMeshesForNavMeshCreation() {
    return this.scene.meshes.filter(
      (m) => m.parent?.name === "__root__"
    ) as Mesh[];
  }

  private _subscribeModelBlob() {
    // TODO: unsubscribe
    signalModelBlob.subscribe(async (blob) => {
      this._removeExistingModels();

      let loaded: Nullable<ISceneLoaderAsyncResult> = null;
      if (blob) {
        loaded = await loadModelFromBlob(blob, "model.glb", this.scene);
      } else {
        loaded = await loadDefaultGlb();
      }

      loaded?.meshes.forEach((m) => (m.isPickable = false));

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
