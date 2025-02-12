import { button, useControls } from "leva";
import { useSignals } from "@preact/signals-react/runtime";

import { sigalnIsLoading, signalObstacleMode } from "../state/signals";
import { levaText } from "./plugins/leva-text";

export const useObstaclesControls = () => {
  useSignals();

  useControls("Obstacles Actions", {
    "Add Obstacle": button(() => addObstacles(), {
      disabled: sigalnIsLoading.value,
    }),
    _1: levaText("Click on the nav mesh to add an obstacle."),
  });
};

function addObstacles() {
  signalObstacleMode.value = true;
}
