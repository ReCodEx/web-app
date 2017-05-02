import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon, WarningIcon } from '../../icons';
import {
  isLoading,
  hasFailed,
  isPosting,
  isDeleting,
  isDeleted,
  getJsData
} from '../../../redux/helpers/resourceManager';

const defaultLoading = noIcons => (
  <span>
    {!noIcons && <LoadingIcon />}
    {' '}
    <FormattedMessage
      id="app.resourceRenderer.loading"
      defaultMessage="Loading ..."
    />
  </span>
);

const defaultFailed = noIcons => (
  <span>
    {!noIcons && <WarningIcon />}
    {' '}
    <FormattedMessage
      id="app.resourceRenderer.loadingFailed"
      defaultMessage="Loading failed."
    />
  </span>
);

/**
 * ResourceRenderer component is given a resource managed by the resourceManager
 * as a prop and displays different content based on the state of the given
 * resource - still loading, loading failed, fully loaded.
 *
 * Passing content for the loading and failed states though props is optional;
 * however, the content for the loaded state is required and must be passed as a
 * child to the ResourceManager. Multiple resources can be passed as an array
 * to the component and it will wait in the loading state until some of the
 * resources are still loading.
 *
 * If one of the resources fails to load the component will switch to the failed state.
 * When all the files are fully loaded then the component displays the content
 * for the loaded state.
 */
const ResourceRenderer = (
  {
    noIcons = false,
    loading = defaultLoading(noIcons),
    failed = defaultFailed(noIcons),
    children: ready,
    resource,
    hiddenUntilReady = false,
    forceLoading = false
  }
) => {
  const resources = Array.isArray(resource) ? resource : [resource];
  return !resource || resources.some(isLoading) || forceLoading
    ? hiddenUntilReady ? null : loading
    : resources.some(hasFailed)
        ? hiddenUntilReady ? null : failed
        : ready(
            ...resources
              .filter(res => !isDeleting(res))
              .filter(res => !isDeleted(res))
              .filter(res => !isPosting(res))
              .map(getJsData)
          ); // display all ready items
};

ResourceRenderer.propTypes = {
  loading: PropTypes.element,
  failed: PropTypes.element,
  children: PropTypes.func.isRequired,
  resource: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  hiddenUntilReady: PropTypes.bool,
  forceLoading: PropTypes.bool,
  noIcons: PropTypes.bool
};

export default ResourceRenderer;
