import * as storage from './storage.js';
import create from './create.js';
import language from '../layouts/export.js';
import Key from './Key.js';

const main = create('main', 'main__container', 
            [create('h1', 'title', 'RSS Virtual Keyboard'),
             create('h3', 'subtitle', 'Windows keyboard')]);

export default class Keyboard {
    constructor(rowsOrder) {
        this.rowsOrder = rowsOrder;
        this.keyPressed = {};
        this.isCaps = false;
    }

    init(langCode) {
        this.keyBase = language[langCode];
        this.output = create('textarea', 'output', null, main, 
        ['placeholder', 'Start typing text...'], 
        ['rows', 8], ['cols', 100],
        ['spellcheck', false],
        ['autocorrect', 'off']);
        this.paragraf = create('p', 'paragraf', 'Use left <kbd>Ctrl</kbd> + <kbd>Alt</kbd> to switch language.', main);
        this.container = create('div', 'keyboard', null, main, ['language', langCode]);
        document.body.prepend(main);

        return this;
    }

    generateLayout() {
        this.keyButtons = [];
        this.rowsOrder.forEach((row, i) => {
           const rowElement = create('div', 'keyboard__row', null, this.container, ['row', i + 1]);
           rowElement.style.gridTemplateColumns = `repeat(${row.length}, 1fr)`;
           row.forEach((code) => {
               const keyObj = this.keyBase.find((key) => key.code === code);
               if (keyObj) {
                   const keyButton = new Key(keyObj);
                   this.keyButtons.push(keyButton);
                   rowElement.appendChild(keyButton.div);
               }
           }) 
        });
    }
}