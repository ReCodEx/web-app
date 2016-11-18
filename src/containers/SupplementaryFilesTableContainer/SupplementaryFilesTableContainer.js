import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Map, List } from 'immutable';

import SupplementaryFilesTable from '../../components/Exercises/SupplementaryFilesTable';
import { fetchSupplementaryFilesForExercise } from '../../redux/modules/supplementaryFiles';
import { supplementaryFilesSelector, createGetSupplementaryFilesForExercise } from '../../redux/selectors/supplementaryFiles';

class SupplementaryFilesTableContainer extends Component {

  componentWillMount() {
    SupplementaryFilesTableContainer.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.exerciseId !== newProps.exerciseId) {
      SupplementaryFilesTableContainer.loadData(newProps);
    }
  }

  static loadData = ({
    exerciseId,
    loadSupplementaryFilesForExercise
  }) => {
    loadSupplementaryFilesForExercise(exerciseId);
  };

  render() {
    const {
      exerciseId,
      supplementaryFiles
    } = this.props;

    return (
      <SupplementaryFilesTable
        supplementaryFiles={supplementaryFiles} />
    );
  }

}

SupplementaryFilesTableContainer.propTypes = {
  exerciseId: PropTypes.string.isRequired,
  supplementaryFiles: PropTypes.instanceOf(Map)
};

export default connect(
  (state, props) => {
    const getSupplementaryFilesForExercise = createGetSupplementaryFilesForExercise(props.exerciseId);
    return {
      supplementaryFiles: getSupplementaryFilesForExercise(state)
    };
  },
  (dispatch, props) => ({
    loadSupplementaryFilesForExercise: (exerciseId) => dispatch(fetchSupplementaryFilesForExercise(exerciseId))
  })
)(SupplementaryFilesTableContainer);
