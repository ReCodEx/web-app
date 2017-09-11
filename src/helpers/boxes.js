export const UNKNOWN_PORT_TYPE = '?';
export const isUnknownType = type => type === UNKNOWN_PORT_TYPE;
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

const transformPort = ({ type, value }, variableTypes) => ({
  type: isUnknownType(type) ? variableTypes[value].type : type,
  value
});

const transformPortTypes = (ports, boxTypePorts, variableTypes) =>
  Object.keys(boxTypePorts).reduce(
    (acc, name) => ({
      ...acc,
      [name]: ports[name]
        ? transformPort(ports[name], variableTypes)
        : { value: '', type: boxTypePorts[name].type }
    }),
    {}
  );

export const transformPipelineDataForApi = (boxTypes, { boxes, variables }) => {
  const variableTypes = getVariablesTypes(boxTypes, boxes);
  const transformedData = {
    boxes: boxes.map(box => {
      const boxType = boxTypes.find(boxType => boxType.type === box.type);

      if (Object.keys(boxType.portsIn).length === 0) {
        delete box.portsIn;
      } else {
        box.portsIn = transformPortTypes(
          box.portsIn,
          boxType.portsIn,
          variableTypes
        );
      }

      if (Object.keys(boxType.portsOut).length === 0) {
        delete box.portsOut;
      } else {
        box.portsOut = transformPortTypes(
          box.portsOut,
          boxType.portsOut,
          variableTypes
        );
      }

      return box;
    }),
    variables: Object.keys(variables)
      .map(key => ({
        name: atob(key),
        value: variables[key]
      }))
      .filter(
        ({ name }) =>
          variableTypes[name] && !isUnknownType(variableTypes[name].type)
      )
      .map(({ name, ...variable }) => ({
        ...variable,
        name,
        type: variableTypes[name].type
      }))
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
                  type: boxType.portsIn[port].type
                }
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
                  type: boxType.portsOut[port].type
                }
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
      ...Object.keys(ports)
        .filter(port => isUnknownType(ports[port].type) === false)
        .map(port => ({
          name: port,
          type: ports[port].type,
          value: btoa(ports[port].value)
        }))
    ],
    []
  );

export const extractVariables = (boxes = []) => {
  const inputs = flattenPorts(
    boxes.map(box => ({ ...box.portsIn })).filter(ports => ports)
  );

  // remove duplicities
  return inputs.reduce(
    (acc, port) =>
      !acc.find(item => item.name === port.name) ? [...acc, port] : acc,
    []
  );
};
