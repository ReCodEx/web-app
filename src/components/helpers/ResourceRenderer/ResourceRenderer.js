import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List, Map } from 'immutable';
import { FormattedMessage } from 'react-intl';
import { lruMemoize } from 'reselect';

import { LoadingIcon, WarningIcon } from '../../icons';
import {
  isLoading,
  isReadyOrReloading,
  hasFailed,
  isPosting,
  isDeleting,
  isDeleted,
  getJsData,
  getUniqueErrors,
} from '../../../redux/helpers/resourceManager';

const shallowResourcesEqual = (oldResources, newResources) => {
  if (List.isList(oldResources) || List.isList(newResources)) {
    return oldResources === newResources;
  }

  // Examine resources as arrays ...

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
  oldResources = null;
  oldData = null;

  returnAsArray = () => {
    const { returnAsArray = null, resourceArray = null } = this.props;
    return returnAsArray !== null ? returnAsArray : Boolean(resourceArray);
  };

  renderFromCache = () => {
    const { children: ready } = this.props;
    return this.returnAsArray() ? ready(this.oldData) : ready(...this.oldData);
  };

  // Perform rendering of the childs whilst keeping resource data cached ...
  renderReady = resources => {
    if (this.oldResources === null || !shallowResourcesEqual(this.oldResources, resources)) {
      this.oldData = resources
        .filter(res => !isDeleting(res))
        .filter(res => !isDeleted(res))
        .filter(res => !isPosting(res))
        .map(getJsData);

      this.oldData = List.isList(this.oldData) ? this.oldData.toArray() : this.oldData;
      this.oldResources = resources;
    }

    return this.renderFromCache();
  };

  renderWrapped = (content, extraClasses = '') => {
    const { bulkyLoading } = this.props;
    return bulkyLoading ? (
      <p className={`text-center larger em-padding ${extraClasses}`}>{content}</p>
    ) : (
      <span className={extraClasses}>{content}</span>
    );
  };

  renderLoading = () => {
    const { loading = null, bulkyLoading, noIcons } = this.props;

    if (loading) {
      return typeof loading === 'function' ? loading(noIcons, bulkyLoading) : loading;
    }

    return this.renderWrapped(
      <>
        {!noIcons && <LoadingIcon gapRight />}
        <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
      </>
    );
  };

  getErrors = lruMemoize(resources => getUniqueErrors(resources));

  renderFailed = resources => {
    const { failed = null, bulkyLoading, noIcons } = this.props;

    if (failed) {
      return typeof failed === 'function' ? failed(this.getErrors(resources), noIcons, bulkyLoading) : failed;
    }

    return this.renderWrapped(
      <>
        {!noIcons && <WarningIcon className="text-danger" gapRight />}
        <FormattedMessage id="app.resourceRenderer.loadingFailed" defaultMessage="Loading failed." />
      </>
    );
  };

  getResources = () => {
    const { resource = null, resourceArray = null } = this.props;
    if (resource) {
      // passed as single resource
      return Array.isArray(resource) || List.isList(resource) ? resource : [resource];
    }
    if (!resource && !resourceArray) {
      return null;
    }
    if (Map.isMap(resourceArray)) {
      // special case, needs converting
      return resourceArray.toArray().map(([_, val]) => val);
    }
    return Array.isArray(resourceArray) || List.isList(resourceArray) ? resource : [resource];
  };

  render() {
    const { hiddenUntilReady = false, forceLoading = false } = this.props;

    const resources = this.getResources();
    const resourcesLength = (resources && (List.isList(resources) ? resources.size : resources.length)) || 0;
    const stillLoading = !resources || resources.find(res => !res) || resources.some(isLoading) || forceLoading;
    const isReloading =
      stillLoading && !forceLoading && resourcesLength > 0 && resources.every(res => res && isReadyOrReloading(res));

    if (isReloading && this.oldData !== null) {
      return this.renderFromCache();
    }

    return stillLoading
      ? hiddenUntilReady
        ? null
        : this.renderLoading()
      : resources.some(hasFailed)
      ? hiddenUntilReady
        ? null
        : this.renderFailed(resources)
      : this.renderReady(resources);
  }
}

ResourceRenderer.propTypes = {
  loading: PropTypes.oneOfType([PropTypes.element, PropTypes.string, PropTypes.func]),
  failed: PropTypes.oneOfType([PropTypes.element, PropTypes.string, PropTypes.func]),
  children: PropTypes.func.isRequired,
  resource: PropTypes.oneOfType([PropTypes.object, PropTypes.array, ImmutablePropTypes.list]),
  resourceArray: PropTypes.oneOfType([PropTypes.array, ImmutablePropTypes.list, ImmutablePropTypes.map]),
  hiddenUntilReady: PropTypes.bool,
  forceLoading: PropTypes.bool,
  noIcons: PropTypes.bool,
  bulkyLoading: PropTypes.bool,
  returnAsArray: PropTypes.bool,
  debug: PropTypes.bool,
};

export default ResourceRenderer;
