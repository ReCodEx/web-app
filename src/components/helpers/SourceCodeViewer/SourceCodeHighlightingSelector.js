import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Overlay, Popover, FormSelect, ButtonGroup } from 'react-bootstrap';

import Button from '../../widgets/TheButton';
import Icon, { CloseIcon, RefreshIcon, SaveIcon } from '../../icons';

import { getPrismModeFromExtension, PRISM_SUPPORTED_LANGUAGES } from '../../helpers/syntaxHighlighting.js';

export const localStorageHighlightOverridesKey = 'SourceCodeViewer.highlightOverrides';

const SourceCodeHighlightingSelector = ({
  id,
  fullButton = false,
  extension,
  initialMode = null,
  onChange,
  ...props
}) => {
  const defaultMode = getPrismModeFromExtension(extension);
  const target = useRef(null);
  const [visible, setVisible] = useState(false);
  const [selectedMode, setSelectedMode] = useState(initialMode !== null ? initialMode : defaultMode);

  useEffect(() => {
    setSelectedMode(initialMode !== null ? initialMode : defaultMode);
  }, [initialMode, extension]);

  const clickHandler = ev => {
    ev.stopPropagation();
    setVisible(!visible);
  };

  const changeHandler = ev => {
    setSelectedMode(ev.target.value);
  };

  return (
    <>
      {fullButton ? (
        <Button {...props} onClick={clickHandler} ref={target}>
          <Icon icon="highlighter" gapRight={2} />
          {(initialMode !== null ? initialMode : defaultMode) || (
            <FormattedMessage id="app.solutionSourceCodes.noHighlighting" defaultMessage="no highlighting" />
          )}
        </Button>
      ) : (
        <Icon icon="highlighter" {...props} onClick={clickHandler} ref={target} />
      )}

      <Overlay target={target.current} show={visible} placement="bottom">
        {props => (
          <Popover id={id} onClick={ev => ev.stopPropagation()} className="highlighting-selector" {...props}>
            <Popover.Header>
              {extension ? (
                <>
                  <FormattedMessage
                    id="app.solutionSourceCodes.highlightingTitle"
                    defaultMessage="Highlighting for files with extension"
                  />{' '}
                  <code>*.{extension}</code>
                </>
              ) : (
                <FormattedMessage
                  id="app.solutionSourceCodes.highlightingTitleNoExtension"
                  defaultMessage="Highlighting for files without extension"
                />
              )}
            </Popover.Header>
            <Popover.Body className="text-center">
              <FormSelect onChange={changeHandler} value={selectedMode}>
                <option value="" className={selectedMode === '' ? 'fw-bold text-primary' : 'fw-italic text-muted'}>
                  [<FormattedMessage id="app.solutionSourceCodes.noHighlighting" defaultMessage="no highlighting" />]
                  {defaultMode === '' && (
                    <>
                      {' ('}
                      <FormattedMessage id="generic.default" defaultMessage="default" />
                      {')'}
                    </>
                  )}
                </option>
                {PRISM_SUPPORTED_LANGUAGES.map(lang => (
                  <option
                    value={lang}
                    key={lang}
                    className={lang === defaultMode || lang === selectedMode ? 'fw-bold text-primary' : ''}>
                    {lang}
                    {lang === defaultMode && (
                      <>
                        {' ('}
                        <FormattedMessage id="generic.default" defaultMessage="default" />
                        {')'}
                      </>
                    )}
                  </option>
                ))}
              </FormSelect>

              <ButtonGroup className="mt-3">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => {
                    onChange(extension, selectedMode !== defaultMode ? selectedMode : null);
                    setVisible(false);
                  }}>
                  <SaveIcon gapRight={2} />
                  <FormattedMessage id="generic.save" defaultMessage="Save" />
                </Button>
                {selectedMode !== defaultMode && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setSelectedMode(defaultMode);
                      onChange(extension, null);
                    }}>
                    <RefreshIcon gapRight={2} />
                    <FormattedMessage id="generic.reset" defaultMessage="Reset" />
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setVisible(false);
                  }}>
                  <CloseIcon gapRight={2} />
                  <FormattedMessage id="generic.close" defaultMessage="Close" />
                </Button>
              </ButtonGroup>
            </Popover.Body>
          </Popover>
        )}
      </Overlay>
    </>
  );
};

SourceCodeHighlightingSelector.propTypes = {
  id: PropTypes.string.isRequired,
  fullButton: PropTypes.bool,
  extension: PropTypes.string.isRequired,
  initialMode: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default SourceCodeHighlightingSelector;
