import { useControls } from "leva";
import { levaText } from "./leva-text";
import { signalTestAgentControls } from "../signals";

export const useTestAgentControls = () => {
  signalTestAgentControls.value = useControls("Test Agent", {
    _: levaText(
      "Creates a Detour Crowd with a single agent for you to test your NavMesh with.\nLeft click to set a target, right click to teleport."
    ),
    agentEnabled: {
      label: "Enabled",
      value: false,
    },
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
