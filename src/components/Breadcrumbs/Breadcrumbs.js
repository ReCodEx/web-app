import React, { PropTypes } from 'react';
import Icon from 'react-fontawesome';
import { LinkContainer } from 'react-router-bootstrap';
import { Breadcrumb } from 'react-bootstrap';

const Breadcrumbs = ({
  items = []
}) => {
  const createItem = ({
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

  return (
    <Breadcrumb>
      {items.map((item, i) =>
        createItem({ ...item, isActive: i === items.length - 1 }))}
    </Breadcrumb>
  );
};

Breadcrumbs.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string.isRequired,
    iconName: PropTypes.string,
    link: PropTypes.string
  }))
};

export default Breadcrumbs;
