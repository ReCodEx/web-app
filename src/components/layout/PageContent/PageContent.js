import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Container } from 'react-bootstrap';

import Icon from '../../icons';

const getMessage = (item, formatMessage) =>
  !item
    ? ''
    : typeof item === 'string'
      ? item
      : item.type === FormattedMessage
        ? formatMessage(item.props, item.props.values || {})
        : getMessage(item.children, formatMessage);

/**
 * Holds the main content of a page with the common structure for
 * all pages - the title, description, content.
 * The component passes the title and description to the Helmet library
 * which reflects these into the <head> section of the HTML document.
 */
const PageContent = ({ intl: { formatMessage }, title = '', windowTitle = null, icon = null, children }) => {
  return (
    <main className="app-main bg-body-tertiary pb-1">
      <Helmet title={getMessage(windowTitle || title, formatMessage)} />
      {(title || icon) && (
        <div className="app-content-header">
          <h1 className="m-0 px-3 text-body h3">
            {icon && (
              <span className="me-3 text-body-secondary">{typeof icon === 'string' ? <Icon icon={icon} /> : icon}</span>
            )}
            {title}
          </h1>
        </div>
      )}
      <div className="app-content">
        <Container fluid>{children}</Container>
      </div>
    </main>
  );
};

PageContent.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  windowTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  children: PropTypes.element,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(PageContent);
