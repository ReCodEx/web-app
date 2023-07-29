import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import PageContent from '../PageContent';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import { LoadingIcon, WarningIcon } from '../../icons';

const Page = ({
  title = '',
  windowTitle = null,
  icon = null,
  resource,
  forceLoading = false,
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
      <FormattedMessage id="app.page.failed" defaultMessage="Cannot load the page" />
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
    forceLoading={forceLoading}
    loading={<PageContent title={loadingTitle} description={loadingDescription} />}
    failed={<PageContent title={failedTitle}>{failedDescription}</PageContent>}>
    {(...resources) => (
      <PageContent
        {...props}
        icon={typeof icon === 'function' ? icon(...resources) : icon}
        title={typeof title === 'function' ? title(...resources) : title}
        windowTitle={typeof windowTitle === 'function' ? windowTitle(...resources) : windowTitle}>
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
  forceLoading: PropTypes.bool,
  loadingTitle: stringOrFormattedMessage,
  loadingDescription: stringOrFormattedMessage,
  failedTitle: stringOrFormattedMessage,
  failedDescription: stringOrFormattedMessage,
  title: PropTypes.oneOfType([PropTypes.func, stringOrFormattedMessage]),
  windowTitle: PropTypes.oneOfType([PropTypes.func, PropTypes.string, PropTypes.element]),
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.func, PropTypes.string]),
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
};

export default Page;
