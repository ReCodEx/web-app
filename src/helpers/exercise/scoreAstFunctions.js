/*
 * This file holds special function that can be used to modify/transform the entire AST tree in its raw form.
 * We have chosen to place this in a separate file to promote readability and extensibility.
 * Furthermore, it would be extrmely difficult to implement these functions on immutable data structure,
 * so it is expected that these transformations are performed on mutable config.
 */

const sum = nums => nums.reduce((acc, x) => acc + x, 0);

const evalNode = {
  avg: children => (children.length > 0 ? sum(children) / children.length : 0),
  clamp: ([x]) => Math.max(0, Math.min(1, x)),
  div: ([a, b]) => (b === 0 ? 0 : a / b),
  max: children => Math.max(...children),
  min: children => Math.min(...children),
  mul: children => children.reduce((acc, x) => acc * x, 1),
  neg: ([x]) => -x,
  sub: ([a, b]) => a - b,
  sum,
};

/**
 * Replace all constant expressions with thei results (as numeric literals).
 * @param {Object} node
 * @returns {Object} modified node
 */
export const removeConstantExpressions = node => {
  if (typeof node === 'number') {
    return node;
  }

  if (node.type === 'value') {
    return node.value;
  }

  if (node.children) {
    node.children = node.children.map(removeConstantExpressions);
    if (evalNode[node.type]) {
      const constants = node.children.filter(child => typeof child === 'number');
      if (constants.length > 1) {
        const value = evalNode[node.type](constants);
        if (constants.length === node.children.length) {
          return value;
        } else {
          node.children = node.children.filter(child => typeof child !== 'number');
          node.children.push(value);
        }
      }
    }
  }

  return node;
};

/**
 * Optimization rules applied in given order to every node recursively (in DFS). Each rule is an object
 * { type, condition, optimisation }. The `type` is node type or array of types to which nodes this rule applies to.
 * The condition is a function that gets node as argument and returns bool, whether the rule may be applied.
 * The optimization is actual transformation function that takes node and yield transformed node.
 */
const optimizationRules = [
  {
    // sub(x,0) is replaced with x
    type: 'sub',
    condition: ({ children }) => children[1] === 0,
    optimization: ({ children }) => children[0],
  },
  {
    // sub(0,x) is replaced with neg(x)
    type: 'sub',
    condition: ({ children }) => children[0] === 0,
    optimization: ({ children }) => ({ type: 'neg', children: [children[1]] }),
  },
  {
    // div(x,0) is replaced with 0
    type: 'div',
    condition: ({ children }) => children[1] === 0,
    optimization: () => 0,
  },
  {
    // div(x,1) is replaced with x
    type: 'div',
    condition: ({ children }) => children[1] === 1,
    optimization: ({ children }) => children[0],
  },
  {
    // neg(neg(x)) is replaced with x
    type: 'neg',
    condition: ({ children: [child] }) => typeof child === 'object' && child.type === 'neg',
    optimization: ({
      children: [
        {
          children: [child],
        },
      ],
    }) => child,
  },
  {
    // clamp(clamp(x)) is replaced with clamp(x)
    type: 'clamp',
    condition: ({ children: [child] }) => typeof child === 'object' && child.type === 'clamp',
    optimization: ({ children: [child] }) => child,
  },
  {
    // all 0 values are removed from sum()
    type: 'sum',
    condition: ({ children }) => children.some(child => child === 0),
    optimization: ({ children, ...rest }) => ({ ...rest, children: children.filter(child => child !== 0) }),
  },
  {
    // if mul() contains 0, replace it with 0
    type: 'mul',
    condition: ({ children }) => children.some(child => child === 0),
    optimization: () => 0,
  },
  {
    // all 1 values are removed from mul()
    type: 'mul',
    condition: ({ children }) => children.some(child => child === 1),
    optimization: ({ children, ...rest }) => ({ ...rest, children: children.filter(child => child !== 1) }),
  },
  {
    // avg(), sum(), mul(), min(), and max() with a single child are replaced with that child
    type: ['avg', 'sum', 'mul', 'min', 'max'],
    condition: ({ children }) => children.length === 1,
    optimization: ({ children: [child] }) => child,
  },
];

/**
 * Perform optimizations (except for the constant expression replacement) on the given node and its subtree.
 * @param {Object} node
 * @returns {Object}
 */
export const optimize = node => {
  if (typeof node === 'number') {
    return node;
  }

  if (node.type === 'value') {
    return node.value;
  }

  if (node.children) {
    node.children = node.children.map(optimize);
    optimizationRules.forEach(({ type, condition, optimization }) => {
      if (
        typeof node === 'object' &&
        (Array.isArray(type) ? type.includes(node.type) : type === node.type) &&
        condition(node)
      ) {
        node = optimization(node);
      }
    });
  }

  return node;
};

/**
 * Internal function that detects a node is of given type (also recognize numbers as 'value' nodes).
 * @param {Object|number} node
 * @param {string} type
 * @returns {boolean}
 */
const _isOfType = (node, type) => {
  return (typeof node === 'object' && node.type === type) || (type === 'value' && typeof node === 'number');
};

/**
 * Internal function that retrieves a value of 'value' nodes (handles both numeric values and 'value' objects).
 * @param {Object|number} node
 * @returns {number|null} null if given node is not value node
 */
const _getValue = node => (_isOfType(node, 'value') ? (typeof node === 'number' ? node : node.value) : null);

/**
 * Internal function that returns all nodes that pass filter test from given subtree.
 * @param {Object|number} node root node of target subtree
 * @param {Function} filter filtering function (node => boolean)
 */
const _getAllNodes = (node, filter) => {
  const res =
    typeof node === 'object' && node.children ? node.children.flatMap(child => _getAllNodes(child, filter)) : [];
  if (!filter || filter(node)) {
    res.push(node);
  }
  return res;
};

/**
 * Internal function that extract children nodes of given type.
 * @param {Object} node parent
 * @param  {string[]} types list of types of child nodes
 * @returns {Array} array holding a corresponding child (or null) to each type of `types`
 */
const _extractChildren = (node, ...types) => {
  if (typeof node !== 'object' || !node.children || node.children.length === 0) {
    return types.map(() => null);
  }

  return types.map(type => {
    const res = node.children.find(child => _isOfType(child, type)) || null;
    return type === 'value' ? _getValue(res) : res;
  });
};

/**
 * Internal function that finds all test-result nodes and accumulate them into a result object.
 * @param {Array} nodes list of nodes
 * @param {Object} accumulator object collecting test results (and their weights)
 * @param {number} weight the value written into accumulator (key is the test name)
 */
const _accumulateTestResultNodes = (nodes, accumulator, weight = 1) => {
  nodes
    .filter(node => _isOfType(node, 'test-result'))
    .forEach(node => {
      accumulator[node.test] = weight;
    });
};

/**
 * A very tolerant function that optimizes the configuration tree, tries to find either
 * weighted average or regular average pattern, and extract the test names and their weights.
 * @param {Object} root root node of the serialized configuration
 * @returns {Object|null} object where keys are test names and values are weights (null on failure)
 */
export const attemptExtractWeights = root => {
  if (!root) {
    return null;
  }

  root = removeConstantExpressions(root);
  root = optimize(root);

  // try to find weighted average expression pattern
  const divNodes = _getAllNodes(root, node => _isOfType(node, 'div'));
  if (divNodes.length === 1) {
    const [sumNode, divisor] = _extractChildren(divNodes[0], 'sum', 'value');
    if (sumNode && divisor) {
      const res = {};

      // nested mul nodes that contain value (weight) and test node are accumulated in res
      sumNode.children
        .filter(node => _isOfType(node, 'mul'))
        .forEach(node => {
          const [test, weight] = _extractChildren(node, 'test-result', 'value');
          if (test !== null && weight !== null) {
            res[test.test] = weight;
          }
        });

      // standalone test-result nodes are added to res with weight 1
      _accumulateTestResultNodes(sumNode.children, res, 1);

      return Object.keys(res).length > 0 ? res : null;
    }
  }

  // try to find regular average pattern
  const avgNodes = _getAllNodes(root, node => _isOfType(node, 'avg'));
  if (avgNodes.length === 1) {
    const res = {};
    _accumulateTestResultNodes(avgNodes[0].children, res, 100);
    return Object.keys(res).length > 0 ? res : null;
  }

  return null;
};
