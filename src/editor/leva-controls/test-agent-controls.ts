import { useControls } from "leva";
import { signalTestAgentControls } from "../state/signals";
import { levaText } from "./plugins/leva-text";

export const useTestAgentControls = () => {
  signalTestAgentControls.value = useControls("Test Agent", {
    _: levaText(
      "Creates a Detour Crowd with a single agent for you to test your NavMesh with.\nLeft click to set a target, right click to teleport. \n\n Display Options/NavMesh/Display - navmesh must be selected (default)."
    ),
    agentEnabled: {
      label: "Enabled",
      value: false,
    },
    _1: levaText(""),
    agentRadius: {
      label: "Agent Radius",
      value: 0.5,
      step: 0.1,
    },
    agentHeight: {
      label: "Agent Height",
      value: 2,
      step: 0.1,
    },
    agentMaxAcceleration: {
      label: "Agent Max Acceleration",
      value: 20,
      step: 0.1,
    },
    agentMaxSpeed: {
      label: "Agent Max Speed",
      value: 6,
      step: 0.1,
    },
  });
};
