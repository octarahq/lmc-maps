import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

export default function MenuIcon({
  color = "currentColor",
  ...props
}: SvgProps & { color?: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M3 12H21M3 6H21M3 18H21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
