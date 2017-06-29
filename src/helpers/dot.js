import Viz from 'viz.js/viz-lite';

const subnode = (node, port) => `${node}__${port}`;

const createDependency = (from, to, clusterTo = null) => {
  const dep =
    `"${from}" -> "${to}"` +
    (clusterTo === null ? '' : `[lhead = cluster_${clusterTo}]`);
  return dep;
};

export const convertGraphToDot = ({ nodes, dependencies }) => {
  const commands = dependencies.map(({ from, to, name }) => {
    const nodeTo = nodes.find(node => node.name === to);
    const clusterTo = nodes.indexOf(nodeTo);
    return createDependency(subnode(from, name), subnode(to, name), clusterTo);
  });

  const subgraphs = nodes.map(({ name, portsIn, portsOut }, i) => {
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
        ${!hasFullSupport ? 'color=red; fontcolor=red;' : ''}
        subgraph cluster_inputs {
          style = "filled";
          label = "inputs";
          color = "#fcffc6";
          fontcolor = black;
          ${inputs.join(';')}
        }
        subgraph cluster_outputs {
          style = "filled";
          label = "outputs";
          color = "#d1f9e9";
          fontcolor = black;
          ${outputs.join(';')}
        }
      }`;
  });

  const mapOutputsToScore = nodes
    .map(({ name, portsOut }) => {
      const score = portsOut.find(port => port === 'score');
      return score ? createDependency(subnode(name, 'score'), 'score') : null;
    })
    .filter(cmd => cmd !== null);

  return `
    digraph {
      node [shape=rect];
      compound = true;
      ${subgraphs.join('\n')}
      ${commands.join(';')}
      ${mapOutputsToScore.join(';')}
      score [shape=doublecircle, style=filled, color = "#00a65a", fontcolor=white];
    }`;
};

export const convertGraphToSvg = graph => {
  const dot = convertGraphToDot(graph);
  return Viz(dot);
};
