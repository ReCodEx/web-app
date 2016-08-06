import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Box from '../../Box';

class CommentBox extends Component {

  state = { prevCount: 0 };

  componentDidUpdate() {
    if (this.state.prevCount < this.props.commentsCount) {
      this.scrollToBottom();
    }
  }

  scrollToBottom = () => {
    const el = this.refs.commentsContainer;
    if (el) { // the element is not available when the box is collapsed
      el.scrollTop = el.scrollHeight;
    }
  };

  render() {
    const {
      children,
      footer
    } = this.props;

    return (
      <Box
        title={<FormattedMessage id='app.comments.title' defaultMessage='Comments and notes' />}
        noPadding={false}
        collapsable
        footer={footer}
        className='direct-chat'>
        <div className='direct-chat-messages' ref='commentsContainer'>
          {children}
        </div>
      </Box>
    );
  }

}

CommentBox.propTypes = {
  commentsCount: PropTypes.number.isRequired,
  footer: PropTypes.element
};

export default CommentBox;
