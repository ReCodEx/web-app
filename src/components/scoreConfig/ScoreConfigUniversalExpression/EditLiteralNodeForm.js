import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { FormGroup, FormControl, HelpBlock } from 'react-bootstrap';
import classnames from 'classnames';

import Button from '../../widgets/FlatButton';
import { CloseIcon, SendIcon } from '../../icons';
import { AstNode, AstNodeValue } from '../../../helpers/exercise/scoreAst';

import formStyles from '../../forms/Fields/commonStyles.less';

class EditLiteralNodeForm extends Component {
  state = {
    node: null,
    parent: null,
    value: null,
    numValue: null,
  };

  static getDerivedStateFromProps({ node = null, parent = null }, state) {
    // If the node or the parent have changed, the text input needs to reset
    return node !== state.node || parent !== state.parent
      ? {
          node,
          parent,
          value: null,
          numValue: null,
        }
      : null;
  }

  changeValue = ev => {
    const rawValue = ev.target && ev.target.value;
    if (rawValue !== undefined && rawValue !== null) {
      const value = rawValue.trim();
      let numValue = parseFloat(value);
      if (isNaN(numValue) || `${numValue}` !== value) {
        numValue = null; // null is an indicator of invalid value
      }
      this.setState({ value, numValue });
    }
  };

  valid = () => {
    return this.state.value === null || this.state.numValue !== null;
  };

  dirty = () => {
    const { node = null } = this.props;
    return this.state.value !== null && this.state.numValue !== (node && node.value);
  };

  save = () => {
    const { node = null, parent = null, close } = this.props;
    if (this.dirty() && this.valid()) {
      const newNode = new AstNodeValue();
      newNode.value = this.state.numValue;
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
    const value = this.state.value !== null ? this.state.value : (node && node.value && `${node.value}`) || '';

    return (
      <React.Fragment>
        <FormGroup validationState={!this.valid() ? 'error' : undefined}>
          <FormControl
            type="text"
            value={value}
            bsClass={classnames({
              'form-control': true,
              [formStyles.dirty]: this.dirty(),
            })}
            onChange={this.changeValue}
          />

          {!this.valid() && (
            <HelpBlock>
              <FormattedMessage
                id="app.scoreConfigExpression.editLiteralDialog.invalidInput"
                defaultMessage="The literal value must be a valid number."
              />
            </HelpBlock>
          )}
        </FormGroup>

        <hr />

        <div className="text-center">
          <Button onClick={this.save} bsStyle="success" disabled={!this.dirty() || !this.valid()}>
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

EditLiteralNodeForm.propTypes = {
  node: PropTypes.instanceOf(AstNode),
  parent: PropTypes.object,
  close: PropTypes.func.isRequired,
};

export default EditLiteralNodeForm;
