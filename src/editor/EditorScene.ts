import { exportNavMesh, init as initRecast } from "recast-navigation";

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
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { Tags } from "@babylonjs/core/Misc/tags";

import {
  AgentControls,
  DefaultGlbSize,
  signalClippingPlanes,
  signalDebugDisplayOptions,
  signalDebugDrawerControls,
  signalGeneratorIntermediates,
  signalIndexedTriangleInputMesh,
  signalModelBlob,
  signalNavMesh,
  signalNavMeshParameters,
  signalTestAgentControls,
  signalTestAgentStart,
  signalTestAgentTarget,
  signGlbDisplayOptions,
} from "./state/signals";

import {
  createFilesInput,
  loadDefaultGlbBig,
  loadDefaultGlbSmall,
  loadModelFromBlob,
} from "./utils/scene-loader";

import { hookInspector } from "./utils/inspector";
import { setCameraLimits, zoomOnScene } from "./utils/camera";
import { download } from "./utils/download";
import { TAG_MODEL } from "./utils/tags";

import {
  NAV_MESH_DEBUG_NAME,
  RecastNavigationJSPluginDebug,
} from "../plugin/RecastNavigationJSPluginDebug";
import { RecastNavigationJSPlugin } from "../plugin/RecastNavigationJSPlugin";
import { drawDebug } from "../plugin/debug-drawer";

export const MAIN_LIGHT_NAME = "main-light";

export class EditorScene {
  private _engine: Engine;
  private _scene: Scene;
  private _camera: ArcRotateCamera;
  private _ui: AdvancedDynamicTexture;
  private _navigation?: RecastNavigationJSPlugin;

  private _debugNavMeshMaterial: StandardMaterial;
  private _navMeshGeneratorInputMeshMaterial: StandardMaterial;
  private _navMeshGeneratorInputMesh: Nullable<Mesh> = null;

  private _crowd?: ICrowd;
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
    this._navMeshGeneratorInputMeshMaterial =
      this._createnavMeshGeneratorInputMeshMaterial();
  }

  public async init() {
    await this._initNavigation();

    this._subscribeSignals();

    this._runRenderLoop();

    this._scene.onReadyObservable.addOnce(async () => {
      // ready
    });
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

    const camera = new ArcRotateCamera("main", 0, 0, 100, Vector3.Zero());
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

  private _resetCamera() {
    this._camera.alpha = 0;
    this._camera.beta = 0;
    this._camera.radius = 100;
    this._camera.target = Vector3.ZeroReadOnly;
  }

  private _runRenderLoop() {
    this._scene.getEngine().runRenderLoop(() => {
      this._scene.render();
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
    const material = new StandardMaterial("nav-mesh-debug");
    material.emissiveColor = Color3.Yellow();
    material.disableLighting = true;
    return material;
  }

  private _createnavMeshGeneratorInputMeshMaterial() {
    const material = new StandardMaterial("nav-mesh-input");
    material.disableLighting = true;
    return material;
  }

  private _removeExistingModels() {
    // const transformNodeIdstoDispose = this._scene.transformNodes.map(
    //   (n) => n.id
    // );
    // const meshNodeIdstoDispose = this._scene.meshes.map((n) => n.id);
    // this._diposeNodes([...transformNodeIdstoDispose, ...meshNodeIdstoDispose]);

    const meshNodeIdstoDispose = this._scene
      .getMeshesByTags(TAG_MODEL)
      .map((n) => n.id);
    this._diposeNodes([...meshNodeIdstoDispose]);
  }

  private _diposeNodes(ids: string[]) {
    for (const id of ids) {
      this._scene.getNodeById(id)?.dispose();
    }
  }

  private _subscribeSignals() {
    hookInspector(this._scene);

    this._createDragAndDropLoader();
    this._subscribeModelBlob();
    this._subscribeNavMeshParamaters();
    this._subscribeIndexedGTriangleInputMesh();
    this._subscribeDisplayModel();
    this._subscribeDisplayOptions();
    this._subscribeDebugDrawerControls();
    this._subscribeClipPlanes();
    this._subscribeTestAgent();
    this._subscribeTestAgentTargetPicker();
    this._subscribeAgentMovement();
  }

  private _createDragAndDropLoader() {
    createFilesInput(this._engine, this._scene, this._canvas);
  }

  private _subscribeDebugDrawerControls() {
    const debug = new RecastNavigationJSPluginDebug();

    signalDebugDrawerControls.subscribe((controls) => {
      const navMesh = signalNavMesh.peek();
      if (!debug || !navMesh || !controls?.navMeshDebugDrawOption) {
        return;
      }

      drawDebug(
        debug,
        navMesh,
        controls.navMeshDebugDrawOption,
        signalGeneratorIntermediates.peek()
      );
    });
  }

  private _subscribeTestAgentTargetPicker() {
    const pointerEventTypes = [PointerEventTypes.POINTERUP];
    // TODO: unreg
    this._scene.onPointerObservable.add((pi: PointerInfo) => {
      if (!pointerEventTypes.includes(pi.type)) {
        return;
      }

      if (
        pi.pickInfo?.pickedMesh?.name === NAV_MESH_DEBUG_NAME &&
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
      if (!this._agent || !this._crowd) {
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
      if (!position || !this._agent || !this._navigation || !this._crowd) {
        return;
      }
      const positionOnNavMesh = this._navigation.getClosestPoint(position);
      this._crowd.agentTeleport(this._agent?.idx, positionOnNavMesh);
    });

    //

    const lineColor = Color3.Blue();

    signalTestAgentTarget.subscribe((position) => {
      if (!position || !this._agent || !this._navigation || !this._crowd) {
        return;
      }

      const targetOnNavMesh = this._navigation.getClosestPoint(position);
      this._crowd.agentGoto(this._agent?.idx, targetOnNavMesh);

      const pathPoints = this._navigation.computePath(
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
    if (!this._agent || !this._crowd) {
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
    const utilLayer = new UtilityLayerRenderer(this._scene);
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

    this._scene.onBeforeRenderObservable.add(() => {
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

      const roots = this._scene.meshes.filter((m) => m.name === "__root__");
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

      this._navMeshGeneratorInputMesh?.setEnabled(
        options.displayNavMeshGenerationInput
      );
      this._navMeshGeneratorInputMeshMaterial.wireframe =
        options.navMeshGeneratorInputWireframe;
      this._navMeshGeneratorInputMeshMaterial.alpha =
        options.navMeshGeneratorInputOpacity;
      this._navMeshGeneratorInputMeshMaterial.emissiveColor =
        Color3.FromHexString(options.navMeshGeneratorInputDebugColor);
    });
  }

  private _subscribeNavMeshParamaters() {
    // let debugNavMesh: Nullable<Mesh> = null;
    signalNavMeshParameters.subscribe(async (navMeshParams) => {
      if (!navMeshParams || !this._navigation) {
        return;
      }

      // generate the navmesh
      try {
        this._disposeCrowd();

        // remove the old debugnnav mesh if exists
        // if (debugNavMesh) {
        //   debugNavMesh.dispose();
        // }

        this._navigation.createNavMesh(
          this._getMeshesForNavMeshCreation(),
          navMeshParams
        );

        signalIndexedTriangleInputMesh.value = {
          positions: this._navigation.positions,
          indices: this._navigation.indices,
        };

        signalNavMesh.value = this._navigation.navMesh ?? null;
        signalGeneratorIntermediates.value =
          this._navigation.intermediates ?? null;

        // generate the new debug navmesh
        signalDebugDrawerControls.value = {
          ...signalDebugDrawerControls.peek(),
        };

        // debugNavMesh = this._navigation.createDebugNavMesh(this._scene);
        // debugNavMesh.name = NAV_MESH_DEBUG_NAME;
        // debugNavMesh.material = this._debugNavMeshMaterial;
      } catch (error) {
        console.error(error);
        signalNavMesh.value = null;
      }
    });
  }

  private _subscribeIndexedGTriangleInputMesh() {
    signalIndexedTriangleInputMesh.subscribe((data) => {
      if (this._navMeshGeneratorInputMesh) {
        this._navMeshGeneratorInputMesh.dispose();
      }

      if (!data) {
        return;
      }

      if (!data.positions || !data.positions) {
        return;
      }

      const vertexData = new VertexData();
      vertexData.positions = data.positions;
      vertexData.indices = data.indices;

      this._navMeshGeneratorInputMesh = new Mesh("nav-mesh-input");
      vertexData.applyToMesh(this._navMeshGeneratorInputMesh);

      this._navMeshGeneratorInputMesh.material =
        this._navMeshGeneratorInputMeshMaterial;

      signalDebugDisplayOptions.value = { ...signalDebugDisplayOptions.peek() };
    });
  }

  private _getMeshesForNavMeshCreation() {
    return this._scene.meshes.filter(
      (m) => m.parent?.name === "__root__"
    ) as Mesh[];
  }

  private _subscribeModelBlob() {
    // TODO: unsubscribe
    signalModelBlob.subscribe(async (blob) => {
      this._removeExistingModels();

      // this._resetCamera();

      if (!blob) {
        return;
      }

      let loaded: Nullable<ISceneLoaderAsyncResult> = null;
      if (blob instanceof Blob) {
        loaded = await loadModelFromBlob(blob, "model.glb", this._scene);
      } else {
        if (blob === DefaultGlbSize.Big) {
          loaded = await loadDefaultGlbBig();
        } else {
          loaded = await loadDefaultGlbSmall();
        }
      }

      for (const m of loaded?.meshes ?? []) {
        m.isPickable = false;
        Tags.AddTagsTo(m, TAG_MODEL);
      }

      zoomOnScene(this._scene, this._camera);
    });
  }

  public exportAsRecastNavMesh() {
    if (!this._navigation?.navMesh) {
      return;
    }
    const navMeshExport = exportNavMesh(this._navigation.navMesh);
    download(navMeshExport, "application/octet-stream", "navmesh.bin");
  }

  public async exportAsGlb() {
    const glb = await GLTF2Export.GLBAsync(this._scene, "navmesh.glb", {
      shouldExportNode: function (node) {
        return node.name === NAV_MESH_DEBUG_NAME;
      },
    });
    glb.downloadFiles();
  }
}
