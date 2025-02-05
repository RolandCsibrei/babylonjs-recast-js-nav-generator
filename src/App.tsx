import "./App.css";
import { useEffect } from "react";

import FileLoader from "./editor/components/FileLoader";
import { EditorScene } from "./EditorScene";
import { EditorPage } from "./editor/pages/EditorPage";
import { signalEditor } from "./editor/signals";

function App() {
  // create the Editor instance
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
  const editorScene = new EditorScene(canvas);

  useEffect(() => {
    // init the Editor
    editorScene.init().then(() => {
      signalEditor.value = editorScene;
    });
  });
  return (
    <>
      <FileLoader />
      <EditorPage />
    </>
  );
}

export default App;
