import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { change } from 'redux-form';

import { FormGroup } from 'react-bootstrap';
import { MaybeSucceededIcon } from '../../icons';
import AuthentictionButtonContianer
  from '../../../containers/CAS/AuthenticationButtonContainer';

const CASAuthenticationButtonField = ({
  input: { name, onChange, value: ticket },
  meta: { dirty, form, dispatch },
  label
}) => (
  <FormGroup controlId={name}>
    {dirty &&
      <span>
        <MaybeSucceededIcon success={Boolean(ticket)} />
        {' '}
        {ticket
          ? <FormattedMessage
              id="app.casRegistration.ok"
              defaultMessage="CAS has accepted your credentials."
            />
          : <FormattedMessage
              id="app.casRegistration.failing"
              defaultMessage="CAS did not accept your credentials."
            />}
      </span>}

    {!ticket &&
      <p className="text-center">
        <AuthentictionButtonContianer
          onTicketObtained={(ticket, clientUrl) => {
            onChange(ticket);
            dispatch(change(form, 'clientUrl', clientUrl));
          }}
          onFailed={() => onChange(false)}
        />
      </p>}
  </FormGroup>
);

CASAuthenticationButtonField.propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  }).isRequired,
  meta: PropTypes.shape({
    dirty: PropTypes.bool
  }).isRequired
};

export default CASAuthenticationButtonField;
