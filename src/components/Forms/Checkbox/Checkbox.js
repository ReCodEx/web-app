import React, { PropTypes, Component } from 'react';
import Icon from 'react-fontawesome';

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
  }

  render() {
    const { checked } = this.props;
    const {
      tabIndex = 0,
      onOff = false,
      disabled = false,
      onBlur,
      onFocus,
      children,
      ...props
    } = this.props;

    return (
      <label
        onClick={this.toggle}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={this.onKeyDown}
        style={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: disabled ? 'gray' : ''
        }}>
        <span
          tabIndex={disabled ? -1 : tabIndex}
          style={{
            display: 'inline-block',
            textAlign: 'left',
            minWidth: 25,
            padding: '0 3px'
          }}>
          {!onOff && (
            !disabled
              ? <Icon name={checked ? 'check-square-o' : 'square-o'} />
              : <Icon name={checked ? 'check-square' : 'square'} />
          )}
          {onOff && <Icon name={checked ? 'toggle-on' : 'toggle-off'} />}
        </span>
        {children}
      </label>
    );
  }

}

Checkbox.propTypes = {
  checked: PropTypes.oneOfType([ PropTypes.string, PropTypes.bool ]),
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func
};

export default Checkbox;
