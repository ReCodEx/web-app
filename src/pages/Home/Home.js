import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';

import PageContent from '../../components/PageContent';

const Home = () => (
  <PageContent
    title={
      <FormattedMessage
        id='app.homepage.title'
        defaultMessage='ReCodEx - Code Examinator Reloaded'
        description='Homepage title' />
      }
    description={
      <FormattedMessage
        id='app.homepage.description'
        defaultMessage='ReCodEx - homepage'
        description='Homepage description' />
  }>
    <h1>
      <FormattedMessage
        id='app.homepage.greetings'
        defaultMessage='Welcome to ReCodEx'
        description='Homepage greetings of the user' />
    </h1>
  </PageContent>
);

export default Home;
