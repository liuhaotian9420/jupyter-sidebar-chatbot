/**
 * Gets the caret position within a contenteditable element.
 * Returns the linear offset from the start of the element's text content.
 */
export function getCaretPosition(element: HTMLElement): number {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !element.contains(selection.anchorNode)) {
    // Check if selection is within the element
    return 0;
  }

  const range = selection.getRangeAt(0);
  // Create a range that spans from the beginning of the element to the caret
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.startContainer, range.startOffset);

  // The length of the text content within this pre-caret range is the position
  // Using toString() is generally more reliable than textContent for range length
  return preCaretRange.toString().length;
}

/**
 * Sets the caret position within a contenteditable element.
 * @param element The contenteditable element.
 * @param position The desired linear offset from the start of the text content.
 */
export function setCaretPosition(element: HTMLElement, position: number): void {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  const range = document.createRange();
  let charCount = 0;
  let foundNode = false;
  let nodeStack: Node[] = [element]; // Use a stack for DFS traversal

  // Depth-first search to find the correct text node and offset
  while(nodeStack.length > 0){
      const node = nodeStack.pop()!;

      if (node.nodeType === Node.TEXT_NODE) {
          const textLength = node.textContent?.length || 0;
          if (position >= charCount && position <= charCount + textLength) {
              range.setStart(node, position - charCount);
              range.setEnd(node, position - charCount);
              foundNode = true;
              break; // Found the node, exit loop
          }
          charCount += textLength;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
          const elementNode = node as HTMLElement;
          if (elementNode.tagName === 'BR') {
              if (position === charCount) { // Position is right before BR
                  range.setStartBefore(node);
                  range.setEndBefore(node);
                  foundNode = true;
                  break;
              }
              charCount += 1; // Treat BR as one character
          } else if (elementNode.getAttribute('contenteditable') === 'false') {
               // Treat non-editable elements (like our widgets) as single characters
               if (position === charCount) { 
                   // Position is right before the widget
                   range.setStartBefore(node);
                   range.setEndBefore(node);
                   foundNode = true;
                   break;
               }
               charCount += 1;
          } else {
              // Add child nodes to the stack in reverse order for correct DFS
              const children = node.childNodes;
              for (let i = children.length - 1; i >= 0; i--) {
                  nodeStack.push(children[i]);
              }
          }
      }
  }

  // If the position is beyond the content or wasn't found, place cursor at the end
  if (!foundNode) {
    range.selectNodeContents(element);
    range.collapse(false); // Collapse to the end
  }

  selection.removeAllRanges();
  selection.addRange(range);

  // Restore focus only if the element was previously focused or is the target
  // This avoids stealing focus unnecessarily
  if (document.activeElement !== element) {
      element.focus({ preventScroll: true }); // preventScroll helps avoid jumping
  }
} 