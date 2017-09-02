export const isUnknownType = type => type === '?';
export const isArrayType = type => type.indexOf('[]') > 0;

export const getVariablesTypes = (boxTypes, boxes) => {
  const variablesTypes = {};
  for (let box of boxes) {
    let boxType = boxTypes.find(boxType => boxType.type === box.type);
    for (let port of Object.keys(box.portsIn)) {
      const { value } = box.portsIn[port];
      const { type } = boxType.portsIn[port];
      variablesTypes[value] = {
        type,
        examplePort: box.name
      };
    }
    for (let port of Object.keys(box.portsOut)) {
      const { value } = box.portsOut[port];
      const { type } = boxType.portsOut[port];
      variablesTypes[value] = {
        type,
        examplePort: box.name
      };
    }
  }

  return variablesTypes;
};

export const transformPipelineDataForApi = (boxTypes, { boxes, variables }) => {
  console.log(boxTypes);
  const variableTypes = getVariablesTypes(boxTypes, boxes);
  const transformedData = {
    boxes: boxes.map(box => {
      if (Object.keys(box.portsIn).length === 0) {
        delete box.portsIn;
      }

      if (Object.keys(box.portsOut).length === 0) {
        delete box.portsOut;
      }

      return box;
    }),
    variables: Object.keys(variables)
      .map(key => ({
        name: atob(key),
        value: variables[key]
      }))
      .filter(({ name }) => variableTypes[name])
      .map(({ name, ...variable }) => ({
        ...variable,
        name,
        type: variableTypes[name].type
      }))
  };

  return transformedData;
};
