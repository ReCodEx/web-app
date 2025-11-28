import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Form, Row, Col, Modal } from 'react-bootstrap';

import Markdown from '../../widgets/Markdown';
import Icon from '../../icons';
import SourceCodeField from './SourceCodeField.js';
import OnOffCheckbox from '../OnOffCheckbox';
import * as styles from './MarkdownTextAreaField.less';

class MarkdownTextAreaField extends Component {
  state = {
    showPreview: this.props.showPreview || false,
  };

  shouldComponentUpdate() {
    return true;
  }

  toggleShowPreview = e => {
    this.setState({ showPreview: !this.state.showPreview });
  };

  showPreview = () => {
    this.setState({ showPreview: true });
  };

  hidePreview = () => {
    this.setState({ showPreview: false });
  };

  render() {
    const {
      input: { name, value },
      disabled,
      hideMarkdownPreview = false,
      inlineMarkdownPreview = false,
      previewPreprocessor = null,
    } = this.props;
    const { showPreview } = this.state;
    return (
      <div>
        <SourceCodeField {...this.props} mode="markdown" readOnly={disabled} />
        {!hideMarkdownPreview && (
          <>
            <Row className="mb-3">
              <Col sm={4}>
                {inlineMarkdownPreview ? (
                  <OnOffCheckbox name={`${name}.togglePreview`} checked={showPreview} onChange={this.toggleShowPreview}>
                    <FormattedMessage id="app.markdownTextArea.showPreviewCheckbox" defaultMessage="Preview" />
                  </OnOffCheckbox>
                ) : (
                  <strong className="text-primary timid clickable mb-2" onClick={this.showPreview}>
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

            {showPreview && inlineMarkdownPreview && (
              <div className={`mb-5 ${styles.preview} ${value.length === 0 ? styles.previewEmpty : ''}`}>
                {value.length === 0 && (
                  <>
                    (<FormattedMessage id="app.markdownTextArea.empty" defaultMessage="Empty" />)
                  </>
                )}
                <Markdown source={previewPreprocessor ? previewPreprocessor(value) : value} />
              </div>
            )}

            {!inlineMarkdownPreview && (
              <Modal show={showPreview} backdrop="static" onHide={this.hidePreview} size="xl">
                <Modal.Header closeButton>
                  <Modal.Title>
                    <FormattedMessage
                      id="app.markdownTextArea.markdownPreviewModal.title"
                      defaultMessage="Markdown preview"
                    />
                  </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                  <div className={`${styles.preview} ${value.length === 0 ? styles.previewEmpty : ''}`}>
                    {value.length === 0 && (
                      <>
                        (<FormattedMessage id="app.markdownTextArea.empty" defaultMessage="Empty" />)
                      </>
                    )}
                    <Markdown source={previewPreprocessor ? previewPreprocessor(value) : value} />
                  </div>
                </Modal.Body>
              </Modal>
            )}
          </>
        )}
      </div>
    );
  }
}

MarkdownTextAreaField.propTypes = {
  showPreview: PropTypes.string,
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  }).isRequired,
  disabled: PropTypes.bool,
  hideMarkdownPreview: PropTypes.bool,
  inlineMarkdownPreview: PropTypes.bool,
  previewPreprocessor: PropTypes.func,
};

export default MarkdownTextAreaField;
