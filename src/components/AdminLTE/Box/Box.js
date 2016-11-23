import React, { PropTypes, Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';
import classNames from 'classnames';
import Collapse from 'react-collapse';

import styles from './Box.less';

class Box extends Component {

  componentWillMount() {
    const { isOpen = true } = this.props;
    this.setState({ isOpen });
  }

  toggleDetails = () => {
    if (!this.props.collapsable) {
      return;
    }

    if (this.state.isOpen) {
      this.hideDetails();
    } else {
      this.showDetails();
    }
  };

  showDetails = () => this.setState({ isOpen: true });
  hideDetails = () => this.setState({ isOpen: false });

  render() {
    const {
      title,
      type = 'default',
      noPadding = false,
      children,
      footer,
      solid = false,
      collapsable = false,
      unlimitedHeight = false,
      className = ''
    } = this.props;
    const { isOpen = true } = this.state;

    return (
      <div className={
        classNames({
          'box': true,
          [`box-${type}`]: typeof type !== 'undefined',
          'panel': true,
          'box-solid': solid,
          [className]: className.length > 0
        })
      }>
        <div className='box-header with-border' onClick={this.toggleDetails}>
          <h3 className='box-title'>{title}</h3>
          {collapsable && (
            <div className='box-tools pull-right'>
              <button type='button' className='btn btn-box-tool' onClick={this.toggleDetails}>
                <Icon name={isOpen ? 'minus' : 'plus'} />
              </button>
            </div>
          )}
        </div>
        <Collapse isOpened={isOpen}>
          <div className={
            classNames({
              'box-body': true,
              'no-padding': noPadding,
              [styles.limited]: !unlimitedHeight,
              [styles.unlimited]: unlimitedHeight
            })
          }>
            {children}
          </div>
          {footer &&
            <div className={'box-footer'}>
              {footer}
            </div>}
        </Collapse>
      </div>
    );
  }

}

Box.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
    PropTypes.element
  ]).isRequired,
  type: PropTypes.string,
  isOpen: PropTypes.bool,
  collapsable: PropTypes.bool,
  unlimitedHeight: PropTypes.bool,
  noPadding: PropTypes.bool,
  solid: PropTypes.bool,
  footer: PropTypes.element,
  children: PropTypes.element,
  className: PropTypes.string
};

export default Box;
