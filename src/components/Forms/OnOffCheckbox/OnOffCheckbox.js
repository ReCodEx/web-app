import React, { PropTypes } from 'react';
import Icon from 'react-fontawesome';
import classNames from 'classnames';
import Toggle from 'react-toggle';

import 'react-toggle/style.css';
import './OnOffCheckbox.css';
import Checkbox from '../Checkbox';

class OnOffCheckbox extends Checkbox {

  renderInput() {
    const { checked, disabled } = this.props;
    return (
      <Toggle
        checked={typeof checked === 'string' ? checked === 'yes' : checked}
        disabled={disabled}
        onChange={() => this.toggle()} />
    );
  }

}

export default OnOffCheckbox;
