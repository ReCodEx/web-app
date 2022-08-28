const commonMapping = {
  cs: 'csharp',
  css: 'css',
  groovy: 'groovy',
  java: 'java',
  js: 'javascript',
  kt: 'kotlin',
  kts: 'kotlin',
  ktm: 'kotlin',
  lpr: 'pascal',
  makefile: 'makefile',
  md: 'markdown',
  markdown: 'markdown',
  pas: 'pascal',
  php: 'php',
  py: 'python',
  rs: 'rust',
  sc: 'scala',
  scala: 'scala',
  ts: 'typescript',
};

const aceMapping = {
  ...commonMapping,
  c: 'c_cpp',
  cpp: 'c_cpp',
  h: 'c_cpp',
  hpp: 'c_cpp',
  ino: 'c_cpp',
  html: 'html',
};

export const createExtensionTranslator = mapping => ext => {
  ext = ext.trim().toLowerCase();
  if (ext === '') {
    return mapping.makefile; // makefile has no extension
  } else if (mapping[ext]) {
    return mapping[ext]; // mapping found
  } else {
    return mapping.cpp; // C/C++ is default
  }
};

const prismMapping = {
  ...commonMapping,
  bash: 'bash',
  c: 'cpp',
  cpp: 'cpp',
  cu: 'cpp', // CUDA
  go: 'go',
  h: 'cpp',
  hpp: 'cpp',
  hs: 'haskell',
  html: 'markup',
  ino: 'arduino',
  pl: 'prolog',
  sh: 'bash',
  sql: 'sql',
  svg: 'markup',
  y: 'bison',
  xml: 'markup',
};

export const getAceModeFromExtension = createExtensionTranslator(aceMapping);
export const getPrismModeFromExtension = createExtensionTranslator(prismMapping);
