import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tabs, Tab } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

const LocalizedTexts = ({
  locales = []
}, {
  lang = 'en'
}) => (
  <Tabs
    defaultActiveKey={
      (locales.find(({ locale }) => locale === lang) || locales.length === 0)
        ? lang
        : locales[0].locale
    }
    className='nav-tabs-custom'
    id='localized-texts'>
    {locales.map(({ locale, text }, i) => (
      <Tab key={i} eventKey={locale} title={locale}>
        <ReactMarkdown source={text} />
      </Tab>
    ))}
    {locales.length === 0 && (
      <Tab eventKey={lang} title={lang}>
        <FormattedMessage id='app.localizedTexts.missingText' defaultMessage='Localized text has not been published yet.' />
      </Tab>
    )}
  </Tabs>
);

LocalizedTexts.contextTypes = {
  lang: PropTypes.string
};

LocalizedTexts.propTypes = {
  locales: PropTypes.arrayOf(
    PropTypes.shape({
      locale: PropTypes.string.isRequried,
      text: PropTypes.string.isRequried
    })
  )
};

export default LocalizedTexts;
