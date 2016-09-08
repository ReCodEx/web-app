import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Collapse from 'react-collapse';
import ReactMarkdown from 'react-markdown';
import { Button } from 'react-bootstrap';
import TextAreaField from './TextAreaField';

class MarkdownTextAreaField extends Component {

  componentWillMount() {
    const { showPreview = true } = this.props;
    this.setState({ showPreview });
  }

  toggleDetails = () => this.setState({ showPreview: !this.state.showPreview });

  render() {
    const { showPreview } = this.state;
    const value = this.props.input.value;
    return (
      <div>
        <TextAreaField {...this.props} />
        {value && (
          <span>
            <p className='text-center'>
              <Button bsStyle='link' onClick={this.toggleDetails} bsSize='xs'>
                {!showPreview && <FormattedMessage id='app.markdownTextArea.showPreview' defaultMessage='Show preview' />}
                {showPreview && <FormattedMessage id='app.markdownTextArea.hidePreview' defaultMessage='Hide preview' />}
              </Button>
            </p>
            <Collapse isOpened={showPreview}>
              <ReactMarkdown source={value} />
              <hr />
            </Collapse>
          </span>
        )}
      </div>
    );
  }

}

MarkdownTextAreaField.propTypes = {
  ...TextAreaField.propTypes,
  showPreview: PropTypes.string.isRequired
};

export default MarkdownTextAreaField;
