import { defaultMemoize } from 'reselect';
import { arrayToObject, getFileExtensionLC, EMPTY_OBJ } from '../../helpers/common';

const nameComparator = (a, b) => a.name.localeCompare(b.name, 'en');

/**
 * Expand zip entries as regular files with adjusted parameters (name and ID are composed of the zip container and the entry itself).
 */
const preprocessZipEntries = ({ zipEntries, ...file }) => {
  if (zipEntries) {
    file.zipEntries = zipEntries
      .filter(({ name, size }) => !name.endsWith('/') || size !== 0)
      .map(({ name, size }) => ({
        entryName: name,
        name: `${file.name}#${name}`,
        size,
        id: `${file.id}/${name}`,
        parentId: file.id,
      }))
      .sort(nameComparator);
  }
  return file;
};

/**
 * Preprocess zip entries, consolidate, and sort by names.
 */
export const preprocessFiles = defaultMemoize(files =>
  files
    .sort(nameComparator)
    .map(preprocessZipEntries)
    .reduce((acc, file) => [...acc, ...(file.zipEntries || [file])], [])
);

/**
 * @param {Array} files of the main solution
 * @param {Array|null} secondFiles of the second solution to diffWith
 * @param {Object} mapping explicit mappings as { firstId: secondId }
 * @return {Array} copy of files array where file objects are augmented -- if a file is matched with a second file
 *                 a `diffWith` entry is added into the file object
 */
export const associateFilesForDiff = defaultMemoize((files, secondFiles, mapping = EMPTY_OBJ) => {
  if (!secondFiles) {
    return files;
  }

  // create an index {name: file} and extensions index {ext: [ fileNames ]}
  const index = {};
  const indexLC = {};
  const extensionsIndex = {};
  const usedSecondFiles = new Set(Object.values(mapping));
  secondFiles
    .filter(file => !usedSecondFiles.has(file.id))
    .forEach(file => {
      index[file.name] = file;
      const nameLC = file.name.toLowerCase();
      indexLC[nameLC] = indexLC[nameLC] || [];
      indexLC[nameLC].push(file.name);
      const ext = getFileExtensionLC(file.name);
      extensionsIndex[ext] = extensionsIndex[ext] || [];
      extensionsIndex[ext].push(file.name);
    });

  // prepare a helper function that gets and removes file of given name from index
  const getFile = name => {
    const file = index[name] || null;
    if (file) {
      const nameLC = file.name.toLowerCase();
      indexLC[nameLC] = indexLC[nameLC].filter(n => n !== name);
      const ext = getFileExtensionLC(name);
      extensionsIndex[ext] = extensionsIndex[ext].filter(n => n !== name);
      delete index[name];
    }
    return file;
  };

  // four stage association -- 1. explicit mapping by IDs, 2. exact file name match, 3. lower-cased name match, 4. extensions match
  // any ambiguity is treated as non-passable obstacle
  return files
    .map(file => {
      // explicit mapping
      const diffWith = mapping[file.id] && secondFiles.find(f => f.id === mapping[file.id]);
      return diffWith ? { ...file, diffWith } : file;
    })
    .map(file => {
      // exact file name match
      const diffWith = !file.diffWith ? getFile(file.name) : null;
      return diffWith ? { ...file, diffWith } : file;
    })
    .map(file => {
      // lowercased file name match
      if (!file.diffWith) {
        const nameLC = file.name.toLowerCase();
        if (indexLC[nameLC] && indexLC[nameLC].length === 1) {
          const diffWith = getFile(indexLC[nameLC].pop());
          return { ...file, diffWith };
        }
      }
      return file;
    })
    .map(file => {
      // file extension match
      if (!file.diffWith) {
        const ext = getFileExtensionLC(file.name);
        if (extensionsIndex[ext] && extensionsIndex[ext].length === 1) {
          const diffWith = getFile(extensionsIndex[ext].pop());
          return { ...file, diffWith };
        }
      }
      return file;
    });
});

/**
 * Helper that computes reverted mapping { secondId: firstId } from the result of associateFilesForDiff.
 */
export const getRevertedMapping = defaultMemoize(files =>
  arrayToObject(
    files.filter(({ diffWith }) => Boolean(diffWith)),
    ({ diffWith }) => diffWith.id
  )
);

/**
 * Prepare an object, where keys are file names (with #entries) and values are arrays of comments.
 */
export const groupReviewCommentPerFile = defaultMemoize((files, reviews, closed, isSupervisor) => {
  const res = { '': [] }; // '' key is reserved for reviews that do not have a matching file
  files.forEach(({ name }) => {
    res[name] = [];
  });

  if ((!closed && !isSupervisor) || !reviews) {
    return res;
  }

  reviews.forEach(review => {
    const key = res[review.file] ? review.file : '';
    res[key].push(review);
  });

  return res;
});
