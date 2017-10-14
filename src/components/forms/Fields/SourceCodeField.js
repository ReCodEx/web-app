import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { canUseDOM } from 'exenv';
import ClientOnly from '../../helpers/ClientOnly';

import { FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap';

// load the ACE editor only when rendering in the browser
let AceEditor = null;
if (canUseDOM) {
  AceEditor = require('react-ace').default;
  require('brace/theme/monokai');
  require('brace/theme/github');
  require('brace/mode/c_cpp');
  require('brace/mode/java');
  require('brace/mode/csharp');
  require('brace/keybinding/vim');
}

const getMode = ext => {
  switch (ext) {
    case 'java':
      return 'java';

    case 'cs':
      return 'csharp';

    case 'c':
    case 'cpp':
    case 'h':
    case 'hpp':
      return 'c_cpp';

    case 'md':
    case 'markdown':
      return 'markdown';

    case '':
      return 'makefile';

    default:
      return 'c_cpp';
  }
};

const SourceCodeField = (
  {
    input,
    mode,
    meta: { touched, error },
    type = 'text',
    label,
    children,
    tabIndex,
    ...props
  },
  { userSettings: { vimMode = false, darkTheme = false } }
) =>
  <FormGroup
    controlId={input.name}
    validationState={error ? (touched ? 'error' : 'warning') : undefined}
  >
    <ControlLabel>
      {label}
    </ControlLabel>
    <ClientOnly>
      <AceEditor
        {...input}
        mode={getMode(mode)}
        theme={darkTheme ? 'monokai' : 'github'}
        name={input.name}
        tabIndex={tabIndex}
        keyboardHandler={vimMode ? 'vim' : undefined}
        width="100%"
        height="100%"
        minLines={5}
        maxLines={20}
        editorProps={{ $blockScrolling: true, $autoScrollEditorIntoView: true }}
      />
    </ClientOnly>
    {error &&
      <HelpBlock>
        {' '}{touched
          ? error
          : <FormattedMessage
              defaultMessage="This field is required."
              id="app.field.isRequired"
            />}{' '}
      </HelpBlock>}
    {children}
  </FormGroup>;

SourceCodeField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  mode: PropTypes.string.isRequired,
  children: PropTypes.any,
  meta: PropTypes.shape({ error: PropTypes.any, touched: PropTypes.bool }),
  tabIndex: PropTypes.number,
  type: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired
};

SourceCodeField.contextTypes = {
  userSettings: PropTypes.object
};

export default SourceCodeField;
