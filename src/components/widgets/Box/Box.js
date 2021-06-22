import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Collapse from 'react-collapse';
import { withRouter } from 'react-router';
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
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

  toggleDetails = ev => {
    ev.preventDefault();

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

  render() {
    const {
      id = null,
      title,
      description = null,
      type = 'light',
      solid = false,
      collapsable = false,
      noPadding = false,
      extraPadding = false,
      unlimitedHeight = false,
      customIcons = null,
      className = '',
      children,
      footer,
    } = this.props;
    const { isOpen = true } = this.state;

    return (
      <Card
        id={id}
        className={classnames({
          'card-outline': !solid && type && type.length > 0,
          [`card-${type}`]: type && type.length > 0,
          [className]: className.length > 0,
        })}>
        <Card.Header onClick={this.toggleDetails}>
          <Card.Title>
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
          </Card.Title>

          {customIcons && <span className={styles.customIcons}>{customIcons}</span>}

          {collapsable && !customIcons && (
            <div className="card-tools mr-1">
              <Icon icon={isOpen ? 'minus' : 'plus'} onClick={this.toggleDetails} />
            </div>
          )}
        </Card.Header>

        <Collapse isOpened={!collapsable || isOpen}>
          <Card.Body
            className={classnames({
              'no-padding': noPadding,
              [styles.extraPadding]: !noPadding && extraPadding,
              [styles.limited]: !unlimitedHeight,
              [styles.unlimited]: unlimitedHeight,
            })}>
            {description && <div className={styles.description}>{description}</div>}
            <div>{children}</div>
          </Card.Body>
          {footer && <Card.Footer>{footer}</Card.Footer>}
        </Collapse>
      </Card>
    );
  }
}

Box.propTypes = {
  id: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
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
