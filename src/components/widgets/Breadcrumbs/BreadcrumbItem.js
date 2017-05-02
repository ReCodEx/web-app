import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';
import { LinkContainer } from 'react-router-bootstrap';
import { Breadcrumb } from 'react-bootstrap';
import withLinks from '../../../hoc/withLinks';

const BreadcrumbItem = (
  {
    text,
    link = null,
    iconName = null,
    isActive = false,
    links
  }
) => {
  const content = (
    <Breadcrumb.Item active={isActive}>
      {!!iconName && <Icon name={iconName} />} {text}
    </Breadcrumb.Item>
  );

  return link !== null
    ? <LinkContainer
        to={typeof link === 'function' ? link(links) : link}
        active={isActive}
      >
        {content}
      </LinkContainer>
    : content;
};

BreadcrumbItem.propTypes = {
  text: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    FormattedMessage
  ]).isRequired,
  iconName: PropTypes.string,
  link: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  isActive: PropTypes.bool.isRequired,
  links: PropTypes.object
};

export default withLinks(BreadcrumbItem);
