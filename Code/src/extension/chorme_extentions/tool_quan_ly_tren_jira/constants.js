'use strict';

export const SUBTASK = 'Sub-task';
export const TASK = 'Task';
export const BUG = 'Bug';
export const PMTASK = 'PM Task';

export const PRODUCT_VALID_REGEXP = /(srs|design|basic\s+design|detail\s+design|detailed\s+design|source\s+code|ut\s+case|unit\s+test\s+case|ut\s+report|unit\s+test\s+report|it\s+case|intergration\s+test\s+case|it\s+report|intergration\s+test\s+report|st\s+case|st\s+report|system\s+test\s+case|system\s+test\s+report|at\s+case|at\s+report)/gi;
export const BUG_PRODUCT_VALID_REGEXP = /(reviewcode|reviewdd|reviewsst|reviewut|)/gi;

export const TD_ATTRS = [
    'id="basic-fname"',
    'data-b-a-c="ffffff"',
    'data-f-name="Arial"',
    'data-f-sz="9"',
    'data-f-color="ffffff"',
    'data-fill-color="205081"',
    'data-b-a-s="thin"',
    'data-a-v="middle"',
    'data-a-h="center"',
  ];