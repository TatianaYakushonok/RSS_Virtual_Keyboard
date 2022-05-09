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
        ['rows', 8], ['cols', 112],
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

        document.addEventListener('keydown', this.handleEvent);
        document.addEventListener('keyup', this.handleEvent);
        this.container.onmousedown = this.preHandleEvent;
        this.container.onmouseup = this.preHandleEvent;
    }

    preHandleEvent = (event) => {
        event.stopPropagation();
        const keyDiv = event.target.closest('.keyboard__key');
        if (!keyDiv) return;
        const { dataset: { code } } = keyDiv;
        keyDiv.addEventListener('mouseleave', this.resetButtonState);
        this.handleEvent({ code, type: event.type});
    }

    resetButtonState = ({ target: { dataset: { code }}}) => {
        const keyObj = this.keyButtons.find((key) => key.code === code);
        keyObj.div.classList.remove('active');
        keyObj.div.removeEventListener('mouseleave', this.resetButtonState);
    }

    handleEvent = (event) => {
        if (event.stopPropagation) {
            event.stopPropagation();
        }

        const { code, type } = event;
        const keyObj = this.keyButtons.find((key) => key.code === code);
        if (!keyObj) return;
        this.output.focus();

        if (type.match(/keydown|mousedown/)) {
            if (type.match(/key/)) event.preventDefault();

            if (code.match(/Shift/)) this.shiftKey = true;
            if (this.shiftKey) this.switchUpperCase(true);

            keyObj.div.classList.add('active');

            if (code.match(/CapsLock/) && !this.isCaps) {
                this.isCaps = true;
                this.switchUpperCase(true);
            } else if (code.match(/CapsLock/) && this.isCaps){
                this.isCaps = false;
                this.switchUpperCase(false);
                keyObj.div.classList.remove('active');
            }

            if (code.match(/Control/)) this.ctrlKey = true;
            if (code.match(/Alt/)) this.altKey = true;

            if (code.match(/Control/) && this.altKey) this.switchLanguage();
            if (code.match(/Alt/) && this.ctrlKey) this.switchLanguage();

            if (!this.isCaps) {
                this.printToOutput(keyObj, this.shiftKey ? keyObj.shift : keyObj.small);
            } else if (this.isCaps) {
                if (this.shiftKey) {
                    this.printToOutput(keyObj, keyObj.sub.innerHTML ? keyObj.shift : keyObj.small);
                } else {
                    this.printToOutput(keyObj, !keyObj.sub.innerHTML ? keyObj.shift : keyObj.small);
                }
            }

        } else if (type.match(/keyup|mouseup/)) {

            if (code.match(/Shift/)) {
                this.shiftKey = false;
                this.switchUpperCase(false);
            }

            if (code.match(/Control/)) this.ctrlKey = false;
            if (code.match(/Alt/)) this.altKey = false;

            if (!code.match(/CapsLock/)) keyObj.div.classList.remove('active');
        }
    }

    switchLanguage = () => {
        const langAbbr = Object.keys(language);
        let langIndex = langAbbr.indexOf(this.container.dataset.language);
        this.keyBase = langIndex + 1 < langAbbr.length ? language[langAbbr[langIndex += 1]] 
                                                       : language[langAbbr[langIndex -= langIndex]];
        this.container.dataset.language = langAbbr[langIndex];
        storage.set('kbLang', langAbbr[langIndex]);

        this.keyButtons.forEach((button) => {
            const keyObj = this.keyBase.find((key) => key.code === button.code);
            if (!keyObj) return;
            button.shift = keyObj.shift;
            button.small = keyObj.small;
            if (keyObj.shift && keyObj.shift.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/)) {
                button.sub.innerHTML = keyObj.shift;
            } else {
                button.sub.innerHTML = '';
            }
            button.letter.innerHTML = keyObj.small;
        });

        if (this.isCaps) this.switchUpperCase(true);
    }

    switchUpperCase(isTrue) {
        if (isTrue) {
            this.keyButtons.forEach((button) => {
                if (button.sub) {
                    if (this.shiftKey) {
                        button.sub.classList.add('sub-active');
                        button.letter.classList.add('sub-inactive');
                    }
                }

                if (!button.isFnKey && this.isCaps && !this.shiftKey && !button.sub.innerHTML) {
                    button.letter.innerHTML = button.shift;
                } else if (!button.isFnKey && this.isCaps && this.shiftKey) {
                    button.letter.innerHTML = button.small;
                } else if (!button.isFnKey && !button.sub.innerHTML) {
                    button.letter.innerHTML = button.shift;
                }
            });   
        } else {
            this.keyButtons.forEach((button) => {
                if (button.sub.innerHTML && !button.isFnKey) {
                    button.sub.classList.remove('sub-active');
                    button.letter.classList.remove('sub-inactive');

                    if (!this.isCaps){
                        button.letter.innerHTML = button.small;
                    } else if (this.isCaps) {
                        button.letter.innerHTML = button.shift;
                    }
                } else if (!button.isFnKey) {
                    if (this.isCaps) {
                        button.letter.innerHTML = button.shift;  
                    } else {
                        button.letter.innerHTML = button.small;
                    }
                }
            });
        }
    }

    printToOutput(keyObj, symbol) {
        let cursorPosition = this.output.selectionStart;
        const left = this.output.value.slice(0, cursorPosition);
        const right = this.output.value.slice(cursorPosition);

        const fnButtonsHendler = {
            Tab: () => {
                this.output.value = `${left}\t${right}`;
                cursorPosition += 1;  
            },
            ArrowLeft: () => {
                cursorPosition = cursorPosition - 1 >= 0 ? cursorPosition - 1 : 0;
            },
            ArrowRight: () => {
                cursorPosition += 1;
            },
            ArrowUp: () => {
                const positionFromLeft = this.output.value.slice(0, cursorPosition).match(/(\n).*${(?!\1)/g) || [[1]];
                cursorPosition -= positionFromLeft[0].length;
            },
            ArrowDown: () => {
                const positionFromLeft = this.output.value.slice(cursorPosition).match(/^.*(\n).*(?!\1)/) || [[1]];
                cursorPosition += positionFromLeft[0].length;
            },
            Enter: () => {
                this.output.value = `${left}\n${right}`;
                cursorPosition += 1;
            },
            Delete: () => {
                this.output.value = `${left}${right.slice(1)}`;
            },
            Backspace: () => {
                this.output.value = `${left.slice(0, -1)}${right}`;
                cursorPosition -= 1;
            },
            Space: () => {
                this.output.value = `${left} ${right}`;
                cursorPosition += 1;
            },
        }

        if (fnButtonsHendler[keyObj.code]) fnButtonsHendler[keyObj.code]();
        else if (!keyObj.isFnKey) {
            cursorPosition += 1;
            this.output.value = `${left}${symbol || ''}${right}`;
        }

        this.output.setSelectionRange(cursorPosition, cursorPosition);
    }
}