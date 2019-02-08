import Viz from 'viz.js/viz-lite';

const subnode = (node, port) => `"${node}__${port}"`;

const createDependency = (from, to, clusterTo = null) => {
  const dep =
    `${from} -> ${to}` +
    (clusterTo === null ? '' : `[lhead = cluster_${clusterTo}]`);
  return dep;
};

const createDotForPorts = (name, ports) =>
  Object.keys(ports)
    .map(portName => ports[portName].value)
    .filter(value => value.length > 0)
    .map(port => `${subnode(name, port)} [label="${port}"]`);

const createDotForNodeFactory = dependencies => (
  name,
  portsIn = {},
  portsOut = {},
  i
) => {
  let hasFullSupport = true;
  const inputs = createDotForPorts(name, portsIn);
  const outputs = createDotForPorts(name, portsOut);

  return `
      subgraph cluster_${i} {
        label = "${name}";
        id = "B-${name}";
        ${
          !hasFullSupport
            ? 'fontcolor = "red"; color = "red";'
            : 'color = "black"; style = "filled, solid";'
        }
        fillcolor = "#f9f9f9";
        subgraph cluster_inputs {
          style = "filled, solid";
          id = "I-${name}";
          label = "inputs";
          color = "#fcffc6";
          fillcolor = "#fcffc6";
          fontcolor = black;
          ${inputs.join(';')}
        }
        subgraph cluster_outputs {
          style = "filled, solid";
          id = "O-${name}";
          label = "outputs";
          color = "#d1f9e9";
          fillcolor = "#d1f9e9";
          fontcolor = black;
          ${outputs.join(';')}
        }
        ${
          inputs.length === 0 && outputs.length === 0
            ? `"E-${name}" [label="void"]`
            : ''
        }
      }`;
};

const createDotForDependencyFactory = nodes => (from, to, name) => {
  const nodeTo = nodes.find(node => node.name === to);
  const clusterTo = nodes.indexOf(nodeTo);
  return createDependency(subnode(from, name), subnode(to, name), clusterTo);
};

const createDotForGraph = (nodes, commands) => `
    digraph {
      node [shape=rect];
      compound = true;
      ${nodes.join('\n')}
      ${commands.join(';')}
    }`;

export const convertGraphToDot = ({ nodes, dependencies }) => {
  const createDotForDependency = createDotForDependencyFactory(nodes);
  const commands = dependencies.map(({ from, to, name }) =>
    createDotForDependency(from, to, name)
  );

  const createDotForNode = createDotForNodeFactory(dependencies);
  const nodesDot = nodes.map(({ name, portsIn, portsOut }, i) =>
    createDotForNode(name, portsIn, portsOut, i)
  );

  return createDotForGraph(nodesDot, commands);
};

export const convertGraphToSvg = graph => {
  const dot = graph ? convertGraphToDot(graph) : '';
  return Viz(dot);
};
