export const isArrayType = type => type.indexOf('[]') > 0;

export const getVariablesTypes = (boxTypes, boxes) => {
  const variablesTypes = {};
  for (const box of boxes) {
    const boxType = boxTypes.find(boxType => boxType.type === box.type);
    for (const port of Object.keys(box.portsIn || {})) {
      const { value } = box.portsIn[port];
      const { type } = boxType.portsIn[port];
      variablesTypes[value] = {
        type,
        examplePort: box.name,
      };
    }
    for (const port of Object.keys(box.portsOut)) {
      const { value } = box.portsOut[port];
      const { type } = boxType.portsOut[port];
      variablesTypes[value] = {
        type,
        examplePort: box.name,
      };
    }
  }

  return variablesTypes;
};

const transformPortTypes = (ports, boxTypePorts, variableTypes) =>
  Object.keys(boxTypePorts).reduce(
    (acc, name) => ({
      ...acc,
      [name]: ports[name] ? ports[name] : { value: '', type: boxTypePorts[name].type },
    }),
    {}
  );

export const transformPipelineDataForApi = (boxTypes, { boxes, variables }, extractedVariables) => {
  const variableTypes = getVariablesTypes(boxTypes, boxes);
  const transformedData = {
    boxes: boxes.map(box => {
      const boxType = boxTypes.find(boxType => boxType.type === box.type);

      if (Object.keys(boxType.portsIn).length === 0) {
        delete box.portsIn;
      } else {
        box.portsIn = transformPortTypes(box.portsIn, boxType.portsIn, variableTypes);
      }

      if (Object.keys(boxType.portsOut).length === 0) {
        delete box.portsOut;
      } else {
        box.portsOut = transformPortTypes(box.portsOut, boxType.portsOut, variableTypes);
      }

      return box;
    }),
    variables: extractedVariables
      .map(({ value }) => value)
      .map(key => ({
        name: atob(key),
        value: variables[key] ? variables[key] : '',
      }))
      .filter(({ name }) => variableTypes[name])
      .map(({ name, ...variable }) => ({
        ...variable,
        name,
        type: variableTypes[name].type,
      })),
  };

  return transformedData;
};

export const createBoxFromFormInputs = (data, boxTypes) => {
  const boxType = boxTypes.find(box => box.type === data.type);
  if (!boxType) {
    throw new Error('No box type was selected.');
  }

  const allowedPortsIn = Object.keys(boxType.portsIn);
  const allowedPortsOut = Object.keys(boxType.portsOut);

  const portsIn = data.portsIn
    ? allowedPortsIn.reduce(
        (acc, port) =>
          data.portsIn[port]
            ? {
                ...acc,
                [port]: {
                  ...data.portsIn[port],
                  type: boxType.portsIn[port].type,
                },
              }
            : acc,
        {}
      )
    : {};

  const portsOut = data.portsOut
    ? allowedPortsOut.reduce(
        (acc, port) =>
          data.portsOut[port]
            ? {
                ...acc,
                [port]: {
                  ...data.portsOut[port],
                  type: boxType.portsOut[port].type,
                },
              }
            : acc,
        {}
      )
    : {};

  return { ...data, portsIn, portsOut };
};

const flattenPorts = boxes =>
  boxes.reduce(
    (acc, ports) => [
      ...acc,
      ...Object.keys(ports).map(port => ({
        name: port,
        type: ports[port].type,
        value: btoa(ports[port].value),
      })),
    ],
    []
  );

export const extractVariables = (boxes = []) => {
  const inputs = flattenPorts(boxes.map(box => ({ ...box.portsIn })).filter(ports => ports)).filter(
    ({ value }) => value.length > 0
  );

  // remove duplicities
  return inputs.reduce((acc, port) => (!acc.find(item => item.name === port.name) ? [...acc, port] : acc), []);
};
