import Viz from 'viz.js/viz-lite';

const subnode = (node, port) => `${node}__${port}`;

const createDependency = (from, to, clusterTo = null) => {
  const dep =
    `"${from}" -> "${to}"` +
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
  const inputs = portsIn.map(port => {
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

  const outputs = portsOut.map(
    port => `${subnode(name, port)} [label=${port}]`
  );

  return `
      subgraph cluster_${i} {
        label = "${name}";
        id = "${name}";
        ${!hasFullSupport ? 'color=red; fontcolor=red;' : ''}
        subgraph cluster_inputs {
          style = "filled";
          id = "${name}_inputs";
          label = "inputs";
          color = "#fcffc6";
          fontcolor = black;
          ${inputs.join(';')}
        }
        subgraph cluster_outputs {
          style = "filled";
          id = "${name}_outputs";
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

const createDotForGraph = (nodes, commands, outputsToScore) => `
    digraph {
      node [shape=rect];
      compound = true;
      ${nodes.join('\n')}
      ${commands.join(';')}
      ${outputsToScore.join(';')}
      score [shape=doublecircle, style=filled, color = "#00a65a", fontcolor=white];
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

  // 'score' is a special case of dependency - the only expected output of the pipeline
  const outputsToScore = nodes
    .map(({ name, portsOut }) => {
      const score = portsOut.find(port => port === 'score');
      return score ? createDependency(subnode(name, 'score'), 'score') : null;
    })
    .filter(cmd => cmd !== null);

  return createDotForGraph(nodesDot, commands, outputsToScore);
};

export const convertGraphToSvg = graph => {
  const dot = graph ? convertGraphToDot(graph) : '';
  return Viz(dot);
};
