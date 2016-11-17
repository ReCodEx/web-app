import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import PageContent from '../../components/PageContent';

const NotFound = () => (
  <PageContent
    title={<FormattedMessage id='app.notFound.title' defaultMessage='Page not found' />}
    description={<FormattedMessage id='app.notFound.description' defaultMessage='Oops, this is probably not what you were looking for.' />}>
    <FormattedMessage id='app.notFound.text' defaultMessage='The URL is not a word of the language this website accepts.' />
  </PageContent>
);

export default NotFound;
