'use strict';

import { findStorage } from 'browser/lib/findStorage'
const fs = require('fs')
const path = require('path')
const CSON = require('@rokt33r/season')
const fsPlus = require('fs-plus')

/**
 * Keep local history of notes
 */
const GranularityEnum = Object.freeze({
    "day": 1,
    "hour": 2,
    "minute": 3,
    "second": 4
});

const LocalHistoryConfig = {

    // 256 KB
    fileSizeLimit: {
        type: 'integer',
        default: 262144,
        description: 'Size max in byte. The files heavier than the defined size will not be saved.'
    },

    // in days
    daysLimit: {
        type: 'integer',
        default: 30,
        description: 'Days retention limit by original files. The oldest revision files are deleted when purging (local-history:purge)'
    },

    // enable automatic purge
    autoPurge: {
        type: 'boolean',
        default: false,
        title: 'Automatic purge',
        description: 'Enable or Disable the automatic purge. Triggered, max 1 time per day.'
    },

    granularity: {
        type: 'string',
        default: GranularityEnum.minute,
        description: 'How often are local history snapshots saved'
    },

    difftoolCommand: {
        type: 'string',
        default: 'meld "{current-file}" "{revision-file}"',
        description: 'A custom command to open your favorite diff tool'
    },

    // show error message in a message panel
    difftoolCommandShowErrorMessage: {
        type: 'boolean',
        default: true,
        title: 'Show the errors of the diff tool command',
        description: 'Display the errors in a message panel'
    }
};

function createNewNoteRevision(dir, noteKey, noteData) {
    let config = LocalHistoryConfig;
    let fileSizeLimit, workspaceView;
    fileSizeLimit = config.fileSizeLimit;

    let file, revFileName;


    // basename_YYYY-mm-dd_HH-ii-ss
    revFileName = createFileName(noteKey, config.granularity.default);

    if (process.platform === 'win32') {
        dir = dir.replace(/:/g, '');
    }

    file = path.join(dir, '.history', revFileName);
    CSON.writeFileSync(file, _.omit(noteData, ['key', 'storage']));
};

function getNoteRevisions(storageKey, noteKey) {
    let isItsRev, originBaseName, files, fileBaseName, pathDirName, list;
    const storage = findStorage(storageKey)
    let historyDir = path.join(storage.path, 'notes', '.history');
    if (process.platform === 'win32') {
        dir = dir.replace(/:/g, '');
    }

    // list the directory (recursively) of the file
    let count = 1;
    files = _.filter(fsPlus.listTreeSync(historyDir), function (file) {
        let notePath = path.basename(file)

        isItsRev = (
            typeof notePath === 'string' &&
            notePath.startsWith(noteKey)
        );

        return isItsRev && fsPlus.isFileSync(file);
    })
    .sort().reverse()
    .map(notePath => {
        let revisionData = CSON.readFileSync(notePath);
        revisionData.key = noteKey + '_' + count++;
        revisionData.storage = storageKey;
        return revisionData;
    });
    

    return files.sort().reverse();
};

function prependZero(value) {
    return '0'.repeat(2 - ('' + value).length) + '' + value;
};

function createFileName(noteKey, granularity) {
    let config = LocalHistoryConfig;
    let now = new Date();
    let parts = [
        now.getFullYear,
        prependZero(now.getMonth() + 1, 2),
        prependZero(now.getDate())
    ];

    if (config.granularity.default >= GranularityEnum.hour) {
        parts.push(prependZero(now.getHours())); //24-hours format
    };

    if (config.granularity.default >= GranularityEnum.minute) {
        parts.push(prependZero(now.getMinutes()));
    };

    if (config.granularity.default >= GranularityEnum.second) {
        parts.push(prependZero(now.getSeconds()));
    };

    return noteKey + '_' + parts.join('-') + '.cson';
}

module.exports = { createNewNoteRevision, getNoteRevisions }