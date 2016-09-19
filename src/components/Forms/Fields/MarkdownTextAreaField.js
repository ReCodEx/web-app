import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Collapse from 'react-collapse';
import ReactMarkdown from 'react-markdown';
import { Row, Col, Checkbox, FormGroup } from 'react-bootstrap';
import TextAreaField from './TextAreaField';

const previewStyle = {
  padding: 5,
  background: '#fefefe'
};

class MarkdownTextAreaField extends Component {

  componentWillMount = () => {
    const { showPreview = false } = this.props;
    this.setState({
      showPreview
    });
  }

  toggleShowPreview = (e) => {
    this.setState({ showPreview: !this.state.showPreview });
  };

  render() {
    const { disabled = false, input: { value } } = this.props;
    const { showPreview } = this.state;
    return (
      <div>
        <TextAreaField {...this.props} />
        <FormGroup controlId='togglePreview' className='text-center'>
          <Checkbox checked={showPreview} onChange={() => this.toggleShowPreview()}>
            <FormattedMessage id='app.markdownTextArea.showPreview' defaultMessage='Show preview' />
          </Checkbox>
        </FormGroup>
        {showPreview && value.length > 0 && (
          <div>
            <h4><FormattedMessage id='app.markdownTextArea.preview' defaultMessage='Preview:' /></h4>
            <div style={previewStyle}>
              <ReactMarkdown source={value} />
            </div>
          </div>
        )}
      </div>
    );
  }

}

MarkdownTextAreaField.propTypes = {
  showPreview: PropTypes.string
};

export default MarkdownTextAreaField;
