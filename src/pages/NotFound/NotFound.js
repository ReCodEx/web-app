import React, { Component, PropTypes } from 'react';
import PageContent from '../../components/PageContent';

class NotFound extends Component {

  render() {
    return (
      <PageContent title='Stránka nebyla nalezena'>
        <p>Omlouváme se, ale pro dané vstupní slovo není definované slovo výstupní.</p>
      </PageContent>
    );
  }

}

export default NotFound;
