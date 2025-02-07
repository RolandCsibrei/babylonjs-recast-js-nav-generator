import { useControls } from "leva";
import { signGlbDisplayOptions } from "../state/signals";

export const useGlbDisplayControls = () => {
  signGlbDisplayOptions.value = useControls("Display Options.Model", {
    displayModel: {
      label: "Show Model",
      value: true,
    },
    displayGround: {
      label: "Show Ground",
      value: false,
    },
  });
};
