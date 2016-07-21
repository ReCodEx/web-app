import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { Form } from 'react-bootstrap';

const FormBox = ({
  title,
  type,
  children,
  footer
}) => (
  <div className={
    classNames({
      'box': true,
      [`box-${type}`]: typeof type !== 'undefined'
    })
  }>
    <div className='box-header with-border'>
      <h3 className='box-title'>{title}</h3>
    </div>
    <Form>
      <div className='box-body'>
        {children}
      </div>
      {footer &&
        <div className={'box-footer'}>
          {footer}
        </div>}
    </Form>
  </div>
);

FormBox.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.string,
  footer: PropTypes.element
};

export default FormBox;
