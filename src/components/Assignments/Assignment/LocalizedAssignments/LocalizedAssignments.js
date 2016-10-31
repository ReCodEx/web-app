import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tabs, Tab } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

const LocalizedAssignments = ({
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
    id='localized-assignments'>
    {locales.map(({ locale, name, description }) => (
      <Tab key={locale} eventKey={locale} title={name}>
        <ReactMarkdown source={description} />
      </Tab>
    ))}
    {locales.length === 0 && (
      <Tab eventKey={lang} title={lang}>
        <FormattedMessage id='app.localizedAssignments.missingDescription' defaultMessage='Assignment text has not been published yet.' />
      </Tab>
    )}
  </Tabs>
);

LocalizedAssignments.contextTypes = {
  lang: PropTypes.string
};

LocalizedAssignments.propTypes = {
  localizedAssignments: PropTypes.arrayOf(
    PropTypes.shape({
      locale: PropTypes.string.isRequried,
      name: PropTypes.string.isRequried,
      description: PropTypes.string.isRequried
    })
  )
};

export default LocalizedAssignments;
