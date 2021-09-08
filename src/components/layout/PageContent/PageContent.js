import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Container, Row, Col } from 'react-bootstrap';

const getMessage = (item, formatMessage) =>
  !item
    ? ''
    : typeof item === 'string'
    ? item
    : item.type === FormattedMessage
    ? formatMessage(item.props)
    : getMessage(item.children, formatMessage);

/**
 * Holds the main content of a page with the common structure for
 * all pages - the title, description, content.
 * The component passes the title and description to the Helmet library
 * which reflects these into the <head> section of the HTML document.
 */
const PageContent = ({ intl: { formatMessage }, title = '', description = '', children }) => (
  <div className="content-wrapper">
    <Helmet title={getMessage(title, formatMessage)} />
    <div className="content-header">
      <Container fluid>
        <Row className="mb-2">
          <Col sm={6}>
            <h1 className="m-0 text-dark">
              {title}
              <small className="halfem-margin-left">{description}</small>
            </h1>
          </Col>
        </Row>
      </Container>
    </div>
    <section className="content">
      <Container fluid>{children}</Container>
    </section>
  </div>
);

PageContent.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  children: PropTypes.element,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(PageContent);
