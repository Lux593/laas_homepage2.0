// ═══════════════════════════════════════════════════════════════════
// HoverMaskReveal — Framer Code Component
// GPU-accelerated fluid simulation mask that reveals an image on hover.
// Drop this file into your Framer project's code folder.
// ═══════════════════════════════════════════════════════════════════

import { addPropertyControls, ControlType } from "framer"
import { useRef, useEffect, useCallback, useState } from "react"

// ─── Types ───────────────────────────────────────────────────────

interface Props {
  imageBase: string
  imageHover: string
  borderRadius: number
  splatRadius: number
  blur: number
  circleBoost: number
  curl: number
  velocityDissipation: number
  shrinkTime: number
  pressureIterations: number
  simResolution: number
  style?: React.CSSProperties
}

interface FBO {
  texture: WebGLTexture
  fbo: WebGLFramebuffer
  width: number
  height: number
  attach(gl: WebGL2RenderingContext, unit: number): number
}

interface DoubleFBO {
  read: FBO
  write: FBO
  swap(): void
}

interface Program {
  program: WebGLProgram
  uniforms: Record<string, WebGLUniformLocation | null>
  bind(gl: WebGL2RenderingContext): void
}

// ─── GLSL Shaders ────────────────────────────────────────────────

const VERT = `#version 300 es
precision highp float;
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`

const SPLAT_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTarget;
uniform float uAspectRatio;
uniform vec3 uColor;
uniform vec2 uPoint;
uniform float uRadius;
in vec2 vUv;
out vec4 fragColor;
void main() {
  vec2 p = vUv - uPoint;
  p.x *= uAspectRatio;
  vec3 splat = exp(-dot(p, p) / uRadius) * uColor;
  vec3 base = texture(uTarget, vUv).xyz;
  fragColor = vec4(base + splat, 1.0);
}`

const ADVECTION_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uTexelSize;
uniform float uDt;
uniform float uDissipation;
in vec2 vUv;
out vec4 fragColor;
void main() {
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uTexelSize;
  fragColor = vec4(uDissipation * texture(uSource, coord).xyz, 1.0);
}`

const DIVERGENCE_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
in vec2 vUv;
out vec4 fragColor;
void main() {
  float L = texture(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).x;
  float R = texture(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).x;
  float T = texture(uVelocity, vUv + vec2(0.0, uTexelSize.y)).y;
  float B = texture(uVelocity, vUv - vec2(0.0, uTexelSize.y)).y;
  fragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`

const CURL_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
in vec2 vUv;
out vec4 fragColor;
void main() {
  float L = texture(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).y;
  float R = texture(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).y;
  float T = texture(uVelocity, vUv + vec2(0.0, uTexelSize.y)).x;
  float B = texture(uVelocity, vUv - vec2(0.0, uTexelSize.y)).x;
  fragColor = vec4(R - L - T + B, 0.0, 0.0, 1.0);
}`

const VORTICITY_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform vec2 uTexelSize;
uniform float uCurlStrength;
uniform float uDt;
in vec2 vUv;
out vec4 fragColor;
void main() {
  float L = texture(uCurl, vUv - vec2(uTexelSize.x, 0.0)).x;
  float R = texture(uCurl, vUv + vec2(uTexelSize.x, 0.0)).x;
  float T = texture(uCurl, vUv + vec2(0.0, uTexelSize.y)).x;
  float B = texture(uCurl, vUv - vec2(0.0, uTexelSize.y)).x;
  float C = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 1e-5;
  force *= uCurlStrength * C;
  vec2 vel = texture(uVelocity, vUv).xy + force * uDt;
  fragColor = vec4(vel, 0.0, 1.0);
}`

const PRESSURE_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexelSize;
in vec2 vUv;
out vec4 fragColor;
void main() {
  float L = texture(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
  float R = texture(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
  float T = texture(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
  float B = texture(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
  float C = texture(uDivergence, vUv).x;
  fragColor = vec4((L + R + B + T - C) * 0.25, 0.0, 0.0, 1.0);
}`

const GRADIENT_SUB_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
in vec2 vUv;
out vec4 fragColor;
void main() {
  float L = texture(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
  float R = texture(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
  float T = texture(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
  float B = texture(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
  vec2 vel = texture(uVelocity, vUv).xy - vec2(R - L, T - B);
  fragColor = vec4(vel, 0.0, 1.0);
}`

const CLEAR_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTexture;
uniform float uValue;
in vec2 vUv;
out vec4 fragColor;
void main() {
  fragColor = uValue * texture(uTexture, vUv);
}`

const DISPLAY_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uDensity;
uniform sampler2D uImageBase;
uniform sampler2D uImageHover;
uniform float uBlur;
uniform float uCircleBoost;
uniform vec2 uCanvasSize;
uniform vec2 uBaseSize;
uniform vec2 uHoverSize;
in vec2 vUv;
out vec4 fragColor;

vec2 coverUV(vec2 uv, vec2 canvas, vec2 image) {
  float ca = canvas.x / canvas.y;
  float ia = image.x / image.y;
  vec2 s = ca > ia ? vec2(1.0, ia / ca) : vec2(ca / ia, 1.0);
  return (uv - 0.5) / s + 0.5;
}

void main() {
  float mask = texture(uDensity, vUv).x;
  mask = smoothstep(0.0, uBlur, mask) * uCircleBoost;
  mask = clamp(mask, 0.0, 1.0);
  vec2 bUV = coverUV(vUv, uCanvasSize, uBaseSize);
  vec2 hUV = coverUV(vUv, uCanvasSize, uHoverSize);
  vec4 base = texture(uImageBase, bUV);
  vec4 hover = texture(uImageHover, hUV);
  fragColor = mix(base, hover, mask);
}`

// ─── WebGL Helpers ───────────────────────────────────────────────

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Shader compile error: ${info}`)
  }
  return shader
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertSrc: string,
  fragSrc: string,
  uniformNames: string[]
): Program {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc)
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc)
  const program = gl.createProgram()!
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Program link error: ${gl.getProgramInfoLog(program)}`)
  }
  const uniforms: Record<string, WebGLUniformLocation | null> = {}
  for (const name of uniformNames) {
    uniforms[name] = gl.getUniformLocation(program, name)
  }
  return { program, uniforms, bind: (g) => g.useProgram(program) }
}

function createFBO(
  gl: WebGL2RenderingContext,
  w: number,
  h: number,
  internalFormat: number,
  format: number,
  type: number,
  filter: number
): FBO {
  const texture = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null)

  const fbo = gl.createFramebuffer()!
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  gl.viewport(0, 0, w, h)
  gl.clear(gl.COLOR_BUFFER_BIT)

  return {
    texture,
    fbo,
    width: w,
    height: h,
    attach(g, unit) {
      g.activeTexture(g.TEXTURE0 + unit)
      g.bindTexture(g.TEXTURE_2D, texture)
      return unit
    },
  }
}

function createDoubleFBO(
  gl: WebGL2RenderingContext,
  w: number,
  h: number,
  internalFormat: number,
  format: number,
  type: number,
  filter: number
): DoubleFBO {
  const fbo1 = createFBO(gl, w, h, internalFormat, format, type, filter)
  const fbo2 = createFBO(gl, w, h, internalFormat, format, type, filter)
  return {
    read: fbo1,
    write: fbo2,
    swap() {
      const t = this.read
      this.read = this.write
      this.write = t
    },
  }
}

function loadImageTexture(
  gl: WebGL2RenderingContext,
  url: string,
  onLoad: (tex: WebGLTexture, w: number, h: number) => void
) {
  const tex = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]))

  const img = new Image()
  img.crossOrigin = "anonymous"
  img.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    onLoad(tex, img.naturalWidth, img.naturalHeight)
  }
  img.src = url
  return tex
}

// ─── Fluid Simulation ───────────────────────────────────────────

class FluidSim {
  private gl: WebGL2RenderingContext
  private velocity: DoubleFBO
  private density: DoubleFBO
  private pressure: DoubleFBO
  private divergenceFBO: FBO
  private curlFBO: FBO

  private splatProg: Program
  private advectionProg: Program
  private divergenceProg: Program
  private curlProg: Program
  private vorticityProg: Program
  private pressureProg: Program
  private gradSubProg: Program
  private clearProg: Program
  private displayProg: Program

  private quadVAO: WebGLVertexArrayObject
  private simW: number
  private simH: number

  constructor(private canvas: HTMLCanvasElement, simRes: number) {
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    })!
    this.gl = gl

    gl.getExtension("EXT_color_buffer_float")
    gl.getExtension("OES_texture_float_linear")

    // Full-screen quad VAO
    const quadVAO = gl.createVertexArray()!
    gl.bindVertexArray(quadVAO)
    const buf = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.bindVertexArray(null)
    this.quadVAO = quadVAO

    // Shader programs
    this.splatProg = createProgram(gl, VERT, SPLAT_FRAG, [
      "uTarget", "uAspectRatio", "uColor", "uPoint", "uRadius",
    ])
    this.advectionProg = createProgram(gl, VERT, ADVECTION_FRAG, [
      "uVelocity", "uSource", "uTexelSize", "uDt", "uDissipation",
    ])
    this.divergenceProg = createProgram(gl, VERT, DIVERGENCE_FRAG, [
      "uVelocity", "uTexelSize",
    ])
    this.curlProg = createProgram(gl, VERT, CURL_FRAG, [
      "uVelocity", "uTexelSize",
    ])
    this.vorticityProg = createProgram(gl, VERT, VORTICITY_FRAG, [
      "uVelocity", "uCurl", "uTexelSize", "uCurlStrength", "uDt",
    ])
    this.pressureProg = createProgram(gl, VERT, PRESSURE_FRAG, [
      "uPressure", "uDivergence", "uTexelSize",
    ])
    this.gradSubProg = createProgram(gl, VERT, GRADIENT_SUB_FRAG, [
      "uPressure", "uVelocity", "uTexelSize",
    ])
    this.clearProg = createProgram(gl, VERT, CLEAR_FRAG, ["uTexture", "uValue"])
    this.displayProg = createProgram(gl, VERT, DISPLAY_FRAG, [
      "uDensity", "uImageBase", "uImageHover", "uBlur", "uCircleBoost",
      "uCanvasSize", "uBaseSize", "uHoverSize",
    ])

    // Simulation FBOs
    const aspect = canvas.width / canvas.height
    this.simW = Math.round(simRes * aspect)
    this.simH = simRes

    const halfFloat = gl.RGBA16F
    const rgba = gl.RGBA
    const float = gl.HALF_FLOAT
    const linear = gl.LINEAR

    this.velocity = createDoubleFBO(gl, this.simW, this.simH, halfFloat, rgba, float, linear)
    this.density = createDoubleFBO(gl, this.simW, this.simH, halfFloat, rgba, float, linear)
    this.pressure = createDoubleFBO(gl, this.simW, this.simH, halfFloat, rgba, float, linear)
    this.divergenceFBO = createFBO(gl, this.simW, this.simH, halfFloat, rgba, float, gl.NEAREST)
    this.curlFBO = createFBO(gl, this.simW, this.simH, halfFloat, rgba, float, gl.NEAREST)
  }

  private blit(target: FBO | null) {
    const gl = this.gl
    if (target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo)
      gl.viewport(0, 0, target.width, target.height)
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    }
    gl.bindVertexArray(this.quadVAO)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.bindVertexArray(null)
  }

  splat(x: number, y: number, dx: number, dy: number, radius: number, density: number) {
    const gl = this.gl
    const aspect = this.canvas.width / this.canvas.height

    // Splat velocity
    this.splatProg.bind(gl)
    gl.uniform1i(this.splatProg.uniforms.uTarget, this.velocity.read.attach(gl, 0))
    gl.uniform1f(this.splatProg.uniforms.uAspectRatio, aspect)
    gl.uniform2f(this.splatProg.uniforms.uPoint, x, y)
    gl.uniform3f(this.splatProg.uniforms.uColor, dx * 10, dy * 10, 0)
    gl.uniform1f(this.splatProg.uniforms.uRadius, radius)
    this.blit(this.velocity.write)
    this.velocity.swap()

    // Splat density
    gl.uniform1i(this.splatProg.uniforms.uTarget, this.density.read.attach(gl, 0))
    gl.uniform3f(this.splatProg.uniforms.uColor, density, 0, 0)
    this.blit(this.density.write)
    this.density.swap()
  }

  step(dt: number, curlStrength: number, velDissipation: number, densDissipation: number, pressureIter: number) {
    const gl = this.gl
    const texelX = 1.0 / this.simW
    const texelY = 1.0 / this.simH

    // Curl
    this.curlProg.bind(gl)
    gl.uniform1i(this.curlProg.uniforms.uVelocity, this.velocity.read.attach(gl, 0))
    gl.uniform2f(this.curlProg.uniforms.uTexelSize, texelX, texelY)
    this.blit(this.curlFBO)

    // Vorticity confinement
    this.vorticityProg.bind(gl)
    gl.uniform1i(this.vorticityProg.uniforms.uVelocity, this.velocity.read.attach(gl, 0))
    gl.uniform1i(this.vorticityProg.uniforms.uCurl, this.curlFBO.attach(gl, 1))
    gl.uniform2f(this.vorticityProg.uniforms.uTexelSize, texelX, texelY)
    gl.uniform1f(this.vorticityProg.uniforms.uCurlStrength, curlStrength)
    gl.uniform1f(this.vorticityProg.uniforms.uDt, dt)
    this.blit(this.velocity.write)
    this.velocity.swap()

    // Divergence
    this.divergenceProg.bind(gl)
    gl.uniform1i(this.divergenceProg.uniforms.uVelocity, this.velocity.read.attach(gl, 0))
    gl.uniform2f(this.divergenceProg.uniforms.uTexelSize, texelX, texelY)
    this.blit(this.divergenceFBO)

    // Clear pressure
    this.clearProg.bind(gl)
    gl.uniform1i(this.clearProg.uniforms.uTexture, this.pressure.read.attach(gl, 0))
    gl.uniform1f(this.clearProg.uniforms.uValue, 0.8)
    this.blit(this.pressure.write)
    this.pressure.swap()

    // Pressure solve (Jacobi)
    this.pressureProg.bind(gl)
    gl.uniform2f(this.pressureProg.uniforms.uTexelSize, texelX, texelY)
    gl.uniform1i(this.pressureProg.uniforms.uDivergence, this.divergenceFBO.attach(gl, 1))
    for (let i = 0; i < pressureIter; i++) {
      gl.uniform1i(this.pressureProg.uniforms.uPressure, this.pressure.read.attach(gl, 0))
      this.blit(this.pressure.write)
      this.pressure.swap()
    }

    // Gradient subtraction
    this.gradSubProg.bind(gl)
    gl.uniform1i(this.gradSubProg.uniforms.uPressure, this.pressure.read.attach(gl, 0))
    gl.uniform1i(this.gradSubProg.uniforms.uVelocity, this.velocity.read.attach(gl, 1))
    gl.uniform2f(this.gradSubProg.uniforms.uTexelSize, texelX, texelY)
    this.blit(this.velocity.write)
    this.velocity.swap()

    // Advect velocity
    this.advectionProg.bind(gl)
    gl.uniform2f(this.advectionProg.uniforms.uTexelSize, texelX, texelY)
    gl.uniform1f(this.advectionProg.uniforms.uDt, dt)
    gl.uniform1i(this.advectionProg.uniforms.uVelocity, this.velocity.read.attach(gl, 0))
    gl.uniform1i(this.advectionProg.uniforms.uSource, this.velocity.read.attach(gl, 0))
    gl.uniform1f(this.advectionProg.uniforms.uDissipation, velDissipation)
    this.blit(this.velocity.write)
    this.velocity.swap()

    // Advect density
    gl.uniform1i(this.advectionProg.uniforms.uVelocity, this.velocity.read.attach(gl, 0))
    gl.uniform1i(this.advectionProg.uniforms.uSource, this.density.read.attach(gl, 1))
    gl.uniform1f(this.advectionProg.uniforms.uDissipation, densDissipation)
    this.blit(this.density.write)
    this.density.swap()
  }

  render(
    baseTex: WebGLTexture,
    hoverTex: WebGLTexture,
    baseSize: [number, number],
    hoverSize: [number, number],
    blur: number,
    circleBoost: number
  ) {
    const gl = this.gl
    this.displayProg.bind(gl)
    gl.uniform1i(this.displayProg.uniforms.uDensity, this.density.read.attach(gl, 0))

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, baseTex)
    gl.uniform1i(this.displayProg.uniforms.uImageBase, 1)

    gl.activeTexture(gl.TEXTURE2)
    gl.bindTexture(gl.TEXTURE_2D, hoverTex)
    gl.uniform1i(this.displayProg.uniforms.uImageHover, 2)

    gl.uniform1f(this.displayProg.uniforms.uBlur, blur)
    gl.uniform1f(this.displayProg.uniforms.uCircleBoost, circleBoost)
    gl.uniform2f(this.displayProg.uniforms.uCanvasSize, this.canvas.width, this.canvas.height)
    gl.uniform2f(this.displayProg.uniforms.uBaseSize, baseSize[0], baseSize[1])
    gl.uniform2f(this.displayProg.uniforms.uHoverSize, hoverSize[0], hoverSize[1])

    this.blit(null)
  }

  destroy() {
    const gl = this.gl
    gl.getExtension("WEBGL_lose_context")?.loseContext()
  }
}

// ─── Component ──────────────────────────────────────────────────

function HoverMaskReveal({
  imageBase,
  imageHover,
  borderRadius = 0,
  splatRadius = 0.25,
  blur = 0.3,
  circleBoost = 1.5,
  curl = 30,
  velocityDissipation = 0.98,
  shrinkTime = 1.5,
  pressureIterations = 20,
  simResolution = 128,
  style,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const simRef = useRef<FluidSim | null>(null)
  const rafRef = useRef<number>(0)
  const pointerRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, hovering: false })
  const imagesRef = useRef<{
    baseTex: WebGLTexture | null
    hoverTex: WebGLTexture | null
    baseSize: [number, number]
    hoverSize: [number, number]
  }>({ baseTex: null, hoverTex: null, baseSize: [1, 1], hoverSize: [1, 1] })

  const [isMobile] = useState(() => {
    if (typeof window === "undefined") return true
    return window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768
  })

  // Props ref for animation loop access
  const propsRef = useRef({ splatRadius, blur, circleBoost, curl, velocityDissipation, shrinkTime, pressureIterations })
  propsRef.current = { splatRadius, blur, circleBoost, curl, velocityDissipation, shrinkTime, pressureIterations }

  // Initialize WebGL
  useEffect(() => {
    if (isMobile) return
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const dpr = Math.min(window.devicePixelRatio, 2)
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    let sim: FluidSim
    try {
      sim = new FluidSim(canvas, simResolution)
    } catch {
      return
    }
    simRef.current = sim

    // Load images
    const gl = canvas.getContext("webgl2")!
    if (imageBase) {
      imagesRef.current.baseTex = loadImageTexture(gl, imageBase, (_, w, h) => {
        imagesRef.current.baseSize = [w, h]
      })
    }
    if (imageHover) {
      imagesRef.current.hoverTex = loadImageTexture(gl, imageHover, (_, w, h) => {
        imagesRef.current.hoverSize = [w, h]
      })
    }

    // Resize observer
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        canvas.width = width * dpr
        canvas.height = height * dpr
      }
    })
    ro.observe(container)

    // Animation loop
    let lastTime = performance.now()
    const frame = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.033)
      lastTime = now

      const p = propsRef.current
      const ptr = pointerRef.current
      const imgs = imagesRef.current

      // Splat at cursor if hovering
      if (ptr.hovering) {
        const dx = ptr.x - ptr.lastX
        const dy = ptr.y - ptr.lastY
        ptr.lastX = ptr.x
        ptr.lastY = ptr.y
        sim.splat(ptr.x, 1.0 - ptr.y, dx, -dy, p.splatRadius * 0.001, 0.3)
      }

      // Density dissipation from shrink time
      const densDissipation = Math.exp(-3 / (p.shrinkTime * 60))

      sim.step(dt, p.curl, p.velocityDissipation, densDissipation, p.pressureIterations)

      if (imgs.baseTex && imgs.hoverTex) {
        sim.render(imgs.baseTex, imgs.hoverTex, imgs.baseSize, imgs.hoverSize, p.blur, p.circleBoost)
      }

      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      sim.destroy()
      simRef.current = null
    }
  }, [isMobile, simResolution, imageBase, imageHover])

  // Pointer handlers
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const ptr = pointerRef.current
    if (!ptr.hovering) {
      ptr.lastX = x
      ptr.lastY = y
    }
    ptr.x = x
    ptr.y = y
    ptr.hovering = true
  }, [])

  const onPointerLeave = useCallback(() => {
    pointerRef.current.hovering = false
  }, [])

  // Mobile fallback: show base image
  if (isMobile) {
    return (
      <div
        ref={containerRef}
        style={{
          ...style,
          borderRadius,
          overflow: "hidden",
          backgroundImage: imageBase ? `url(${imageBase})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    )
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{
        ...style,
        borderRadius,
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  )
}

// ─── Framer Property Controls ───────────────────────────────────

addPropertyControls(HoverMaskReveal, {
  imageBase: {
    type: ControlType.Image,
    title: "Base Image",
  },
  imageHover: {
    type: ControlType.Image,
    title: "Hover Image",
  },
  borderRadius: {
    type: ControlType.Number,
    title: "Border Radius",
    defaultValue: 0,
    min: 0,
    max: 100,
    step: 1,
    unit: "px",
  },
  splatRadius: {
    type: ControlType.Number,
    title: "Splat Radius",
    defaultValue: 0.25,
    min: 0.01,
    max: 1,
    step: 0.01,
  },
  blur: {
    type: ControlType.Number,
    title: "Mask Blur",
    defaultValue: 0.3,
    min: 0.01,
    max: 1,
    step: 0.01,
  },
  circleBoost: {
    type: ControlType.Number,
    title: "Circle Boost",
    defaultValue: 1.5,
    min: 0.5,
    max: 5,
    step: 0.1,
  },
  curl: {
    type: ControlType.Number,
    title: "Curl",
    defaultValue: 30,
    min: 0,
    max: 100,
    step: 1,
  },
  velocityDissipation: {
    type: ControlType.Number,
    title: "Velocity Dissipation",
    defaultValue: 0.98,
    min: 0.9,
    max: 1,
    step: 0.001,
  },
  shrinkTime: {
    type: ControlType.Number,
    title: "Shrink Time",
    defaultValue: 1.5,
    min: 0.1,
    max: 5,
    step: 0.1,
    unit: "s",
  },
  pressureIterations: {
    type: ControlType.Number,
    title: "Pressure Iterations",
    defaultValue: 20,
    min: 1,
    max: 60,
    step: 1,
  },
  simResolution: {
    type: ControlType.Number,
    title: "Sim Resolution",
    defaultValue: 128,
    min: 32,
    max: 256,
    step: 32,
  },
})

export default HoverMaskReveal
