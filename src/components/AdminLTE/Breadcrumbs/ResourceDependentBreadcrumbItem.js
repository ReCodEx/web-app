import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';
import ResourceRenderer from '../../ResourceRenderer';
import { LoadingIcon } from '../../Icons';
import BreadcrumbItem from './BreadcrumbItem';

const ResourceDependentBreadcrumbItem = ({
  resource,
  iconName,
  isActive,
  breadcrumb
}) => (
  <ResourceRenderer
    resource={resource}
    loading={(
      <BreadcrumbItem
        text={(
          <span>
            {iconName !== null ? <Icon name={iconName} /> : <LoadingIcon />}
            {' '}<FormattedMessage id='app.resourceDependendBreadcrumbItem.loading' defaultMessage='Loading ...' />
          </span>
        )}
        isActive={isActive} />
    )}
    failed={null}>
    {(data) => <BreadcrumbItem iconName={iconName} {...breadcrumb(data)} isActive={isActive} />}
  </ResourceRenderer>
);

ResourceDependentBreadcrumbItem.propTypes = {
  resource: PropTypes.object,
  isActive: PropTypes.bool,
  hiddenUntilReady: PropTypes.bool
};

export default ResourceDependentBreadcrumbItem;
