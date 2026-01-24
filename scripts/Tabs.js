const rootSelector = '[data-js-tabs]';

class Tabs{
    selectors = {
        root: rootSelector,
        button: '[data-js-tabs-button]',
        content: '[data-js-tabs-content]'
    };

    stateClasses = {
        isActive: 'is-active'
    };

    stateAttributes = {
        ariaSelected: 'aria-selected',
        tabIndex: 'tabindex'
    };

    constructor(rootElement){
        this.rootElement = rootElement;
        this.buttonElements = this.rootElement.querySelectorAll(this.selectors.button);
        this.contentElements = this.rootElement.querySelectorAll(this.selectors.content);
        this.state = this.getProxyState({
            activeTabIndex: [...this.buttonElements]
            .findIndex((buttonElement) =>  buttonElement.classList.contains(this.stateClasses.isActive))
        })
        this.limitTabsindex = this.buttonElements.length - 1;
        this.bindevents();
    };

    getProxyState(initialState){
        return new Proxy(initialState, {
            get: (target, prop) =>{
                return target[prop]
            },
            set: (target, prop, value) => {
                target[prop] = value;

                this.updateUi();

                return true
            }
        })
    }

    updateUi() {
        const {activeTabIndex} = this.state;

        this.buttonElements.forEach((buttonElement, index) => {
            const isActive = index === activeTabIndex;

            buttonElement.classList.toggle(this.stateClasses.isActive, isActive);
            buttonElement.setAttribute(this.stateAttributes.ariaSelected, isActive.toString())
            buttonElement.setAttribute(this.stateAttributes.tabIndex, isActive ? '0' : '-1')
        });

        this.contentElements.forEach((contentElement, index) => {
            const isActive = index === activeTabIndex;

            contentElement.classList.toggle(this.stateClasses.isActive, isActive);
        })
    }

    activateTab(newTabIndex){
        this.state.activeTabIndex = newTabIndex;
        this.buttonElements[newTabIndex].focus();
    }

    previousTab = () => {
        const newTabIndex = this.state.activeTabIndex === 0 
            ? this.limitTabsindex
            : this.state.activeTabIndex - 1; 

        this.activateTab(newTabIndex);
    }

    nextTab = () => {
        const newTabIndex = this.state.activeTabIndex === this.limitTabsindex
            ? 0
            : this.state.activeTabIndex + 1;

        this.activateTab(newTabIndex);
    }

    firstTab = () => {
        this.activateTab(0);
    }

    lastTab = () => {
        this.activateTab(this.limitTabsindex);
    }

    onButtonClick(buttonIndex){
        this.state.activeTabIndex = buttonIndex
    };

    onKeyDown = (event) => {
        event.preventDefault()

        const {code, metaKey} = event;
        
        const action = {
            ArrowLeft: this.previousTab,
            ArrowRight: this.nextTab,
            Home: this.firstTab,
            End: this.lastTab
        }[code]

        const isMacHomeKey = metaKey && code === 'ArrowLeft';

        if (isMacHomeKey) {
            this.firstTab();
            return;
        }

        const isMacEndKey = metaKey && code === 'ArrowRight';

        if (isMacEndKey) {
            this.lastTab();
            return;
        }

        action?.()
    };

    bindevents(){
        this.buttonElements.forEach((buttonElement, index) =>{
            buttonElement.addEventListener('click',() => this.onButtonClick(index));
        })
        this.rootElement.addEventListener('keydown', this.onKeyDown)
    };
};

class TabsCollection{
    constructor(){
        this.init();
    };

    init(){
        document.querySelectorAll(rootSelector).forEach((element) =>{
            new Tabs(element)
        })
    };

};

export default TabsCollection;