# Sample Notebook with Custom Kernel

This directory contains a sample Jupyter notebook configured to work with a custom kernel via Jupyter Kernel Gateway.

## Setup

1. Register the custom kernel:

```bash
python examples/register_kernel.py
```

2. Verify the kernel is registered:

```bash
jupyter kernelspec list
```

You should see `sample_kernel` in the list of available kernels.

## Running with Jupyter Kernel Gateway

To run the notebook using the Jupyter Kernel Gateway in HTTP mode:

```bash
jupyter kernelgateway --KernelGatewayApp.api=kernel_gateway.notebook_http --KernelGatewayApp.seed_uri=examples/sample_notebook.ipynb --port=10100
```

## Testing the HTTP Endpoints

Once the Kernel Gateway is running, you can access the endpoints:

```bash
# Get data
curl http://127.0.0.1:10100/api/data

# Get statistics
curl http://127.0.0.1:10100/api/stats

# Query specific column operations
curl -X POST -H "Content-Type: application/json" -d '{"column":"A","operation":"mean"}' http://127.0.0.1:10100/api/query
```

## Kernel Configuration

The custom kernel is configured in `examples/kernels/sample_kernel/kernel.json`. This configuration includes:

- Display name: "Sample Kernel"
- Language: Python
- Custom kernel gateway metadata for notebook HTTP mode

## HTTP Endpoints

The sample notebook includes these annotated cells as HTTP endpoints:

1. `GET /api/data` - Returns the sample dataframe as JSON
2. `GET /api/stats` - Returns descriptive statistics of the dataframe
3. `POST /api/query` - Executes operations on specific columns:
   - Parameters: 
     - `column`: Column name (A, B, or C)
     - `operation`: Operation to perform (mean, sum, max, min)

## Integration with LLM Extensions

This setup provides a foundation for LLM extensions to:

1. Generate or modify HTTP endpoints based on natural language instructions
2. Enhance data analysis with AI-driven insights
3. Dynamically create new endpoints with custom processing
4. Translate natural language queries into API calls 