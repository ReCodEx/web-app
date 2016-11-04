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
  hiddenUntilReady = false,
  forceLoading = false
}) => {
  const resources = Array.isArray(resource) ? resource : [resource];
  return (!resource || resources.some(isLoading) || forceLoading)
    ? hiddenUntilReady ? null : loading
    : resources.some(hasFailed)
      ? hiddenUntilReady ? null : failed
      : ready(...resources.map(getJsData));
};

ResourceRenderer.propTypes = {
  loading: PropTypes.element,
  failed: PropTypes.element,
  children: PropTypes.func.isRequired,
  resource: PropTypes.oneOfType([ PropTypes.object, PropTypes.array ]),
  hiddenUntilReady: PropTypes.bool,
  forceLoading: PropTypes.bool
};

export default ResourceRenderer;
