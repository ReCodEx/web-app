import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import ReviewCommentForm, { newCommentFormInitialValues } from '../../forms/ReviewCommentForm';
import SourceCodeComment from '../../helpers/SourceCodeViewer/SourceCodeComment.js';
import Button from '../../widgets/TheButton';
import Box from '../../widgets/Box';
import { AddIcon } from '../../icons';

class ReviewSummary extends Component {
  state = { add: false, edit: null, editInitialValues: null };

  startCreation = () => this.setState({ add: true });
  close = () => this.setState({ add: false, edit: null });

  createNewComment = ({ text, issue, suppressNotification = false }) => {
    const { addComment } = this.props;
    text = text.trim();
    return addComment({
      text,
      issue,
      suppressNotification,
      file: '',
      line: 0,
    }).then(this.close);
  };

  startEditting = ({ id, text, issue }) => {
    this.setState({ edit: id, editInitialValues: { text, issue, suppressNotification: false } });
  };

  editComment = ({ text, issue, suppressNotification = false }) => {
    const { updateComment } = this.props;
    text = text.trim();
    if (!text || !this.state.edit) {
      this.close();
      return Promise.resove();
    }

    return updateComment({
      id: this.state.edit,
      text,
      issue,
      suppressNotification,
    }).then(this.close);
  };

  render() {
    const {
      reviewComments = [],
      reviewClosed = false,
      authorView = false,
      restrictCommentAuthor = null,
      addComment = null,
      updateComment = null,
      removeComment = null,
    } = this.props;

    return (
      <Box
        title={<FormattedMessage id="app.solutionSourceCodes.reviewSummary.title" defaultMessage="Review summary" />}
        noPadding
        unlimitedHeight
        isOpen>
        <div className="sourceCodeViewerComments reviewSummary">
          {reviewComments.map(comment =>
            this.state.edit === comment.id && updateComment ? (
              <ReviewCommentForm
                key={comment.id}
                form={`review-summary-${comment.id}`}
                initialValues={this.state.editInitialValues}
                createdAt={comment.createdAt}
                authorId={comment.author}
                onCancel={this.close}
                onSubmit={this.editComment}
                showSuppressor={this.props.reviewClosed}
              />
            ) : (
              <SourceCodeComment
                key={comment.id}
                comment={comment}
                authorView={authorView}
                restrictCommentAuthor={restrictCommentAuthor}
                startEditting={updateComment ? this.startEditting : null}
                removeComment={removeComment}
              />
            )
          )}

          {reviewComments.length === 0 && this.state.add && addComment && (
            <ReviewCommentForm
              form="review-summary-new"
              initialValues={newCommentFormInitialValues}
              onCancel={this.close}
              onSubmit={this.createNewComment}
              showSuppressor={reviewClosed}
            />
          )}

          {reviewComments.length === 0 && addComment && !this.state.add && (
            <div className="text-center p-3">
              <Button onClick={this.startCreation} size="sm" variant="success">
                <AddIcon gapRight={2} />
                <FormattedMessage id="generic.create" defaultMessage="Create" />
              </Button>
            </div>
          )}
        </div>
      </Box>
    );
  }
}

ReviewSummary.propTypes = {
  reviewComments: PropTypes.array,
  reviewClosed: PropTypes.bool,
  authorView: PropTypes.bool,
  restrictCommentAuthor: PropTypes.string,
  addComment: PropTypes.func,
  updateComment: PropTypes.func,
  removeComment: PropTypes.func,
};

export default ReviewSummary;
