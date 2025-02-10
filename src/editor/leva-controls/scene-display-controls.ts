import { useControls } from "leva";
import { signalSceneDisplayOptions } from "../state/signals";

export const useSceneDisplayControls = () => {
  signalSceneDisplayOptions.value = useControls("Display Options.Scene", {
    displayGround: {
      label: "Show Ground",
      value: false,
    },
    displayAxis: {
      label: "Show Axis",
      value: false,
    },
  });
};
