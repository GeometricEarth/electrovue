import path from 'path'
import { remote } from 'electron'
import fs from 'fs'

export default class FileSistem {
    constructor() {

    }
    saveFile(data) {
        remote.dialog.showSaveDialog(filename => {
            fs.writeFile(filename, data, (err) => {
                if (err) console.error(err.message);
                console.log('Файл сохранен');
            });
        });
    }
    openFile() {
        let buff;
        remote.dialog.showOpenDialog(path => {
            fs.readFile(path, (err, data) => {
                if (err) {
                    alert('Ошибка при чтении файла: ' + err.message);
                    return
                }
                buff = data;
            })
        })
        console.log("data: " + buff)
        return buff
    }
    openImg() {
        // let buff = ;
        return new Promise(function (resolve, reject) {
            remote.dialog.showOpenDialog(path => {
                console.log(path);
                fs.readFile(path[0], (err, data) => {
                    if (err) {
                        console.log('Ошибка при чтении файла: ' + err.message);
                        return
                    }
                    // console.log("data: " + data);
                    // let arrayBuffer = new ArrayBuffer(data.length);
                    // let view = new Uint8Array(arrayBuffer);
                    // for (let i = 0; data.length; ++i) {
                    //     // arrayBuffer[i] = view[i];
                    //     view[i] = data[i];
                    //     // console.dir(arrayBuffer[i]);
                    // }
                    // let blob = new Blob(arrayBuffer, { type: 'image/png' });
                    resolve(window.URL.createObjectURL(data));
                })
            })
        })
        // let buff;

        // console.log(buff);
        // return buff
    }
}

// export {saveFile};