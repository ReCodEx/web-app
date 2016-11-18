import React, { PropTypes, Component } from 'react';
import Icon from 'react-fontawesome';
import classNames from 'classnames';

import styles from './Checkbox.less';

class Checkbox extends Component {

  componentWillMount() {
    const { checked = false } = this.props;
    this.setState({ checked });
  }

  componentWillReceiveProps({ checked }) {
    if (typeof checked !== 'undefined') {
      this.setState({ checked });
    }
  }

  toggle = () => {
    const { disabled, onChange } = this.props;
    if (disabled) {
      return;
    }

    const checked = !this.state.checked;
    this.setState({ checked });
    onChange && onChange(checked);
  };

  onKeyDown = ({ key, repeat }) => {
    if (!repeat && (key === 'Enter' || key === ' ')) {
      this.toggle();
    }
  };

  renderInput() {
    const { disabled, checked } = this.props;
    return !disabled
      ? <Icon name={checked ? 'check-square-o' : 'square-o'} />
      : <Icon name={checked ? 'check-square' : 'square'} />;
  }

  render() {
    const {
      checked,
      tabIndex = 0,
      disabled = false,
      onBlur,
      onFocus,
      children,
      colored = false,
      className
    } = this.props;

    return (
      <label
        onClick={this.toggle}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={this.onKeyDown}
        className={classNames({
          [className]: className && className.length > 0,
          [styles.labelDisabled]: disabled,
          [styles.label]: !disabled
        })}>
        <span
          tabIndex={disabled ? -1 : tabIndex}
          className={classNames({
            [styles.inputWrapper]: true,
            'text-success': colored && checked,
            'text-danger': colored && !checked
          })}>
          {this.renderInput()}
        </span>
        <span className={styles.labelText}>
          {children}
        </span>
      </label>
    );
  }

}

Checkbox.propTypes = {
  checked: PropTypes.oneOfType([ PropTypes.string, PropTypes.bool ]),
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  tabIndex: PropTypes.number,
  children: PropTypes.any,
  colored: PropTypes.bool,
  className: PropTypes.string
};

export default Checkbox;
