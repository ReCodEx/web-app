import React, { PropTypes } from 'react';
import classNames from 'classnames';

const Box = ({
  title,
  noPadding = true,
  body,
  footer
}) => (
  <div className='box'>
    <div className='box-header with-border'>
      <h3 className='box-title'>{title}</h3>
    </div>
    <div className={
      classNames({
        'box-body': true,
        'no-padding': noPadding
      })
    }>
      {body}
    </div>
    {footer &&
      <div className={'box-footer'}>
        {footer}
      </div>}
  </div>
);

Box.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.string
};

export default Box;
