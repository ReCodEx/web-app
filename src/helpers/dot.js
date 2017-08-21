import Viz from 'viz.js/viz-lite';

const subnode = (node, port) => `"${node}__${port}"`;

const createDependency = (from, to, clusterTo = null) => {
  const dep =
    `${from} -> ${to}` +
    (clusterTo === null ? '' : `[lhead = cluster_${clusterTo}]`);
  return dep;
};

const createDotForNodeFactory = dependencies => (
  name,
  portsIn,
  portsOut,
  i
) => {
  let hasFullSupport = true;
  const inputs = Object.keys(portsIn)
    .map(portName => portsIn[portName].value)
    .map(port => {
      const hasSupport = dependencies.find(
        dep => dep.to === name && dep.name === port
      );

      if (!hasSupport) {
        hasFullSupport = false;
      }

      return (
        `${subnode(name, port)} [label="${port}"]` +
        (!hasSupport ? '[color=red, fontcolor=red]' : '')
      );
    });

  const outputs = Object.keys(portsOut)
    .map(portName => portsOut[portName].value)
    .map(port => `${subnode(name, port)} [label="${port}"]`);

  return `
      subgraph cluster_${i} {
        label = "${name}";
        id = "B-${name}";
        ${!hasFullSupport
          ? 'fontcolor=red; color=red;'
          : 'color = "#f8f8f8"; style=filled;'}
        subgraph cluster_inputs {
          style = "filled";
          id = "I-${name}";
          label = "inputs";
          color = "#fcffc6";
          fontcolor = black;
          ${inputs.join(';')}
        }
        subgraph cluster_outputs {
          style = "filled";
          id = "O-${name}";
          label = "outputs";
          color = "#d1f9e9";
          fontcolor = black;
          ${outputs.join(';')}
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
