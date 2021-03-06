export default class TintComponent extends HTMLElement {
    /**
     * Return object of properties
     */
    static get properties(){
        return {};
    }

    /**
     * 
     * return properties that will observed as attribute
     */
    static get observedAttributes() {
        let observed=[];
        for (const key in this.properties) {
            if (this.properties.hasOwnProperty(key)) {
                const prop = this.properties[key];
                if(prop!==null && typeof prop ==='object' && prop.hasOwnProperty('isAttribute') && prop.isAttribute===true){
                    observed.push(key);
                }
            }
        }
        return observed;
    }

    /**
     * Mapping properties to element attributes
     * @param {object} properties - list of properties that set from this.constructor.properties
     */
    mapAttributes(properties){
        for (const key in properties) {
            if (properties.hasOwnProperty(key)) {
                const prop = properties[key];
                
                if(prop!==null && typeof prop==='object'){
                    
                    if(prop.hasOwnProperty('isAttribute') && prop.isAttribute===true){
                        if(prop.hasOwnProperty('value')){
                            this._attributes[key]=prop.value;
                        } else {
                            this._attributes[key]=null;
                        }  

                        if( this._attributes[key]!== null){
                            this.setAttribute(key, this._attributes[key]);
                        } 

                        this._properties[key]=prop.value;
                    }
                } else {
                    this._properties[key]=prop;
                }
                
                Object.defineProperty(this, key, { 
                    get: function() { 
                        if(this._properties[key]!==null && typeof this._properties[key]==='object' && this._properties[key].hasOwnProperty('value')){
                            return this._properties[key].value;
                        } else
                            return this._properties[key]; 
                    },
                    set: function(newValue) { 
                        const oldValue=this._properties[key];
                        const properties=this.constructor.properties;
                        
                        //check if there is an observer
                        if(properties[key]!== null && typeof properties[key]==='object'){
                            
                            if(properties[key].hasOwnProperty('observer')){
                               
                                if(typeof properties[key].observer==='function'){
                                    //call observer if set
                                    // need to check
                                    properties[key].observer(oldValue,newValue);
                                }
                                else if(typeof properties[key].observer==='string'){
                                    this[properties[key].observer](oldValue,newValue);
                                }
                            }
                            
                        }
                        //update property value;
                        this._properties[key]=newValue;

                        //make sure update attribute if exist
                        if(this._attributes.hasOwnProperty(key)){
                            if(typeof newValue === 'boolean'){
                                if(newValue){
                                    this.setAttribute(key, '');
                                } else if(this.hasAttribute(key)){
                                    this.removeAttribute(key);
                                }
                            } else {
                                this.setAttribute(key, newValue);
                            }
                            this._attributes[key]=newValue;
                        } 

                        this._updateRendering();
                    }
                });
            }
        }
    }

    /**
     * 
     * @param {string} name 
     * @param {mix} oldValue - previous value of changed attribute
     * @param {mix} newValue - new value of changed attribute
     */
    async attributeChangedCallback(name, oldValue, newValue) {
        this._properties[name]=newValue;
        this._attributes[name]=newValue;
        this._updateRendering();
    }

    render(){
        this._shadowRoot.innerHTML = this.getTemplate();
    }

    getTemplate(){
        return ``;
    }

    constructor() {
        super(); // always call super() first in the ctor.
        this._onRendering=false;
        this._ready=false;
        this._attributes={};
        this._properties={};
        // Attach a shadow root to <custom-element>.
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this.mapAttributes(this.constructor.properties);
        
      }
    
    /**
     * internal function to update rendering and call ready() on element first created
     * The rendering bind to requestAnimationFrame so don't expect it will updated realtime
     */
    async _updateRendering(){
        if(!this._onRendering){
            window.requestAnimationFrame(()=>{
                this._onRendering=true;
                //use lithtml to render the template inside shadow dom
                this.render();
                this._onRendering=false;
                if(this._ready===false){
                    this.ready();
                    this._ready=true;
                }
                
            });
        } 
    }

    /**
     * Callback function that called once element connected to parent element
     */
    connectedCallback(){
        this._updateRendering();
    }

    /**
     * Callback function that called once element connected to parent and templated finish rendered. 
     * Extend this function to setup anything with your element
     */
    ready(){
        // update here for anything need after rendered.
    }
    
  }