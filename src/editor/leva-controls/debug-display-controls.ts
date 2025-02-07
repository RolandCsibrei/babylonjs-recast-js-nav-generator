import { useControls } from "leva";
import { signalDebugDisplayOptions } from "../state/signals";
import { levaText } from "./plugins/leva-text";

export const useDebugDisplayControls = () => {
  signalDebugDisplayOptions.value = useControls(
    "Display Options.NavMesh Generator Input",
    {
      _: levaText(
        "The indexed indexed triangle mesh that will be used for NavMesh generation."
      ),
      displayNavMeshGenerationInput: {
        label: "Show Input",
        value: false,
      },
      navMeshGeneratorInputDebugColor: {
        label: "Color",
        value: "#ff69b4",
      },
      navMeshGeneratorInputOpacity: {
        label: "Opacity",
        value: 0.65,
        min: 0,
        max: 1,
      },
      navMeshGeneratorInputWireframe: {
        label: "Wireframe",
        value: false,
      },
    }
  );
};
