import { storageGetItem, storageSetItem, storageRemoveItem } from '../../../helpers/localStorage';

const SOLUTIONS_LOCAL_STORAGE_KEY = 'Soluttions.SourceCodeBox.recent';
const MAX_RECENT_SOLUTIONS = 25;

export const registerSolutionVisit = ({ id, authorId, assignmentId, createdAt, attemptIndex }) => {
  const recent = storageGetItem(SOLUTIONS_LOCAL_STORAGE_KEY, []).filter(solution => solution.id !== id);
  while (recent.length >= MAX_RECENT_SOLUTIONS) {
    recent.pop();
  }
  storageSetItem(SOLUTIONS_LOCAL_STORAGE_KEY, [{ id, authorId, assignmentId, createdAt, attemptIndex }, ...recent]);
};

export const getRecentlyVisitedSolutions = () => storageGetItem(SOLUTIONS_LOCAL_STORAGE_KEY, []);

export const clearRecentlyVisitedSolutions = () => storageRemoveItem(SOLUTIONS_LOCAL_STORAGE_KEY);
