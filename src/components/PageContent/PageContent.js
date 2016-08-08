import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';
import Breadcrumbs from '../Breadcrumbs';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

const getMessage = (item, formatMessage) =>
  typeof item === 'string' ? item : formatMessage(item.props);

const PageContent = ({
  intl: { formatMessage },
  title,
  description = '',
  breadcrumbs = [],
  children
}) => (
  <div className='content-wrapper'>
    <Helmet
      title={getMessage(title, formatMessage)}
      description={getMessage(description, formatMessage)} />
    <section className='content-header'>
      <h1>
        {title}
        <small>{description}</small>
      </h1>
      {breadcrumbs.length > 0 &&
        <Breadcrumbs items={breadcrumbs} />}
    </section>
    <section className='content'>
      {children}
    </section>
  </div>
);

PageContent.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  description: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,breadcrumbs: PropTypes.array,
  children: PropTypes.element,
  intl: intlShape.isRequired
};

export default injectIntl(PageContent);
