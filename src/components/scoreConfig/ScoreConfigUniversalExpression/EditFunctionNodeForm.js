import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table, Well } from 'react-bootstrap';
import classnames from 'classnames';

import StandaloneRadioField from '../../forms/StandaloneRadioInput';
import Button from '../../widgets/FlatButton';
import { CloseIcon, SendIcon } from '../../icons';
import { AST_FUNCTION_CLASSES, KNOWN_AST_CLASSES, AstNode } from '../../../helpers/exercise/scoreAst';

class EditFunctionNodeForm extends Component {
  state = {
    node: null,
    parent: null,
    selected: null,
  };

  static getDerivedStateFromProps({ node = null, parent = null }, state) {
    // If the node or the parent have changed, the previous selection should be forgotten (form is reset)
    return node !== state.node || parent !== state.parent
      ? {
          node,
          parent,
          selected: null,
        }
      : null;
  }

  dirty = () => {
    const { node = null } = this.props;
    return this.state.selected && this.state.selected !== (node && node.getType());
  };

  save = () => {
    const { node = null, parent = null, close } = this.props;
    if (this.dirty()) {
      const newNode = new KNOWN_AST_CLASSES[this.state.selected]();
      if (node) {
        node.replace(newNode);
      } else if (parent) {
        parent.appendChild(newNode);
      }
    }
    close();
  };

  render() {
    const { node = null, close } = this.props;
    const selected = this.state.selected || (node && node.getType());

    return (
      <React.Fragment>
        {node ? (
          <div className="callout callout-warning">
            <FormattedMessage
              id="app.scoreConfigExpression.editFunctionDialog.editDescription"
              defaultMessage="Please note that modifying the type of existing function node may have some effect on the nested nodes. However, nested nodes will be preserved as much as possible."
            />
          </div>
        ) : (
          <Well>
            <FormattedMessage
              id="app.scoreConfigExpression.editFunctionDialog.addDescription"
              defaultMessage="Please select the function of the newly created node."
            />
          </Well>
        )}

        <Table hover>
          <tbody>
            {AST_FUNCTION_CLASSES.map(astClass => (
              <tr
                key={astClass.type}
                onClick={() => this.setState({ selected: astClass.type })}
                className={classnames({
                  'bg-info': (node && node.getType()) === astClass.type,
                })}>
                <td className="valign-middle shrink-col">
                  <StandaloneRadioField
                    name="nodeFunction"
                    value={astClass.type}
                    checked={astClass.type === selected}
                    onChange={() => this.setState({ selected: astClass.type })}
                  />
                </td>
                <td>
                  <strong>
                    <code>{astClass.type}()</code>
                  </strong>
                </td>
                <td>{astClass.description}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <hr />

        <div className="text-center">
          <Button onClick={this.save} bsStyle="success" disabled={!this.dirty()}>
            <SendIcon gapRight />
            <FormattedMessage id="generic.save" defaultMessage="Save" />
          </Button>
          <Button onClick={close} bsStyle="default">
            <CloseIcon gapRight />
            <FormattedMessage id="generic.close" defaultMessage="Close" />
          </Button>
        </div>
      </React.Fragment>
    );
  }
}

EditFunctionNodeForm.propTypes = {
  node: PropTypes.instanceOf(AstNode),
  parent: PropTypes.object,
  close: PropTypes.func.isRequired,
};

export default EditFunctionNodeForm;
