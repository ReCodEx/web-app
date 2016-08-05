import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';
import Breadcrumbs from '../Breadcrumbs';

const PageContent = ({
  title,
  description = '',
  breadcrumbs = [],
  children
}) => (
  <div className='content-wrapper'>
    <Helmet title={title} description={description} />
    <section className='content-header'>
      <h1>
        {title}
        <small>{description}</small>
      </h1>
      {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
    </section>
    <section className='content'>
      {children}
    </section>
  </div>
);

PageContent.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  breadcrumbs: PropTypes.array,
  children: PropTypes.element
};

export default PageContent;
