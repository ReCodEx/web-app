import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '../../Box';

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

  render() {
    const { children, footer } = this.props;

    return (
      <Box
        title={
          <FormattedMessage
            id="app.comments.title"
            defaultMessage="Comments and notes"
          />
        }
        noPadding={false}
        collapsable
        footer={footer}
        className="direct-chat"
      >
        <div
          className="direct-chat-messages"
          ref={c => {
            this.commentsContainer = c;
          }}
        >
          {children}
        </div>
      </Box>
    );
  }
}

CommentBox.propTypes = {
  commentsCount: PropTypes.number.isRequired,
  footer: PropTypes.element,
  children: PropTypes.element
};

export default CommentBox;
