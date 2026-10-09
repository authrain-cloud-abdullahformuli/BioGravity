/**
 * Polyfill for WebGPU constants.
 * Some libraries (like three-render-objects, used by react-force-graph-3d)
 * attempt to access these constants even when using WebGL, leading to
 * "Cannot read properties of undefined (reading 'VERTEX')" errors
 * in environments where WebGPU is not supported or during SSR.
 */
if (typeof window !== 'undefined') {
    window.GPUShaderStage = window.GPUShaderStage || {
        VERTEX: 1,
        FRAGMENT: 2,
        COMPUTE: 4
    };

    window.GPUBufferUsage = window.GPUBufferUsage || {
        MAP_READ: 1,
        MAP_WRITE: 2,
        COPY_SRC: 4,
        COPY_DST: 8,
        INDEX: 16,
        VERTEX: 32,
        UNIFORM: 64,
        STORAGE: 128,
        INDIRECT: 256,
        QUERY_RESOLVE: 512,
        RENDER_ATTACHMENT: 1024
    };
}

export { };
