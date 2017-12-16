import { canUseDOM } from 'exenv';

export const loadAceEditor = () => {
  let AceEditor = null;
  if (canUseDOM) {
    AceEditor = require('react-ace').default;
    require('brace/theme/monokai');
    require('brace/theme/github');
    require('brace/mode/c_cpp');
    require('brace/mode/java');
    require('brace/mode/csharp');
    require('brace/mode/pascal');
    require('brace/keybinding/vim');
  }
  return AceEditor;
};

export const getAceModeFromExtension = ext => {
  const extMapping = {
    java: 'java',
    cs: 'csharp',
    c: 'c_cpp',
    cpp: 'c_cpp',
    h: 'c_cpp',
    hpp: 'c_cpp',
    md: 'markdown',
    markdown: 'markdown',
    pas: 'pascal',
    lpr: 'pascal'
  };

  ext = ext.trim().toLowerCase();
  if (ext === '') {
    return 'makefile'; // makefile has no extension
  } else if (extMapping[ext]) {
    return extMapping[ext]; // mapping found
  } else {
    return 'c_cpp'; // C/C++ is default
  }
};
