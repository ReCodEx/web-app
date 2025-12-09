import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Form, FormLabel, Row, Col, Modal } from 'react-bootstrap';
import classnames from 'classnames';

import TextAreaField from './TextAreaField.js';
import Markdown from '../../widgets/Markdown';
import Icon from '../../icons';
import SourceCodeField from './SourceCodeField.js';
import OnOffCheckbox from '../OnOffCheckbox';
import * as styles from './MarkdownTextAreaField.less';

export const PREVIEW_INLINE = 'inline';
export const PREVIEW_MODAL = 'modal';
export const PREVIEW_FIRST = 'first';

class MarkdownTextAreaField extends Component {
  state = {
    show: this.props.show || false,
    editor: true,
  };

  shouldComponentUpdate() {
    return true;
  }

  toggleShowState = () => {
    this.setState({ show: !this.state.show });
  };

  showDialog = () => {
    this.setState({ show: true });
  };

  hideDialog = () => {
    this.setState({ show: false });
  };

  toggleEditorState = () => {
    this.setState({ editor: !this.state.editor });
  };

  render() {
    const {
      meta: { dirty, error, warning },
      label = null,
      input: { name, value },
      disabled,
      preview = PREVIEW_MODAL,
      previewPreprocessor = null,
    } = this.props;
    const { show, editor } = this.state;
    return (
      <div>
        {preview !== PREVIEW_FIRST ? (
          <SourceCodeField {...this.props} mode="markdown" readOnly={disabled} />
        ) : (
          <>
            {Boolean(label) && (
              <FormLabel className={error ? 'text-danger' : warning ? 'text-warning' : undefined}>{label}</FormLabel>
            )}
            <div
              className={classnames({
                [styles.preview]: true,
                [styles.previewEmpty]: value.length === 0,
                [styles.clickable]: !disabled,
                [styles.disabled]: disabled,
                [styles.dirty]: dirty,
                'mb-3': true,
              })}
              onDoubleClick={disabled ? null : this.showDialog}>
              <Icon icon="pencil" className={styles.editIcon} />
              {value.length === 0 && (
                <>
                  (<FormattedMessage id="app.markdownTextArea.empty" defaultMessage="Empty" />)
                </>
              )}
              <Markdown source={previewPreprocessor ? previewPreprocessor(value) : value} />
            </div>
          </>
        )}

        {(preview === true || preview === PREVIEW_MODAL || preview === PREVIEW_INLINE) && (
          <>
            <Row className="mb-3">
              <Col sm={4}>
                {preview === PREVIEW_INLINE ? (
                  <OnOffCheckbox name={`${name}.togglePreview`} checked={show} onChange={this.toggleShowState}>
                    <FormattedMessage id="app.markdownTextArea.showPreviewCheckbox" defaultMessage="Preview" />
                  </OnOffCheckbox>
                ) : (
                  <strong className="text-primary timid clickable mb-2" onClick={this.showDialog}>
                    <Icon icon="eye" gapRight />
                    <FormattedMessage id="app.markdownTextArea.showPreviewButton" defaultMessage="Show preview" />
                  </strong>
                )}
              </Col>
              <Col sm={8} className="text-end">
                <Form.Text>
                  <FormattedMessage
                    id="app.markdownTextArea.canUseMarkdown"
                    defaultMessage="You can use <a>markdown syntax</a> in this field."
                    values={{
                      a: caption => (
                        <a href="https://github.com/ReCodEx/wiki/wiki/Markdown" target="_blank" rel="noreferrer">
                          {caption}
                        </a>
                      ),
                    }}
                  />
                </Form.Text>
              </Col>
            </Row>
          </>
        )}

        {show && preview === PREVIEW_INLINE && (
          <div className={`mb-5 ${styles.preview} ${value.length === 0 ? styles.previewEmpty : ''}`}>
            {value.length === 0 && (
              <>
                (<FormattedMessage id="app.markdownTextArea.empty" defaultMessage="Empty" />)
              </>
            )}
            <Markdown source={previewPreprocessor ? previewPreprocessor(value) : value} />
          </div>
        )}

        {(preview === true || preview === PREVIEW_MODAL || preview === PREVIEW_FIRST) && (
          <Modal
            show={show}
            backdrop="static"
            onHide={this.hideDialog}
            onEscapeKeyDown={this.hideDialog}
            size="xl"
            scrollable={preview !== PREVIEW_FIRST || editor}
            dialogClassName={preview === PREVIEW_FIRST ? 'full-width-modal' : ''}>
            <Modal.Header closeButton className="position-relative">
              <Modal.Title>
                {preview === PREVIEW_FIRST ? (
                  <>{label}</>
                ) : (
                  <FormattedMessage
                    id="app.markdownTextArea.markdownPreviewModal.title"
                    defaultMessage="Markdown preview"
                  />
                )}
              </Modal.Title>

              {preview === PREVIEW_FIRST && (
                <span className={styles.editorToggle}>
                  <OnOffCheckbox name={`${name}.toggleEditor`} checked={editor} onChange={this.toggleEditorState}>
                    <FormattedMessage id="app.markdownTextArea.showAceEditor" defaultMessage="Editor" />
                  </OnOffCheckbox>
                </span>
              )}
            </Modal.Header>

            <Modal.Body className={preview === PREVIEW_FIRST && !editor ? 'p-1' : ''}>
              {preview !== PREVIEW_FIRST ? (
                <div className={`${styles.preview} ${value.length === 0 ? styles.previewEmpty : ''}`}>
                  {value.length === 0 && (
                    <>
                      (<FormattedMessage id="app.markdownTextArea.empty" defaultMessage="Empty" />)
                    </>
                  )}
                  <Markdown source={previewPreprocessor ? previewPreprocessor(value) : value} />
                </div>
              ) : editor ? (
                <SourceCodeField
                  {...this.props}
                  label={null}
                  mode="markdown"
                  readOnly={disabled}
                  minLines={25}
                  maxLines={Infinity}
                />
              ) : (
                <TextAreaField {...this.props} label={null} rows={null} className={styles.textAreaModal} />
              )}
            </Modal.Body>
          </Modal>
        )}
      </div>
    );
  }
}

MarkdownTextAreaField.propTypes = {
  meta: PropTypes.shape({
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any,
  }),
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  show: PropTypes.string,
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  }).isRequired,
  disabled: PropTypes.bool,
  preview: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  previewPreprocessor: PropTypes.func,
};

export default MarkdownTextAreaField;
