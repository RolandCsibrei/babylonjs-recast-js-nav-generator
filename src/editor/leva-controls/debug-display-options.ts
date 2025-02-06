import { useControls } from "leva";
import { levaText } from "./leva-text";
import { signalDebugDisplayOptions } from "../signals";

export const useDebugDisplayOptionsControls = () => {
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
        // onEditEnd: setNavMeshGeneratorInputDebugColor,
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

  return {
    // displayModel,
  };
};

//   const { navMeshDebugDraw, navMeshDebugDrawOption } = useControls(
//     "Display Options.NavMesh",
//     {
//       _: levaText("The computed navigation mesh."),
//       navMeshDebugDraw: {
//         label: "Show NavMesh Debug Drawer",
//         value: true,
//       },
//       navMeshDebugDrawOption: {
//         label: "Display",
//         value: DebugDrawerOption.NAVMESH,
//         options: Object.values(DebugDrawerOption),
//       },
//     }
//   );

//   return {
//     displayModel,
//     navMeshGeneratorInputDebugColor,
//     displayNavMeshGenerationInput,
//     navMeshGeneratorInputWireframe,
//     navMeshGeneratorInputOpacity,
//     navMeshDebugDraw,
//     navMeshDebugDrawOption,
//   };
// };
