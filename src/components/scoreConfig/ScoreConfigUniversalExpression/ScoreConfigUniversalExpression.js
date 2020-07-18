import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import classnames from 'classnames';
import { defaultMemoize } from 'reselect';

import ExpressionNode from './ExpressionNode';
import EditFunctionNodeForm from './EditFunctionNodeForm';
import EditTestNodeForm from './EditTestNodeForm';
import EditLiteralNodeForm from './EditLiteralNodeForm';

import { createTestNameIndex } from '../../../helpers/exercise/testsAndScore';
import { FUNCTION_NODE, TEST_NODE, LITERAL_NODE, Ast, AstNode } from '../../../helpers/exercise/scoreAst';
import { removeConstantExpressions, optimize } from '../../../helpers/exercise/scoreAstFunctions';
import Button from '../../widgets/FlatButton';
import Icon, { UndoIcon, RedoIcon, InfoIcon, CloseIcon } from '../../icons';
import { composeFunctions } from '../../../helpers/common';

import style from './tree.less';

const CLOSED_DIALOGS_STATE = {
  [`${FUNCTION_NODE}DialogOpen`]: false,
  [`${TEST_NODE}DialogOpen`]: false,
  [`${LITERAL_NODE}DialogOpen`]: false,
  helpDialogOpen: false,
  optimizationDialogOpen: false,
};

const EDIT_FORMS = {
  [FUNCTION_NODE]: EditFunctionNodeForm,
  [TEST_NODE]: EditTestNodeForm,
  [LITERAL_NODE]: EditLiteralNodeForm,
};

const EDIT_FORMS_TITLES = {
  [FUNCTION_NODE]: (
    <FormattedMessage
      id="app.scoreConfigExpression.editFunctionNodeDialog.title"
      defaultMessage="Select the function type"
    />
  ),
  [TEST_NODE]: (
    <FormattedMessage id="app.scoreConfigExpression.editTestNodeDialog.title" defaultMessage="Select the test result" />
  ),
  [LITERAL_NODE]: (
    <FormattedMessage
      id="app.scoreConfigExpression.editLiteralNodeDialog.title"
      defaultMessage="Set the literal value"
    />
  ),
};

const createTestNameIndexMemoized = defaultMemoize(tests => createTestNameIndex(tests));

class ScoreConfigUniversalExpression extends Component {
  state = {
    ast: null,
    root: null,
    currentSelection: {},
    ...CLOSED_DIALOGS_STATE,
  };

  static getDerivedStateFromProps({ ast, root }, state) {
    if (ast !== state.ast) {
      // editor has been reinitialized
      return {
        ast, // we keep this just to detect changes
        root, // we keep this just to detect changes
        currentSelection: {},
        ...CLOSED_DIALOGS_STATE,
      };
    }

    if (root !== state.root) {
      // Update selection (nodes may have changed or removed)
      const currentSelection = {};
      Object.keys(state.currentSelection).forEach(id => {
        const node = root && root.findById(id);
        if (node) {
          currentSelection[id] = node;
        }
      });
      return { root, currentSelection };
    }
    return null;
  }

  /**
   * Open dialog that edit parameters/type of a node (based on its generic class)
   * @param {AstNode|null} node Node being edited (i.e., replaced). If null, new node is created.
   * @param {AstNode|null} parent If null, node's parent is taken.
   * @param {string|null} genericClass Generic class (type of dialog to be opened). If null, generic class of given node is taken.
   * @param {boolean} pushDown Whether current node should be pushed down as a child of newly created node (instead of replacing).
   */
  openDialog = (node, parent = null, genericClass = null, pushDown = false) => {
    if (!genericClass) {
      genericClass = node && node.getGenericClass();
      if (!genericClass) {
        throw new Error(
          'Open dialog called without explicit node to edit nor without specifying generic class of node to create.'
        );
      }
    }

    this.setState({
      // One must love dynamic languages...
      [`${genericClass}DialogOpen`]: Boolean(node || parent),
      [`${genericClass}DialogNode`]: node,
      [`${genericClass}DialogParent`]: parent || (node && node.getParent()),
    });

    if (genericClass === FUNCTION_NODE) {
      this.setState({ [`${FUNCTION_NODE}DialogPushDown`]: pushDown });
    }
  };

  openHelpDialog = () => {
    this.setState({ helpDialogOpen: true });
  };

  openOptimizationDialog = () => {
    if (this.props.ast.isValid()) {
      this.setState({ optimizationDialogOpen: true });
    }
  };

  performOptimizations = (...transformations) => {
    const transformation = composeFunctions(...transformations);
    this.props.ast.applyTransformation(transformation, createTestNameIndex(this.props.tests));
    this.closeDialog();
  };

  closeDialog = () => {
    this.setState(CLOSED_DIALOGS_STATE);
  };

  selectNode = (node, multi = false) => {
    if (node === null) {
      this.setState({ currentSelection: {} });
    }

    const currentSelection = multi ? { ...this.state.currentSelection } : {};
    if (this.state.currentSelection[node.id]) {
      delete currentSelection[node.id];
    } else {
      currentSelection[node.id] = node;
    }
    this.setState({ currentSelection });
  };

  render() {
    const { ast, root, tests, editable = false } = this.props;
    const testsIndex = createTestNameIndexMemoized(tests);

    return root ? (
      <React.Fragment>
        {editable && (
          <span className={style.iconBar}>
            <OverlayTrigger
              placement="left"
              overlay={
                <Tooltip id="undo">
                  <FormattedMessage id="app.scoreConfigExpression.undo" defaultMessage="Undo" />
                </Tooltip>
              }>
              <UndoIcon
                fixedWidth
                size="lg"
                className={classnames({
                  'halfem-margin-vertical': true,
                  'em-margin-horizontal': true,
                  'text-primary': true,
                })}
                disabled={!ast.canUndo()}
                onClick={() => ast.undo()}
              />
            </OverlayTrigger>

            <br />

            <OverlayTrigger
              placement="left"
              overlay={
                <Tooltip id="redo">
                  <FormattedMessage id="app.scoreConfigExpression.redo" defaultMessage="Redo" />
                </Tooltip>
              }>
              <RedoIcon
                fixedWidth
                size="lg"
                className={classnames({
                  'halfem-margin-vertical': true,
                  'em-margin-horizontal': true,
                  'text-primary': true,
                })}
                disabled={!ast.canRedo()}
                onClick={() => ast.redo()}
              />
            </OverlayTrigger>

            <br />

            <OverlayTrigger
              placement="left"
              overlay={
                <Tooltip id="optimizeDialog">
                  <FormattedMessage
                    id="app.scoreConfigExpression.openOptimizeDialog"
                    defaultMessage="Optimize the tree"
                  />
                </Tooltip>
              }>
              <Icon
                icon="air-freshener"
                fixedWidth
                size="lg"
                className="halfem-margin-vertical em-margin-horizontal text-warning"
                disabled={!ast.isValid()}
                onClick={this.openOptimizationDialog}
              />
            </OverlayTrigger>

            <br />

            <OverlayTrigger
              placement="left"
              overlay={
                <Tooltip id="infoDialog">
                  <FormattedMessage
                    id="app.scoreConfigExpression.openInfoDialog"
                    defaultMessage="Open quick reference"
                  />
                </Tooltip>
              }>
              <InfoIcon
                fixedWidth
                size="lg"
                className="halfem-margin-vertical em-margin-horizontal text-muted"
                onClick={this.openHelpDialog}
              />
            </OverlayTrigger>
          </span>
        )}

        <ul className={style.tree}>
          <ExpressionNode
            node={root}
            testsIndex={testsIndex}
            selectedNodes={this.state.currentSelection}
            editNode={editable ? this.openDialog : null}
            selectNode={editable ? this.selectNode : null}
          />
        </ul>

        {editable &&
          [FUNCTION_NODE, TEST_NODE, LITERAL_NODE].map(genericClass => {
            const FormComponent = EDIT_FORMS[genericClass];
            return FormComponent ? (
              <Modal
                key={genericClass}
                show={this.state[`${genericClass}DialogOpen`]}
                backdrop="static"
                onHide={this.closeDialog}
                bsSize="large">
                <Modal.Header closeButton>
                  <Modal.Title>{EDIT_FORMS_TITLES[genericClass]}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <FormComponent
                    node={this.state[`${genericClass}DialogNode`]}
                    parent={this.state[`${genericClass}DialogParent`]}
                    pushDown={genericClass === FUNCTION_NODE ? this.state[`${FUNCTION_NODE}DialogPushDown`] : undefined}
                    tests={tests}
                    close={this.closeDialog}
                  />
                </Modal.Body>
              </Modal>
            ) : null;
          })}

        {editable && (
          <Modal show={this.state.helpDialogOpen} backdrop="static" onHide={this.closeDialog} bsSize="large">
            <Modal.Header closeButton>
              <Modal.Title>
                <FormattedMessage
                  id="app.scoreConfigExpression.help.title"
                  defaultMessage="Expression Editor Quick Reference"
                />
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                <FormattedMessage
                  id="app.scoreConfigExpression.help.p1"
                  defaultMessage="The expression is represented by an abstract syntax tree (AST). Inner nodes are pure functions, leaves are either numeric literals or references to test results. The test results input values are in [0,1] range and the computed correctness (returned by the root node) should also be in [0,1] range."
                />
              </p>
              <p>
                <FormattedMessage
                  id="app.scoreConfigExpression.help.p2"
                  defaultMessage="The tree is edited by basic mouse gestures and by clicking on icons:"
                />
              </p>
              <ul>
                <li>
                  <FormattedMessage
                    id="app.scoreConfigExpression.help.li1"
                    defaultMessage="Mouse click: selects/deselects a node"
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="app.scoreConfigExpression.help.li2"
                    defaultMessage="Mouse click + Ctrl: selects/deselects node allowing for multiple nodes to be selected"
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="app.scoreConfigExpression.help.li3"
                    defaultMessage="Double click: opens editting dialog for given node"
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="app.scoreConfigExpression.help.li4"
                    defaultMessage="All other operations (creating, removing, and moving nodes) are controlled by icons. Each icon has a tooltip which explains its purpose."
                  />
                </li>
              </ul>
              <p>
                <FormattedMessage
                  id="app.scoreConfigExpression.help.p3"
                  defaultMessage="Selected node(s) may be either copied or moved. Corresponding icons for such operations appear at possible target locations once the selection is made. When only a single node is selected, it offers some additional functions. It may be removed without removing the children, a new parent node may be injected above, or it may be swapped (including the sub-trees) with another node in the tree."
                />
              </p>
              <p>
                <FormattedMessage
                  id="app.scoreConfigExpression.help.p4"
                  defaultMessage="Invalid nodes are marked by red color. In case of function nodes, it indicates that the node does not have the right amount of children (e.g., when binary function does not have exactly two arguments). In case of leaf nodes, something may be wrong with the node value. There must be no invalid nodes when the form is submitted."
                />
              </p>
            </Modal.Body>
            <Modal.Footer>
              <div className="text-center">
                <Button onClick={this.closeDialog} bsStyle="default">
                  <CloseIcon gapRight />
                  <FormattedMessage id="generic.close" defaultMessage="Close" />
                </Button>
              </div>
            </Modal.Footer>
          </Modal>
        )}

        {editable && (
          <Modal show={this.state.optimizationDialogOpen} backdrop="static" onHide={this.closeDialog} bsSize="large">
            <Modal.Header closeButton>
              <Modal.Title>
                <FormattedMessage
                  id="app.scoreConfigExpression.optimize.title"
                  defaultMessage="Optimize The Expression"
                />
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="callout callout-info">
                <FormattedMessage
                  id="app.scoreConfigExpression.optimize.info"
                  defaultMessage="The selected optimization is applied on the whole tree as a single operation (i.e., it will register as one undo step). If it cannot improve the tree (since it is already optimal) no modifications will be performed."
                />
              </div>

              <table>
                <tr>
                  <td className="em-padding valign-middle">
                    <Button onClick={() => this.performOptimizations(removeConstantExpressions)} bsStyle="success">
                      <FormattedMessage
                        id="app.scoreConfigExpression.optimize.removeConstantsButton"
                        defaultMessage="Replace Constant Sub-expressions"
                      />
                    </Button>
                  </td>
                  <td className="em-padding valign-middle text-muted small">
                    <FormattedMessage
                      id="app.scoreConfigExpression.optimize.removeConstantsInfo"
                      defaultMessage="All constant sub-expressions (sub-trees) are evaluated and replaced with numeric literal nodes."
                    />
                  </td>
                </tr>
                <tr>
                  <td className="em-padding valign-middle">
                    <Button onClick={() => this.performOptimizations(optimize)} bsStyle="success">
                      <FormattedMessage
                        id="app.scoreConfigExpression.optimize.optimizeButton"
                        defaultMessage="Basic Optimizations"
                      />
                    </Button>
                  </td>
                  <td className="em-padding valign-middle text-muted small">
                    <FormattedMessage
                      id="app.scoreConfigExpression.optimize.optimizeInfo"
                      defaultMessage="Perform basic set of optimizations which simplify the tree but have no effect on the result (removing double negtion, removing 0 from sum() and 1 from mul(), etc.)."
                    />
                  </td>
                </tr>
                <tr>
                  <td className="em-padding valign-middle">
                    <Button
                      onClick={() => this.performOptimizations(removeConstantExpressions, optimize)}
                      bsStyle="success">
                      <FormattedMessage
                        id="app.scoreConfigExpression.optimize.allButton"
                        defaultMessage="All Optimizations"
                      />
                    </Button>
                  </td>
                  <td className="em-padding valign-middle text-muted small">
                    <FormattedMessage
                      id="app.scoreConfigExpression.optimize.allInfo"
                      defaultMessage="Perform all optimizations mentioned above in the correct order."
                    />
                  </td>
                </tr>
              </table>
            </Modal.Body>
            <Modal.Footer>
              <div className="text-center">
                <Button onClick={this.closeDialog} bsStyle="default">
                  <CloseIcon gapRight />
                  <FormattedMessage id="generic.close" defaultMessage="Close" />
                </Button>
              </div>
            </Modal.Footer>
          </Modal>
        )}
      </React.Fragment>
    ) : null;
  }
}

ScoreConfigUniversalExpression.propTypes = {
  ast: PropTypes.instanceOf(Ast).isRequired,
  root: PropTypes.instanceOf(AstNode).isRequired,
  tests: PropTypes.array.isRequired,
  editable: PropTypes.bool,
};

export default ScoreConfigUniversalExpression;
