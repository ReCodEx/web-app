import React, { PropTypes } from 'react';
import Icon from 'react-fontawesome';
import { LinkContainer } from 'react-router-bootstrap';
import { Breadcrumb } from 'react-bootstrap';

const BreadcrumbItem = ({
  text,
  link = null,
  iconName = null,
  isActive = false
}) => {
  const content = (
    <Breadcrumb.Item active={isActive}>
      {!!iconName && <Icon name={iconName} />} {text}
    </Breadcrumb.Item>
  );

  return link !== null
    ? <LinkContainer to={link}>{content}</LinkContainer>
    : content;
};

BreadcrumbItem.propTypes = {
  text: PropTypes.string.isRequired,
  iconName: PropTypes.string,
  link: PropTypes.string,
  isActive: PropTypes.bool.isRequired
};

export default BreadcrumbItem;
