import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Form, Row, Col } from 'react-bootstrap';

import Markdown from '../../widgets/Markdown';
import SourceCodeField from './SourceCodeField';
import OnOffCheckbox from '../OnOffCheckbox';
import styles from './MarkdownTextAreaField.less';

import { canUseDOM } from 'exenv';
if (canUseDOM) {
  require('ace-builds/src-noconflict/mode-markdown');
}

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
    } = this.props;
    const { showPreview } = this.state;
    return (
      <div>
        <SourceCodeField {...this.props} mode="markdown" readOnly={disabled} />
        <Row>
          <Col sm={4}>
            <OnOffCheckbox name={`${name}.togglePreview`} checked={showPreview} onChange={this.toggleShowPreview}>
              <FormattedMessage id="app.markdownTextArea.showPreview" defaultMessage="Preview" />
            </OnOffCheckbox>
          </Col>
          <Col sm={8}>
            <Form.Text className="text-right">
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
          <div className="mt-3">
            <h6>
              <FormattedMessage id="app.markdownTextArea.preview" defaultMessage="Preview:" />
            </h6>
            <div className={styles.preview}>
              {value.length === 0 && (
                <p>
                  <small>
                    (
                    <FormattedMessage id="app.markdownTextArea.empty" defaultMessage="Empty" />)
                  </small>
                </p>
              )}
              <Markdown source={value} />
            </div>
          </div>
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
};

export default MarkdownTextAreaField;
