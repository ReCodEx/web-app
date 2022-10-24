import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { canUseDOM } from 'exenv';
import { Prism as SyntaxHighlighter, createElement } from 'react-syntax-highlighter';
import classnames from 'classnames';
import { defaultMemoize } from 'reselect';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'prismjs/themes/prism.css';

import UsersNameContainer from '../../../containers/UsersNameContainer';
import ReviewCommentForm from '../../forms/ReviewCommentForm';
import Confirm from '../../forms/Confirm';
import DateTime from '../../widgets/DateTime';
import Markdown from '../../widgets/Markdown';
import Icon, { DeleteIcon, EditIcon, LoadingIcon, WarningIcon } from '../../icons';
import { getPrismModeFromExtension } from '../../helpers/syntaxHighlighting';
import { getFileExtensionLC } from '../../../helpers/common';

import './SourceCodeViewer.css';

const newCommentFormInitialValues = {
  text: '',
  issue: false,
  suppressNotification: false,
};

const groupCommentsByLine = defaultMemoize(comments => {
  const res = {};

  // group by
  (comments || []).forEach(comment => {
    res[comment.line] = res[comment.line] || [];
    res[comment.line].push(comment);
  });

  // make sure each group is in ascending order (by time of creation)
  const comparator = (a, b) => a.createdAt - b.createdAt;
  Object.keys(res).forEach(line => {
    res[line].sort(comparator);
  });

  return res;
});

class SourceCodeViewer extends React.Component {
  state = { activeLine: null, newComment: null, editComment: null, editInitialValues: null };

  lineClickHandler = ev => {
    ev.stopPropagation();
    window.getSelection()?.removeAllRanges();

    // opens new comment form if no other form is currently open
    const lineNumber = parseInt(ev.target.dataset.line);
    if (lineNumber && !isNaN(lineNumber) && !this.state.activeLine) {
      this.setState({ activeLine: lineNumber, newComment: lineNumber });
    }
  };

  startEditting = ({ id, line, text, issue }) => {
    this.setState({ editComment: id, activeLine: line, newComment: null, editInitialValues: { text, issue } });
  };

  closeForms = () => this.setState({ activeLine: null, newComment: null, editComment: null, editInitialValues: null });

  createNewComment = ({ text, issue, suppressNotification = false }) => {
    const { name, addComment } = this.props;
    text = text.trim();
    return addComment({
      text,
      issue,
      suppressNotification,
      file: name,
      line: this.state.newComment,
    }).then(this.closeForms);
  };

  editComment = ({ text, issue, suppressNotification = false }) => {
    const { updateComment } = this.props;
    text = text.trim();
    if (!text || !this.state.editComment) {
      this.closeForms();
      return Promise.resove();
    }

    return updateComment({
      id: this.state.editComment,
      text,
      issue,
      suppressNotification,
    }).then(this.closeForms);
  };

  renderComment = comment => {
    const { authorView = false, updateComment = null, removeComment = null, restrictCommentAuthor = null } = this.props;
    return (
      <div className={classnames({ issue: comment.issue, 'half-opaque': comment.removing })}>
        <span className="icon">
          {comment.issue ? (
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id={`issue-${comment.id}`}>
                  {authorView ? (
                    <FormattedMessage
                      id="app.sourceCodeViewer.issueTooltipForAuthor"
                      defaultMessage="This comment is marked as an issue, which means you are expected to fix it in your next submission."
                    />
                  ) : (
                    <FormattedMessage
                      id="app.sourceCodeViewer.issueTooltip"
                      defaultMessage="This comment is marked as an issue, which means the author is expected to fix it in the next submission."
                    />
                  )}
                </Tooltip>
              }>
              <WarningIcon className="text-danger" gapRight />
            </OverlayTrigger>
          ) : (
            <Icon icon={['far', 'comment']} className="almost-transparent" gapRight />
          )}
        </span>

        <small>
          <UsersNameContainer userId={comment.author} showEmail="icon" />
          <span className="actions">
            {comment.removing && <LoadingIcon />}

            {updateComment &&
              !comment.removing &&
              (!restrictCommentAuthor || restrictCommentAuthor === comment.author) && (
                <EditIcon className="text-warning" gapRight onClick={() => this.startEditting(comment)} />
              )}
            {removeComment &&
              !comment.removing &&
              (!restrictCommentAuthor || restrictCommentAuthor === comment.author) && (
                <Confirm
                  id={`delcfrm-${comment.id}`}
                  onConfirmed={() => this.props.removeComment(comment.id)}
                  question={
                    <FormattedMessage
                      id="app.sourceCodeViewer.deleteCommentConfirm"
                      defaultMessage="Do you really wish to remove this comment? This operation cannot be undone."
                    />
                  }>
                  <DeleteIcon className="text-danger" gapRight />
                </Confirm>
              )}
          </span>
        </small>

        <small className="float-right mr-2">
          <DateTime unixts={comment.createdAt} showRelative />
        </small>
        <Markdown source={comment.text} />
      </div>
    );
  };

  linesRenderer = ({ rows, stylesheet, useInlineStyles }) => {
    const comments = groupCommentsByLine(this.props.comments || []);

    return rows.map((node, i) => {
      const lineNumber = i + 1;
      return (
        <React.Fragment key={`cfrag${lineNumber}`}>
          {createElement({
            node,
            stylesheet,
            useInlineStyles,
            key: `cseg${lineNumber}`,
          })}

          {(comments[lineNumber] || (this.state.newComment && this.state.newComment === lineNumber)) && (
            <div className="sourceCodeViewerComments">
              {(comments[lineNumber] || []).map(comment =>
                this.state.editComment === comment.id ? (
                  <ReviewCommentForm
                    key={comment.id}
                    form={`review-comment-${comment.id}`}
                    initialValues={this.state.editInitialValues}
                    createdAt={comment.createdAt}
                    authorId={comment.author}
                    onCancel={this.closeForms}
                    onSubmit={this.editComment}
                    showSuppressor={this.props.reviewClosed}
                  />
                ) : (
                  <React.Fragment key={comment.id}>{this.renderComment(comment)}</React.Fragment>
                )
              )}

              {this.state.newComment && this.state.newComment === lineNumber && (
                <ReviewCommentForm
                  form="review-comment-new"
                  initialValues={newCommentFormInitialValues}
                  onCancel={this.closeForms}
                  onSubmit={this.createNewComment}
                  showSuppressor={this.props.reviewClosed}
                />
              )}
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  linePropsGenerator = lineNumber => ({
    'data-line': lineNumber,
    'data-line-active': this.state.activeLine && this.state.activeLine === lineNumber ? '1' : undefined,
    onDoubleClick: this.props.addComment ? this.lineClickHandler : undefined,
  });

  render() {
    const { name, content = '' } = this.props;
    return canUseDOM ? (
      <SyntaxHighlighter
        language={getPrismModeFromExtension(getFileExtensionLC(name))}
        style={vs}
        className="sourceCodeViewer"
        showLineNumbers={true}
        showInlineLineNumbers={true}
        wrapLines={true}
        wrapLongLines={false}
        useInlineStyles={false}
        lineProps={this.linePropsGenerator}
        renderer={this.linesRenderer}>
        {content}
      </SyntaxHighlighter>
    ) : (
      <></>
    );
  }
}

SourceCodeViewer.propTypes = {
  name: PropTypes.string.isRequired,
  content: PropTypes.string,
  solutionId: PropTypes.string.isRequired,
  comments: PropTypes.array,
  addComment: PropTypes.func,
  updateComment: PropTypes.func,
  removeComment: PropTypes.func,
  authorView: PropTypes.bool,
  restrictCommentAuthor: PropTypes.string,
  reviewClosed: PropTypes.bool,
};

export default SourceCodeViewer;
