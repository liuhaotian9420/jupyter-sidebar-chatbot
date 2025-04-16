import json
import os

from setuptools import setup

HERE = os.path.abspath(os.path.dirname(__file__))

# Get our version
with open(os.path.join(HERE, 'package.json')) as f:
    pkg = json.load(f)

setup_args = dict(
    name=pkg['name'],
    version=pkg['version'],
    url=pkg['homepage'],
    author=pkg['author'],
    description=pkg['description'],
    license=pkg['license'],
    packages=[],
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        'jupyterlab>=4.0.0',
    ],
    python_requires=">=3.8",
)

if __name__ == "__main__":
    setup(**setup_args) 