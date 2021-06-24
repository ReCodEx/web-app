const extMapping = {
  java: 'java',
  css: 'css',
  cs: 'csharp',
  c: 'c_cpp',
  cpp: 'c_cpp',
  h: 'c_cpp',
  hpp: 'c_cpp',
  ino: 'c_cpp',
  groovy: 'groovy',
  html: 'html',
  js: 'javascript',
  kt: 'kotlin',
  kts: 'kotlin',
  ktm: 'kotlin',
  md: 'markdown',
  markdown: 'markdown',
  pas: 'pascal',
  lpr: 'pascal',
  py: 'python',
  php: 'php',
  rs: 'rust',
  sc: 'scala',
  scala: 'scala',
  ts: 'typescript',
};

export const getAceModeFromExtension = ext => {
  ext = ext.trim().toLowerCase();
  if (ext === '') {
    return 'makefile'; // makefile has no extension
  } else if (extMapping[ext]) {
    return extMapping[ext]; // mapping found
  } else {
    return 'c_cpp'; // C/C++ is default
  }
};
