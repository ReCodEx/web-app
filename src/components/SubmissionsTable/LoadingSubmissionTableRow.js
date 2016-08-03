import React, { PropTypes } from 'react';
import { LoadingIcon } from '../Icons';

const LoadingSubmissionTableRow = () => (
  <tr>
    <td><LoadingIcon /></td>
    <td colSpan={4} className='text-center'>
      Načítám odevzdaná řešení ...
    </td>
  </tr>
);

export default LoadingSubmissionTableRow;
