import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Collapse from 'react-collapse';
import ReactMarkdown from 'react-markdown';
import { Row, Col, FormGroup } from 'react-bootstrap';
import TextAreaField from './TextAreaField';
import Checkbox from '../Checkbox';

const previewStyle = {
  padding: 5,
  background: '#eee',
  marginBottom: 20,
  borderBottom: '2px solid #ddd'
};

class MarkdownTextAreaField extends Component {

  componentWillMount = () => {
    const { showPreview = false } = this.props;
    this.setState({
      showPreview
    });
  }

  shouldComponentUpdate() {
    return true;
  }

  toggleShowPreview = (e) => {
    this.setState({ showPreview: !this.state.showPreview });
  };

  render() {
    const { disabled = false, input: { value } } = this.props;
    const { showPreview } = this.state;
    return (
      <div>
        <TextAreaField {...this.props}>
          <Checkbox onOff controlId='togglePreview' checked={showPreview} onChange={() => this.toggleShowPreview()}>
            <FormattedMessage id='app.markdownTextArea.showPreview' defaultMessage='Preview' />
          </Checkbox>
        </TextAreaField>
        {showPreview && (
          <div>
            <h4><FormattedMessage id='app.markdownTextArea.preview' defaultMessage='Preview:' /></h4>
            <div style={previewStyle}>
              {value.length === 0 && (<p><small>(<FormattedMessage id='app.markdownTextArea.empty' defaultMessage='Empty' />)</small></p>)}
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
