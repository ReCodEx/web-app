import React from 'react';
import PropTypes from 'prop-types';
import BreadcrumbItem from './BreadcrumbItem';
import ResourceDependentBreadcrumbItem from './ResourceDependentBreadcrumbItem';

const Breadcrumbs = ({ items = [] }) => (
  <ol className="breadcrumb float-sm-right small">
    {items
      .filter(({ hidden = false }) => hidden !== true)
      .map((item, i) => {
        const Component = Object.prototype.hasOwnProperty.call(item, 'resource')
          ? ResourceDependentBreadcrumbItem
          : BreadcrumbItem;
        return <Component {...item} key={i} isActive={i === items.length - 1} />;
      })}
  </ol>
);

Breadcrumbs.propTypes = {
  items: PropTypes.array,
};

export default Breadcrumbs;
