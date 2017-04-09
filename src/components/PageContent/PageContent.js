import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import Breadcrumbs from '../AdminLTE/Breadcrumbs';

const getMessage = (item, formatMessage) =>
  !item
    ? ''
    : typeof item === 'string'
      ? item
      : item.Component === FormattedMessage
        ? formatMessage(item.props)
        : getMessage(item.children);

/**
 * Holds the main content of a page with the common structure for
 * all pages - the title, description, breadcrumbs, content.
 * The component passes the title and description to the Helmet library
 * which reflects these into the <head> section of the HTML document.
 */
const PageContent = ({
  intl: { formatMessage },
  title,
  description = '',
  breadcrumbs = [],
  children
}) => (
  <div className="content-wrapper">
    <Helmet
      title={getMessage(title, formatMessage)}
      description={getMessage(description, formatMessage)} />
    <section className="content-header">
      <h1>
        {title}
        <small>{description}</small>
      </h1>
      {breadcrumbs.length > 0 &&
        <Breadcrumbs items={breadcrumbs} />}
    </section>
    <section className="content">
      {children}
    </section>
  </div>
);

PageContent.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]).isRequired,
  description: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]).isRequired,
  breadcrumbs: PropTypes.array,
  children: PropTypes.element,
  intl: intlShape.isRequired
};

export default injectIntl(PageContent);
