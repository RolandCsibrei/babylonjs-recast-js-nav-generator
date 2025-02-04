import { useInputContext, styled } from "leva/plugin";

const Text = styled("div", {
  color: "#ccc",
  lineHeight: "1.5em",
  paddingTop: "5px",
  whiteSpace: "pre-line",
});

export const TextComponent = () => {
  const { label } = useInputContext();
  return <Text>{label}</Text>;
};
