import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';

class Home extends Component {

  render() {
    return (
      <div>
        <Helmet title='Úvodní strana' />
        <h1>Úvodní strana</h1>
        <p>Softwarový projekt ReCodEx</p>
      </div>
    );
  }

}

export default Home;
