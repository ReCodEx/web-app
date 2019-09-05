import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const HeaderLanguageSwitching = ({ lang, setLang, active = false }) => (
  <li
    className={classnames({ active })}
    onClick={ev => {
      setLang(lang);
      ev.preventDefault();
    }}>
    <a href="#">{lang}</a>
  </li>
);

HeaderLanguageSwitching.propTypes = {
  setLang: PropTypes.func.isRequired,
  lang: PropTypes.string.isRequired,
  active: PropTypes.bool,
};

export default HeaderLanguageSwitching;
