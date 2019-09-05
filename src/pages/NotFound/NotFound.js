import React from 'react';
import { FormattedMessage } from 'react-intl';
import PageContent from '../../components/layout/PageContent';

const NotFound = () => (
  <PageContent
    title={<FormattedMessage id="app.notFound.title" defaultMessage="Page not found" />}
    description={
      <FormattedMessage
        id="app.notFound.description"
        defaultMessage="Oops, this is probably not what you were looking for."
      />
    }>
    <FormattedMessage
      id="app.notFound.text"
      defaultMessage="Either you got a wrong (possibly old) URL in your address bar, or we have a bug in links generator."
    />
  </PageContent>
);

export default NotFound;
