export const addNode = (graph, node) => {
  graph.nodes.push(node);
  return addDependencies(graph, node);
};

export const addDependencies = (graph, node) => {
  const dependencies = graph.dependencies;
  const candidates = [];

  const nodePortsIn = node.portsIn ? Object.keys(node.portsIn) : {};
  const nodePortsOut = node.portsOut ? Object.keys(node.portsOut) : {};

  for (let old of graph.nodes) {
    const oldPortsIn = old.portsIn ? Object.keys(old.portsIn) : {};
    const oldPortsOut = old.portsOut ? Object.keys(old.portsOut) : {};
    for (let portInName of oldPortsIn) {
      const portIn = old.portsIn[portInName];
      if (portIn.value.length === 0) {
        continue;
      }

      for (let portOutName of nodePortsOut) {
        const portOut = node.portsOut[portOutName];
        if (portOut.value.length > 0 && portIn.value === portOut.value) {
          candidates.push({
            from: node.name,
            to: old.name,
            name: portIn.value,
          });
        }
      }
    }

    for (let portInName of nodePortsIn) {
      const portIn = node.portsIn[portInName];
      if (portIn.value.length === 0) {
        continue;
      }

      for (let portOutName of oldPortsOut) {
        const portOut = old.portsOut[portOutName];
        if (portOut.value.length > 0 && portIn.value === portOut.value) {
          candidates.push({
            from: old.name,
            to: node.name,
            name: portIn.value,
          });
        }
      }
    }
  }

  for (let candidate of candidates) {
    let unique = true;
    for (let dependency of dependencies) {
      if (candidate.name === dependency.name && candidate.from === dependency.from && candidate.to === dependency.to) {
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
    dependencies,
  };
};

export const removeNode = ({ nodes, dependencies }, node) => ({
  nodes: nodes.filter(n => n.name !== node.name),
  dependencies: dependencies.filter(dep => dep.from !== node.name && dep.to !== node.name),
});

export const replaceNode = (graph, oldNode, newNode) => addNode(removeNode(graph, oldNode), newNode);

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
