export default function create(e,t,r,a,...l){let c=null;try{c=document.createElement(e)}catch(e){throw new Error("Unable to create HTMLElement! Give a proper tag name")}return t&&c.classList.add(t.split(" ")),r&&Array.isArray(r)?r.forEach((e=>e&&c.appendChild(e))):r&&"object"==typeof r?c.appendChild(r):r&&"string"==typeof r&&(c.innerHTML=r),a&&a.appendChild(c),l.length&&l.forEach((([e,t])=>{""===t&&c.setAttribute(e,""),e.match(/value|id|placeholder|cols|rows|autocorrect|spellcheck/)?c.setAttribute(e,t):c.dataset[e]=t})),c}