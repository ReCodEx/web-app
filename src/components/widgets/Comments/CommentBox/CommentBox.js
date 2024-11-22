import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'react-bootstrap';
import classnames from 'classnames';

import Box from '../../Box';
import Icon, { ChatIcon } from '../../../icons';
import * as styles from '../comments.less';

class CommentBox extends Component {
  state = { prevCount: 0, panelOpen: false };

  componentDidMount() {
    setTimeout(() => this.scrollToBottom(), 10);
  }

  componentDidUpdate() {
    if (this.state.prevCount < this.props.commentsCount) {
      this.setState({ prevCount: this.props.commentsCount });
      setTimeout(this.scrollToBottom, 10); // @todo: find another workaround for late DOM rendering
    }
  }

  scrollToBottom = () => {
    const el = this.commentsContainer;
    if (el) {
      // the element is not available when the box is collapsed
      el.scrollTop = el.scrollHeight;
    }
  };

  openPanel = () => this.setState({ panelOpen: true });
  closePanel = () => this.setState({ panelOpen: false });

  renderMessages() {
    return (
      <div
        className={classnames({
          'direct-chat-messages': true,
          [styles.body]: this.props.displayAs === 'panel',
          [styles.modalHeight]: this.props.displayAs === 'modal',
        })}
        ref={c => {
          this.commentsContainer = c;
        }}>
        {this.props.children}
      </div>
    );
  }

  render() {
    const {
      title = <FormattedMessage id="app.comments.title" defaultMessage="Comments and Notes" />,
      footer,
      displayAs = 'box',
    } = this.props;

    return displayAs === 'modal' ? (
      <>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{this.renderMessages()}</Modal.Body>
        <Modal.Footer>
          <div className="w-100">{footer}</div>
        </Modal.Footer>
      </>
    ) : displayAs === 'panel' ? (
      <>
        <div className={classnames({ [styles.panel]: true, [styles.panelOpen]: this.state.panelOpen })}>
          <div>
            <span className={styles.panelIcon}>
              {this.state.panelOpen ? (
                <Icon icon="angles-right" className="text-body-secondary" onClick={this.closePanel} />
              ) : (
                <ChatIcon className="text-primary" onClick={this.openPanel} />
              )}
            </span>
            {this.state.panelOpen && (
              <>
                <div className={styles.header}>{title}</div>
                {this.renderMessages()}
                <div className={styles.footer}>{footer}</div>
              </>
            )}
          </div>
        </div>
      </>
    ) : (
      <Box title={title} noPadding={false} collapsable footer={footer} className="direct-chat">
        {this.renderMessages()}
      </Box>
    );
  }
}

CommentBox.propTypes = {
  title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  commentsCount: PropTypes.number.isRequired,
  footer: PropTypes.element,
  displayAs: PropTypes.string,
  children: PropTypes.element,
};

export default CommentBox;
