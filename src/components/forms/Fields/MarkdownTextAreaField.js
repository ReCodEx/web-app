import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ReactMarkdown from 'react-remarkable';
import { Row, Col, HelpBlock } from 'react-bootstrap';

import SourceCodeField from './SourceCodeField';
import OnOffCheckbox from '../OnOffCheckbox';
import styles from './MarkdownTextAreaField.less';

import { canUseDOM } from 'exenv';
if (canUseDOM) {
  require('brace/mode/markdown');
}

class MarkdownTextAreaField extends Component {
  componentWillMount = () => {
    const { showPreview = false } = this.props;
    this.setState({
      showPreview
    });
  };

  shouldComponentUpdate() {
    return true;
  }

  toggleShowPreview = e => {
    this.setState({ showPreview: !this.state.showPreview });
  };

  render() {
    const { input: { name, value } } = this.props;
    const { showPreview } = this.state;
    return (
      <div>
        <SourceCodeField {...this.props} mode="markdown" />
        <Row>
          <Col sm={4}>
            <OnOffCheckbox
              name={`${name}.togglePreview`}
              checked={showPreview}
              onChange={() => this.toggleShowPreview()}
            >
              <FormattedMessage
                id="app.markdownTextArea.showPreview"
                defaultMessage="Preview"
              />
            </OnOffCheckbox>
          </Col>
          <Col sm={8}>
            <HelpBlock className="text-right">
              <FormattedMessage
                id="app.markdownTextArea.canUseMarkdown"
                defaultMessage="You can use markdown syntax in this field."
              />
            </HelpBlock>
          </Col>
        </Row>
        {showPreview &&
          <div>
            <h4>
              <FormattedMessage
                id="app.markdownTextArea.preview"
                defaultMessage="Preview:"
              />
            </h4>
            <div className={styles.preview}>
              {value.length === 0 &&
                <p>
                  <small>
                    (
                    <FormattedMessage
                      id="app.markdownTextArea.empty"
                      defaultMessage="Empty"
                    />
                    )
                  </small>
                </p>}
              <ReactMarkdown source={value} />
            </div>
          </div>}
      </div>
    );
  }
}

MarkdownTextAreaField.propTypes = {
  showPreview: PropTypes.string,
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  }).isRequired
};

export default MarkdownTextAreaField;
