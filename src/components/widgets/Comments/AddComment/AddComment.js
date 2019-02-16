import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import { Form, FormGroup, FormControl, InputGroup, HelpBlock } from 'react-bootstrap';

import Button from '../../FlatButton';
import Icon from '../../../icons';

const messages = defineMessages({
  placeholder: {
    id: 'app.comments.commentPlaceholder',
    defaultMessage: 'Your comment...',
  },
});

class AddComment extends Component {
  state = { text: '', isPrivate: false };

  changeText = text => this.setState({ text });
  togglePrivate = () => this.setState({ isPrivate: !this.state.isPrivate });

  addComment = e => {
    e.preventDefault();
    const { text, isPrivate } = this.state;
    const { addComment } = this.props;
    addComment(text, isPrivate);
    this.setState({ text: '' });
  };

  render() {
    const { text, isPrivate } = this.state;
    const {
      addComment,
      refresh,
      intl: { formatMessage },
    } = this.props;

    return (
      <Form>
        <FormGroup>
          <InputGroup>
            <FormControl
              componentClass="textarea"
              rows={text.split('\n').length}
              style={{ resize: 'none', overflow: 'hidden' }}
              disabled={!addComment}
              onChange={e => this.changeText(e.target.value)}
              placeholder={formatMessage(messages.placeholder)}
              value={text}
            />
            <InputGroup.Button>
              <Button
                type="submit"
                bsStyle={isPrivate ? 'success' : 'primary'}
                disabled={text.length === 0 || !addComment}
                onClick={this.addComment}>
                <FormattedMessage id="app.comments.addComment" defaultMessage="Send" />
              </Button>
              <Button bsStyle="default" onClick={refresh}>
                <FormattedMessage id="generic.refresh" defaultMessage="Refresh" />
              </Button>
            </InputGroup.Button>
          </InputGroup>
          <HelpBlock>
            <Button onClick={this.togglePrivate} bsSize="xs" disabled={!addComment}>
              {isPrivate ? (
                <Icon icon="lock" className="text-success" />
              ) : (
                <Icon icon="unlock-alt" className="text-warning" />
              )}
            </Button>{' '}
            {isPrivate && (
              <FormattedHTMLMessage
                id="app.comments.warnings.isPrivate"
                defaultMessage="<strong>Only you will see this comment.</strong>"
              />
            )}
            {!isPrivate && (
              <FormattedHTMLMessage
                id="app.comments.warnings.isPublic"
                defaultMessage="<strong>Everyone on this page will see this comment.</strong>"
              />
            )}
          </HelpBlock>
        </FormGroup>
      </Form>
    );
  }
}

AddComment.propTypes = {
  addComment: PropTypes.func,
  refresh: PropTypes.func,
  intl: intlShape.isRequired,
};

export default injectIntl(AddComment);
