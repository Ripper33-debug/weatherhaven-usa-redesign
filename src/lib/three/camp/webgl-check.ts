/** Kept apart from the scenes so the check doesn't download three.js. */
/**
 * Whether this browser can draw the 3D scenes (the mission builder's camp and the TRECC on the
 * homepage and its product page): WebGL must be on and drawn by a GPU. Software WebGL
 * (SwiftShader, llvmpipe, Windows' Basic Render Driver) turns every frame into a long main-thread task, so those browsers get
 * the photo instead. Test runs that render in software on purpose set __CAMP_ALLOW_SOFTWARE__.
 */
export function canUseWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)).toLowerCase();
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    const w = window as unknown as { __CAMP_ALLOW_SOFTWARE__?: boolean; __CAMP_STILL__?: boolean; __CAMP_CAPTURE__?: boolean };
    const software = /swiftshader|llvmpipe|softpipe|software|basic render driver/.test(name);
    return !software || !!(w.__CAMP_ALLOW_SOFTWARE__ || w.__CAMP_STILL__ || w.__CAMP_CAPTURE__);
  } catch {
    return false;
  }
}
