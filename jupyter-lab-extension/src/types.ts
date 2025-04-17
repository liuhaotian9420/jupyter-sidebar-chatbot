import { JupyterFrontEnd } from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';

/**
 * Interface for cell context information
 */
export interface ICellContext {
  /**
   * Full text content of the cell
   */
  text: string;
  
  /**
   * Position information of the cursor
   */
  position: { 
    /**
     * Line number (0-indexed)
     */
    line: number; 
    
    /**
     * Column number
     */
    column: number; 
    
    /**
     * Character offset from start of document
     */
    offset: number;
  };
  
  /**
   * Text context before cursor
   */
  contextBefore: string;
  
  /**
   * Text context after cursor
   */
  contextAfter: string;
}

/**
 * Global reference types for accessing key components across modules
 */
export interface IGlobalReferences {
  app?: JupyterFrontEnd;
  notebookTracker?: INotebookTracker;
  cellContextTracker?: any; // Using any to avoid circular dependency
} 