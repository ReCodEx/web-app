import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon, WarningIcon } from '../../icons';

const isLoading = status => status === 'PENDING';
const hasFailed = status => status === 'FAILED';

const defaultLoading = noIcons =>
  <span>
    {!noIcons && <LoadingIcon gapRight />}
    <FormattedMessage
      id="app.resourceRenderer.loading"
      defaultMessage="Loading ..."
    />
  </span>;

const defaultFailed = noIcons =>
  <span>
    {!noIcons && <WarningIcon gapRight />}
    <FormattedMessage
      id="app.resourceRenderer.loadingFailed"
      defaultMessage="Loading failed."
    />
  </span>;

const FetchManyResourceRenderer = ({
  noIcons = false,
  loading = defaultLoading(noIcons),
  failed = defaultFailed(noIcons),
  children: ready,
  fetchManyStatus,
  hiddenUntilReady = false,
  forceLoading = false
}) => {
  const stillLoading =
    !fetchManyStatus || isLoading(fetchManyStatus) || forceLoading;
  return stillLoading
    ? hiddenUntilReady ? null : loading
    : hasFailed(fetchManyStatus) ? (hiddenUntilReady ? null : failed) : ready(); // display all ready items
};

FetchManyResourceRenderer.propTypes = {
  loading: PropTypes.element,
  failed: PropTypes.element,
  children: PropTypes.func.isRequired,
  fetchManyStatus: PropTypes.string,
  hiddenUntilReady: PropTypes.bool,
  forceLoading: PropTypes.bool,
  noIcons: PropTypes.bool
};

export default FetchManyResourceRenderer;
