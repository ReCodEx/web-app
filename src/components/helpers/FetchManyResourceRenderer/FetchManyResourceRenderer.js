import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon, WarningIcon } from '../../icons';
import { resourceStatus } from '../../../redux/helpers/resourceManager';

const isLoading = status => status === resourceStatus.PENDING || status === resourceStatus.ABORTED;
const hasFailed = status => status === resourceStatus.FAILED;

const defaultLoading = noIcons => (
  <span>
    {!noIcons && <LoadingIcon gapRight={2} />}
    <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
  </span>
);

const defaultFailed = noIcons => (
  <span>
    {!noIcons && <WarningIcon gapRight={2} />}
    <FormattedMessage id="app.resourceRenderer.loadingFailed" defaultMessage="Loading failed." />
  </span>
);

const FetchManyResourceRenderer = ({
  noIcons = false,
  loading = defaultLoading(noIcons),
  failed = defaultFailed(noIcons),
  children: ready,
  fetchManyStatus,
  hiddenUntilReady = false,
  forceLoading = false,
}) => {
  const stillLoading = !fetchManyStatus || isLoading(fetchManyStatus) || forceLoading;
  return stillLoading
    ? hiddenUntilReady
      ? null
      : loading
    : hasFailed(fetchManyStatus)
      ? hiddenUntilReady
        ? null
        : failed
      : ready(); // display all ready items
};

FetchManyResourceRenderer.propTypes = {
  loading: PropTypes.element,
  failed: PropTypes.element,
  children: PropTypes.func.isRequired,
  fetchManyStatus: PropTypes.string,
  hiddenUntilReady: PropTypes.bool,
  forceLoading: PropTypes.bool,
  noIcons: PropTypes.bool,
};

export default FetchManyResourceRenderer;
