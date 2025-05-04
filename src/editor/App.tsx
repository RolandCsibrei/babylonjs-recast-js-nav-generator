import "./App.css";
import { useEffect } from "react";
import styled from "styled-components";

import { Footer } from "./components/Footer";

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
`;

import { EditorScene } from "./scenes/EditorScene";

import { signalEditor } from "./state/signals";
import { EditorPage } from "./pages/EditorPage";

function App() {
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

  // create the Editor instance
  const editorScene = new EditorScene(canvas);

  useEffect(() => {
    // init the Editor
    editorScene.init().then(() => {
      signalEditor.value = editorScene;
    });
  });

  return (
    <Layout>
      <EditorPage />
      <Footer />
    </Layout>
  );
}

export default App;
