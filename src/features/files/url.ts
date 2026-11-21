export const FILE_BUCKET = "house-files";
export const FILE_MAX_BYTES = 50 * 1024 * 1024;

export const FILE_EXTENSIONS = [
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt",
  "zip", "rar", "7z",
  "obj", "mtl", "fbx", "glb", "gltf", "stl", "skp", "dwg", "dxf", "ifc", "3ds", "blend",
] as const;

/** For the accept attribute of the file picker. */
export const FILE_ACCEPT = FILE_EXTENSIONS.map((extension) => `.${extension}`).join(",");

export function extensionOf(name: string) {
  const dot = name.lastIndexOf(".");
  return dot < 0 ? "" : name.slice(dot + 1).toLowerCase();
}

export function isAllowedFile(name: string) {
  return (FILE_EXTENSIONS as readonly string[]).includes(extensionOf(name));
}