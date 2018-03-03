import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List } from 'immutable';
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

const defaultLoading = noIcons =>
  <span>
    {!noIcons && <LoadingIcon />}{' '}
    <FormattedMessage
      id="app.resourceRenderer.loading"
      defaultMessage="Loading ..."
    />
  </span>;

const defaultFailed = noIcons =>
  <span>
    {!noIcons && <WarningIcon />}{' '}
    <FormattedMessage
      id="app.resourceRenderer.loadingFailed"
      defaultMessage="Loading failed."
    />
  </span>;

const shallowResourcesEqual = (oldResources, newResources) => {
  if (oldResources.length !== newResources.length) {
    return false;
  }

  // Ah, finally, some old-school for-loops...
  for (let i = 0; i < oldResources.length; ++i) {
    if (oldResources[i] !== newResources[i]) {
      return false;
    }
  }
  return true;
};

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
class ResourceRenderer extends Component {
  componentWillMount = () => {
    // Reset caching variables ...
    this.oldResources = null;
    this.oldData = null;
  };

  componentWillUpdate = () => {
    // Reset caching variables ...
    this.oldResources = null;
    this.oldData = null;
  };

  // Perform rendering of the childs whilst keeping resource data cached ...
  renderReady = resources => {
    const { children: ready, returnAsArray = false } = this.props;
    if (
      this.oldResources === null ||
      !shallowResourcesEqual(this.oldResources, resources)
    ) {
      this.oldData = resources
        .filter(res => !isDeleting(res))
        .filter(res => !isDeleted(res))
        .filter(res => !isPosting(res))
        .map(
          (res, idx) =>
            // If a particular resource did not change, re-use its old data
            this.oldResources &&
            this.oldResources[idx] === res &&
            this.oldResources[idx].get('data') === res.get('data')
              ? this.oldData[idx]
              : getJsData(res)
        );
      this.oldResources = resources;
    }
    return returnAsArray ? ready(this.oldData) : ready(...this.oldData);
  };

  render() {
    const {
      noIcons = false,
      loading = defaultLoading(noIcons),
      failed = defaultFailed(noIcons),
      resource,
      hiddenUntilReady = false,
      forceLoading = false
    } = this.props;

    const resources = Array.isArray(resource)
      ? resource
      : List.isList(resource) ? resource.toArray() : [resource];
    const stillLoading =
      !resource ||
      resources.find(res => !res) ||
      resources.some(isLoading) ||
      forceLoading;

    return stillLoading
      ? hiddenUntilReady ? null : loading
      : resources.some(hasFailed)
        ? hiddenUntilReady ? null : failed
        : this.renderReady(resources);
  }
}

ResourceRenderer.propTypes = {
  loading: PropTypes.element,
  failed: PropTypes.element,
  children: PropTypes.func.isRequired,
  resource: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
    ImmutablePropTypes.list
  ]),
  hiddenUntilReady: PropTypes.bool,
  forceLoading: PropTypes.bool,
  noIcons: PropTypes.bool,
  returnAsArray: PropTypes.bool,
  debug: PropTypes.bool
};

export default ResourceRenderer;
