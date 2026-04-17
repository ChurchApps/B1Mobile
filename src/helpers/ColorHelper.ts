export function adjustHexColor(hexColor: string, percent: number) {
  const hex = hexColor.replace("#", "");
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return hexColor;

  const amount = Math.round(2.55 * percent);
  const clamp = (value: number) => Math.max(0, Math.min(255, value));
  const channels = [0, 2, 4].map(index => clamp(parseInt(hex.slice(index, index + 2), 16) + amount));

  return `#${channels.map(channel => channel.toString(16).padStart(2, "0")).join("")}`;
}

export function hexToRgba(hexColor: string, opacity: number) {
  const hex = hexColor.replace("#", "");
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return hexColor;

  const [r, g, b] = [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16));
  const alpha = Math.max(0, Math.min(1, opacity));

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getPrimaryGradientColors(primaryColor: string, variant: "two-stop" | "three-stop" = "two-stop") {
  if (variant === "three-stop") {
    return [adjustHexColor(primaryColor, -12), adjustHexColor(primaryColor, 18), adjustHexColor(primaryColor, 28)] as const;
  }

  return [adjustHexColor(primaryColor, -12), adjustHexColor(primaryColor, 18)] as const;
}
