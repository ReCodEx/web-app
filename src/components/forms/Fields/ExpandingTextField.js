import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  FormGroup,
  FormControl,
  HelpBlock,
  ControlLabel
} from 'react-bootstrap';

class ExpandingTextField extends Component {
  state = { texts: [''] };

  componentDidMount() {
    const { input: { value } } = this.props;
    const initialValue = Array.isArray(value) ? value.concat(['']) : [''];
    this.setState({ texts: initialValue });
  }

  changeText = (i, text, onChange) => {
    const { texts } = this.state;
    texts[i] = text.trim();
    if (i === texts.length - 1) {
      texts.push('');
    }
    this.setState({ texts });

    const texts2 = texts.slice(0, texts.length - 1);
    onChange(texts2);
  };

  removeIfEmpty = (i, onChange) => {
    const { texts } = this.state;
    if (i !== texts.length - 1 && texts[i] === '') {
      texts.splice(i, 1);
      this.setState({ texts });

      const texts2 = texts.slice(0, texts.length - 1);
      onChange(texts2);
    }
  };

  render() {
    const {
      label = '',
      input: { onChange },
      meta: { touched, error }
    } = this.props;
    const { texts } = this.state;

    return (
      <FormGroup
        controlId={'value'}
        validationState={touched && error ? 'error' : undefined}
      >
        <ControlLabel>
          {label}
        </ControlLabel>
        {texts.map((text, i) =>
          <FormControl
            key={i}
            componentClass="input"
            onChange={e => this.changeText(i, e.target.value, onChange)}
            onBlur={() => this.removeIfEmpty(i, onChange)}
            value={text}
          />
        )}
        {touched &&
          error &&
          <HelpBlock>
            {error}
          </HelpBlock>}
      </FormGroup>
    );
  }
}

ExpandingTextField.propTypes = {
  input: PropTypes.object,
  meta: PropTypes.object,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ])
};

export default ExpandingTextField;
