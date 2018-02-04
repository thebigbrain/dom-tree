export type DOMString = string;

export class Node {
  public nodeName: string;
  protected attrs: Map<string, any>;
  public parentNode: Node;
  public parentElement: Element;
  public childNodes: Array<Node>;
  public innerText: DOMString;

  constructor(name?: DOMString) {
    this.nodeName = name || '';
    this.innerText = '';
    this.attrs = new Map<string, string>();
    this.childNodes = new Array<Node>();
  }

  public appendChild(child: Node): Node {
    this.childNodes.push(child);
    return child;
  }
}

export class Element extends Node {

  constructor(name?: DOMString) {
    super(name);
  }

  public getAttribute(name: string): string {
    return this.attrs.get(name) || '';
  }

  public setAttribute(name: string, value: any): void {
    this.attrs.set(name, value);
  }
}
