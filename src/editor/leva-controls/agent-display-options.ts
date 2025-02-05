import { useControls } from "leva";
import { levaText } from "./leva-text";
import { signalDisplayOptions, signalKokki } from "../signals";
// import { DebugDrawerOption } from "./debug-drawer";

export const useDisplayOptionsControls = () => {
  // signalKokki.value = useControls("Display Options.Model", {
  //   displayModel: {
  //     label: "Show Model",
  //     value: true,
  //   },
  // });

  // const [navMeshGeneratorInputDebugColor, setNavMeshGeneratorInputDebugColor] =
  //   useState("#ff69b4");

  signalDisplayOptions.value = useControls(
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
        value: true,
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

// export const useTestAgentControls = () => {
//   const {
//     agentEnabled,
//     agentRadius,
//     agentHeight,
//     agentMaxAcceleration,
//     agentMaxSpeed,
//   } = useControls("Test Agent", {
//     _: levaText(
//       "Creates a Detour Crowd with a single agent for you to test your NavMesh with.\nLeft click to set a target, right click to teleport."
//     ),
//     agentEnabled: {
//       label: "Enabled",
//       value: false,
//     },
//     agentRadius: {
//       label: "Agent Radius",
//       value: 0.5,
//       step: 0.1,
//     },
//     agentHeight: {
//       label: "Agent Height",
//       value: 2,
//       step: 0.1,
//     },
//     agentMaxAcceleration: {
//       label: "Agent Max Acceleration",
//       value: 20,
//       step: 0.1,
//     },
//     agentMaxSpeed: {
//       label: "Agent Max Speed",
//       value: 6,
//       step: 0.1,
//     },
//   });

//   return {
//     agentEnabled,
//     agentRadius,
//     agentHeight,
//     agentMaxAcceleration,
//     agentMaxSpeed,
//   };
// };
