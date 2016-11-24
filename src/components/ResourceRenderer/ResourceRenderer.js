import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon, WarningIcon } from '../Icons';
import { isLoading, hasFailed, isDeleting, getJsData } from '../../redux/helpers/resourceManager';

const defaultLoading = (noIcons) => (
  <span>
    {!noIcons && <LoadingIcon />} <FormattedMessage id='app.resourceRenderer.loading' defaultMessage='Loading ...' />
  </span>
);

const defaultFailed = (noIcons) => (
  <span>
    {!noIcons && <WarningIcon />} <FormattedMessage id='app.resourceRenderer.loadingFailed' defaultMessage='Loading failed.' />
  </span>
);

const ResourceRenderer = ({
  noIcons = false,
  loading = defaultLoading(noIcons),
  failed = defaultFailed(noIcons),
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
      : ready(...resources.filter((res) => !isDeleting(res)).map(getJsData)); // display all rady items
};

ResourceRenderer.propTypes = {
  loading: PropTypes.element,
  failed: PropTypes.element,
  children: PropTypes.func.isRequired,
  resource: PropTypes.oneOfType([ PropTypes.object, PropTypes.array ]),
  hiddenUntilReady: PropTypes.bool,
  forceLoading: PropTypes.bool,
  noIcons: PropTypes.bool
};

export default ResourceRenderer;
