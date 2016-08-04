import React, { PropTypes } from 'react';
import { LoadingIcon } from '../Icons';

const LoadingSubmissionTableRow = () => (
  <tr>
    <td colSpan={5} className='text-center'>
      <LoadingIcon />{' '}Načítám odevzdaná řešení ...
    </td>
  </tr>
);

export default LoadingSubmissionTableRow;
