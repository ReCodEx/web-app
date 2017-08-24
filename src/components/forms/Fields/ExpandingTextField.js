import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { FormGroup, FormControl, HelpBlock } from 'react-bootstrap';

class ExpandingTextField extends Component {
  state = { texts: [''] };

  componentDidMount() {
    const { input: { value } } = this.props;
    const initialValue = Array.isArray(value) ? value : [''];
    this.setState({ texts: initialValue });
  }

  componentWillReceiveProps(newProps) {
    this.setState({ texts: newProps.input.value });
  }

  changeText = (i, text, onChange) => {
    const { texts } = this.state;
    texts[i] = text.trim();
    if (i === texts.length - 1) {
      texts.push('');
    }
    this.setState({ texts });
    onChange(texts);
  };

  render() {
    const { input: { onChange }, meta: { touched, error } } = this.props;
    const { texts } = this.state;

    return (
      <FormGroup controlId={'value'}>
        {texts.map((text, i) =>
          <FormControl
            key={i}
            componentClass="input"
            onChange={e => this.changeText(i, e.target.value, onChange)}
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
  meta: PropTypes.object
};

export default ExpandingTextField;
