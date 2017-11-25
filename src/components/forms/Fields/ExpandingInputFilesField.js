import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Row,
  Col,
  FormGroup,
  FormControl,
  HelpBlock,
  ControlLabel
} from 'react-bootstrap';

const EMPTY_VALUE = { first: '', second: '' };

class ExpandingInputFilesField extends Component {
  state = { texts: [] };

  componentDidMount() {
    const { input: { value } } = this.props;
    const initialValue =
      Array.isArray(value) && value.first && value.second
        ? value.concat([EMPTY_VALUE])
        : [EMPTY_VALUE];
    this.setState({ texts: initialValue });
  }

  changeText = (i, text, isFirst, onChange) => {
    const { texts } = this.state;
    if (isFirst) {
      texts[i] = { first: text.trim(), second: texts[i].second };
    } else {
      texts[i] = { first: texts[i].first, second: text.trim() };
    }
    if (i === texts.length - 1) {
      texts.push(EMPTY_VALUE);
    }
    this.setState({ texts });

    const texts2 = texts.slice(0, texts.length - 1);
    onChange(texts2);
  };

  removeIfEmpty = (i, onChange) => {
    const { texts } = this.state;
    if (
      i !== texts.length - 1 &&
      texts[i].first === '' &&
      texts[i].second === ''
    ) {
      texts.splice(i, 1);
      this.setState({ texts });

      const texts2 = texts.slice(0, texts.length - 1);
      onChange(texts2);
    }
  };

  isReference = () => {};

  render() {
    const {
      leftLabel = '',
      rightLabel = '',
      input: { onChange },
      meta: { touched, error },
      style = {},
      options,
      ...props
    } = this.props;
    const { texts } = this.state;

    return (
      <Row>
        <Col sm={6}>
          <FormGroup
            controlId={'first'}
            validationState={
              error ? (touched ? 'error' : 'warning') : undefined
            }
          >
            <ControlLabel>{leftLabel}</ControlLabel>
            <div style={style}>
              {texts.map((text, i) =>
                <FormControl
                  key={i}
                  onChange={e =>
                    this.changeText(i, e.target.value, true, onChange)}
                  onBlur={() => this.removeIfEmpty(i, onChange)}
                  value={text.first}
                  componentClass="select"
                  {...props}
                >
                  {options.map(({ key, name }, o) =>
                    <option value={key} key={o}>
                      {name}
                    </option>
                  )}
                </FormControl>
              )}
            </div>{' '}
          </FormGroup>
        </Col>
        <Col sm={6}>
          <FormGroup
            controlId={'second'}
            validationState={
              error ? (touched ? 'error' : 'warning') : undefined
            }
          >
            <ControlLabel>{rightLabel}</ControlLabel>
            <div style={style}>
              {texts.map((text, i) =>
                <FormControl
                  key={i}
                  componentClass="input"
                  onChange={e =>
                    this.changeText(i, e.target.value, false, onChange)}
                  onBlur={() => this.removeIfEmpty(i, onChange)}
                  value={text.second}
                  {...props}
                />
              )}
            </div>{' '}
          </FormGroup>
        </Col>
        {error &&
          <HelpBlock>
            {' '}{touched
              ? error
              : <FormattedMessage
                  defaultMessage="This field is required."
                  id="app.field.isRequired"
                />}{' '}
          </HelpBlock>}
      </Row>
    );
  }
}

ExpandingInputFilesField.propTypes = {
  input: PropTypes.object,
  meta: PropTypes.object,
  leftLabel: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  rightLabel: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  style: PropTypes.object,
  options: PropTypes.array
};

export default ExpandingInputFilesField;
