export default function addDropCap(document: Document) {
  // Make drop caps great again
  const firstNode = document.querySelector("p:first-of-type");
  if (firstNode && firstNode?.firstChild?.nodeName === "#text") {
    const textNode = firstNode.firstChild as Text;

    const initialText = firstNode.firstChild.textContent;
    const words = initialText?.split(" ");
    const firstWord = words!.slice(0, 1)[0];
    const remainder = words?.slice(1).join(" ") as string;

    const letters = firstWord?.split("") as string[];
    const firstLetter = letters?.slice(0, 1)[0];
    const restOfFirstWord = letters?.slice(1).join("");

    const wrapper = document.createElement("span");
    wrapper.classList.add("drop-cap");
    wrapper.role = "text";

    const inner = document.createElement("span");
    inner.setAttribute("aria-hidden", "true");

    const capElement = document.createElement("span");
    capElement.classList.add("initial");
    capElement.appendChild(document.createTextNode(firstLetter));

    inner.appendChild(capElement);
    inner.appendChild(document.createTextNode(restOfFirstWord));

    wrapper.appendChild(inner);

    const accessibleText = document.createElement("span");
    accessibleText.classList.add("sr-only");
    accessibleText.appendChild(document.createTextNode(firstWord));
    wrapper.appendChild(accessibleText);

    textNode.replaceWith(wrapper, " ", remainder);
  }

  return document;
}
