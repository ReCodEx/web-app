import React from 'react';
import Comment from './Comment.js';

const UsersComment = props => <Comment {...props} right={true} isFromCurrentUser={true} />;

export default UsersComment;
