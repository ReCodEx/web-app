import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { ButtonGroup } from 'react-bootstrap';

import Button from '../../widgets/FlatButton';
import Icon, { RefreshIcon } from '../../icons';

const BrokerButtons = ({ refreshBrokerStats }) =>
  <div className="em-margin-bottom em-margin-right">
    <ButtonGroup>
      <Button onClick={refreshBrokerStats} bsStyle="primary">
        <RefreshIcon gapRight />
        <FormattedMessage id="app.broker.refresh" defaultMessage="Refresh" />
      </Button>
      {/* <Button bsStyle="danger">
    <Icon icon="times" gapRight />
    <FormattedMessage
      id="app.broker.freeze"
      defaultMessage="Freeze"
    />
  </Button>
  <Button bsStyle="success">
    <Icon icon="sun" gapRight />
    <FormattedMessage
      id="app.broker.unfreeze"
      defaultMessage="Unfreeze"
    />
  </Button> */}
    </ButtonGroup>
  </div>;

BrokerButtons.propTypes = {
  refreshBrokerStats: PropTypes.func.isRequired
};

export default BrokerButtons;
