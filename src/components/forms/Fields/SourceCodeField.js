import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap';

import ClientOnly from '../../helpers/ClientOnly';
import { UserSettingsContext } from '../../../helpers/contexts';

// load the ACE editor only when rendering in the browser
import { loadAceEditor, getAceModeFromExtension } from '../../helpers/AceEditorLoader';
const AceEditor = loadAceEditor();

const SourceCodeField = ({
  input,
  mode,
  meta: { error, warning },
  label = null,
  children,
  tabIndex,
  onBlur,
  readOnly = false,
  ...props
}) => (
  <FormGroup controlId={input.name} validationState={error ? 'error' : warning ? 'warning' : undefined}>
    {Boolean(label) && <ControlLabel>{label}</ControlLabel>}
    <ClientOnly>
      <div className={readOnly ? 'noselection' : ''}>
        <UserSettingsContext.Consumer>
          {({ vimMode = false, darkTheme = false }) => (
            <AceEditor
              {...props}
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
              readOnly={readOnly}
              onBlur={
                () => input.onBlur() // this is a hack that will ensure blur call witout distorting the contents
              }
              editorProps={{
                $blockScrolling: Infinity,
                $autoScrollEditorIntoView: true,
              }}
            />
          )}
        </UserSettingsContext.Consumer>
      </div>
    </ClientOnly>
    {error && <HelpBlock> {error} </HelpBlock>}
    {!error && warning && <HelpBlock> {warning} </HelpBlock>}
    {children}
  </FormGroup>
);

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
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
  ]),
  readOnly: PropTypes.bool,
  onBlur: PropTypes.func,
};

export default SourceCodeField;
