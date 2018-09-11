import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import ClientOnly from '../../helpers/ClientOnly';

import { FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap';

// load the ACE editor only when rendering in the browser
import {
  loadAceEditor,
  getAceModeFromExtension
} from '../../helpers/AceEditorLoader';
let AceEditor = loadAceEditor();

const SourceCodeField = (
  {
    input,
    mode,
    meta: { dirty, error, warning },
    type = 'text',
    label = null,
    children,
    tabIndex,
    onBlur,
    ...props
  },
  { userSettings: { vimMode = false, darkTheme = false } }
) =>
  <FormGroup
    controlId={input.name}
    validationState={error ? 'error' : warning ? 'warning' : undefined}
  >
    {Boolean(label) &&
      <ControlLabel>
        {label}
      </ControlLabel>}
    <ClientOnly>
      <AceEditor
        {...input}
        mode={getAceModeFromExtension(mode)}
        theme={darkTheme ? 'monokai' : 'github'}
        name={input.name}
        tabIndex={tabIndex}
        keyboardHandler={vimMode ? 'vim' : undefined}
        width="100%"
        height="100%"
        minLines={5}
        maxLines={20}
        onBlur={() => input.onBlur() // this is a hack that will ensure blur call witout distorting the contents
        }
        editorProps={{
          $blockScrolling: Infinity,
          $autoScrollEditorIntoView: true
        }}
      />
    </ClientOnly>
    {error &&
      <HelpBlock>
        {' '}{error}{' '}
      </HelpBlock>}
    {!error &&
      warning &&
      <HelpBlock>
        {' '}{warning}{' '}
      </HelpBlock>}
    {children}
  </FormGroup>;

SourceCodeField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  mode: PropTypes.string.isRequired,
  children: PropTypes.any,
  meta: PropTypes.shape({
    error: PropTypes.any,
    warning: PropTypes.any,
    dirty: PropTypes.bool
  }),
  tabIndex: PropTypes.number,
  type: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]),
  onBlur: PropTypes.func
};

SourceCodeField.contextTypes = {
  userSettings: PropTypes.object
};

export default SourceCodeField;
