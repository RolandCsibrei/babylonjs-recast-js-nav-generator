import { createPlugin } from "leva/plugin";
import { TextComponent } from "./TextComponent";

export const textPlugin = createPlugin({
  component: TextComponent,
});

export const levaText = (text: string) => textPlugin({ label: text });
