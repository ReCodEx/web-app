import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';

const removeFirstSegment = url =>
  url.substr(1).indexOf('/') === -1
    ? '/'
    : url.substr(url.substr(1).indexOf('/') + 1);

const changeLang = (url, lang) =>
  `/${lang}${removeFirstSegment(url)}`;

const HeaderLanguageSwitching = ({
  currentUrl,
  lang,
  active = false
}) => (
  <li className={classNames({ active })}>
    <Link to={changeLang(currentUrl, lang)}>{lang}</Link>
  </li>
);

HeaderLanguageSwitching.propTypes = {
  currentUrl: PropTypes.string.isRequired,
  lang: PropTypes.string.isRequired,
  active: PropTypes.bool
};

export default HeaderLanguageSwitching;
