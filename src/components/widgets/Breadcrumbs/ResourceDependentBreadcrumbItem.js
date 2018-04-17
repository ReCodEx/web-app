import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import Icon, { LoadingIcon } from '../../icons';
import BreadcrumbItem from './BreadcrumbItem';

const ResourceDependentBreadcrumbItem = ({
  resource,
  iconName,
  isActive,
  breadcrumb
}) =>
  <ResourceRenderer
    resource={resource}
    loading={
      <BreadcrumbItem
        text={
          <span>
            {iconName
              ? <Icon icon={iconName} gapRight />
              : <LoadingIcon gapRight />}
            <FormattedMessage
              id="app.resourceDependendBreadcrumbItem.loading"
              defaultMessage="Loading ..."
            />
          </span>
        }
        isActive={isActive}
      />
    }
    failed={null}
  >
    {data =>
      <BreadcrumbItem
        iconName={iconName}
        {...breadcrumb(data)}
        isActive={isActive}
      />}
  </ResourceRenderer>;

ResourceDependentBreadcrumbItem.propTypes = {
  resource: PropTypes.object,
  iconName: PropTypes.string,
  isActive: PropTypes.bool,
  hiddenUntilReady: PropTypes.bool,
  breadcrumb: PropTypes.func.isRequired
};

export default ResourceDependentBreadcrumbItem;
