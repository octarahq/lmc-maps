type Unit = "px" | "%";

interface Options {
  unit?: Unit;
  screenHeight?: number;
}

export function formatSnapPoints(
  values: number[],
  options: Options = {},
): string[] {
  const unit = options.unit ?? "px";

  if (unit === "%" && options.screenHeight) {
    return values.map((v) => {
      const percent = (v / options.screenHeight!) * 100;
      return `${percent}%`;
    });
  }

  return values.map((v) => `${v}${unit}`);
}

export function snapPointsPx(values: number[]): string[] {
  return formatSnapPoints(values, { unit: "px" });
}

export function snapPointsPercent(
  values: number[],
  screenHeight: number,
): string[] {
  return formatSnapPoints(values, { unit: "%", screenHeight });
}
