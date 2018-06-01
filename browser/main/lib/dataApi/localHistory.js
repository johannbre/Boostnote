'use strict';

import { findStorage } from 'browser/lib/findStorage'
const fs = require('fs')
const path = require('path')
const CSON = require('@rokt33r/season')

/**
 * Keep local history of notes
 */
module.exports = {
    localHistoryView: null,

    config: {

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
            description: 'Days retention limit by original files. '
                + 'The oldest revision files are deleted when purging (local-history:purge)'
        },

        // enable automatic purge
        autoPurge: {
            type: 'boolean',
            default: false,
            title: 'Automatic purge',
            description: 'Enable or Disable the automatic purge. Triggered, max 1 time per day.'
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
    },

    saveHistoryRevision(dir, noteKey, noteData) {
        let config = this.config;
        let fsPlus, fileSizeLimit, workspaceView;
        fsPlus = require('fs-plus');
        fileSizeLimit = this.config.fileSizeLimit;

        let file, revFileName;

        let now = new Date();
        let day = '' + now.getDate();
        let month = '' + (now.getMonth() + 1);
        let hour = '' + now.getHours(); //24-hours format
        let minute = '' + now.getMinutes();
        let second = '' + now.getSeconds();

        if (day.length === 1) {
            day = '0' + day;
        }

        if (month.length === 1) {
            month = '0' + month;
        }

        if (hour.length === 1) {
            hour = '0' + hour;
        }

        if (minute.length === 1) {
            minute = '0' + minute;
        }

        if (second.length === 1) {
            second = '0' + second;
        }
        debugger
        // YYYY-mm-dd_HH-ii-ss_basename
        revFileName = now.getFullYear() +
            '-' + month +
            '-' + day +
            '_' + hour +
            '-' + minute +
            '-' + second +
            '_' + noteKey
            ;

        if (process.platform === 'win32') {
            dir = dir.replace(/:/g, '');
        }

        file = path.join(dir, '.history', revFileName + '.cson');
        CSON.writeFileSync(file, _.omit(noteData, ['key', 'storage']));
    },


    getFileRevisionList(dir, noteKey) {
        let isItsRev, originBaseName, files, fileBaseName, pathDirName, list;
    
        files        = [];
        fileBaseName = path.basename(filePath);
    
        if (process.platform === 'win32') {
            dir = dir.replace(/:/g,'');
        }
    
        // list the directory (recursively) of the file
        list = fs.listTreeSync(path.join(
          dir, '.history'
        ));
    
        for (let i in list) {
          originBaseName = this.getOriginBaseName(list[i]);
    
          isItsRev = (
            typeof originBaseName === 'string'
            && path.basename(originBaseName) === fileBaseName
          );
    
          if (isItsRev && fs.isFileSync(list[i])) {
            files.push(list[i]);
          }
        }
    
        return files.sort().reverse();
      },
};