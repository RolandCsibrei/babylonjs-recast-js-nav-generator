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
    if (!position || !editor.agent || !editor.navigation || !editor.crowd) {
      return;
    }
    const positionOnNavMesh = editor.navigation.getClosestPoint(position);
    editor.crowd.agentTeleport(editor.agent?.idx, positionOnNavMesh);
  });

  //

  const lineColor = Color3.Blue();

  signalTestAgentTarget.subscribe((position) => {
    if (!position || !editor.agent || !editor.navigation || !editor.crowd) {
      return;
    }

    const targetOnNavMesh = editor.navigation.getClosestPoint(position);
    editor.crowd.agentGoto(editor.agent?.idx, targetOnNavMesh);

    const pathPoints = editor.navigation.computePath(
      editor.crowd.getAgentPosition(editor.agent.idx),
      targetOnNavMesh
    );

    editor.scene.getMeshByName("path-line")?.dispose();

    const pathLine = CreateGreasedLine(
      "path-line",
      {
        points: pathPoints,
      },
      {
        color: lineColor,
        width: 0.4,
      }
    );
    pathLine.position.y += 1;
    // pathLine.renderingGroupId = 2;
  });
}

function subscribeTestAgentTargetPicker(editor: EditorScene) {
  const pointerEventTypes = [PointerEventTypes.POINTERUP];
  // TODO: unreg
  editor.scene.onPointerObservable.add((pi: PointerInfo) => {
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
  editor.scene.onBeforeRenderObservable.add(() => {
    if (!editor.agent || !editor.crowd) {
      {
        return;
      }
    }

    const deltaTime = editor.scene.getEngine().getDeltaTime() / 1000; // DeltaTime in seconds
    editor.crowd.update(deltaTime);
    editor.agent.transform.position = editor.crowd.getAgentPosition(
      editor.agent.idx
    );
  });
}

export function disposeCrowd(editor: EditorScene) {
  if (editor.crowd && editor.agent?.idx) {
    editor.crowd.removeAgent(editor.agent?.idx);
    editor.crowd.dispose();
  }
}

export function updateCrowdAgentParams(
  editor: EditorScene,
  controls: AgentControls
) {
  if (!editor.agent || !editor.crowd) {
    return;
  }

  editor.crowd.updateAgentParameters(
    editor.agent.idx,
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
