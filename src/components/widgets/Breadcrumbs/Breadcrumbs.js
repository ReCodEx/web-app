import React, { PropTypes } from 'react';
import { Breadcrumb } from 'react-bootstrap';
import BreadcrumbItem from './BreadcrumbItem';
import ResourceDependentBreadcrumbItem from './ResourceDependentBreadcrumbItem';

const Breadcrumbs = ({
  items = []
}) => (
  <Breadcrumb>
    {items
      .filter(({ hidden = false }) => hidden !== true)
      .map((item, i) => {
        const Component = item.hasOwnProperty('resource') ? ResourceDependentBreadcrumbItem : BreadcrumbItem;
        return <Component {...item} key={i} isActive={i === items.length - 1} />;
      })}
  </Breadcrumb>
);

Breadcrumbs.propTypes = {
  items: PropTypes.array
};

export default Breadcrumbs;
