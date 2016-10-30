import React, { PropTypes } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

const LocalizedAssignments = ({
  locales
}, {
  lang
}) => (
  <Tabs
    defaultActiveKey={
      locales.find(({ locale }) => locale === lang)
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
