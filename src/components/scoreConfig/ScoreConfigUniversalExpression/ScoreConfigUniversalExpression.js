import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'react-bootstrap';

import ExpressionNode from './ExpressionNode';
import EditFunctionNodeForm from './EditFunctionNodeForm';
import EditTestNodeForm from './EditTestNodeForm';
import EditLiteralNodeForm from './EditLiteralNodeForm';

import { FUNCTION_NODE, TEST_NODE, LITERAL_NODE, Ast } from '../../../helpers/exercise/scoreAst';

import style from './tree.less';

const CLOSED_DIALOGS_STATE = {
  [`${FUNCTION_NODE}DialogOpen`]: false,
  [`${TEST_NODE}DialogOpen`]: false,
  [`${LITERAL_NODE}DialogOpen`]: false,
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
        <ul className={style.tree}>
          <ExpressionNode
            node={config}
            selectedNodes={this.state.currentSelection}
            editNode={editable ? this.openDialog : null}
            selectNode={editable ? this.selectNode : null}
          />
        </ul>

        {[FUNCTION_NODE, TEST_NODE, LITERAL_NODE].map(genericClass => {
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
