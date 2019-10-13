import path from 'path';
import { remote } from 'electron';
import { createQuize } from "../modules/QuizeBuilder.js";
import parser from './xmlparser'
const fs = require('fs');
// const fsPromises = require('fs').promises;
const util = require('util');
const mime = require('mime/lite');
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile).bind(this);
const access = util.promisify(fs.access).bind(this);

export default class FileSistem {
    constructor() {
    }
    saveProject(questionsArray, quizeName) {
        let outputPath = remote.dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        outputPath = outputPath.toString();
        let projectPath = path.join(outputPath, quizeName);

        function saveFile(data) {
            return readUrlBlob(data.img)
                .then((obj) => {
                    let extension = mime.getExtension(obj.type);
                    let imgName = 'img' + data.id + '.' + extension;
                    data.path = path.join('don', quizeName, imgName);
                    return writeFile(path.join(projectPath, imgName), obj.buffer)
                })
                .catch(er => { console.error(er) })
                .then(() => {
                    console.log('Save');
                })

        };
        function readUrlBlob(url) {
            return new Promise(function (resolve, reject) {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.responseType = 'blob';
                xhr.onload = function (e) {
                    if (this.status == 200) {
                        let blob = this.response;
                        console.log(blob.type);
                        let reader = new FileReader();
                        reader.readAsArrayBuffer(blob);
                        reader.onloadend = (evt => {
                            let buffer = Buffer.from(new Uint8Array(evt.target.result))
                            console.log('Чтение блоба' + url);
                            resolve({ buffer: buffer, type: blob.type });
                        });
                    } else { reject(Error(xhr.statusText)) }
                };
                xhr.send();
            })
        }

        mkdir(projectPath)
            .then(() => {
                return Promise.all(questionsArray.map(saveFile))

            })
            .then(() => console.log('End'))
            .then(() => {
                let xmlData = createQuize(questionsArray, quizeName);
                let xmlPath = path.join(projectPath, 'quize.xml')
                return writeFile(xmlPath, xmlData);
            }).catch((err) => {
                console.log('Ошибка! ' + err);
            }).then(() => console.log('Quiz project seved'))

        return
        // mkdir(projectPath)
        //     .then(() => {
        //         console.log('Папка создана ' + projectPath);
        //         function sequencer(sequence, question) {
        //             return sequence.then(() => {
        //                 return this.readUrlBlob(question.img);

        //             })
        //                 .then((obj) => {
        //                     let extension = mime.getExtension(obj.type);
        //                     let imgName = 'img' + question.id + '.' + extension;
        //                     question.path = path.join('don', quizeName, imgName);
        //                     return writeFile(path.join(projectPath, imgName), obj.buffer);
        //                 })
        //                 .catch((er) => {
        //                     console.error('Ошибка блока write blob ' + er);
        //                 })
        //                 .then(() => {
        //                     console.log('Saved')
        //                 })
        //         }
        //         return questionsArray.reduce(sequencer.bind(this), Promise.resolve('test'));
        //     }).then(() => { console.log('End ') })
        //     .then(() => {
        //         let xmlData = createQuize(questionsArray, quizeName);
        //         let xmlPath = path.join(projectPath, 'quize.xml')
        //         return writeFile(xmlPath, xmlData);
        //     }).catch((err) => {
        //         console.log('Ошибка! ' + err);
        //     });
    }
    openImg() {
        return new Promise(function (resolve, reject) {
            remote.dialog.showOpenDialog(path => {
                readFile(path[0])
                .then( data => {
                    // if (err) {
                    //     reject('Ошибка при чтении img ' + err);
                    // }
                    let arrayBuffer = [];
                    arrayBuffer.push(data);
                    let mimeType = mime.getType(path[0])
                    let blob = new Blob(arrayBuffer, { type: mimeType });
                    resolve(window.URL.createObjectURL(blob));
                })
            })
        })
    }
    readImg(path){
        return access(path)
        // .then( (err) => {
        //     if (err) {
        //       console.error(err)
        //       return
        //     }
        //     //exists
        .then(()=>{
            return readFile(path)
        })
        .then(data => {
            let arrayBuffer = [];
            arrayBuffer.push(data);
            let mimeType = mime.getType(path)
            let blob = new Blob(arrayBuffer, { type: mimeType });
            let url = window.URL.createObjectURL(blob);
            return url;
        })
        // .catch(err=>{
        //     console.error(err);
        //     return 'static/assets/no-image-icon.png'
        // })
    }
    
    openQuiz() {
        let t = this;
        return new Promise(function (resolve, reject) {
            remote.dialog.showOpenDialog(filePath => {
                // fs.readFile(filePath[0], (err, data) => {
                //     if (err) reject('Ошибка при чтении xml ' + err);
                //     parser.parseXML(data)
                //     .then((quiz)=>{
                //         quiz.questions.map((question) =>{
                //             let picURL = filePath[0].slice(0, filePath[0].lastIndexOf('\\')+1)
                //             + question.pic_path.slice(question.pic_path.lastIndexOf('\\')+1);
                //             t.readImg(picURL);
                //             // question.pic_path = ;
                //         })
                                                
                //         resolve (quiz);

                //     })
                // })
                readFile(filePath[0])
                .then(data => {
                    return parser.parseXML(data)
                })
                .then((quiz)=>{
                    return Promise.all(quiz.questions.map((question) =>{
                        let picURL = filePath[0].slice(0, filePath[0].lastIndexOf('\\')+1)
                        + question.pic_path.slice(question.pic_path.lastIndexOf('\\')+1);
                        t.readImg(picURL)
                        .then(url => {
                            question.img = url;
                            // return question;
                        })
                    })
                    )
                    .then(data => {
                        resolve(quiz);
                    })
                    // resolve (quiz);
                    // return quiz;
                })
            })
        })
    }
}

