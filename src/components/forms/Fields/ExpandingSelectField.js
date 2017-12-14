import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  FormGroup,
  FormControl,
  HelpBlock,
  ControlLabel
} from 'react-bootstrap';
import classNames from 'classnames';

import styles from './commonStyles.less';

class ExpandingSelectField extends Component {
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
      input: { name, onChange, onFocus, onBlur },
      meta: { active, dirty, error, warning },
      options,
      style = {},
      ignoreDirty = false,
      ...props
    } = this.props;
    const { texts } = this.state;

    return (
      <FormGroup
        controlId={name}
        validationState={error ? 'error' : warning ? 'warning' : undefined}
      >
        <ControlLabel>{label}</ControlLabel>
        <div style={style}>
          {texts.map((text, i) =>
            <FormControl
              key={i}
              onChange={e => this.changeText(i, e.target.value, onChange)}
              onFocus={onFocus}
              onBlur={e => {
                onBlur(e);
                this.removeIfEmpty(i, onChange);
              }}
              value={text}
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
        </div>{' '}
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

ExpandingSelectField.propTypes = {
  input: PropTypes.object,
  meta: PropTypes.shape({
    active: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any
  }).isRequired,
  options: PropTypes.array,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  style: PropTypes.object,
  ignoreDirty: PropTypes.bool
};

export default ExpandingSelectField;
