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
import classNames from 'classnames';

import styles from './commonStyles.less';

const EMPTY_VALUE = { first: '', second: '' };

class ExpandingInputFilesField extends Component {
  state = { texts: [] };

  componentDidMount() {
    const { input: { value } } = this.props;
    const initialValue = Array.isArray(value)
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
      input: { onChange, onFocus, onBlur, ...input },
      meta: { active, dirty, error, warning },
      style = {},
      options,
      ignoreDirty = false,
      ...props
    } = this.props;
    const { texts } = this.state;

    return (
      <FormGroup
        controlId={input.name}
        validationState={error ? 'error' : warning ? 'warning' : undefined}
      >
        <Row>
          <Col sm={6}>
            <ControlLabel>
              {leftLabel}
            </ControlLabel>
            <div style={style}>
              {texts.map((text, i) =>
                <FormControl
                  key={i}
                  onChange={e =>
                    this.changeText(i, e.target.value, true, onChange)}
                  onFocus={onFocus}
                  onBlur={e => {
                    onBlur(e);
                    this.removeIfEmpty(i, onChange);
                  }}
                  value={text.first}
                  componentClass="select"
                  bsClass={classNames({
                    'form-control': true,
                    [styles.dirty]:
                      i < texts.length - 1 &&
                      dirty &&
                      !ignoreDirty &&
                      !error &&
                      !warning,
                    [styles.active]: active
                  })}
                  {...props}
                >
                  {options.map(({ key, name }, o) =>
                    <option value={key} key={o}>
                      {name}
                    </option>
                  )}
                </FormControl>
              )}
            </div>
          </Col>
          <Col sm={6}>
            <ControlLabel>
              {rightLabel}
            </ControlLabel>
            <div style={style}>
              {texts.map((text, i) =>
                <FormControl
                  key={i}
                  componentClass="input"
                  onChange={e =>
                    this.changeText(i, e.target.value, false, onChange)}
                  onFocus={onFocus}
                  onBlur={e => {
                    onBlur(e);
                    this.removeIfEmpty(i, onChange);
                  }}
                  value={text.second}
                  bsClass={classNames({
                    'form-control': true,
                    [styles.dirty]:
                      i < texts.length - 1 &&
                      dirty &&
                      !ignoreDirty &&
                      !error &&
                      !warning,
                    [styles.active]: active
                  })}
                  {...props}
                />
              )}
            </div>
          </Col>
        </Row>
        {error &&
          <HelpBlock>
            {' '}{error}{' '}
          </HelpBlock>}
        {!error &&
          warning &&
          <HelpBlock>
            {' '}{warning}{' '}
          </HelpBlock>}
      </FormGroup>
    );
  }
}

ExpandingInputFilesField.propTypes = {
  input: PropTypes.object,
  meta: PropTypes.shape({
    active: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any
  }).isRequired,
  leftLabel: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  rightLabel: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  style: PropTypes.object,
  options: PropTypes.array,
  ignoreDirty: PropTypes.bool
};

export default ExpandingInputFilesField;
