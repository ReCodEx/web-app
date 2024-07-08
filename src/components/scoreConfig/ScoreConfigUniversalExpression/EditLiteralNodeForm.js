import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Form, FormGroup, FormControl } from 'react-bootstrap';
import classnames from 'classnames';

import Button, { TheButtonGroup } from '../../widgets/TheButton';
import { CloseIcon, SaveIcon } from '../../icons';
import { AstNode, AstNodeValue } from '../../../helpers/exercise/scoreAst.js';

import * as formStyles from '../../forms/Fields/commonStyles.less';

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

  keyDown = ev => {
    if (event.key === 'Enter' && this.dirty() && this.valid()) {
      ev.preventDefault();
      ev.stopPropagation();
      this.save();
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
        node.supplant(newNode);
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
      <>
        <FormGroup>
          <FormControl
            autoFocus
            type="text"
            value={value}
            isInvalid={!this.valid()}
            className={classnames({
              'form-control': true,
              [formStyles.dirty]: this.dirty(),
              'border-danger': !this.valid(),
            })}
            onChange={this.changeValue}
            onKeyDown={this.keyDown}
          />

          {!this.valid() && (
            <Form.Text className="text-danger">
              <FormattedMessage
                id="app.scoreConfigExpression.editLiteralDialog.invalidInput"
                defaultMessage="The literal value must be a valid number."
              />
            </Form.Text>
          )}
        </FormGroup>

        <hr />

        <div className="text-center">
          <TheButtonGroup>
            <Button onClick={this.save} variant="success" disabled={!this.dirty() || !this.valid()}>
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

EditLiteralNodeForm.propTypes = {
  node: PropTypes.instanceOf(AstNode),
  parent: PropTypes.object,
  close: PropTypes.func.isRequired,
};

export default EditLiteralNodeForm;
