import { button, useControls } from "leva";
import { useSignals } from "@preact/signals-react/runtime";

import { signalIsLoading, signalNavMesh } from "../state/signals";
import { levaText } from "./plugins/leva-text";

export const useGlbControls = ({
  loadGlb,
  loadDefaultGlbSmall,
  loadDefaultGlbBig,
  exportAsGlb,
}: {
  loadGlb: () => void;
  loadDefaultGlbSmall: () => void;
  loadDefaultGlbBig: () => void;
  exportAsGlb: () => void;
}) => {
  useSignals();

  useControls(
    "GLB Actions",
    {
      "Load GLB": button(() => loadGlb(), {
        disabled: signalIsLoading.value,
      }),
      _1: levaText("Or drag and drop to load.GLB/GLTF supported."),

      "Load Example GLB - Small": button(() => loadDefaultGlbSmall(), {
        disabled: signalIsLoading.value,
      }),
      "Load Example GLB - Big": button(() => loadDefaultGlbBig(), {
        disabled: signalIsLoading.value,
      }),
      "Export as GLTF": button(exportAsGlb, {
        disabled: !signalNavMesh.value,
      }),

      _: levaText("Alt/Option + I to toggle Inspector."),
    },
    [loadGlb]
  );
};
