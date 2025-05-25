// src/wasmEngine.js
let engineModule = null;

export async function loadEngine() {
  if (engineModule) return engineModule; // Singleton

  // Dynamically import the Emscripten module
  // The default export is a function that returns a Promise
  const createModule = await import('../public/mahoraga.js');
  console.log('createModule', createModule);
  engineModule = await createModule.default(); // Emscripten 2.x+ uses .default
  return engineModule;
}
