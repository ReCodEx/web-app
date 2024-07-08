/**
 * This is a bit tough piece of code, so this prologue should help you understand it.
 * We have considered using libraries like immutable.js, but they are not quite ready for recursive trees.
 *
 * The thing is we need an immutable data structure (when change is done in a node, a clone is created instead).
 * However, due to performance reasons we need both donwlink (children) and uplink (parent) references in the nodes.
 * If such a tree is completely immutable, any modification will result in complete re-creation of the tree
 * which is highly suboptimal. Therefore, each node is immutable except for the reference to its parent.
 * The parent reference is kept in a nested object, so it is not affected by Object.freeze and can be changed.
 *
 * When AST node is cloned, _childChanged method needs to be called on its parent to replace the clone with the
 * original. This leads to recursive update all the way up to the root. Parent of a root node is Ast class that
 * represents the whole tree. This class also implements _childChanged, but it is mutable (so it updates its root ref).
 *
 * Each node is assigned unique ID. This ID is copied to a clone when the node is simply updated. Hence, it can be used
 * externally to keep more permanent idenfication of a node (e.g., node selection). However, when the node is really
 * copied (user-issued copy operation), a new ID is assigned to the copy.
 */

/**
 * EXPERIMENTAL INFO: this feature is still in experimental stage. There are some methods/additional data which
 * are here to help us with bug tracking and diagnostics. All these properties/methods/functions are prefixed with `debug`.
 */

import React from 'react';
import { FormattedMessage } from 'react-intl';
import { arrayToObject, objectFind, deepCompare } from '../common.js';
import { evaluationFunctions } from './scoreAstFunctions.js';

// Generic node types
export const FUNCTION_NODE = 'function';
export const TEST_NODE = 'test';
export const LITERAL_NODE = 'literal';

/**
 * Numeric-vector comparator for sorting.
 * @param {number[]} v1
 * @param {number[]} v2
 */
const compareLocationVectors = (v1, v2) => {
  const len = Math.max(v1.length, v2.length);
  for (let i = 0; i < len; ++i) {
    const x1 = i < v1.length ? v1[i] : -1;
    const x2 = i < v2.length ? v2[i] : -1;
    const res = x1 - x2;
    if (res) {
      return res;
    }
  }
  return 0;
};

/**
 * Internal function that sorts nodes by their position in the tree (DFS ordering).
 */
const sortNodes = nodes => {
  if (nodes.length < 2) {
    return nodes; // small optimization
  }

  const wrapped = nodes.map(node => ({ node, key: node.getLocationVector() }));
  wrapped.sort((a, b) => compareLocationVectors(a.key, b.key));
  return wrapped.map(({ node }) => node);
};

/**
 * Special collection that can temporarily hold detached nodes.
 * The benefit is that changes may be performed in detached node subtrees
 * and the mutable list correctly replace the nodes with their updated clones.
 */
class MutableNodeList {
  constructor() {
    this.nodes = [];
  }

  /**
   * Append another node to be handled inside this list.
   * @param {AstNode} node already detached node
   */
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

/**
 * Base class for all AST nodes. Most functionality is implemented here.
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
    this.valid = null;
    this.subtreeValid = null;
    this.evaluated = null; // current value of this node (null if the value is not available)

    this._fixChildrenPlaceholders();
    this._fixChildrenParentage();
  }

  debugCheckStructure() {
    if (!Object.isFrozen(this)) throw new Error(`Node ${this.id} is not frozen.`);
    if (this.valid !== this._isValid())
      throw new Error(
        `Node ${this.id} validity mismatch (valid === ${this.valid}, _isValid() === ${this._isValid()}).`
      );

    this.children.forEach((child, idx) => {
      if (!child) throw new Error(`Child #${idx} of node ${this.id} is ${child}.`);
      if (!(child instanceof AstNode)) throw new Error(`Child #${idx} of node ${this.id} is not instance of AstNode.`);
      if (child.getParent() !== this)
        throw new Error(
          `Node ${child.id} has parent reference set to ${child.getParent() && child.getParent().id} instead of ${
            this.id
          }.`
        );
      child.debugCheckStructure();
    });

    if (this.children > 0) {
      if (
        this.subtreeValid !== this.valid &&
        this.children.reduce((valid, node) => valid && node.valid && node.subtreeValid, true)
      )
        throw new Error(`Node ${this.id} subtreeValid (=== ${this.subtreeValid}) flag is not correct.`);

      if (this.evaluated !== null && (typeof this.evaluated !== 'number' || isNaN(this.evaluated)))
        throw new Error(`Node ${this.id} evaluated (=== ${this.evaluated}) value is not correct.`);

      const allChildrenEvaluated = this.children.every(child => child.evaluated !== null);
      if (allChildrenEvaluated !== (this.evaluated !== null))
        throw new Error(`Node ${this.id} evaluated (=== ${this.evaluated}) value is not correct.`);
    }

    if (this instanceof AstNodeValue && this.value !== this.evaluated)
      throw new Error(
        `Value node ${this.id} evaluated (=== ${this.evaluated}) value is not correct (${this.value} expected).`
      );
  }

  debugGetIds(acc) {
    acc[this.id] = 1 + acc[this.id];
    this.children.forEach(child => child.debugGetIds(acc));
  }

  _freeze() {
    this.valid = this._isValid();
    const realChildren = this.getRealChildren();
    this.subtreeValid = this.valid && realChildren.every(child => child.subtreeValid);
    if (this.valid && evaluationFunctions[this.getType()] && realChildren.every(child => child.evaluated !== null)) {
      this.evaluated = evaluationFunctions[this.getType()](realChildren.map(child => child.evaluated));
    }
    Object.freeze(this);
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

  /**
   * Internal deserialization routine.
   * @param {Object} config A JSON configuration node as retrieved from the API.
   * @param {Object} tests test names index (object where keys are ids and values are names)
   */
  _initFromConfig(config, tests = null) {
    if (config.children && config.children.length > 0) {
      this.children = config.children.map(childConf => _deserialize(childConf, tests) || new AstNodePlaceholder());
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
  _updateChildren(updater, keepPlaceholders = false, debugAction = null, debugData = null) {
    // Create clone with updated children
    const clone = this._clone();
    clone.children = updater(clone.children);

    // Make sure children are OK and have the right parent ref.
    if (!keepPlaceholders) {
      clone._fixChildrenPlaceholders();
    }
    clone._fixChildrenParentage();

    // Finalize and report the change upwards
    clone._freeze();
    if (this.getParent() && this.getParent()._childChanged) {
      this.getParent()._childChanged(this, clone, debugAction, debugData);
    }
    return clone;
  }

  /**
   * Replace given child with one ore more new nodes.
   * @param {AstNode|null} child Child node to be replaced; if null, new nodes are appended
   * @param {AstNode|AstNode[]} newNodes Node or array of nodes to be placed where the original node was.
   * @param {boolean} [keepPlaceholders=false] If true, placeholders will not be modified (not even if the capacity of the node is exceeded).
   */
  _replaceChild(child, newNodes = [], keepPlaceholders = false, debugAction = null, debugData = null) {
    if (!Array.isArray(newNodes)) {
      newNodes = newNodes ? [newNodes] : [];
    }

    return this._updateChildren(
      children => {
        let position = children.indexOf(child);
        position = position < 0 ? children.length : position;
        return [...children.slice(0, position), ...newNodes, ...children.slice(position + 1)];
      },
      keepPlaceholders,
      debugAction,
      debugData
    );
  }

  /**
   * Internal function used to update the tree. If node is changed (i.e., its update-clone is created),
   * it calls this function on its parent to introduce the updated clone into the tree.
   * @param {AstNode} [oldChild=null] child node to be replaced (if null, new child is appended)
   * @param {AstNode} [newChild=null] child node to be inserted (if null, only old child is removed/replaced with placeholder)
   */
  _childChanged(oldChild, newChild, debugAction = null, debugData = null) {
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

    return this._replaceChild(oldChild, newChild || [], true, debugAction, debugData);
  }

  /**
   * Replace this node and its entire subtree with another node (and its subtree).
   * @param {AstNode} newNode a replacement node (not connected in tree)
   */
  _replace(newNode) {
    if (this.getParent() && this.getParent()._childChanged) {
      this.getParent()._childChanged(this, newNode, 'replace', newNode.id);
    }
  }

  /**
   * Initiates a transaction on the whole tree.
   */
  _beginTransaction(debugAction = null, debugData = null) {
    if (this.getParent() && this.getParent()._beginTransaction) {
      this.getParent()._beginTransaction(debugAction, debugData);
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
    return this.getType() + '()'; // this is default for function-nodes (leaves will have to override)
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

  // Internal validation function used for overloading (public interface is `isValid`)
  _isValid() {
    const realChildren = this.getRealChildren();
    return realChildren.length >= this.getMinChildren() && realChildren.length <= this.getMaxChildren();
  }

  /**
   * Validates this node whether it has the right amount of children (no placeholders) and all parameters.
   * @returns {boolean}
   */
  isValid() {
    return this.valid === null ? this._isValid() : this.valid;
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
   * Return a list of all nodes in this sub-tree. The nodes are optionally filtered by a predicate.
   * @param {Function} [filter=null]
   */
  getNodes(filter = null) {
    const children = this.children.flatMap(node => node.getNodes(filter));
    return !filter || filter(this) ? [this, ...children] : children;
  }

  /**
   * Exports a structure ready for JSON serialization (according to API format).
   * @param {Object} tests test names index (object where keys are ids and values are names)
   * @returns {Object}
   */
  serialize(tests) {
    return { type: this.getType(), children: this.getRealChildren().map(child => child.serialize(tests)) };
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
    res._freeze();
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
    child._freeze();
    return this._childChanged(null, child, 'appendChild', child.id);
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
    newNode._freeze();
    if (parent && parent._childChanged) {
      parent._childChanged(this, newNode, 'supplant', newNode.id);
    }
  }

  /**
   * Replace this node with an array of nodes. These nodes must not be connected in the tree
   * or they must be connected under nodes being removed.
   * @param {AstNode[]} nodes
   */
  replaceWithMultiple(nodes, debugAction = null) {
    const realNodes = nodes.filter(node => node && !(node instanceof AstNodePlaceholder));

    // Let's make sure we can do this (check the vacancies)
    const parent = this.getParent();
    const vacantSiblings =
      parent && parent instanceof AstNode ? parent.getMaxChildren() - parent.getRealChildren().length : 0;

    if (vacantSiblings + 1 < realNodes.length) {
      // this condition is met also when the parent is the Ast (tree) object
      throw new Error('Node cannot be removed since its children cannot be moved one level up.');
    }

    parent._replaceChild(
      this,
      nodes,
      false,
      debugAction ? `replaceWithMultiple(${debugAction})` : 'replaceWithMultiple',
      nodes.map(node => node.id)
    );
  }

  /**
   * Swap this node (and entire subtree) with given node of the same tree. The nodes must not be in ancestor-child relation.
   * @param {AstNode} node another node in the tree
   */
  swap(node) {
    if (this === node || this.getAllAncestors().includes(node) || node.getAllAncestors().includes(this)) {
      throw new Error('Unable to swap nodes (one is an ancestor of another).');
    }

    this._beginTransaction('swap', [this.id, node.id]);
    const tmp1 = new AstNode();
    const tmp2 = new AstNode();

    this._replace(tmp1);
    node._replace(tmp2);

    tmp1._replace(node);
    tmp2._replace(this);

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

    this.replaceWithMultiple(this.children, 'remove');
  }

  /**
   * Remove this node (and its entire subtree) from the hierarchy.
   */
  removeWholeSubtree() {
    if (this.getParent() && this.getParent()._childChanged) {
      this.getParent()._childChanged(this, null, 'removeWholeSubtree', this.id);
    }
  }

  /**
   * Soft test whether moveNodesHere would succeed. Used to indicate whether a control icon should be displayed or not.
   * @param {AstNode[]} nodes
   */
  canMoveNodesHere(nodes) {
    // Verify the operation can be performed
    const ancestors = this.getAllAncestors();
    if (nodes.some(node => this === node || ancestors.includes(node))) {
      return false;
    }

    const parent = this instanceof AstNodePlaceholder ? this.getParent() : this;
    const nodesKeepingTheirParent = nodes.filter(node => node.getParent() === parent);
    return nodes.length <= parent.getMaxChildren() - parent.getRealChildren().length - nodesKeepingTheirParent.length;
  }

  /**
   * Move given nodes under this nodes (append them as children). If this node is a placeholder,
   * the moved nodes will replace it. Moved nodes must not be ancestors of this node.
   * @param {AstNode[]} nodes
   */
  moveNodesHere(nodes) {
    // Verify the operation can be performed
    nodes.forEach(node => {
      if (!node || node instanceof AstNodePlaceholder) {
        throw new Error('Placeholders may not be moved.');
      }
    });

    if (!this.canMoveNodesHere(nodes)) {
      throw new Error('Unable to move the nodes.');
    }

    // lets get started
    const sortedNodes = sortNodes(nodes);
    this._beginTransaction(
      'moveNodesHere',
      nodes.map(node => node.id)
    );

    // determine the right target (placeholders are replaced, otherwise the nodes are appended as children)
    const target = this instanceof AstNodePlaceholder ? this : new AstNodePlaceholder();
    if (target !== this) {
      this._childChanged(null, target, 'moveNodesHere-appendTarget', target.id); // append new target (will be replaced later)
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
    target.replaceWithMultiple(mutableList.nodes, 'moveNodesHere');

    this._commit();
  }

  /**
   * Soft test whether copyNodesHere would succeed. Used to indicate whether a control icon should be displayed or not.
   * @param {AstNode[]} nodes
   */
  canCopyNodesHere(nodes) {
    const parent = this instanceof AstNodePlaceholder ? this.getParent() : this;
    return nodes.length <= parent.getMaxChildren() - parent.getRealChildren().length;
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

    if (!this.canCopyNodesHere(nodes)) {
      throw new Error('Unable to copy the nodes (the arity of the target node would be exceeded).');
    }

    const sortedNodes = sortNodes(nodes).map(node => node.clone());

    // this is shorter and more readable than polymorphism
    if (this instanceof AstNodePlaceholder) {
      // placeholders are replaced directly
      this.replaceWithMultiple(sortedNodes, 'copyNodesHere');
    } else {
      // otherwise we append the children (null = append)
      this._replaceChild(
        null,
        sortedNodes,
        'copyNodesHere',
        nodes.map(node => node.id)
      );
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
 * Special placeholder node. It is used in situations, where node needs to be present (e.g., to hold specific position)
 * in the UI. This node may not be serialized and its behavior is slightly different in some situations.
 */
export class AstNodePlaceholder extends AstNode {
  static type = 'placeholder';
  debugCheckStructure() {
    if (this.children.length > 0) {
      throw new Error(`Placeholder ${this.id} have some children (${this.children.length})`);
    }
  }

  getCaption() {
    return null;
  }

  supplant(newNode) {
    // Placeholder do not override children of the new node
    newNode._freeze();
    this._replace(newNode);
  }

  serialize() {
    throw new Error('Unable to serialize placeholder nodes.');
  }
}

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

export class AstNodeClamp extends AstNodeUnary {
  static type = 'clamp';
  static description = (
    <FormattedMessage
      id="app.scoreConfigExpression.clamp.description"
      defaultMessage="Clamps the value into [0,1] range"
    />
  );
}

export class AstNodeDivision extends AstNodeBinary {
  static type = 'div';
  static description = (
    <FormattedMessage
      id="app.scoreConfigExpression.div.description"
      defaultMessage="Divides the first child node value by the second child node value"
    />
  );
}

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

export class AstNodeNegation extends AstNodeUnary {
  static type = 'neg';
  static description = (
    <FormattedMessage
      id="app.scoreConfigExpression.neg.description"
      defaultMessage="Negates a value of the nested node"
    />
  );
}

export class AstNodeSubtraction extends AstNodeBinary {
  static type = 'sub';
  static description = (
    <FormattedMessage
      id="app.scoreConfigExpression.sub.description"
      defaultMessage="Subtracts the value of the second node from the value of the first node"
    />
  );
}

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
 * Leaf node representing a test. It holds `test` property with the ID (not the name!) of the test.
 * Keeping ID instead of name requires translation during (de)serialization, but the structure
 * is immune to test renaming.
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

  _initFromConfig(config, tests = null) {
    if (tests !== null) {
      const testId = objectFind(tests, config.test);
      this.test = testId || null;
    } else {
      this.test = config.test; // if no tests are given, no translation takes place
    }
  }

  _clone(forceNewId = false) {
    const clone = super._clone(forceNewId);
    clone.test = this.test;
    clone.evaluated = this.evaluated;
    return clone;
  }

  getGenericClass() {
    return TEST_NODE;
  }

  getCaption(tests = null) {
    return (tests && tests[this.test]) || this.test;
  }

  _isValid() {
    return this.children.length === 0 && this.test !== null;
  }

  serialize(tests) {
    const test = (tests && tests[this.test]) || this.test;
    if (!test) {
      throw new Error('Unable to serialize test result node with invalid test reference.');
    }

    return { type: this.getType(), test };
  }

  /**
   * Assign an evaluated value from test results (creates an updated clone).
   * @param {number} value
   */
  evaluate(value) {
    const clone = this._clone();
    clone.evaluated = value;
    clone._freeze();
    if (this.getParent() && this.getParent()._childChanged) {
      this.getParent()._childChanged(this, clone);
    }
    return clone;
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

  _freeze() {
    this.evaluated = this.value;
    super._freeze();
  }

  _initFromConfig(config) {
    this.value = config.value;
    this.evaluated = this.value;
  }

  _clone(forceNewId = false) {
    const clone = super._clone(forceNewId);
    clone.value = this.value;
    clone.evaluated = this.evaluated;
    return clone;
  }

  getGenericClass() {
    return LITERAL_NODE;
  }

  getCaption() {
    return this.value;
  }

  _isValid() {
    return this.children.length === 0 && this.value !== null;
  }

  serialize() {
    if (!this.getParent() || !(this.getParent() instanceof AstNode)) {
      // there is no parent or the parent is AST container => this is the root node
      return { type: this.getType(), value: this.value };
    } else {
      // we may simplify the node to mere number literal.
      return this.value;
    }
  }
}

/**
 * List of all classes of the generic type 'function'.
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
 * @param {Object} scoreConfig Configuration node to be deserialized.
 * @param {Object} tests test names index (object where keys are ids and values are names)
 * @returns {AstNode|null} null is returned if the deserialization fails
 */
const _deserialize = (scoreConfig, tests = null) => {
  if (typeof scoreConfig === 'number') {
    const node = new AstNodeValue();
    node.value = scoreConfig;
    node._freeze();
    return node;
  }

  if (!scoreConfig.type || !KNOWN_AST_CLASSES[scoreConfig.type]) {
    return null;
  }

  const node = new KNOWN_AST_CLASSES[scoreConfig.type]();
  node._initFromConfig(scoreConfig, tests);
  node._freeze();
  return node;
};

const debugSoftClone = node => {
  const res = { ...node };
  res.parent = node.getParent && node.getParent() && node.getParent().id;
  if (res.children) {
    res.children = res.children.map(debugSoftClone);
  }
  return res;
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
    this.undos = []; // list of UNDo roots
    this.redos = []; // list of REDO roots
    this.debugLog = [];
    this.debugLastRoot = null;
  }

  debugAddLog(action, additionalData = null) {
    const record = { action };
    if (additionalData) record.data = additionalData;
    const root = this.inTransaction ? this.uncommitedRoot : this.root;
    if (root && this.debugLastRoot !== root) record.root = debugSoftClone(root);
    this.debugLog.push(record);
  }

  debugConsistencyCheck() {
    try {
      this.root.debugCheckStructure();

      const ids = {};
      this.root.debugGetIds(ids);
      const duplicates = Object.entries(ids)
        .filter(([_, value]) => value > 1)
        .map(([key]) => key);
      if (duplicates.length > 0) throw new Error(`Duplicate IDs found: ${duplicates.join(', ')}`);
    } catch (e) {
      console.error('Consistency check failed.'); // eslint-disable-line no-console
      console.error(e); // eslint-disable-line no-console
    }
  }

  /**
   * Interface retaken from AstNode (basically reports that root node needs to be replaced).
   */
  _childChanged(oldChild, newChild, debugAction = null, debugData = null) {
    if (this.inTransaction) {
      // when in transaction, the change of a root needs to be commited
      this.uncommitedRoot = newChild;
      if (debugAction) this.debugAddLog(debugAction, debugData);
      return;
    }

    if (!newChild) {
      newChild = new AstNodePlaceholder();
    }

    // clear redos and save last root for undo
    this.redos = [];
    this.undos.push(this.root);

    // update the root
    this.root = newChild;
    newChild.setParent(this);

    if (this.rootChangedCallback) {
      this.rootChangedCallback(oldChild, newChild);
    }

    if (debugAction) this.debugAddLog(debugAction, debugData);
    this.debugConsistencyCheck();
  }

  /**
   * Initiate transaction on the tree. No root modifications will be actually made until
   * commit is called.
   */
  _beginTransaction(debugAction = null, debugData = null) {
    if (this.inTransaction) {
      throw new Error('Recursive transactions are not allowed.');
    }
    this.debugAddLog(debugAction ? `beginTransaction(${debugAction})` : 'beginTransaction', debugData);
    this.inTransaction = true;
  }

  /**
   * Commit a transaction (make the last root passed via _childChanged the real root).
   */
  _commit() {
    if (!this.inTransaction) {
      throw new Error('Unable to perform commit when no transaction was started.');
    }

    this.inTransaction = false;
    if (this.uncommitedRoot) {
      this._childChanged(this.root, this.uncommitedRoot);
      this.uncommitedRoot = null;
    }
    this.debugAddLog('commit');
  }

  /**
   * Rollback a transaction (remove any temporary data, do not change the root).
   */
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
    this.debugAddLog('rollback');
  }

  /**
   * Get the (immutable) root node of the tree.
   */
  getRoot() {
    return this.root;
  }

  isValid() {
    return this.root && this.root.subtreeValid;
  }

  /**
   * Whether it is possible to perform an UNDO operation.
   */
  canUndo() {
    return this.undos.length > 0;
  }

  /**
   * Revert the tree to the previous state in the history.
   */
  undo() {
    if (this.canUndo()) {
      const oldRoot = this.root;
      this.redos.push(oldRoot);
      this.root = this.undos.pop();
      this.root._fixChildrenParentage(true);

      if (this.rootChangedCallback) {
        this.rootChangedCallback(oldRoot, this.root);
      }
      this.debugAddLog('undo');
    }
  }

  /**
   * Whether it is possible to perform REDO operation.
   */
  canRedo() {
    return this.redos.length > 0;
  }

  /**
   * Change the tree into a next state, that was previosly reverted by UNDO.
   */
  redo() {
    if (this.canRedo()) {
      const oldRoot = this.root;
      this.undos.push(oldRoot);
      this.root = this.redos.pop();
      this.root._fixChildrenParentage(true);

      if (this.rootChangedCallback) {
        this.rootChangedCallback(oldRoot, this.root);
      }
      this.debugAddLog('redo');
    }
  }

  /**
   * Public deserialization interface. Get score config and returns the root node of the AST.
   * @param {Object} scoreConfig score configuration from API to be deserialized
   * @param {Object} tests test names index (object where keys are ids and values are names)
   */
  deserialize(scoreConfig, tests = null) {
    const root = _deserialize(scoreConfig, tests);
    if (root) {
      this.root = root;
      root.setParent(this);
    }
    return root;
  }

  /**
   * Serialize the entire tree into a structure which can be passed to API.
   * @param {Object} tests test names index (object where keys are ids and values are names)
   */
  serialize(tests) {
    return this.getRoot() && this.getRoot().serialize(tests);
  }

  /**
   * Return a list of all nodes in the tree. The nodes are optionally filtered by a predicate.
   * @param {Function} [filter=null]
   */
  getNodes(filter = null) {
    return this.getRoot() ? this.getRoot().getNodes(filter) : [];
  }

  /**
   * Apply a tree-wide transformation.
   * @param {Function} transformation node => node function applied to in serialized form
   * @param {Object} tests test names index (object where keys are ids and values are names)
   */
  applyTransformation(transformation, tests) {
    this.debugAddLog('applyTransformation', transformation.name);
    const source = this.serialize(tests);
    const verification = this.serialize(tests);
    const transformed = transformation(source);

    if (!deepCompare(verification, transformed)) {
      // when transformation actually modified something
      const root = _deserialize(transformed, tests);
      if (root) {
        this._childChanged(this.root, root);
      }
    }
  }

  /**
   * Provide scores for individual test results and perform a tree-wide evaluation.
   * @param {Object} results keys are test names/ids (expected to match, whatever is used in the AST), values are scores
   */
  evaluate(results) {
    this.debugAddLog('evaluate', results);
    const needsTransaction = !this.inTransaction;
    if (needsTransaction) {
      this._beginTransaction();
    }

    const tests = this.getNodes(node => node instanceof AstNodeTestResult);
    tests.forEach(test => {
      if (results[test.test] !== undefined) {
        test.evaluate(results[test.test]);
      }
    });

    if (needsTransaction) {
      this._commit();
    }
  }
}
