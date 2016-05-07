import React, { PropTypes } from 'react';

const PageContent = ({
  title,
  description = '',
  children
}) => (
  <div className='content-wrapper'>
    <section className='content-header'>
      <h1>
        {title}
        <small>{description}</small>
      </h1>
      {/*
      <ol className='breadcrumb'>
        <li><a href='#'><i class='fa fa-dashboard'></i> Level</a></li>
        <li class='active'>Here</li>
      </ol>
      */}
    </section>
    <section className='content'>
      {children}
    </section>
  </div>
);

PageContent.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.element
};

export default PageContent;
