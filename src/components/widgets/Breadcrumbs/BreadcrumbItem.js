import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'react-bootstrap';

import Icon from '../../icons';
import withLinks from '../../../helpers/withLinks';

const BreadcrumbItem = ({ text, link = null, iconName = null, isActive = false, links }) => {
  const content = (
    <>
      {Boolean(iconName) && <Icon icon={iconName} smallGapRight />} {text}
    </>
  );

  return (
    <Breadcrumb.Item active={isActive} linkAs="span">
      {link !== null ? <Link to={typeof link === 'function' ? link(links) : link}>{content}</Link> : content}
    </Breadcrumb.Item>
  );
};

BreadcrumbItem.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.element, FormattedMessage]).isRequired,
  iconName: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  link: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  isActive: PropTypes.bool.isRequired,
  links: PropTypes.object,
};

export default withLinks(BreadcrumbItem);
