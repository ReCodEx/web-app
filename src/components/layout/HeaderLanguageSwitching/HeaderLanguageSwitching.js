import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { knownLocalesNames } from '../../../helpers/localizedData.js';

const HeaderLanguageSwitching = ({ currentLang, availableLangs, setLang }) => (
  <Dropdown as="li" align="end" className="nav-item" data-bs-theme="light">
    <Dropdown.Toggle as="a" id="dropdown-header-lang-switch" bsPrefix="nav-link">
      {currentLang}&nbsp;
    </Dropdown.Toggle>
    <Dropdown.Menu rootCloseEvent="mousedown">
      <Dropdown.Header>
        <FormattedMessage id="app.header.languageSwitching.translationTitle" defaultMessage="Translation" />
      </Dropdown.Header>
      <Dropdown.Divider />
      {availableLangs.map(lang => (
        <Dropdown.Item
          key={lang}
          active={currentLang === lang}
          onClick={ev => {
            setLang(lang);
            ev.preventDefault();
          }}>
          {knownLocalesNames[lang] || lang}
        </Dropdown.Item>
      ))}
    </Dropdown.Menu>
  </Dropdown>
);

HeaderLanguageSwitching.propTypes = {
  currentLang: PropTypes.string.isRequired,
  setLang: PropTypes.func.isRequired,
  availableLangs: PropTypes.array,
};

export default HeaderLanguageSwitching;
