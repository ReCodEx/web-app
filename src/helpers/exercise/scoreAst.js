import React from 'react';
import { FormattedMessage } from 'react-intl';
import { arrayToObject } from '../common';

// Generic node types
export const FUNCTION_NODE = 'function';
export const TEST_NODE = 'test';
export const LITERAL_NODE = 'literal';

/*
 * Abstract AST classes
 */
let idCounter = 0;

export class AstNode {
  constructor(config = null) {
    this.id = `${this.getType()}-${++idCounter}`;
    this.parent = null;
    this.children = [];
    if (config) {
      this._initFromConfig(config);
    }

    this._fixChildrenPlaceholders();
    this._fixChildrenParentage();
  }

  _fixChildrenPlaceholders() {
    if (this.isComutative() || this.children.length > this.getMaxChildren()) {
      this.children = this.children.filter(child => child && !(child instanceof AstNodePlaceholder));
    }

    // Fill missing children with placeholders
    while (this.children.length < this.getMinChildren()) {
      this.children.push(new AstNodePlaceholder());
    }
  }

  _fixChildrenParentage() {
    this.children.forEach(child => {
      child.parent = this;
    });
  }

  // TODO remove
  _check() {
    const errors = this.children.filter(child => child.parent !== this);
    if (errors.length > 0) {
      console.log(this.id);
      console.log(errors);
    }

    this.children.forEach(child => child._check());
  }

  _initFromConfig(config) {
    if (config.children && config.children.length > 0) {
      this.children = config.children.map(childConf => _deserialize(childConf) || new AstNodePlaceholder());
    }
  }

  _clone() {
    const clone = this.constructor();
    clone.parent = this.parent;
    clone.children = this.children;
    return clone;
  }

  /**
   *
   * @param {AstNode} [oldChild=null] child node to be replaced (if null, new child is appended)
   * @param {AstNode} [newChild=null] child node to be inserted (if null, only old child is removed/replaced with placeholder)
   */
  _childChanged(oldChild, newChild) {
    if (!oldChild && !newChild) {
      throw new Error('At least one argument (oldChild, newChild) must not be null in child changed notificator.');
    }

    if (oldChild) {
      if (oldChild.parent !== this || !this.children.includes(oldChild)) {
        throw new Error('AST structure is corrupted. Child replacement trigger did not found the old child object.');
      }
      oldChild.parent = null;
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

    const clone = this._clone();
    clone.children =
      oldChild === null
        ? // Appending
          [...this.children, newChild]
        : // Replacing/removing
          this.children.map(child => (child === oldChild ? newChild : child)).filter(child => child);
    clone._fixChildrenParentage();

    if (this.parent) {
      this.parent._childChanged(this, clone);
    }

    return clone;
  }

  /*
   * Objet type and behavioral properties
   */

  getType() {
    return this.constructor.type || null; // access static property 'type' of a class
  }

  getGenericClass() {
    return null;
  }

  getCaption() {
    return this.getType() + '()';
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
   */
  isValid() {
    if (this.children.length < this.getMinChildren() || this.children.length > this.getMaxChildren()) {
      return false;
    }

    return this.children.every(child => child && !(child instanceof AstNodePlaceholder));
  }

  /**
   * Return the first child node or null, if there are no children.
   */
  getFirstChild() {
    return this.children && this.children.length > 0 ? this.children[0] : null;
  }

  /**
   * Return the last child node or null, if there are no children.
   */
  getLastChild() {
    return this.children && this.children.length > 0 ? this.children[this.children.length - 1] : null;
  }

  /**
   * Exports a structure ready for JSON serialization (according to API format).
   */
  serialize() {
    const res = { type: this.getType() };
    if (this.children.length > 0) {
      res.children = this.children.map(child => child.serialize());
    }
    return res;
  }

  /*
   * Modification routines
   */

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
   * Replace this node only with given new node. The new node re-takes all the children of the old node.
   * @param {AstNode} newNode a replacement node
   */
  replace(newNode) {
    newNode.children = this.children;
    this.children = [];
    newNode._fixChildrenPlaceholders();
    newNode._fixChildrenParentage();

    if (this.parent) {
      this.parent._childChanged(this, newNode);
    }
  }

  /**
   * Replace this node and its entire subtree with another node (and its subtree).
   * @param {AstNode} newNode a replacement node
   */
  replaceWithSubtree(newNode) {
    if (this.parent) {
      this.parent._childChanged(this, newNode);
    }
  }

  /**
   * Remove this node (and its entire subtree) from the hierarchy.
   */
  delete() {
    if (this.parent) {
      this.parent._childChanged(this, null);
    }
  }
}

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

export class AstNodePlaceholder extends AstNode {
  static type = 'placeholder';

  getCaption() {
    return null;
  }

  replace(newNode) {
    // Placeholder do not override children of the new node
    this.replaceWithSubtree(newNode);
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

export class AstNodeTestResult extends AstNode {
  static type = 'test-result';
  static description = (
    <FormattedMessage
      id="app.scoreConfigExpression.test-result.description"
      defaultMessage="Input node that takes the result assigned by a judge to a particular test (as value in [0,1] range)"
    />
  );

  constructor(config = null) {
    super(config);
    if (this.test === undefined) {
      this.test = null;
    }
  }

  _initFromConfig(config) {
    this.test = config.test;
  }

  _clone() {
    const clone = super._clone();
    clone.test = this.test;
    return clone;
  }

  getGenericClass() {
    return TEST_NODE;
  }

  getCaption() {
    return this.test;
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

export class AstNodeValue extends AstNode {
  static type = 'value';
  static description = (
    <FormattedMessage id="app.scoreConfigExpression.value.description" defaultMessage="Numeric literal" />
  );

  constructor(config = null) {
    super(config);
    if (this.value === undefined) {
      this.value = null;
    }
  }

  _initFromConfig(config) {
    this.value = config.value;
  }

  _clone() {
    const clone = super._clone();
    clone.value = this.value;
    return clone;
  }

  getGenericClass() {
    return LITERAL_NODE;
  }

  getCaption() {
    return this.value;
  }

  isValid() {
    return this.children.length === 0 && this.value !== null;
  }

  serialize() {
    if (!this.parent || !(this.parent instanceof AstNode)) {
      // There is no parent or the parent is a placeholder.
      return super.serialize();
    } else {
      // We may simplify the node to mere number literal.
      return this.value;
    }
  }
}

/**
 * Registration of all classes by their types. Used for deserialization.
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

export const KNOWN_AST_CLASSES = arrayToObject([...AST_FUNCTION_CLASSES, AstNodeTestResult, AstNodeValue], c => c.type);

/**
 * Internal deserialization routine.
 * @param {Object} parent Parent object of newly deserialized object.
 * @param {Object} scoreConfig Configuration node to be deserialized.
 */
const _deserialize = scoreConfig => {
  if (typeof scoreConfig === 'number') {
    return new AstNodeValue({ value: scoreConfig });
  }

  if (!scoreConfig.type || !KNOWN_AST_CLASSES[scoreConfig.type]) {
    return null;
  }

  return new KNOWN_AST_CLASSES[scoreConfig.type](scoreConfig);
};

/**
 * Public deserialization interface. Get score config and returns the root node of the AST.
 * @param {Object} scoreConfig Score configuration to be deserialized into AST.
 * @param {function} [rootChangedCallback=null]
 */
export const deserialize = (scoreConfig, rootChangedCallback = null) => {
  // If root changed callback is provided, we wrap it into root object, which fakes the _childChanged interface.
  const root = rootChangedCallback
    ? {
        _childChanged: (oldChild, newChild) => {
          if (!newChild) {
            newChild = new AstNodePlaceholder();
          }
          oldChild.parent = null;
          newChild.parent = root;
          rootChangedCallback(oldChild, newChild);
        },
      }
    : null;

  const res = _deserialize(scoreConfig);
  res.parent = root;
  res._check();
  return res;
};
