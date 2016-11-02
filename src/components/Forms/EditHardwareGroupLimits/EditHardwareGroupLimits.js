import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { Alert, Button, Tabs, Tab } from 'react-bootstrap';
import Confirm from '../Confirm';
import { AddIcon, WarningIcon } from '../../Icons';
import {
  TextField,
  CheckboxField,
  SelectField,
  TabbedArrayField
} from '../Fields';

import HardwareGroupFields from './HardwareGroupFields';

const EditHardwareGroupLimits = ({
  limits,
  ...props
}) => (
  <TabbedArrayField
    {...props}
    limits={limits}
    getTitle={i => limits[i].hardwareGroup}
    id='edit-hardware-group-limits'
    add={false}
    remove={false}
    ContentComponent={HardwareGroupFields} />
);

export default EditHardwareGroupLimits;
