export function detectGPUTier(): "high" | "medium" | "low" {
  if (typeof window === "undefined") return "medium";

  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return "low";

    const glContext = gl as WebGLRenderingContext;
    const debugInfo = glContext.getExtension("WEBGL_debug_renderer_info");

    if (debugInfo) {
      const renderer = glContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();

      if (
        renderer.includes("nvidia") ||
        renderer.includes("radeon rx") ||
        renderer.includes("apple m") ||
        renderer.includes("apple gpu")
      ) {
        return "high";
      }

      if (
        renderer.includes("intel") ||
        renderer.includes("mali") ||
        renderer.includes("adreno 5") ||
        renderer.includes("swiftshader")
      ) {
        return "low";
      }
    }

    return "medium";
  } catch {
    return "medium";
  }
}

export function getParticleCount(tier: "high" | "medium" | "low"): number {
  switch (tier) {
    case "high": return 5000;
    case "medium": return 2000;
    case "low": return 500;
  }
}
