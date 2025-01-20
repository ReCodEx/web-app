import React from 'react';
import PropTypes from 'prop-types';
import { Prism as SyntaxHighlighter, createElement } from 'react-syntax-highlighter';
import { lruMemoize } from 'reselect';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'prismjs/themes/prism.css';

import ReviewCommentForm, { newCommentFormInitialValues } from '../../forms/ReviewCommentForm';
import { getPrismModeFromExtension } from '../../helpers/syntaxHighlighting.js';
import { getFileExtensionLC, canUseDOM } from '../../../helpers/common.js';

import SourceCodeComment from './SourceCodeComment.js';
import './SourceCodeViewer.css';

const groupCommentsByLine = lruMemoize(comments => {
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
    // opens new comment form if no other form is currently open
    const target = ev.target.closest('*[data-line]');
    const lineNumber = target && parseInt(target.dataset.line);
    if (lineNumber && !isNaN(lineNumber) && !this.state.activeLine) {
      ev.stopPropagation();
      window.getSelection()?.removeAllRanges();
      this.setState({ activeLine: lineNumber, newComment: lineNumber });
    }
  };

  startEditting = ({ id, line, text, issue }) => {
    this.setState({
      editComment: id,
      activeLine: line,
      newComment: null,
      editInitialValues: { text, issue, suppressNotification: false },
    });
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

  linesRenderer = ({ rows, stylesheet, useInlineStyles }) => {
    const {
      id,
      name,
      authorView = false,
      updateComment = null,
      removeComment = null,
      restrictCommentAuthor = null,
    } = this.props;
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

          <span className="scvAddButton" data-line={lineNumber} onClick={this.lineClickHandler}></span>

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
                    fileName={name}
                    lineNumber={lineNumber}
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

              {this.state.newComment && this.state.newComment === lineNumber && (
                <ReviewCommentForm
                  form={`review-comment-new-${id}`}
                  initialValues={newCommentFormInitialValues}
                  onCancel={this.closeForms}
                  onSubmit={this.createNewComment}
                  showSuppressor={this.props.reviewClosed}
                  fileName={name}
                  lineNumber={lineNumber}
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
    const { name, content = '', addComment } = this.props;
    return canUseDOM ? (
      <SyntaxHighlighter
        language={getPrismModeFromExtension(getFileExtensionLC(name))}
        style={vs}
        className={addComment && !this.state.activeLine ? 'sourceCodeViewer addComment' : 'sourceCodeViewer'}
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
  id: PropTypes.string.isRequired,
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
