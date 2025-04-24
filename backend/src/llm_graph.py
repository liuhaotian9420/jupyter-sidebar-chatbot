from langgraph.graph import StateGraph,END
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI
from langchain_community.chat_models import ChatOllama
from typing import TypedDict, List, Dict, Any, Optional, Union
import os
import uuid

class ChatState(TypedDict):
    """Type definition for the graph state"""
    messages: List[Union[HumanMessage, AIMessage]]
    current_response: str


class LLMGraphChat:
    """A simple LangGraph-based chatbot implementation"""

    def __init__(self, provider: str = "OpenAI", api_key: str = "", api_url: str = "", model: str = "gpt-4"):
        """
        Initialize the LLM chatbot
        
        Args:
            provider: The LLM provider to use (OpenAI, HuggingFace, Local)
            api_key: API key for the provider
            api_url: Custom API URL if any
            model: Model name to use (e.g., gpt-4, gpt-3.5-turbo)
        """
        self.provider = provider
        self.api_key = api_key
        self.api_url = api_url
        self.model = model
        self.llm = self._initialize_llm()
        self.graph = self._build_graph()
        # Add a dictionary to store message histories for different threads
        self.thread_messages: Dict[str, List[Union[HumanMessage, AIMessage]]] = {}
    
    def _initialize_llm(self):
        """Initialize the appropriate LLM based on configuration"""
        if self.provider == "OpenAI":
            if self.api_url and self.api_url.strip():
                return ChatOpenAI(
                    api_key=self.api_key,
                    base_url=self.api_url,
                    model=self.model,
                    streaming=True
                )
            else:
                return ChatOpenAI(
                    api_key=self.api_key,
                    model=self.model,
                    streaming=True
                )
        elif self.provider == "Local":
            # Using Ollama for local LLM support
            return ChatOllama(
                base_url=self.api_url if self.api_url else "http://localhost:11434",
                model=self.model if self.model != "gpt-4" else "llama2"
            )
        else:
            # Default fallback to OpenAI
            return ChatOpenAI(
                api_key=self.api_key or "dummy-key",
                model=self.model,
                streaming=True
            )
    
    def _build_graph(self):
        """Build the LangGraph conversation flow"""
        workflow = StateGraph(ChatState)
        
        # Define the main nodes in our graph
        workflow.add_node("process_input", self._process_input)
        workflow.add_node("generate_response", self._generate_response)
        
        # Define the edges in our graph
        workflow.set_entry_point("process_input")
        workflow.add_edge("process_input", "generate_response")
        workflow.add_edge("generate_response",END)
        
        # Compile the graph
        return workflow.compile()
    
    def _process_input(self, state: ChatState) -> ChatState:
        """Process the user input, update history"""
        # This function doesn't modify the input in this simple implementation
        # but could be extended for preprocessing, context retrieval, etc.
        return state
    
    def _generate_response(self, state: ChatState) -> ChatState:
        """Generate a response from the LLM"""
        # Create a prompt from the message history
        response = self.llm.invoke(state["messages"])
        
        # Update the state with the response
        state["current_response"] = response.content
        state["messages"].append(AIMessage(content=response.content))
        
        return state
    
    def create_thread(self) -> str:
        """
        Create a new chat thread with a unique ID
        
        Returns:
            str: The new thread ID
        """
        thread_id = str(uuid.uuid4())
        self.thread_messages[thread_id] = []
        return thread_id
    
    def get_threads(self) -> List[str]:
        """
        Get all available thread IDs
        
        Returns:
            List[str]: List of thread IDs
        """
        return list(self.thread_messages.keys())
    
    def get_thread_messages(self, thread_id: str) -> List[Union[HumanMessage, AIMessage]]:
        """
        Get messages for a specific thread
        
        Args:
            thread_id: The thread ID to retrieve messages for
            
        Returns:
            List[Union[HumanMessage, AIMessage]]: List of messages in the thread
        """
        if thread_id not in self.thread_messages:
            self.thread_messages[thread_id] = []
        return self.thread_messages[thread_id]
    
    async def astream_chat(self, message: str, context: Optional[Dict[str, Any]] = None, thread_id: Optional[str] = None):
        """
        Stream a chat response for the given message
        
        Args:
            message: The user's message
            context: Optional context information
            thread_id: Optional thread ID for maintaining conversation history
            
        Yields:
            Chunks of the generated response
        """
        # Add the new message to our history
        human_message = HumanMessage(content=message)
        
        # Initialize or get history
        messages = []
        
        # First try to get history from thread_id
        if thread_id and thread_id in self.thread_messages:
            messages = self.thread_messages[thread_id].copy()
        # If no thread_id or not found, try getting from context
        elif context and "history" in context:
            messages = context["history"]
            # If thread_id is provided but didn't exist, create it and store these messages
            if thread_id:
                self.thread_messages[thread_id] = messages.copy()
        # If thread_id is provided but no history found anywhere, create an entry
        elif thread_id:
            self.thread_messages[thread_id] = []
            messages = []
        
        # Add the human message to history
        messages.append(human_message)
        
        # Update thread history if we have a thread_id
        if thread_id:
            self.thread_messages[thread_id] = messages.copy()
        
        # Get streaming LLM
        streaming_llm = self.llm
        
        # Get the AI response
        ai_message_content = ""
        async for chunk in streaming_llm.astream(messages):
            # Extract content from the chunk
            if hasattr(chunk, 'content'):
                content = chunk.content
                ai_message_content += content
                # Yield each chunk to create a true streaming experience
                yield content
        
        # After streaming completes, add the AI message to the thread history
        if thread_id:
            self.thread_messages[thread_id].append(AIMessage(content=ai_message_content))
    
    def stream_chat(self, message: str, context: Optional[Dict[str, Any]] = None, thread_id: Optional[str] = None):
        """
        Synchronous version of stream_chat
        
        Args:
            message: The user's message
            context: Optional context information
            thread_id: Optional thread ID for maintaining conversation history
            
        Returns:
            The complete response
        """
        # Add the new message to our history
        human_message = HumanMessage(content=message)
        
        # Initialize or get history
        messages = []
        
        # First try to get history from thread_id
        if thread_id and thread_id in self.thread_messages:
            messages = self.thread_messages[thread_id].copy()
        # If no thread_id or not found, try getting from context
        elif context and "history" in context:
            messages = context["history"]
            # If thread_id is provided but didn't exist, create it and store these messages
            if thread_id:
                self.thread_messages[thread_id] = messages.copy()
        # If thread_id is provided but no history found anywhere, create an entry
        elif thread_id:
            self.thread_messages[thread_id] = []
            messages = []
        
        # Add the human message to history
        messages.append(human_message)
        
        # Update thread history if we have a thread_id
        if thread_id:
            self.thread_messages[thread_id] = messages.copy()
        
        # Prepare initial state
        state = {"messages": messages, "current_response": ""}
        
        # Run the graph
        result = self.graph.invoke(state)
        
        # After processing, add the AI message to the thread history
        if thread_id and "current_response" in result:
            self.thread_messages[thread_id].append(AIMessage(content=result["current_response"]))
        
        # Return the response
        return result["current_response"] 