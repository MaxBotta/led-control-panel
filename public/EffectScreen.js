class EffectScreen {
    constructor({ parent, padding }) {
        this.parent = parent == undefined ? null : parent;
        this.padding = padding == undefined ? "0px" : padding + "px";
        this.effectList = ["laser", "strobo", "all"];

    }

    initBlocks() {
        console.log(this.effectList);
        this.effectList.forEach(element => {
            let block = new Block({ parent: this.parent, name: element, duration: 1000 });
            block.create();
        });
    }


}

class Block {

    constructor({ parent, name, duration }) {
        this.parent = parent;
        this.name = name;
        this.duration = duration;
        this.block;
    }

    create() {
        this.block = document.createElement("div");
        this.block.setAttribute("class", "effect-block");

        let textfield = document.createElement("input");
        textfield.setAttribute("class", "effect-block-textfield");
        this.block.appendChild(textfield);

        let text = document.createElement("p");
        text.setAttribute("class", "effect-block-text");
        text.innerHTML = this.name;
        this.block.appendChild(text);

        let connectorTop = document.createElement("div");
        connectorTop.setAttribute("class", "block-connector-top");
        this.block.appendChild(connectorTop);

        let connectorBottom = document.createElement("div");
        connectorBottom.setAttribute("class", "block-connector-bottom");
        this.block.appendChild(connectorBottom);
        // this.block.innerHTML = this.name;
        this.parent.appendChild(this.block);

    }
}

let effectScreen = new EffectScreen({
    parent: document.getElementById("effect-screen"),
    padding: 0
});
console.log(effectScreen);

effectScreen.initBlocks();
