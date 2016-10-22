import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { List } from 'immutable';
import { Row, Col } from 'react-bootstrap';

import PageContent from '../../components/PageContent';
import ResourceRenderer from '../../components/ResourceRenderer';
import { fetchExercisesIfNeeded } from '../../redux/modules/exercises';

class Exercises extends Component {

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.instanceId !== newProps.params.instanceId) {
      newProps.loadAsync();
    }
  }

  render() {
    const {
      params: { instanceId },
      instance,
      groups,
      createGroup,
      isMemberOf
    } = this.props;

    return (
      <PageContent
        title={<FormattedMessage id='app.exercises.title' defaultMessage='Exercises list' />}
        description={<FormattedMessage id='app.instance.description' defaultMessage='List and assign exercises to your groups.' />}>
        {/* @todo */}
      </PageContent>
    );
  }

}

Exercises.propTypes = {
  loadAsync: PropTypes.func.isRequired
};

export default connect(
  (state) => ({
  }),
  (dispatch) => ({
    loadAsync: () => Promise.all([
    ])
  })
)(Exercises);
