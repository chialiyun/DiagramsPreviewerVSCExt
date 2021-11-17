# Diagrams Previewer extension for Visual Studio Code
An extension to preview [Diagrams](https://diagrams.mingrammer.com/) (Diagram as a Code) while editing the code in VSCode.

## Features
- Preview Diagram
- Update Diagrams Preview on save

## Usage
The extension can be activated with
1. Toggle Preview (<kbd>Shift</kbd>+<kbd>Command</kbd>+<kbd>P</kbd> for Mac, <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> for Windows)
2. Command `Preview Diagrams` to load the diagrams on a separate window on the right

## Requirements (Set up)
Make sure you have installed the following before activating the extension:

### Windows
- [Python 3](https://www.python.org/downloads/)
    - `choco install python3`
    - After installing python, make sure to install `Diagrams` package using `pip3 install diagrams`
- [GraphViz](https://www.graphviz.org/)
    - `choco install graphviz`
    - Make sure graphviz is added into your environment variables. You may add `C:\Program Files (x86)\Graphviz2.38\bin\dot.exe` to System Path manually if it is not added automatically during the installation earlier.
    
### Mac
- [Python 3](https://www.python.org/downloads/)
    - `brew install python3`
    - After installing python, make sure to install `Diagrams` package using `pip3 install diagrams`
- [GraphViz](https://www.graphviz.org/)
    - `brew install graphviz`

## Demonstration
![Demonstration GIF](./resources/preview.gif)

### Source Code Example:
```
from diagrams import Diagram
from diagrams.aws.compute import EC2
from diagrams.aws.database import RDS
from diagrams.aws.network import ELB

with Diagram("Web Service",show=False): # It is recommended to set "show" to false to prevent the pop out of the diagram in your image viewer
    ELB("lb") >> EC2("Production") >> RDS("Accounts")
    ELB("lb") >> EC2("UAT") >> RDS("Accounts")
    ELB("lb") >> EC2("Dev") >> RDS("Accounts")
```

## Release Notes
Please refer to `CHANGELOG.md`.