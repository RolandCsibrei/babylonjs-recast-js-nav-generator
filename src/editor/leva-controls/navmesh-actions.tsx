import { Nullable } from "@babylonjs/core/types";
import { NavMesh } from "@recast-navigation/core/dist/nav-mesh";
import { button, useControls } from "leva";

export const useNavMeshActionsControls = ({
  loading,
  generateNavMesh,
  navMesh,
  exportAsRecastNavMesh,
}: {
  loading: boolean;
  generateNavMesh: () => void;
  navMesh: Nullable<NavMesh>;
  exportAsRecastNavMesh: () => void;
}) => {
  useControls(
    "NavMesh Actions",
    {
      "Generate NavMesh": button(() => generateNavMesh(), {
        disabled: loading,
      }),
      "Export as Recast NavMesh": button(exportAsRecastNavMesh, {
        disabled: !navMesh,
      }),
    },
    [generateNavMesh, loading]
  );
};
