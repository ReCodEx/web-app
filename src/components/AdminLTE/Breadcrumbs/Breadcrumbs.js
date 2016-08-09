import React, { PropTypes } from 'react';
import { Breadcrumb } from 'react-bootstrap';
import BreadcrumbItem from './BreadcrumbItem';

const Breadcrumbs = ({
  items = []
}) => (
  <Breadcrumb>
    {items.map((item, i) =>
      <BreadcrumbItem
        {...item}
        isActive={i === items.length - 1}
        key={i} />)}
  </Breadcrumb>
);

Breadcrumbs.propTypes = {
  items: PropTypes.array
};

export default Breadcrumbs;
