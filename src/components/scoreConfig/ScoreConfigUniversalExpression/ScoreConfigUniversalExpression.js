import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';

import ExpressionNode from './ExpressionNode';
import EditFunctionNodeForm from './EditFunctionNodeForm';
import EditTestNodeForm from './EditTestNodeForm';
import EditLiteralNodeForm from './EditLiteralNodeForm';
import Button from '../../widgets/FlatButton';
import Icon, { CloseIcon } from '../../icons';

import { FUNCTION_NODE, TEST_NODE, LITERAL_NODE, deserialize } from '../../../helpers/exercise/scoreAst';

import style from './tree.less';

const memoizedDeserialize = defaultMemoize((config, updateCallback) => deserialize(config, updateCallback));

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
    ...CLOSED_DIALOGS_STATE,
  };

  static getDerivedStateFromProps({ initialConfig }, state) {
    return initialConfig !== state.initialConfig
      ? {
          initialConfig, // we keep this just to detect changes
          config: null, // null -> computed from initial config
          ...CLOSED_DIALOGS_STATE,
        }
      : null;
  }

  updateConfig = (_, config) => {
    this.setState({ config });
  };

  openDialog = (node, parent = null, genericClass = null) => {
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
      [`${genericClass}DialogParent`]: parent || (node && node.parent),
    });
  };

  closeDialog = () => {
    this.setState(CLOSED_DIALOGS_STATE);
  };

  render() {
    const { initialConfig, tests, editable = false } = this.props;
    const config = this.state.config || memoizedDeserialize(initialConfig, this.updateConfig);

    return config ? (
      <React.Fragment>
        <ul className={style.tree}>
          <ExpressionNode node={config} editNode={editable ? this.openDialog : null} />
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
