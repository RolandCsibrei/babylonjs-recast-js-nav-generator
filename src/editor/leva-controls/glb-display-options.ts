import { useControls } from "leva";
import { signGlbDisplayOptions } from "../signals";

export const useGlbDisplayOptionsControls = () => {
  signGlbDisplayOptions.value = useControls("Display Options.Model", {
    displayModel: {
      label: "Show Model",
      value: true,
    },
  });

  return {
    // displayModel,
  };
};
