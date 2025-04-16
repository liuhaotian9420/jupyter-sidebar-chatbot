import json

# Define the updated notebook content
notebook = {
  "cells": [
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": [
        "# Sample Notebook",
        "",
        "This is a demonstration notebook for LLM extensions with Jupyter Kernel Gateway integration."
      ]
    },
    {
      "cell_type": "code",
      "execution_count": None,
      "metadata": {},
      "outputs": [],
      "source": [
        "import numpy as np",
        "import pandas as pd",
        "import matplotlib.pyplot as plt",
        "",
        "# Enable inline plotting",
        "plt.style.use(\"ggplot\")",
        "",
        "# Create sample data",
        "np.random.seed(42)",
        "df = pd.DataFrame(np.random.randn(10, 3), columns=[\"A\", \"B\", \"C\"])",
        "",
        "df.head()"
      ]
    },
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": [
        "## Data Analysis"
      ]
    },
    {
      "cell_type": "code",
      "execution_count": None,
      "metadata": {},
      "outputs": [],
      "source": [
        "# Basic statistics",
        "df.describe()"
      ]
    },
    {
      "cell_type": "code",
      "execution_count": None,
      "metadata": {},
      "outputs": [],
      "source": [
        "# Visualization",
        "plt.figure(figsize=(10, 6))",
        "for column in df.columns:",
        "    plt.hist(df[column], alpha=0.5, label=column)",
        "plt.legend()",
        "plt.title(\"Distribution of Values\")",
        "plt.xlabel(\"Value\")",
        "plt.ylabel(\"Frequency\")",
        "plt.show()"
      ]
    },
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": [
        "## HTTP Endpoints for Kernel Gateway",
        "",
        "The following cells demonstrate HTTP endpoints that can be exposed via Jupyter Kernel Gateway."
      ]
    },
    {
      "cell_type": "code",
      "execution_count": None,
      "metadata": {},
      "outputs": [],
      "source": [
        "# GET /api/data",
        "import json",
        "",
        "# Access to the previously created dataframe",
        "response = {",
        "    \"data\": df.to_dict(orient=\"records\"),",
        "    \"shape\": df.shape",
        "}",
        "",
        "print(json.dumps(response))"
      ]
    },
    {
      "cell_type": "code",
      "execution_count": None,
      "metadata": {},
      "outputs": [],
      "source": [
        "# GET /api/stats",
        "import json",
        "",
        "# Generate descriptive statistics",
        "stats = df.describe().to_dict()",
        "",
        "print(json.dumps(stats))"
      ]
    },
    {
      "cell_type": "code",
      "execution_count": None,
      "metadata": {},
      "outputs": [],
      "source": [
        "# POST /api/query",
        "import json",
        "import pandas as pd",
        "",
        "# Get the request data",
        "req = json.loads(REQUEST)",
        "body = req.get('body', '{}')",
        "",
        "if isinstance(body, str):",
        "    body = json.loads(body)",
        "",
        "# Extract column and operation from request",
        "column = body.get('column', 'A')",
        "operation = body.get('operation', 'mean')",
        "",
        "# Validate column",
        "if column not in df.columns:",
        "    result = {\"error\": f\"Column {column} not found\"} ",
        "else:",
        "    # Perform requested operation",
        "    if operation == 'mean':",
        "        value = df[column].mean()",
        "    elif operation == 'sum':",
        "        value = df[column].sum()",
        "    elif operation == 'max':",
        "        value = df[column].max()",
        "    elif operation == 'min':",
        "        value = df[column].min()",
        "    else:",
        "        value = None",
        "        result = {\"error\": f\"Operation {operation} not supported\"} ",
        "    ",
        "    if value is not None:",
        "        result = {",
        "            \"column\": column,",
        "            \"operation\": operation,",
        "            \"result\": float(value)",
        "        }",
        "",
        "print(json.dumps(result))"
      ]
    },
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": [
        "## Running with Jupyter Kernel Gateway",
        "",
        "To run this notebook with Jupyter Kernel Gateway in HTTP mode, use:",
        "",
        "```bash",
        "jupyter kernelgateway --KernelGatewayApp.api=kernel_gateway.notebook_http --KernelGatewayApp.seed_uri=examples/sample_notebook.ipynb --port=10100",
        "```",
        "",
        "Then access the endpoints via HTTP:",
        "",
        "```bash",
        "# Get data",
        "curl http://127.0.0.1:10100/api/data",
        "",
        "# Get statistics",
        "curl http://127.0.0.1:10100/api/stats",
        "",
        "# Query specific column operations",
        "curl -X POST -H \"Content-Type: application/json\" -d '{\"column\":\"A\",\"operation\":\"mean\"}' http://127.0.0.1:10100/api/query",
        "```"
      ]
    }
  ],
  "metadata": {
    "kernelspec": {
      "display_name": "Sample Kernel",
      "language": "python",
      "name": "sample_kernel"
    },
    "language_info": {
      "codemirror_mode": {
        "name": "ipython",
        "version": 3
      },
      "file_extension": ".py",
      "mimetype": "text/x-python",
      "name": "python",
      "nbconvert_exporter": "python",
      "pygments_lexer": "ipython3",
      "version": "3.8.10"
    }
  },
  "nbformat": 4,
  "nbformat_minor": 4
}

# Write the notebook to a file
with open('examples/sample_notebook.ipynb', 'w') as f:
    json.dump(notebook, f, indent=2)

print("Notebook updated successfully!") 