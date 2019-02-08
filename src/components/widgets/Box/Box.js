import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classnames from 'classnames';
import Collapse from 'react-collapse';

import Icon from '../../icons';

import styles from './Box.less';

/**
 * component for bounding other components like text paragraphs or tables inside.
 * It is in fact a re-styled Panel component from Bootstrap. It can be collapsable
 * and can be displayed in different colors and types.
 */
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

  renderBody() {
    const {
      description = null,
      noPadding = false,
      extraPadding = false,
      children,
      footer,
      unlimitedHeight = false,
    } = this.props;
    return (
      <div>
        {description && <div className={styles.description}>{description}</div>}
        <div
          className={classnames({
            'box-body': true,
            'no-padding': noPadding,
            [styles.extraPadding]: !noPadding && extraPadding,
            [styles.limited]: !unlimitedHeight,
            [styles.unlimited]: unlimitedHeight,
          })}>
          {children}
        </div>
        {footer && <div className={'box-footer'}>{footer}</div>}
      </div>
    );
  }

  render() {
    const {
      title,
      type = 'default',
      solid = false,
      collapsable = false,
      className = '',
    } = this.props;
    const { isOpen = true } = this.state;

    return (
      <div
        className={classnames({
          box: true,
          [`box-${type}`]: typeof type !== 'undefined',
          panel: true,
          'box-solid': solid,
          [className]: className.length > 0,
        })}>
        <div className="box-header with-border" onClick={this.toggleDetails}>
          <h3 className="box-title">{title}</h3>
          {collapsable && (
            <div className="box-tools pull-right">
              <button
                type="button"
                className="btn btn-box-tool"
                onClick={this.toggleDetails}>
                <Icon icon={isOpen ? 'minus' : 'plus'} />
              </button>
            </div>
          )}
        </div>
        <div>
          {collapsable && (
            <Collapse isOpened={isOpen}>{this.renderBody()}</Collapse>
          )}

          {!collapsable && this.renderBody()}
        </div>
      </div>
    );
  }
}

Box.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
    PropTypes.element,
  ]).isRequired,
  description: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
    PropTypes.element,
  ]),
  type: PropTypes.string,
  isOpen: PropTypes.bool,
  collapsable: PropTypes.bool,
  unlimitedHeight: PropTypes.bool,
  noPadding: PropTypes.bool,
  extraPadding: PropTypes.bool,
  solid: PropTypes.bool,
  footer: PropTypes.element,
  children: PropTypes.element,
  className: PropTypes.string,
};

export default Box;
