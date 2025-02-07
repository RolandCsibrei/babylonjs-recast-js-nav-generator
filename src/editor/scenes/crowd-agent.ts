import { Color3 } from "@babylonjs/core/Maths/math.color";
import { CreateGreasedLine } from "@babylonjs/core/Meshes/Builders/greasedLineBuilder";
import {
  PointerEventTypes,
  PointerInfo,
} from "@babylonjs/core/Events/pointerEvents";
import {
  AgentControls,
  signalNavMesh,
  signalTestAgentControls,
  signalTestAgentStart,
  signalTestAgentTarget,
} from "../state/signals";

import { NAV_MESH_DEBUG_NAME } from "../../plugin/RecastNavigationJSPluginDebug";
import { EditorScene } from "./EditorScene";

export function subscribeTestAgent(editor: EditorScene) {
  subscribeTestAgentTargetPicker(editor);
  subscribeAgentMovement(editor);

  signalTestAgentControls.subscribe((controls) => {
    if (!controls || !signalNavMesh.value) {
      return;
    }

    editor.createCrowdAndAgent(controls);
  });

  //

  signalTestAgentStart.subscribe((position) => {
    if (!position || !editor._agent || !editor._navigation || !editor._crowd) {
      return;
    }
    const positionOnNavMesh = editor._navigation.getClosestPoint(position);
    editor._crowd.agentTeleport(editor._agent?.idx, positionOnNavMesh);
  });

  //

  const lineColor = Color3.Blue();

  signalTestAgentTarget.subscribe((position) => {
    if (!position || !editor._agent || !editor._navigation || !editor._crowd) {
      return;
    }

    const targetOnNavMesh = editor._navigation.getClosestPoint(position);
    editor._crowd.agentGoto(editor._agent?.idx, targetOnNavMesh);

    const pathPoints = editor._navigation.computePath(
      editor._crowd.getAgentPosition(editor._agent.idx),
      targetOnNavMesh
    );

    editor._scene.getMeshByName("path-line")?.dispose();

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

function subscribeTestAgentTargetPicker(editor: EditorScene) {
  const pointerEventTypes = [PointerEventTypes.POINTERUP];
  // TODO: unreg
  editor._scene.onPointerObservable.add((pi: PointerInfo) => {
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

function subscribeAgentMovement(editor: EditorScene) {
  editor._scene.onBeforeRenderObservable.add(() => {
    if (!editor._agent || !editor._crowd) {
      {
        return;
      }
    }

    const deltaTime = editor._scene.getEngine().getDeltaTime() / 1000; // DeltaTime in seconds
    editor._crowd.update(deltaTime);
    editor._agent.transform.position = editor._crowd.getAgentPosition(
      editor._agent.idx
    );
  });
}

export function disposeCrowd(editor: EditorScene) {
  if (editor._crowd && editor._agent?.idx) {
    editor._crowd.removeAgent(editor._agent?.idx);
    editor._crowd.dispose();
  }
}

export function updateCrowdAgentParams(
  editor: EditorScene,
  controls: AgentControls
) {
  if (!editor._agent || !editor._crowd) {
    return;
  }

  editor._crowd.updateAgentParameters(
    editor._agent.idx,
    agentControlsToAgentParameters(controls)
  );
}

export function agentControlsToAgentParameters(controls: AgentControls) {
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
