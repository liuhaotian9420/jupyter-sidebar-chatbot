"""
Setup script for the Jupyter LLM Extension.
"""

from setuptools import setup, find_packages

setup(
    name="jupyter-llm-ext",
    version="0.1.0",
    description="A sidecar application for AI-assisted code analysis and execution in Jupyter",
    author="Project Contributors",
    author_email="",
    url="https://github.com/yourname/jupyter-llm-ext",
    packages=find_packages(exclude=["tests", "examples"]),
    install_requires=[
        "fastapi>=0.95.0",
        "uvicorn>=0.21.1",
        "jupyter-client>=8.0.0",
        "ipykernel>=6.22.0",
        "aiohttp>=3.8.4",
        "websockets>=11.0.2",
        "pydantic>=2.0.0",
        "notebook>=6.5.4"
    ],
    extras_require={
        "dev": [
            "pytest>=7.3.1",
            "httpx>=0.24.0"
        ]
    },
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
    ],
    python_requires=">=3.8",
) 