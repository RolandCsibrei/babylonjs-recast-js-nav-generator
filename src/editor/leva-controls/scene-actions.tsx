import { button, useControls } from "leva";

export const useActionsControls = ({
  loading,
  generateNavMesh,
  loadGlb,
}: {
  loading: boolean;
  generateNavMesh: () => void;
  loadGlb: () => void;
}) => {
  useControls(
    "Actions",
    {
      "Load GLB": button(() => loadGlb(), {
        disabled: loading,
      }),
      "Generate NavMesh": button(() => generateNavMesh(), {
        disabled: loading,
      }),
    },
    [generateNavMesh, loading, loadGlb]
  );
};

// import { button, useControls } from "leva";

// export const useActionsControls = ({
//   navMesh,
//   loading,
//   generateNavMesh,
//   exportAsGltf,
//   exportAsRecastNavMesh,
// }: {
//   navMesh: NavMesh | undefined;
//   loading: boolean;
//   generateNavMesh: () => {};
//   exportAsGltf: () => {};
//   exportAsRecastNavMesh: () => {};
// }) => {
//   useControls(
//     "Actions",
//     {
//       "Generate NavMesh": button(() => generateNavMesh(), {
//         disabled: loading,
//       }),
//       "Export as GLTF": button(exportAsGltf, {
//         disabled: !navMesh,
//       }),
//       "Export as Recast NavMesh": button(exportAsRecastNavMesh, {
//         disabled: !navMesh,
//       }),
//     },
//     [navMesh, generateNavMesh, loading]
//   );
// };
