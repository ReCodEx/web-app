export const SIMPLE_CONFIG_TYPE = 'simpleExerciseConfig';
export const ADVANCED_CONFIG_TYPE = 'advancedExerciseConfig';

export const isSimple = exercise =>
  exercise && exercise.configurationType === SIMPLE_CONFIG_TYPE;
