import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { Form } from 'react-bootstrap';

const FormBox = ({
  title,
  type,
  children,
  footer,
  overlay
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
      <div className='box-body'>{children}</div>
      {footer &&
        <div className={'box-footer'}>{footer}</div>}
      {!!overlay &&
        <div className={'box-overlay'}>{overlay}</div>}
    </Form>
  </div>
);

FormBox.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
    PropTypes.element
  ]).isRequired,
  type: PropTypes.string,
  footer: PropTypes.element
};

export default FormBox;
