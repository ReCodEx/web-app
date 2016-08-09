
export const getFiles = state => state.files;
export const getSourceCode = id => state => getFiles(state).getIn(['resources', id]);
