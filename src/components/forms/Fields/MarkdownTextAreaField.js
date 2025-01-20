import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Form, Row, Col } from 'react-bootstrap';

import Markdown from '../../widgets/Markdown';
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

  render() {
    const {
      input: { name, value },
      disabled,
      hideMarkdownPreview = false,
    } = this.props;
    const { showPreview } = this.state;
    return (
      <div>
        <SourceCodeField {...this.props} mode="markdown" readOnly={disabled} />
        {!hideMarkdownPreview && (
          <>
            <Row>
              <Col sm={4}>
                <OnOffCheckbox name={`${name}.togglePreview`} checked={showPreview} onChange={this.toggleShowPreview}>
                  <FormattedMessage id="app.markdownTextArea.showPreview" defaultMessage="Preview" />
                </OnOffCheckbox>
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

            {showPreview && (
              <div className="mt-1">
                <div className={`${styles.preview} ${value.length === 0 ? styles.previewEmpty : ''}`}>
                  {value.length === 0 && (
                    <>
                      (<FormattedMessage id="app.markdownTextArea.empty" defaultMessage="Empty" />)
                    </>
                  )}
                  <Markdown source={value} />
                </div>
              </div>
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
};

export default MarkdownTextAreaField;
