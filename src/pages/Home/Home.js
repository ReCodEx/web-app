import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';

import PageContent from '../../components/PageContent';

const Home = () => (
  <PageContent
    title='ReCodEx - Code Examinator Reloaded'
    description={'ReCodEx - úvodní strana'}>
    <h1>Vítejte v ReCodEx-u</h1>
  </PageContent>
);

export default Home;
