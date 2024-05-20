import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';

import PageContent from '../PageContent';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import Icon, { LoadingIcon, WarningIcon } from '../../icons';
import Callout from '../../widgets/Callout';
import { getErrorCodeStructured, getBaseErrorMessage, getErrorMessage } from '../../../locales/apiErrorMessages';

const failedIcons = {
  400: <Icon icon={['far', 'circle-xmark']} />,
  401: <Icon icon="person-circle-question" />,
  403: <Icon icon={['far', 'hand']} />,
  404: <Icon icon="magnifying-glass" />,
  500: <Icon icon="fire" />,
};

class Page extends Component {
  defaultFailedPage = errors => {
    const {
      title = '',
      windowTitle = null,
      icon = null,
      intl: { formatMessage },
    } = this.props;

    const error = errors[0] || null;
    const [major] = getErrorCodeStructured(error);
    const description = getErrorMessage(formatMessage)(error, null);

    return (
      <PageContent
        title={title}
        windowTitle={!windowTitle || typeof windowTitle === 'function' ? title : windowTitle}
        icon={icon && typeof icon !== 'function' ? icon : null}>
        <Callout
          variant="danger"
          className="large-icon p-4"
          icon={failedIcons[major] || <WarningIcon className="text-danger" gapRight />}>
          <h2>
            {getBaseErrorMessage(formatMessage)(
              error,
              <FormattedMessage id="app.page.failed" defaultMessage="Cannot load the page" />
            )}
          </h2>
          {description ? (
            <p>{description}</p>
          ) : (
            <>
              <p>
                <FormattedMessage
                  id="app.page.failedPage.explain"
                  defaultMessage="This problem might have been caused by network failure or by internal error at server side. It is also possible that some of the resources required for displaying this page have been deleted."
                />
              </p>
              <p>
                <FormattedMessage
                  id="app.page.failedPage.sorry"
                  defaultMessage="We are sorry for the inconvenience, please try again later. If the problem prevails, verify that the requested resource still exists."
                />
              </p>
            </>
          )}
        </Callout>
      </PageContent>
    );
  };

  render() {
    const {
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
      failedPage = this.defaultFailedPage,
      children,
      ...props
    } = this.props;

    return (
      <ResourceRenderer
        resource={resource}
        forceLoading={forceLoading}
        loading={<PageContent title={loadingTitle} description={loadingDescription} />}
        failed={failedPage}>
        {(...resources) => (
          <PageContent
            {...props}
            icon={typeof icon === 'function' ? icon(...resources) : icon}
            title={title}
            windowTitle={typeof windowTitle === 'function' ? windowTitle(...resources) : windowTitle}>
            {typeof children === 'function' ? children(...resources) : children}
          </PageContent>
        )}
      </ResourceRenderer>
    );
  }
}

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
  failedPage: stringOrFormattedMessage,
  title: stringOrFormattedMessage,
  windowTitle: PropTypes.oneOfType([PropTypes.func, PropTypes.string, PropTypes.element]),
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.func, PropTypes.string]),
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  intl: PropTypes.object,
};

export default injectIntl(Page);
