import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, FormGroup, FormLabel } from 'react-bootstrap';
import AceEditor from 'react-ace';

import { canUseDOM } from '../../../helpers/common.js';
import { UserUIDataContext } from '../../../helpers/contexts.js';

// load the ACE editor only when rendering in the browser
import { getAceModeFromExtension } from '../../helpers/syntaxHighlighting.js';

const editorProps = {
  $blockScrolling: Infinity,
  $autoScrollEditorIntoView: false,
};
const digitCodes = {};
for (let i = 0; i <= 9; ++i) {
  digitCodes['Digit' + i] = i;
  digitCodes['Numpad' + i] = i;
}

class SourceCodeField extends Component {
  constructor() {
    super();
    this.focusedEditor = null;
  }

  keyDownEventHandler = ev => {
    const { readOnly = false, getSnippet = null, setSnippet = null } = this.props;

    if (
      this.focusedEditor &&
      !readOnly &&
      !ev.repeat &&
      !ev.shiftKey &&
      ev.ctrlKey &&
      digitCodes[ev.code] !== undefined
    ) {
      if (ev.altKey) {
        const text = this.focusedEditor.getSelectedText() || this.focusedEditor.getValue();
        if (text) {
          setSnippet(digitCodes[ev.code], text);
        }
      } else {
        const snippet = getSnippet(digitCodes[ev.code]);
        if (snippet) {
          this.focusedEditor.insert(snippet);
        }
      }
      ev.stopPropagation();
      ev.preventDefault();
    }
  };

  focusHandler = (_, editor) => {
    this.focusedEditor = editor;
  };

  blurHandler = () => {
    this.props.input.onBlur(); // this is a hack that will ensure blur call without distorting the contents
    this.focusedEditor = null;
  };

  render() {
    const {
      input,
      mode,
      meta: { error, warning },
      label = null,
      children,
      tabIndex,
      onBlur,
      readOnly = false,
      ...props
    } = this.props;
    return (
      <FormGroup controlId={input.name} className="mb-1">
        {Boolean(label) && (
          <FormLabel className={error ? 'text-danger' : warning ? 'text-warning' : undefined}>{label}</FormLabel>
        )}
        {canUseDOM && (
          <div className={readOnly ? 'noselection' : ''} onKeyDownCapture={this.keyDownEventHandler}>
            <UserUIDataContext.Consumer>
              {({ vimMode = false, darkTheme = true, editorFontSize = 16 }) => (
                <AceEditor
                  width="100%"
                  height="100%"
                  minLines={5}
                  maxLines={20}
                  {...props}
                  {...input}
                  mode={getAceModeFromExtension(mode)}
                  theme={darkTheme ? 'monokai' : 'github'}
                  name={input.name}
                  tabIndex={tabIndex}
                  keyboardHandler={vimMode ? 'vim' : undefined}
                  readOnly={readOnly}
                  fontSize={editorFontSize}
                  onBlur={this.blurHandler}
                  editorProps={editorProps}
                  onFocus={this.focusHandler}
                />
              )}
            </UserUIDataContext.Consumer>
          </div>
        )}
        {error && <Form.Text className="text-danger"> {error} </Form.Text>}
        {!error && warning && <Form.Text className="text-warning"> {warning} </Form.Text>}
        {children}
      </FormGroup>
    );
  }
}

SourceCodeField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    onBlur: PropTypes.func.isRequired,
  }).isRequired,
  mode: PropTypes.string.isRequired,
  children: PropTypes.any,
  meta: PropTypes.shape({
    error: PropTypes.any,
    warning: PropTypes.any,
    dirty: PropTypes.bool,
  }),
  tabIndex: PropTypes.number,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  readOnly: PropTypes.bool,
  onBlur: PropTypes.func,
  getSnippet: PropTypes.func,
  setSnippet: PropTypes.func,
};

export default SourceCodeField;
