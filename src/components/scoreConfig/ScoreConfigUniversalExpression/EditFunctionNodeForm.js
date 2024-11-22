import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import classnames from 'classnames';

import StandaloneRadioField from '../../forms/StandaloneRadioInput';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';
import InsetPanel from '../../widgets/InsetPanel';
import { CloseIcon, SaveIcon } from '../../icons';
import { AST_FUNCTION_CLASSES, KNOWN_AST_CLASSES, AstNode } from '../../../helpers/exercise/scoreAst.js';

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
    const { node = null, pushDown = false } = this.props;
    return this.state.selected && (pushDown || this.state.selected !== (node && node.getType()));
  };

  save = () => {
    const { node = null, parent = null, pushDown = false, close } = this.props;
    if (this.dirty()) {
      const newNode = new KNOWN_AST_CLASSES[this.state.selected]();
      if (node) {
        node.supplant(newNode, pushDown);
      } else if (parent) {
        parent.appendChild(newNode);
      }
    }
    close();
  };

  render() {
    const { node = null, pushDown = false, close } = this.props;
    const selected = this.state.selected || (node && !pushDown ? node.getType() : null);

    return (
      <>
        {node && !pushDown ? (
          <Callout variant="warning">
            <FormattedMessage
              id="app.scoreConfigExpression.editFunctionDialog.editDescription"
              defaultMessage="Please note that modifying the type of existing function node may have some effect on the nested nodes. However, nested nodes will be preserved as much as possible."
            />
          </Callout>
        ) : (
          <InsetPanel>
            <FormattedMessage
              id="app.scoreConfigExpression.editFunctionDialog.addDescription"
              defaultMessage="Please select the function of the newly created node."
            />
          </InsetPanel>
        )}

        <Table hover>
          <tbody>
            {AST_FUNCTION_CLASSES.map(astClass => (
              <tr
                key={astClass.type}
                onClick={() => this.setState({ selected: astClass.type })}
                className={classnames({
                  'bg-info': node && !pushDown && node.getType() === astClass.type,
                })}>
                <td className="align-middle shrink-col">
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
          <TheButtonGroup>
            <Button onClick={this.save} variant="success" disabled={!this.dirty()}>
              <SaveIcon gapRight />
              <FormattedMessage id="generic.save" defaultMessage="Save" />
            </Button>
            <Button onClick={close} variant="outline-secondary">
              <CloseIcon gapRight />
              <FormattedMessage id="generic.close" defaultMessage="Close" />
            </Button>
          </TheButtonGroup>
        </div>
      </>
    );
  }
}

EditFunctionNodeForm.propTypes = {
  node: PropTypes.instanceOf(AstNode),
  parent: PropTypes.object,
  pushDown: PropTypes.bool,
  close: PropTypes.func.isRequired,
};

export default EditFunctionNodeForm;
