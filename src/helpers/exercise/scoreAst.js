/**
 * This is a bit tough piece of code, so this prologue should help you understand it.
 * TODO
 */

import React from 'react';
import { FormattedMessage } from 'react-intl';
import { arrayToObject } from '../common';

// Generic node types
export const FUNCTION_NODE = 'function';
export const TEST_NODE = 'test';
export const LITERAL_NODE = 'literal';

/**
 * Get a key for sorting (a string with serialized location vector).
 * This function assumes that no node in the tree has more than 9,999 children.
 * @param {AstNode} node
 */
const _getSortingKey = node =>
  node
    .getLocationVector()
    .map(idx => String(idx).padStart(4, '0'))
    .join('-');

/**
 * Internal function that sorts nodes by their position in the tree (DFS ordering).
 */
const sortNodes = nodes => {
  if (nodes.length < 2) {
    return nodes; // small optimization
  }

  const wrapped = nodes.map(node => ({ node, key: _getSortingKey(node) }));
  wrapped.sort();
  return wrapped.map(({ node }) => node);
};

class MutableNodeList {
  constructor() {
    this.nodes = [];
  }

  addNode(node) {
    this.nodes.push(node);
    node.setParent(this);
  }

  /**
   * Actually reimplements the interface of AstNode, but in a mutable way (just modify internal list of nodes).
   * @param {AstNode} oldChild
   * @param {AstNode} newChild
   */
  _childChanged(oldChild, newChild) {
    const index = this.nodes.indexOf(oldChild);
    if (index >= 0) {
      this.nodes[index] = newChild;
    }
  }
}

/*
 * Abstract AST classes
 */
let idCounter = 0; // internal counter for generating unique IDs

/*
TODO - parent bude mutable, pri zmene children se musi naklonovat node
- pri zmene roota (napr. pri undo) se opravi vsechny parenty (rekurzivne podle children).
- zvazit, jestli neudelat parenta pres indirekci (objekt) a nezafreezovat this (otazka kdy)
*/
export class AstNode {
  /**
   * Initialize an empty node. The node remains mutable until initialized by deserialization,
   * or until connected to a real tree by modification functions.
   * @param {string} [id=null] Unique identifier of the node. If missing, it is generated automatically.
   */
  constructor(id = null) {
    this.id = id || `${this.getType()}-${++idCounter}`;
    this.parent = { parent: null }; // this way we keep the parent mutable after freeze
    this.children = [];

    this._fixChildrenPlaceholders();
    this._fixChildrenParentage();
  }

  /**
   * Remove unnecessary placeholders (if this node is comutative or if the number of children is exceeded).
   * This must be called before the node is frozen.
   */
  _fixChildrenPlaceholders() {
    if (this.isComutative() || this.children.length > this.getMaxChildren()) {
      this.children = this.children.filter(child => child && !(child instanceof AstNodePlaceholder));
    }

    // Fill missing children with placeholders
    while (this.children.length < this.getMinChildren()) {
      this.children.push(new AstNodePlaceholder());
    }
  }

  /**
   * Fix the parent references of all children. The references are mutable.
   * @param {boolean} recursive If true, the operation will be performed in the entire subtree.
   */
  _fixChildrenParentage(recursive = false) {
    this.children.forEach(child => {
      child.setParent(this);
      if (recursive) {
        child._fixChildrenParentage(true);
      }
    });
  }

  // TODO remove
  _check() {
    const errors = this.children.filter(child => child.getParent() !== this);
    if (errors.length > 0) {
      console.log(this);
      console.log(errors);
    }

    this.children.forEach(child => child._check());
  }

  /**
   * Internal deserialization routine.
   * @param {Array} config A JSON configuration node as retrieved from the API.
   */
  _initFromConfig(config) {
    if (config.children && config.children.length > 0) {
      this.children = config.children.map(childConf => _deserialize(childConf) || new AstNodePlaceholder());
      this._fixChildrenPlaceholders();
      this._fixChildrenParentage();
    }
  }

  /**
   * Internal cloning function that creates a copy of self.
   * @param {boolean} [forceNewId=false] If true, the clone will have new unique ID. Otherwise even the ID is copied.
   */
  _clone(forceNewId = false) {
    const clone = this.constructor(forceNewId ? null : this.id);
    clone.setParent(this.getParent());
    clone.children = this.children;
    return clone;
  }

  /**
   * Create a clone of this node with updated children and initiate its replacement within a tree.
   * @param {Function} updater creates new children array from the old one
   * @param {boolean} [keepPlaceholders=false] If true, placeholders will not be modified (not even if the capacity of the node is exceeded).
   */
  _updateChildren(updater, keepPlaceholders = false) {
    // Create clone with updated children
    const clone = this._clone();
    clone.children = updater(clone.children);

    // Make sure children are OK and have the right parent ref.
    if (!keepPlaceholders) {
      clone._fixChildrenPlaceholders();
    }
    clone._fixChildrenParentage();

    // Finalize and report the change upwards
    Object.freeze(clone);
    if (this.getParent() && this.getParent()._childChanged) {
      this.getParent()._childChanged(this, clone);
    }
    return clone;
  }

  /**
   * Replace given child with one ore more new nodes.
   * @param {AstNode|null} child Child node to be replaced; if null, new nodes are appended
   * @param {AstNode|AstNode[]} newNodes Node or array of nodes to be placed where the original node was.
   * @param {boolean} [keepPlaceholders=false] If true, placeholders will not be modified (not even if the capacity of the node is exceeded).
   */
  _replaceChild(child, newNodes = [], keepPlaceholders = false) {
    if (!Array.isArray(newNodes)) {
      newNodes = newNodes ? [newNodes] : [];
    }

    return this._updateChildren(children => {
      let position = children.indexOf(child);
      position = position < 0 ? children.length : position;
      return [...children.slice(0, position), ...newNodes, ...children.slice(position + 1)];
    }, keepPlaceholders);
  }

  /**
   * Internal function used to update the tree. If node is changed (i.e., its update-clone is created),
   * it calls this function on its parent to introduce the updated clone into the tree.
   * @param {AstNode} [oldChild=null] child node to be replaced (if null, new child is appended)
   * @param {AstNode} [newChild=null] child node to be inserted (if null, only old child is removed/replaced with placeholder)
   */
  _childChanged(oldChild, newChild) {
    if (!oldChild && !newChild) {
      throw new Error('At least one argument (oldChild, newChild) must not be null in child changed notificator.');
    }

    if (newChild === null) {
      const oldIndex = this.children.indexOf(oldChild);
      const shouldPreservePlace =
        !this.isComutative() &&
        oldIndex < this.children.length - 1 &&
        !(this.children[oldIndex + 1] instanceof AstNodePlaceholder);

      if (shouldPreservePlace || this.children.length <= this.getMinChildren()) {
        // Removing child from inside of non-comutative list or too few children would remain -> insert a placeholder
        newChild = new AstNodePlaceholder();
      }
    }

    return this._replaceChild(oldChild, newChild || [], true);
  }

  /**
   * Initiates a transaction on the whole tree.
   */
  _beginTransaction() {
    if (this.getParent() && this.getParent()._beginTransaction) {
      this.getParent()._beginTransaction();
    }
  }

  /**
   * Perfoms a commit on the whole tree.
   */
  _commit() {
    if (this.getParent() && this.getParent()._commit) {
      this.getParent()._commit();
    }
  }

  /**
   * Undo all changes in the tree made after transaction started.
   */
  _rollback() {
    if (this.getParent() && this.getParent()._rollback) {
      this.getParent()._rollback();
    }
  }

  /*
   * Basic object getters
   */

  getType() {
    return this.constructor.type || null; // access static property 'type' of a class
  }

  getGenericClass() {
    return null;
  }

  getCaption() {
    return this.id; // TODO return
    // return this.getType() + '()'; // this is default for function-nodes (leaves will have to override)
  }

  getDescription() {
    return this.constructor.description || null; // access static property 'description' of a class
  }

  getMinChildren() {
    return 0;
  }

  getMaxChildren() {
    return 0;
  }

  isComutative() {
    return false;
  }

  /**
   * Validates this node whether it has the right amount of children (no placeholders) and all parameters.
   * @returns {boolean}
   */
  isValid() {
    if (this.children.length < this.getMinChildren() || this.children.length > this.getMaxChildren()) {
      return false;
    }

    return this.children.every(child => child && !(child instanceof AstNodePlaceholder));
  }

  /**
   * Return parent node.
   * @returns {AstNode}
   */
  getParent() {
    return this.parent.parent;
  }

  /**
   * Change the parent reference. This is the only mutable item of a node.
   * @param {AstNode|Ast|null} parent
   */
  setParent(parent) {
    this.parent.parent = parent;
  }

  /**
   * Return all ancestor nodes in an array (from the nearest to the root).
   * @returns {AstNode[]}
   */
  getAllAncestors() {
    const res = [];
    let parent = this.getParent();
    while (parent && parent instanceof AstNode) {
      res.push(parent);
      parent = parent.getParent();
    }
    return res;
  }

  /**
   * Return (zero-based) index of this node among its siblings.
   * @returns {number}
   */
  getSiblingIndex() {
    if (!this.getParent() || !(this.getParent() instanceof AstNode)) {
      return 0;
    }
    return this.getParent().children.indexOf(this);
  }

  /**
   * Return a vector that represents a path from root to this node.
   * Each item is the index of the corresponding ancestor among its siblings.
   * @returns {number[]}
   */
  getLocationVector() {
    let node = this;
    const res = [];
    while (node && node instanceof AstNode) {
      res.unshift(node.getSiblingIndex());
      node = node.getParent();
    }
    return res;
  }

  /**
   * Return the first child node or null, if there are no children.
   * @returns {AstNode|null}
   */
  getFirstChild() {
    return this.children && this.children.length > 0 ? this.children[0] : null;
  }

  /**
   * Return the last child node or null, if there are no children.
   * @returns {AstNode|null}
   */
  getLastChild() {
    return this.children && this.children.length > 0 ? this.children[this.children.length - 1] : null;
  }

  /**
   * Return array of children without placeholder nodes.
   * @returns {AstNode[]}
   */
  getRealChildren() {
    return this.children.filter(child => child && !(child instanceof AstNodePlaceholder));
  }

  /**
   * Search subtree starting with this node as root for node with given ID.
   * @param {string} id
   * @returns {AstNode|null} the node or null if no such node exists
   */
  findById(id) {
    if (this.id === id) {
      return this;
    }

    return this.children.reduce((res, child) => res || child.findById(id), null);
  }

  /**
   * Exports a structure ready for JSON serialization (according to API format).
   * @returns {Object}
   */
  serialize() {
    const res = { type: this.getType() };
    if (this.children.length > 0) {
      res.children = this.children.map(child => child.serialize());
    }
    return res;
  }

  /*
   * Public routines for tree manipulation
   */

  /**
   * Create a deep copy of given node and its subtree (cloned nodes have new IDs).
   */
  clone() {
    const res = this._clone(true);
    res.children = res.children.map(child => child.clone());
    res._fixChildrenParentage();
    Object.freeze(res);
    return res;
  }

  /**
   * Append new child node.
   * @param {AstNode} child
   */
  appendChild(child) {
    if (this.getMaxChildren() <= this.children.length) {
      throw new Error('Unable to append another child. Maximal limit of children has been reached.');
    }
    return this._childChanged(null, child);
  }

  /**
   * Replace this node with given new node, but the new node re-takes all the children of the old node.
   * @param {AstNode} newNode a replacement node (still mutable, will be frozen)
   * @param {boolean} pushDown original node is pushed one level down as the first child of replacement node
   */
  supplant(newNode, pushDown) {
    const parent = this.getParent();

    if (pushDown) {
      newNode.children = [this];
    } else {
      newNode.children = this.children;
    }
    newNode._fixChildrenPlaceholders();
    newNode._fixChildrenParentage();
    Object.freeze(newNode);
    if (parent && parent._childChanged) {
      parent._childChanged(this, newNode);
    }
  }

  /**
   * Replace this node and its entire subtree with another node (and its subtree).
   * @param {AstNode} newNode a replacement node (not connected in tree)
   */
  replace(newNode) {
    Object.freeze(newNode);
    if (this.getParent() && this.getParent()._childChanged) {
      this.getParent()._childChanged(this, newNode);
    }
  }

  /**
   * Replace this node with an array of nodes. These nodes must not be connected in the tree
   * or they must be connected under nodes being removed.
   * @param {AstNode[]} nodes
   */
  replaceWithMultiple(nodes) {
    const realNodes = nodes.filter(node => node && !(node instanceof AstNodePlaceholder));

    // Let's make sure we can do this (check the vacancies)
    const parent = this.getParent();
    const vacantSiblings =
      parent && parent instanceof AstNode ? parent.getMaxChildren() - parent.getRealChildren().length : 0;

    if (vacantSiblings + 1 < realNodes.length) {
      // this condition is met also when the parent is the Ast (tree) object
      throw new Error('Node cannot be removed since its children cannot be moved one level up.');
    }

    parent._replaceChild(this, nodes);
  }

  /**
   * Swap this node (and entire subtree) with given node of the same tree. The nodes must not be in ancestor-child relation.
   * @param {AstNode} node another node in the tree
   */
  swap(node) {
    if (this === node || this.getAllAncestors().includes(node) || node.getAllAncestors().includes(this)) {
      throw new Error('Unable to swap nodes (one is an ancestor of another).');
    }

    this._beginTransaction();
    const tmp1 = new AstNode();
    const tmp2 = new AstNode();

    this.replace(tmp1);
    node.replace(tmp2);

    tmp1.replace(node);
    tmp2.replace(this);

    this._commit();
  }

  /**
   * Remove this node, but keep the children. The children are reconnected under the parent of this node.
   */
  remove() {
    const realChildrenCount = this.getRealChildren().length;
    if (realChildrenCount === 0) {
      this.removeWholeSubtree(); // no children -> remove everything
      return;
    }

    this.replaceWithMultiple(this.children);
  }

  /**
   * Remove this node (and its entire subtree) from the hierarchy.
   */
  removeWholeSubtree() {
    if (this.getParent() && this.getParent()._childChanged) {
      this.getParent()._childChanged(this, null);
    }
  }

  /**
   * Move given nodes under this nodes (append them as children). If this node is a placeholder,
   * the moved nodes will replace it. Moved nodes must not be ancestors of this node.
   * @param {AstNode[]} nodes
   */
  moveNodesHere(nodes) {
    // Verify the operation can be performed
    const ancestors = this.getAllAncestors();
    nodes.forEach(node => {
      if (!node || node instanceof AstNodePlaceholder) {
        throw new Error('Placeholders may not be moved.');
      }
      if (this === node || ancestors.includes(node)) {
        throw new Error('Unable to move the nodes (at least one is an ancestor of target node).');
      }
    });

    // lets get started
    const sortedNodes = sortNodes(nodes);
    this._beginTransaction();

    // determine the right target (placeholders are replaced, otherwise the nodes are appended as children)
    const target = this instanceof AstNodePlaceholder ? this : new AstNodePlaceholder();
    if (target !== this) {
      this._childChanged(null, target); // append new target (will be replaced later)
    }

    // verify that the nodes will fit
    const nodesKeepingTheirParent = sortedNodes.filter(node => node.getParent() === target.getParent());
    if (
      sortedNodes.length >
      target.getParent().getMaxChildren() - target.getParent().getRealChildren().length - nodesKeepingTheirParent.length
    ) {
      target._rollback();
      throw new Error('Unable to move the nodes (the arity of the target node would be exceeded).');
    }

    /*
     * We need to carefully remove nodes from the tree and place them into temporary collection.
     * The reason for that is that one node may be an ancestor of another and we might need to
     * remove nodes from already removed subtrees (temporary collection will handle root replacements).
     * Note that the nodes are sorted, so the ancestor is always moved before its descendant.
     */
    const mutableList = new MutableNodeList();
    sortedNodes.forEach(node => {
      node.removeWholeSubtree();
      mutableList.addNode(node);
    });

    // Now we move the nodes from mutable list (where they may have been modified due to subtree updates).
    target.replaceWithMultiple(mutableList.nodes);

    this._commit();
  }

  /**
   * Copy given list of nodes here (append them as children). If this node is a placeholder,
   * the copied nodes will replace it.
   * @param {AstNode[]} nodes
   */
  copyNodesHere(nodes) {
    // verify the operation can be performed
    nodes.forEach(node => {
      if (!node || node instanceof AstNodePlaceholder) {
        throw new Error('Placeholders may not be copied.');
      }
    });

    if (nodes.length > this.getMaxChildren() - this.getRealChildren().length) {
      throw new Error('Unable to copy the nodes (the arity of the target node would be exceeded).');
    }

    const sortedNodes = sortNodes(nodes).map(node => node.clone());

    // this is shorter and more readable than polymorphism
    if (this instanceof AstNodePlaceholder) {
      // placeholders are replaced directly
      this.replaceWithMultiple(sortedNodes);
    } else {
      // otherwise we append the children (null = append)
      this._replaceChild(null, sortedNodes);
    }
  }
}

/**
 * Base class for unary functions (with single child).
 */
export class AstNodeUnary extends AstNode {
  getGenericClass() {
    return FUNCTION_NODE;
  }

  getMinChildren() {
    return 1;
  }

  getMaxChildren() {
    return 1;
  }
}

/**
 * Base class for binary functions (with two children)
 */
export class AstNodeBinary extends AstNode {
  getGenericClass() {
    return FUNCTION_NODE;
  }

  getMinChildren() {
    return 2;
  }

  getMaxChildren() {
    return 2;
  }
}

/**
 * Base class for variadic functions (with one or more children).
 */
export class AstNodeVariadic extends AstNode {
  getGenericClass() {
    return FUNCTION_NODE;
  }

  getMinChildren() {
    return 1;
  }

  getMaxChildren() {
    return Number.MAX_SAFE_INTEGER;
  }
}

/*
 * Concrete AST classes
 */

/**
 *
 */
export class AstNodePlaceholder extends AstNode {
  static type = 'placeholder';

  getCaption() {
    return null;
  }

  supplant(newNode) {
    // Placeholder do not override children of the new node
    this.replace(newNode);
  }

  serialize() {
    throw new Error('Unable to serialize placeholder nodes.');
  }
}

/**
 *
 */
export class AstNodeAverage extends AstNodeVariadic {
  static type = 'avg';
  static description = (
    <FormattedMessage
      id="app.scoreConfigExpression.avg.description"
      defaultMessage="Computes an arithmetic average of nested nodes"
    />
  );

  isComutative() {
    return true;
  }
}

/**
 *
 */
export class AstNodeClamp extends AstNodeUnary {
  static type = 'clamp';
  static description = (
    <FormattedMessage
      id="app.scoreConfigExpression.clamp.description"
      defaultMessage="Clamps the value into [0,1] range"
    />
  );
}

/**
 *
 */
export class AstNodeDivision extends AstNodeBinary {
  static type = 'div';
  static description = (
    <FormattedMessage
      id="app.scoreConfigExpression.div.description"
      defaultMessage="Divides the first child node value by the second child node value"
    />
  );
}

/**
 *
 */
export class AstNodeMinimum extends AstNodeVariadic {
  static type = 'min';
  static description = (
    <FormattedMessage
      id="app.scoreConfigExpression.min.description"
      defaultMessage="Computes a minimum of nested nodes"
    />
  );

  isComutative() {
    return true;
  }
}

/**
 *
 */
export class AstNodeMaximum extends AstNodeVariadic {
  static type = 'max';
  static description = (
    <FormattedMessage
      id="app.scoreConfigExpression.max.description"
      defaultMessage="Computes a maximum of nested nodes"
    />
  );

  isComutative() {
    return true;
  }
}

/**
 *
 */
export class AstNodeMultiply extends AstNodeVariadic {
  static type = 'mul';
  static description = (
    <FormattedMessage
      id="app.scoreConfigExpression.mul.description"
      defaultMessage="Multiplies the values of all nested nodes"
    />
  );

  isComutative() {
    return true;
  }
}

/**
 *
 */
export class AstNodeNegation extends AstNodeUnary {
  static type = 'neg';
  static description = (
    <FormattedMessage
      id="app.scoreConfigExpression.neg.description"
      defaultMessage="Negates a value of the nested node"
    />
  );
}

/**
 *
 */
export class AstNodeSubtraction extends AstNodeBinary {
  static type = 'sub';
  static description = (
    <FormattedMessage
      id="app.scoreConfigExpression.sub.description"
      defaultMessage="Subtracts the value of the second node from the value of the first node"
    />
  );
}

/**
 *
 */
export class AstNodeSum extends AstNodeVariadic {
  static type = 'sum';
  static description = (
    <FormattedMessage
      id="app.scoreConfigExpression.sum.description"
      defaultMessage="Computes a sum of all nested nodes"
    />
  );

  isComutative() {
    return true;
  }
}

/**
 *
 */
export class AstNodeTestResult extends AstNode {
  static type = 'test-result';
  static description = (
    <FormattedMessage
      id="app.scoreConfigExpression.test-result.description"
      defaultMessage="Input node that takes the result assigned by a judge to a particular test (as value in [0,1] range)"
    />
  );

  constructor(id = null) {
    super(id);
    if (this.test === undefined) {
      this.test = null;
    }
  }

  _initFromConfig(config) {
    this.test = config.test;
  }

  _clone(forceNewId = false) {
    const clone = super._clone(forceNewId);
    clone.test = this.test;
    return clone;
  }

  getGenericClass() {
    return TEST_NODE;
  }

  getCaption() {
    return `${this.id}: ${this.test}`; // TODO remove
    // return this.test;
  }

  isValid() {
    return this.children.length === 0 && this.test !== null;
  }

  serialize() {
    const res = super.serialize();
    res.test = this.test;
    return res;
  }
}

/**
 * Node representing a literal numeric value.
 */
export class AstNodeValue extends AstNode {
  static type = 'value';
  static description = (
    <FormattedMessage id="app.scoreConfigExpression.value.description" defaultMessage="Numeric literal" />
  );

  constructor(id = null) {
    super(id);
    if (this.value === undefined) {
      this.value = null;
    }
  }

  _initFromConfig(config) {
    this.value = config.value;
  }

  _clone(forceNewId = false) {
    const clone = super._clone(forceNewId);
    clone.value = this.value;
    return clone;
  }

  getGenericClass() {
    return LITERAL_NODE;
  }

  getCaption() {
    return `${this.id}: ${this.value}`; // TODO remove
    // return this.value;
  }

  isValid() {
    return this.children.length === 0 && this.value !== null;
  }

  serialize() {
    if (!this.getParent() || !(this.getParent() instanceof AstNode)) {
      // There is no parent or the parent is a placeholder.
      return super.serialize();
    } else {
      // We may simplify the node to mere number literal.
      return this.value;
    }
  }
}

/**
 * List of all classes of the function generic type.
 */
export const AST_FUNCTION_CLASSES = [
  AstNodeAverage,
  AstNodeClamp,
  AstNodeDivision,
  AstNodeMinimum,
  AstNodeMaximum,
  AstNodeMultiply,
  AstNodeNegation,
  AstNodeSubtraction,
  AstNodeSum,
];

/**
 * Index of all classes by their types. Used for deserialization.
 */
export const KNOWN_AST_CLASSES = arrayToObject([...AST_FUNCTION_CLASSES, AstNodeTestResult, AstNodeValue], c => c.type);

/**
 * Internal deserialization routine.
 * @param {Object} parent Parent object of newly deserialized object.
 * @param {Object} scoreConfig Configuration node to be deserialized.
 */
const _deserialize = scoreConfig => {
  if (typeof scoreConfig === 'number') {
    const node = new AstNodeValue();
    node.value = scoreConfig;
    Object.freeze(node);
    return node;
  }

  if (!scoreConfig.type || !KNOWN_AST_CLASSES[scoreConfig.type]) {
    return null;
  }

  const node = new KNOWN_AST_CLASSES[scoreConfig.type]();
  node._initFromConfig(scoreConfig);
  Object.freeze(node);
  return node;
};

/**
 * Ast object represents the whole tree. It is also acts as special parent for root node.
 * We take advantage of dynamic nature of JS and implement some of the methods that are
 * called on parents from nodes (to ensure correct interaction between this object and the root node).
 */
export class Ast {
  constructor(rootChangedCallback = null) {
    this.root = new AstNodePlaceholder();
    this.rootChangedCallback = rootChangedCallback;
    this.inTransaction = false;
    this.uncommitedRoot = null;
  }

  /**
   * Interface retaken from AstNode (basically reports that root node needs to be replaced).
   */
  _childChanged(oldChild, newChild) {
    if (this.inTransaction) {
      // When in transaction, the change of a root needs to be commited
      this.uncommitedRoot = newChild;
      return;
    }

    if (!newChild) {
      newChild = new AstNodePlaceholder();
    }
    this.root = newChild;
    newChild.setParent(this);

    if (this.rootChangedCallback) {
      this.rootChangedCallback(oldChild, newChild);
    }
  }

  _beginTransaction() {
    if (this.inTransaction) {
      throw new Error('Recursive transactions are not allowed.');
    }
    this.inTransaction = true;
  }

  _commit() {
    if (!this.inTransaction) {
      throw new Error('Unable to perform commit when no transaction was started.');
    }

    this.inTransaction = false;
    if (this.uncommitedRoot) {
      this._childChanged(this.root, this.uncommitedRoot);
      this.uncommitedRoot = null;
    }
  }

  _rollback() {
    if (!this.inTransaction) {
      throw new Error('Unable to perform commit when no transaction was started.');
    }

    this.inTransaction = false;
    this.uncommitedRoot = null;
    if (this.root) {
      // It might be necessary to fix parent refs, since they might have been updated in transaction.
      this.root._fixChildrenParentage(true);
    }
  }

  getRoot() {
    return this.root;
  }

  /**
   * Public deserialization interface. Get score config and returns the root node of the AST.
   * @param {Object} scoreConfig Score configuration to be deserialized into AST.
   */
  deserialize(scoreConfig) {
    this.root = _deserialize(scoreConfig);
    this.root.setParent(this);
    this.root._check();
    return this.root;
  }
}
