import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Collapse from 'react-collapse';
import RichTextEditor, { createEmptyValue } from 'react-rte';
import { Row, Col, Checkbox, FormGroup } from 'react-bootstrap';
import TextAreaField from './TextAreaField';

class MarkdownTextAreaField extends Component {

  componentWillMount = () => {
    const { viewSource = false } = this.props;
    this.setState({
      viewSource,
      value: createEmptyValue()
    });
  }

  componentWillReceiveProps = (newProps) => {
    const { viewSource, value } = this.state;
    const inputVal = newProps.input.value;
    const sourceEditedDirectly = viewSource && inputVal !== this.props.input.value;
    const formWasReset = !viewSource && inputVal !== value.toString('markdown') && inputVal.length === 0;

    if (sourceEditedDirectly || formWasReset) {
      this.setState({
        value: this.state.value.setContentFromString(inputVal, 'markdown')
      });
    }
  };

  toggleViewSource = (e) => {
    this.setState({ viewSource: !this.state.viewSource });
  };

  onChange = (value) => {
    const { onChange, input } = this.props;
    const markdown = value.toString('markdown');
    this.setState({ value });
    input.onChange(markdown);
    onChange && onChange(markdown);
  };

  render() {
    const { disabled = false } = this.props;
    const { viewSource, value } = this.state;
    return (
      <div>
        {viewSource && (
          <TextAreaField {...this.props} />)}
        {!viewSource && (
          <RichTextEditor
            value={value}
            className=''
            editorClassName='recodex-editor'
            onChange={e => this.onChange(e)}
            readonly={disabled} />)}
        <FormGroup controlId='togglePreview' className='text-center'>
          <Checkbox checked={viewSource} onChange={() => this.toggleViewSource()}>
            <FormattedMessage id='app.markdownTextArea.showMarkdown' defaultMessage='Show markdown source' />
          </Checkbox>
        </FormGroup>
      </div>
    );
  }

}

MarkdownTextAreaField.propTypes = {
  ...TextAreaField.propTypes,
  showPreview: PropTypes.string
};

export default MarkdownTextAreaField;
