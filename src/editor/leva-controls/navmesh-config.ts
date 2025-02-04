import { useControls } from "leva";
import { levaText } from "./leva-text";

export const useNavMeshGenerationControls = () => {
  const { keepIntermediates, ...navMeshConfig } = useControls(
    "NavMesh Generation Config",
    {
      cs: {
        label: "Cell Size",
        value: 0.2,
      },
      ch: {
        label: "Cell Height",
        value: 0.2,
      },
      tileSize: {
        label: "Tile Size",
        value: 0,
        step: 1,
      },
      borderSize: {
        label: "Border Size",
        value: 0,
      },
      walkableSlopeAngle: {
        label: "Walkable Slope Angle",
        value: 60,
      },
      walkableHeight: {
        label: "Walkable Height",
        value: 2,
      },
      walkableClimb: {
        label: "Walkable Climb",
        value: 2,
      },
      walkableRadius: {
        label: "Walkable Radius",
        value: 1,
      },
      maxEdgeLen: {
        label: "Max Edge Length",
        value: 12,
      },
      maxSimplificationError: {
        label: "Max Simplification Error",
        value: 1.3,
      },
      minRegionArea: {
        label: "Min Region Area",
        value: 8,
      },
      mergeRegionArea: {
        label: "Merge Region Area",
        value: 20,
      },
      maxVertsPerPoly: {
        label: "Max Verts Per Poly",
        value: 6,
        step: 1,
      },
      detailSampleDist: {
        label: "Detail Sample Dist",
        value: 6,
      },
      detailSampleMaxError: {
        label: "Detail Sample Max Error",
        value: 1,
      },
      // expectedLayersPerTile: {
      //   label: "Expected Layers Per Tile",
      //   value: 4,
      //   step: 1,
      // },
      // maxLayers: {
      //   label: "Max Layers",
      //   value: 32,
      //   step: 1,
      // },
      keepIntermediates: {
        label: "Keep Intermediates",
        value: true,
      },
    }
  );

  useControls("NavMesh Generation Config.Tips", {
    _: levaText(
      '- Start by tweaking the cell size and cell height. Enable the "Show Heightfield" display option to visualise the voxel cells.' +
        "\n" +
        "- Set Tile Size to 0 to generate a solo nav mesh, and pick a value e.g. 32 to generate a tiled nav mesh" +
        "\n" +
        '- Uncheck "Keep Intermediates" if you are trying to generate a large nav mesh and are running out of memory.'
    ),
  });

  return { keepIntermediates, navMeshConfig };
};
