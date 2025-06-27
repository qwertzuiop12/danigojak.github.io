// The Javascript handlers for Elementor’s native widgets are written as ES6 classes. The handlers all extend a base class which provides some useful functionality.
class ContentToggleButton extends elementorModules.frontend.handlers.Base {

  getDefaultSettings() {
    return {
    selectors: {//elementor-repeater-item'
          buttons: '[class*=story-line-option-btn]',
          contents: '[class*=story-line-content-text]',
          images: '[class*=story-line-content-image]',
      },
    };
  }

  getDefaultElements() {
    const selectors = this.getSettings( 'selectors' );
    return {
        $buttons: document.querySelectorAll( selectors.buttons ),
        $contents: document.querySelectorAll( selectors.contents ),
        $images: document.querySelectorAll( selectors.images ),
    };    
  }

  bindEvents() {
    this.getDefaultElements().$buttons.forEach(btn => {
      btn.addEventListener( 'click', ev => this.onButtonClick( ev ) );
    });
  }

  eraseActiveClassFromAllButtons() {
    this.getDefaultElements().$buttons.forEach(btn => {
      if (btn.classList.contains('active')) {
        btn.classList.remove('active');
      }
    });
  }

  hideAllBindingElements() {
    this.getDefaultElements().$contents.forEach(cnt => {
      cnt.style.display = 'none';
    });
    this.getDefaultElements().$images.forEach(img => {
      img.style.display = 'none';
    });
  }

  setActiveClass( btn ) {
    if (!btn.classList.contains('active')) {
      btn.classList.add('active');
    }
  }

  swapBindingElements( elementId ) {
    let images = this.getDefaultElements().$images;
    let matchingImage = [...images].filter(img => img && img.className.includes(elementId))[0];
    if (matchingImage) {
      matchingImage.style.display = 'unset';
    }
    let contents = this.getDefaultElements().$contents;
    let matchingContent = [...contents].filter(text => text && text.className.includes(elementId))[0];
    if (matchingContent) {
      matchingContent.style.display = 'unset';
    }
  }

  onButtonClick( event ) {
    console.log(event.target);
    let className = event.target.className;
    let rx = /^story-line-option-btn elementor-repeater-item-(.*)/gm;
    let res = rx.exec(className);
    let elementId = res[1];
    console.log(elementId);
    this.eraseActiveClassFromAllButtons();
    this.hideAllBindingElements();
    console.log(event.target);
    this.setActiveClass( event.target );
    this.swapBindingElements( elementId );
    event.preventDefault();
  }
}

jQuery( window ).on( 'elementor/frontend/init', () => {
   const addHandler = ( $element ) => {
       elementorFrontend.elementsHandler.addHandler( ContentToggleButton, {
           $element,
       } );
   };
   //frontend/element_ready/content-toggle-button.default
   elementorFrontend.hooks.addAction( 'frontend/element_ready/awesomesauce.default', addHandler );
} );