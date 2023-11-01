import { useTheme } from "next-themes";
import { HTMLAttributes } from "react";

export default function Avatar(
  props: { src?: string } & HTMLAttributes<HTMLImageElement>,
) {
  const { theme } = useTheme();

  return (
    <img
      src={
        props.src ||
        (theme === "light" ? "/user-light.svg" : "/user-dark.svg")
      }
      {...props}
    />
  );
}
