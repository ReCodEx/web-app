import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import PageContent from '../PageContent';
import ResourceRenderer from '../../helpers/ResourceRenderer';

const Page = (
  {
    title,
    description,
    resource,
    loadingTitle = (
      <FormattedMessage id="app.page.loading" defaultMessage="Loading ..." />
    ),
    loadingDescription = (
      <FormattedMessage
        id="app.page.loadingDescription"
        defaultMessage="Please wait while we are getting things ready."
      />
    ),
    failedTitle = (
      <FormattedMessage
        id="app.page.failed"
        defaultMessage="Cannot load the page"
      />
    ),
    failedDescription = (
      <FormattedMessage
        id="app.page.failedDescription"
        defaultMessage="We are sorry for the inconvenience, please try again later."
      />
    ),
    children,
    ...props
  }
) => (
  <ResourceRenderer
    resource={resource}
    loading={
      <PageContent title={loadingTitle} description={loadingDescription} />
    }
    failed={<PageContent title={failedTitle} description={failedDescription} />}
  >
    {(...resources) => (
      <PageContent
        {...props}
        title={typeof title === 'function' ? title(...resources) : title}
        description={
          typeof description === 'function'
            ? description(...resources)
            : description
        }
      >
        {typeof children === 'function' ? children(...resources) : children}
      </PageContent>
    )}
  </ResourceRenderer>
);

const stringOrFormattedMessage = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({
    type: PropTypes.oneOf([FormattedMessage, ResourceRenderer])
  })
]);

Page.propTypes = {
  resource: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  loadingTitle: stringOrFormattedMessage,
  loadingDescription: stringOrFormattedMessage,
  failedTitle: stringOrFormattedMessage,
  failedDescription: stringOrFormattedMessage,
  title: PropTypes.oneOfType([
    PropTypes.func,
    stringOrFormattedMessage
  ]).isRequired,
  description: PropTypes.oneOfType([
    PropTypes.func,
    stringOrFormattedMessage
  ]).isRequired,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.func])
};

export default Page;
