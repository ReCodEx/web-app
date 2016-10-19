import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon, WarningIcon } from '../Icons';
import { isLoading, isReady, hasFailed, getJsData } from '../../redux/helpers/resourceManager';

const defaultLoading = (
  <span>
    <LoadingIcon /> <FormattedMessage id='app.resourceRenderer.loading' defaultMessage='Loading ...' />
  </span>
);

const defaultFailed = (
  <span>
    <WarningIcon /> <FormattedMessage id='app.resourceRenderer.loadingFailed' defaultMessage='Loading failed.' />
  </span>
);

const ResourceRenderer = ({
  loading = defaultLoading,
  failed = defaultFailed,
  children: ready,
  resource,
  forceLoading = false
}) =>
  (!resource || isLoading(resource) || forceLoading)
    ? loading
    : hasFailed(resource)
      ? failed
      : typeof ready === 'function'
        ? ready(getJsData(resource))
        : React.cloneElement(ready, getJsData(resource));

ResourceRenderer.propTypes = {
  loading: PropTypes.element,
  failed: PropTypes.element,
  children: PropTypes.oneOfType([ PropTypes.func, PropTypes.element ]).isRequired,
  resource: PropTypes.object
};

export default ResourceRenderer;
