# Diagrams Previewer extension for Visual Studio Code
An extension to preview [Diagrams](https://diagrams.mingrammer.com/) (Diagram as a Code) while editing the code in VSCode.

* Please note that this extension is currently only tested for Mac/Linux machines. Windows may not be supported yet.

## Features
- Preview Diagram
- Update Diagrams Preview on save

## Usage
The extension can be activated with
1. Toggle Preview (<kbd>Shift</kbd>+<kbd>Command</kbd>+<kbd>P</kbd> for Mac, <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> for Windows)
2. Command `Preview Diagrams` to load the diagrams on a separate window on the right

## Requirements
Make sure you have installed the following before activating the extension:
- [Python 3](https://www.python.org/downloads/)
    - If you are using Mac, it should be 
    - After installing python, make sure to install `Diagrams` package using `pip3 install diagrams`
- [GraphViz](https://www.graphviz.org/)
    - `brew install graphviz` for Mac
    - `choco install graphviz` for Windows

## Demonstration
![Demonstration](https://github.com/chialiyun/DiagramAsCodePreviewVSCExt/blob/master/resources/preview.gif)

## Release Notes

### 0.0.1
Initial Release; Preview in Progress