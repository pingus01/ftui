/*
* Medialist component for FTUI version 3
*
* Copyright (c) 2021 Mario Stephan <mstephan@shared-files.de>
* Under MIT License (http://www.opensource.org/licenses/mit-license.php)
*
* https://github.com/knowthelist/ftui
*/

import { FtuiElement } from '../element.component.js';
import { isDefined, durationFromSeconds, log, error, isNumeric } from '../../modules/ftui/ftui.helper.js';
import { parseHocon } from '../../modules/hocon/hocon.min.js';

export class FtuiMedialist extends FtuiElement {
  constructor(properties) {

    super(Object.assign(FtuiMedialist.properties, properties));

    this.elemList = this.shadowRoot.querySelector('.media-list');
  }

  template() {
    return `
      <style> @import "components/medialist/medialist.component.css"; </style>
      <div class="media-list"></div>
      <slot></slot>
      `;
  }

  static get properties() {
    return {
      list: '',
      file: '',
      track: '',
      width: '',
      height: '',
      margin: '1',
    };
  }

  static get observedAttributes() {
    return [...this.convertToAttributes(FtuiMedialist.properties), ...super.observedAttributes];
  }

  onConnected() {
    this.style.margin = isNumeric(this.margin) ? this.margin + 'em' : this.margin;
    if (this.list.length > 0) {
      this.fillList();
    }
  }

  onAttributeChanged(name) {
    switch (name) {
      case 'list':
        this.fillList();
        break;
      case 'track':
        this.setPosition();
        break;
      case 'file':
        this.setFile();
        break;
    }
  }

  onClicked(media) {
    this.file = media.file
    this.track = media.track
    this.emitChangeEvent('file', this.file);
    this.emitChangeEvent('track', this.track);
  }

  clearCurrent() {
    this.elemList.querySelectorAll('.current').forEach(elem => {
      elem.classList.remove('current');
    });
  }

  setPosition() {
    this.clearCurrent();
    if (this.track) {
      this.setCurrent(`[data-track="${this.track}"]`);
    }
  }

  setFile() {
    this.clearCurrent();
    if (this.file) {
      this.setCurrent(`[data-file="${this.file}"]`);
    }
  }

  setCurrent(selector) {
    this.elemList.querySelectorAll(selector).forEach(elem => {
      elem.classList.add('current');
      elem.scrollIntoView();
    });
  }

  fillList() {
    if (isDefined(this.list)) {
      try {
        this.elemList.innerHTML = '';
        const collection = parseHocon(this.list.replace(/`/g, '"').replace(/´/g, '"'));
        collection.forEach((item, index) => {

          const elemItem = document.createElement('div');
          elemItem.classList.add('media');
          elemItem.file = item.File;
          elemItem.track = item.Track || index + 1;
          elemItem.setAttribute('data-file', elemItem.file);
          elemItem.setAttribute('data-track', elemItem.track);
          elemItem.addEventListener('click', () => this.onClicked(elemItem));

          let content = '<div class="media-image">';
          content += '<img class="cover" src="' + item.Cover + '"/>';
          content += '</div>';
          content += '<div class="media-text">';
          content += '<div class="title">' + item.Title + '</div>';
          content += '<div class="artist">' + item.Artist + '</div>';
          content += '<div class="duration">' + ((item.Time > 0) ? durationFromSeconds(item.Time) : '&nbsp;') + '</div>';
          content += '</div>';
          elemItem.innerHTML = content;
          this.elemList.appendChild(elemItem);
        });

      } catch (e) {
        error('[FtuiMedialist] error: ' + e);
        log(1, this.list);
      }
    }
    this.setPosition();
  }
}

window.customElements.define('ftui-medialist', FtuiMedialist);
