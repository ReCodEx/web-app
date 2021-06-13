import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import ScoreConfigInfo from './ScoreConfigInfo';
import ResourceRenderer from '../../helpers/ResourceRenderer';

const ScoreConfigInfoDialog = ({ show, onHide, scoreConfig, testResults, canResubmit = false }) => (
  <Modal show={show} backdrop="static" onHide={onHide} size="large">
    <Modal.Header closeButton>
      <Modal.Title>
        <FormattedMessage id="app.scoreConfigInfo.dialogTitle" defaultMessage="Correctness Algorithm" />
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <ResourceRenderer resource={scoreConfig}>
        {scoreConfigJS => (
          <ScoreConfigInfo scoreConfig={scoreConfigJS} testResults={testResults} canResubmit={canResubmit} />
        )}
      </ResourceRenderer>
    </Modal.Body>
  </Modal>
);

ScoreConfigInfoDialog.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  scoreConfig: ImmutablePropTypes.map,
  testResults: PropTypes.array,
  canResubmit: PropTypes.bool,
};

export default ScoreConfigInfoDialog;
