import "./App.css";
import { useEffect } from "react";
import { Leva } from "leva";

import { useNavMeshGenerationControls } from "./editor/leva-controls/navmesh-config";
import { useActionsControls } from "./editor/leva-controls/scene-actions";
import FileLoader from "./editor/components/FileLoader";
import { EditorScene } from "./EditorScene";
import { signalNavMeshParameters } from "./editor/signals";

function App() {
  const loading = false;

  const generateNavMesh = () => {
    console.log("Generate navmesh", navMeshConfig);
    signalNavMeshParameters.value = { ...navMeshConfig };
  };

  const loadGlb = () => {
    document.getElementById("load-glb")?.click();
  };

  // Leva controls
  useActionsControls({ loading, generateNavMesh, loadGlb });
  const { navMeshConfig } = useNavMeshGenerationControls();

  // create the Editor instance
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
  const editorScene = new EditorScene(canvas);

  useEffect(() => {
    // init the Editor
    void editorScene.init();
  });
  return (
    <>
      <FileLoader />
      <Leva
        hidden={false}
        theme={{
          sizes: {
            rootWidth: "400px",
            controlWidth: "150px",
          },
        }}
      />
    </>
  );
}

export default App;
