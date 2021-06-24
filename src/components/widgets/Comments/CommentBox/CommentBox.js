import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'react-bootstrap';
import classnames from 'classnames';

import Box from '../../Box';
import styles from '../comments.less';

class CommentBox extends Component {
  state = { prevCount: 0 };

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

  renderMessages() {
    return (
      <div
        className={classnames({ 'direct-chat-messages': true, [styles.fullHeight]: this.props.inModal })}
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
      inModal = false,
    } = this.props;

    return inModal ? (
      <>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{this.renderMessages()}</Modal.Body>
        <Modal.Footer>
          <div className="full-width">{footer}</div>
        </Modal.Footer>
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
  inModal: PropTypes.bool,
  children: PropTypes.element,
};

export default CommentBox;
