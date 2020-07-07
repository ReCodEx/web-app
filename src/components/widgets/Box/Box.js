import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Collapse from 'react-collapse';
import { withRouter } from 'react-router';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import classnames from 'classnames';

import Icon from '../../icons';

import styles from './Box.less';

/**
 * component for bounding other components like text paragraphs or tables inside.
 * It is in fact a re-styled Panel component from Bootstrap. It can be collapsable
 * and can be displayed in different colors and types.
 */
class Box extends Component {
  state = {
    isOpen: this.props.isOpen !== undefined ? this.props.isOpen : true,
  };

  componentDidMount() {
    if (this.props.id && this.props.location.hash === `#${this.props.id}`) {
      window.location.hash = this.props.location.hash;
    }
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

  removeUrlHash = () => {
    const scrollPosition = window.scrollY;
    window.location.hash = '';
    this.props.history.replace(this.props.location.pathname + this.props.location.search);
    window.setTimeout(() => window.scrollTo(0, scrollPosition), 0);
  };

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
        {footer && <div className="box-footer">{footer}</div>}
      </div>
    );
  }

  render() {
    const {
      id = null,
      title,
      type = 'default',
      solid = false,
      collapsable = false,
      customIcons = null,
      className = '',
    } = this.props;
    const { isOpen = true } = this.state;

    return (
      <div
        id={id}
        className={classnames({
          box: true,
          [`box-${type}`]: typeof type !== 'undefined',
          panel: true,
          'box-solid': solid,
          [className]: className.length > 0,
        })}>
        <div className="box-header with-border" onClick={this.toggleDetails}>
          <h3 className="box-title">
            {title}

            <span className="whenTargetted text-warning">
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id={`highlighter-${id}`}>
                    <FormattedMessage
                      id="app.box.highlighterExplanation"
                      defaultMessage="This box is highlighted. Click to restore."
                    />
                  </Tooltip>
                }>
                <Icon icon="highlighter" gapLeft timid onClick={this.removeUrlHash} />
              </OverlayTrigger>
            </span>
          </h3>

          {customIcons && <span className={styles.customIcons}>{customIcons}</span>}

          {collapsable && !customIcons && (
            <div className="box-tools">
              <button type="button" className="btn btn-box-tool" onClick={this.toggleDetails}>
                <Icon icon={isOpen ? 'minus' : 'plus'} />
              </button>
            </div>
          )}
        </div>
        <div>
          {collapsable && <Collapse isOpened={isOpen}>{this.renderBody()}</Collapse>}

          {!collapsable && this.renderBody()}
        </div>
      </div>
    );
  }
}

Box.propTypes = {
  id: PropTypes.string,
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
  customIcons: PropTypes.any,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }),
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
    hash: PropTypes.string.isRequired,
  }).isRequired,
};

export default withRouter(Box);
