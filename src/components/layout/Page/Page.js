import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import PageContent from '../PageContent';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import { LoadingIcon, WarningIcon } from '../../icons';

const Page = ({
  title = '',
  description = '',
  resource,
  loadingTitle = (
    <span>
      <LoadingIcon gapRight />
      <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
    </span>
  ),
  loadingDescription = (
    <FormattedMessage
      id="app.page.loadingDescription"
      defaultMessage="Please wait while we are getting things ready."
    />
  ),
  failedTitle = (
    <span>
      <WarningIcon className="text-warning" gapRight />
      <FormattedMessage id="app.page.failed" defaultMessage="Cannot Load the Page" />
    </span>
  ),
  failedDescription = (
    <>
      <p>
        <FormattedMessage
          id="app.page.failedDescription.explain"
          defaultMessage="This problem might have been caused by network failure or by internal error at server side. It is also possible that some of the resources required for displaying this page have been deleted."
        />
      </p>
      <p>
        <FormattedMessage
          id="app.page.failedDescription.sorry"
          defaultMessage="We are sorry for the inconvenience, please try again later. If the problem prevails, verify that the requested resource still exists."
        />
      </p>
    </>
  ),
  children,
  ...props
}) => (
  <ResourceRenderer
    resource={resource}
    loading={<PageContent title={loadingTitle} description={loadingDescription} />}
    failed={<PageContent title={failedTitle}>{failedDescription}</PageContent>}>
    {(...resources) => (
      <PageContent
        {...props}
        title={typeof title === 'function' ? title(...resources) : title}
        description={typeof description === 'function' ? description(...resources) : description}>
        {typeof children === 'function' ? children(...resources) : children}
      </PageContent>
    )}
  </ResourceRenderer>
);

const stringOrFormattedMessage = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({
    type: PropTypes.oneOf([FormattedMessage, ResourceRenderer]),
  }),
]);

Page.propTypes = {
  resource: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  loadingTitle: stringOrFormattedMessage,
  loadingDescription: stringOrFormattedMessage,
  failedTitle: stringOrFormattedMessage,
  failedDescription: stringOrFormattedMessage,
  title: PropTypes.oneOfType([PropTypes.func, stringOrFormattedMessage]),
  description: PropTypes.oneOfType([PropTypes.func, stringOrFormattedMessage]),
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
};

export default Page;
