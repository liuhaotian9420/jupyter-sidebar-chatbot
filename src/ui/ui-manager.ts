                } else {
                     console.log(`UI_MANAGER handleInput: Anchor coords from temp span: Top=${spanRect.top}, Left=${spanRect.left}`);
                     // Show the TOP LEVEL suggestions using the reliable coordinates
                     // Pass the coordinates directly to showPopupMenu
                     this.popupMenuManager.showPopupMenu({ x: spanRect.left, y: spanRect.top });
                }
            }
        } else {
// ... existing code ...
        } 