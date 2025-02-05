import { Nullable } from "@babylonjs/core/types";
import { button, useControls } from "leva";
import { NavMesh } from "recast-navigation";

export const useGlbActionsControls = ({
  loading,
  loadGlb,
  loadDefault,
  exportAsGlb,
  navMesh,
}: {
  loading: boolean;
  loadGlb: () => void;
  loadDefault: () => void;
  exportAsGlb: () => void;
  navMesh: Nullable<NavMesh>;
}) => {
  useControls(
    "GLB Actions",
    {
      "Load GLB": button(() => loadGlb(), {
        disabled: loading,
      }),
      "Load Default GLB": button(() => loadDefault(), {
        disabled: loading,
      }),
      "Export as GLTF": button(exportAsGlb, {
        disabled: !navMesh,
      }),
    },
    [loading, loadGlb, navMesh]
  );
};
