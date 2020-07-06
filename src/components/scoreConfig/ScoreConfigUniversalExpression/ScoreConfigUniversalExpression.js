import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import classnames from 'classnames';

import ExpressionNode from './ExpressionNode';
import EditFunctionNodeForm from './EditFunctionNodeForm';
import EditTestNodeForm from './EditTestNodeForm';
import EditLiteralNodeForm from './EditLiteralNodeForm';

import { FUNCTION_NODE, TEST_NODE, LITERAL_NODE, Ast } from '../../../helpers/exercise/scoreAst';
import Button from '../../widgets/FlatButton';
import { UndoIcon, RedoIcon, InfoIcon, CloseIcon } from '../../icons';

import style from './tree.less';

const CLOSED_DIALOGS_STATE = {
  [`${FUNCTION_NODE}DialogOpen`]: false,
  [`${TEST_NODE}DialogOpen`]: false,
  [`${LITERAL_NODE}DialogOpen`]: false,
  helpDialogOpen: false,
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

class ScoreConfigUniversalExpression extends Component {
  state = {
    initialConfig: null,
    config: null,
    currentSelection: {},
    ...CLOSED_DIALOGS_STATE,
  };

  static getDerivedStateFromProps({ initialConfig }, state) {
    return initialConfig !== state.initialConfig
      ? {
          initialConfig, // we keep this just to detect changes
          config: null, // null -> computed from initial config
          currentSelection: {},
          ...CLOSED_DIALOGS_STATE,
        }
      : null;
  }

  updateConfig = (_, config) => {
    if (config) {
      config._check(); // TODO remove
    }

    // Update selection (nodes may have changed or removed)
    const currentSelection = {};
    Object.keys(this.state.currentSelection).forEach(id => {
      const node = config && config.findById(id);
      if (node) {
        currentSelection[id] = node;
      }
    });
    this.setState({ currentSelection });

    this.setState({ config });
  };

  ast = null;
  lastInitialConfig = null;
  getAst() {
    if (this.lastInitialConfig !== this.props.initialConfig || !this.ast) {
      this.lastInitialConfig = this.props.initialConfig;
      this.ast = new Ast(this.updateConfig);
      this.ast.deserialize(this.props.initialConfig);
    }

    return this.ast;
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
    const { tests, editable = false } = this.props;
    const config = this.state.config || this.getAst().getRoot();

    return config ? (
      <React.Fragment>
        <span className={style.iconBar}>
          <OverlayTrigger
            placement="left"
            overlay={
              <Tooltip id="undo">
                <FormattedMessage id="app.scoreConfigExpression.undo" defaultMessage="Undo" />
              </Tooltip>
            }>
            <UndoIcon
              size="lg"
              className={classnames({
                'halfem-margin-vertical': true,
                'em-margin-horizontal': true,
                'text-primary': true,
                'almost-transparent': !this.getAst().canUndo(),
              })}
              onClick={() => this.getAst().undo()}
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
              size="lg"
              className={classnames({
                'halfem-margin-vertical': true,
                'em-margin-horizontal': true,
                'text-primary': true,
                'almost-transparent': !this.getAst().canRedo(),
              })}
              onClick={() => this.getAst().redo()}
            />
          </OverlayTrigger>

          <br />

          <OverlayTrigger
            placement="left"
            overlay={
              <Tooltip id="infoDialog">
                <FormattedMessage id="app.scoreConfigExpression.openInfoDialog" defaultMessage="Open quick reference" />
              </Tooltip>
            }>
            <InfoIcon
              size="lg"
              className="halfem-margin-vertical em-margin-horizontal text-muted"
              onClick={this.openHelpDialog}
            />
          </OverlayTrigger>
        </span>
        <ul className={style.tree}>
          <ExpressionNode
            node={config}
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
                defaultMessage="The expression is represented by an abstract syntax tree (AST). Inner nodes are pure functions, leaves are either numeric literals or references to test results. The test results input values are in [0,1] range and the output correctness (yielded by the root node) should also be in [0,1] range."
              />
            </p>
            <p>
              <FormattedMessage
                id="app.scoreConfigExpression.help.p2"
                defaultMessage="The tree is edited by basic mouse gestures and icons:"
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
                  defaultMessage="Mouse click + Ctrl: selects/deselects and allow for multiple nodes to be selected"
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
                  defaultMessage="All other operations (creating, removing, and moving nodes) are controlled by icons. Each icon has a tool tip which explains its purpose."
                />
              </li>
            </ul>
            <p>
              <FormattedMessage
                id="app.scoreConfigExpression.help.p3"
                defaultMessage="Selected node(s) may be either copied or moved. Corresponding icons for such operations appear at possible target locations once the selection is made. When only a single node is selected, it offers some additional functions. It may be removed without removing the children, a new parent node may be injected above, or the selected node may be swapped (including the sub-trees) with another node in the tree."
              />
            </p>
            <p>
              <FormattedMessage
                id="app.scoreConfigExpression.help.p4"
                defaultMessage="Invalid nodes are marked by red color. It indicates that the node does not have the right amount of children (e.g., when binary function does not have exactly two arguments). There must be no invalid nodes when the form is submitted."
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
      </React.Fragment>
    ) : null;
  }
}

ScoreConfigUniversalExpression.propTypes = {
  initialConfig: PropTypes.object.isRequired,
  tests: PropTypes.array.isRequired,
  editable: PropTypes.bool,
};

export default ScoreConfigUniversalExpression;
