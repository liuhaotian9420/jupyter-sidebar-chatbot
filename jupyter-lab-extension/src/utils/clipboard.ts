/**
 * Helper function to copy text to clipboard.
 * Provides visual feedback via console logs and optionally a callback.
 */
export function copyToClipboard(text: string, feedbackCallback?: () => void): void {
  try {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Content copied to clipboard');
      feedbackCallback?.(); // Call optional feedback callback
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  } catch (error) {
    console.error('Error copying text to clipboard:', error);
  }
}

/**
 * Copies message content to clipboard.
 * Provides visual feedback via console logs and optionally a callback.
 */
export function copyMessageToClipboard(text: string, feedbackCallback?: (success: boolean) => void): void {
  try {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Message content copied to clipboard');
      feedbackCallback?.(true); // Indicate success
    }).catch(err => {
      console.error('Failed to copy message text: ', err);
      feedbackCallback?.(false); // Indicate failure
    });
  } catch (error) {
    console.error('Error copying message to clipboard:', error);
    feedbackCallback?.(false); // Indicate failure
  }
}

/**
 * Copies an image to the clipboard from a given URL.
 * Provides visual feedback via console logs and optionally a callback.
 */
export function copyImageToClipboard(imageUrl: string, feedbackCallback?: (success: boolean) => void): void {
  try {
    fetch(imageUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        return response.blob();
      })
      .then(blob => {
        // Create a ClipboardItem with the image blob
        // Note: ClipboardItem might not be defined in all environments
        // You might need to add `"dom.iterable"` to tsconfig lib or handle appropriately.
        const item = new ClipboardItem({ [blob.type]: blob });
        
        navigator.clipboard.write([item]).then(() => {
          console.log('Image copied to clipboard');
          feedbackCallback?.(true); // Indicate success
        })
        .catch(err => {
          console.error('Failed to copy image to clipboard: ', err);
          alert('Failed to copy image: ' + err.message); // Keep alert for critical user feedback
          feedbackCallback?.(false); // Indicate failure
        });
      })
      .catch(err => {
        console.error('Failed to fetch or process image: ', err);
        alert('Failed to fetch image: ' + err.message); // Keep alert for critical user feedback
        feedbackCallback?.(false); // Indicate failure
      });
  } catch (error) {
    console.error('Error preparing image copy:', error);
    alert('Error copying image: ' + error); // Keep alert for critical user feedback
    feedbackCallback?.(false); // Indicate failure
  }
} 