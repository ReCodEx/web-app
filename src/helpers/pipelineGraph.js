export const addNode = (graph, node) => {
  graph.nodes.push(node);
  return addDependencies(graph, node);
};

export const addDependencies = (graph, node) => {
  const dependencies = graph.dependencies;
  const candidates = [];

  for (let old of graph.nodes) {
    for (let portInName of Object.keys(old.portsIn)) {
      const portIn = old.portsIn[portInName];
      for (let portOutName of Object.keys(node.portsOut)) {
        const portOut = node.portsOut[portOutName];
        if (portIn.value === portOut.value) {
          candidates.push({
            from: node.name,
            to: old.name,
            name: portIn.value
          });
        }
      }
    }

    for (let portInName of Object.keys(node.portsIn)) {
      const portIn = node.portsIn[portInName];
      for (let portOutName of Object.keys(old.portsOut)) {
        const portOut = old.portsOut[portOutName];
        if (portIn.value === portOut.value) {
          candidates.push({
            from: old.name,
            to: node.name,
            name: portIn.value
          });
        }
      }
    }
  }

  for (let candidate of candidates) {
    let unique = true;
    for (let dependency of dependencies) {
      if (
        candidate.name === dependency.name &&
        candidate.from === dependency.from &&
        candidate.to === dependency.to
      ) {
        unique = false;
        break;
      }
    }

    if (unique === true) {
      dependencies.push(candidate);
    }
  }

  return {
    nodes: graph.nodes,
    dependencies
  };
};

export const removeNode = ({ nodes, dependencies }, node) => ({
  nodes: nodes.filter(n => n.name !== node.name),
  dependencies: dependencies.filter(
    dep => dep.from !== node.name && dep.to !== node.name
  )
});

export const replaceNode = (graph, oldNode, newNode) =>
  addNode(removeNode(graph, oldNode), newNode);

export const createGraphFromNodes = nodes => {
  let graph = { nodes, dependencies: [] };

  for (let node of graph.nodes) {
    graph = addDependencies(graph, node);
  }

  return graph;
};

/*
 * Manipulation with the JSON source code
 */

export const createGraphFromSource = source => {
  const nodes = JSON.parse(source);
  return createGraphFromNodes(nodes);
};

export const graphToSource = graph => JSON.stringify(graph.nodes);
