// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { platform } from 'process';

let python3Commmand: string | undefined
function initSettings() {
	const workspace = vscode.workspace;
	var settings = workspace.getConfiguration('diagramspreviewer');

	python3Commmand = settings.get("pythonCommand")
}

const getCurrentWorkspace = () => {
	const workplaceFolders = vscode.workspace.workspaceFolders

	if (workplaceFolders !== undefined && workplaceFolders?.length >= 1) {
		return workplaceFolders[0].uri.path
	}

	return undefined
}

const getVSCodeInterpreterPath = async () => {
	const workspaceFolder = getCurrentWorkspace()
	if (workspaceFolder !== undefined) {
		// need try catch here
		return await vscode.commands.executeCommand(
			'python.interpreterPath', {
				workspaceFolder:workspaceFolder
			})
	}
}

const getVSCodeDefaultInterpreterPath = () => {
	const workspace = vscode.workspace;
	var vsPythonSettings = workspace.getConfiguration('python');
	const vsPythonDefault = vsPythonSettings.get("defaultInterpreterPath")

	return vsPythonDefault
}

const getVSCodePythonEnv = async () => {
	const vsCodeInterpreterPath = await getVSCodeInterpreterPath()

	if (vsCodeInterpreterPath !== undefined) {
		return vsCodeInterpreterPath
	}
	
	return getVSCodeDefaultInterpreterPath()
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// settings
	initSettings()

	// commmands
	const command = 'diagramspreviewer.start';

	const docPath = () => vscode.window.activeTextEditor?.document.uri.path ?? "";

	const isValidFileExtension = () => path.extname(docPath()) === '.py';

	const outDirectory = path.join(context.extensionPath, "out", "docs");
	const fileName = 'previewDiagram';
	const targetSrcFileName = `${fileName}.py`;
	const targetFile = path.join(outDirectory, `${fileName}.png`);
	const targetSrcFile = path.join(outDirectory, targetSrcFileName);

	let isPanelOpen = false;

	const createWebViewContent = () => {
		var data = fs.readFileSync(targetFile.split(/\ /).join('\ ')).toString('base64');

		const content = `<!DOCTYPE html>
			<html style="height: 100%">
			<head>
			<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
			<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.0/font/bootstrap-icons.css" integrity="sha384-ejwKkLla8gPP8t2u0eQyL0Q/4ItcnyveF505U0NIobD/SMsNyXrLti6CWaD0L52l" crossorigin="anonymous">
				<script src='https://unpkg.com/panzoom@9.4.0/dist/panzoom.min.js'></script>
				<script src="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
			</head>
				<body style="height: 100%">
					<button type="button" class="btn btn-light" onclick="save()"><i class="bi bi-file-earmark-arrow-down"></i></button>
					<div style="overflow:hidden;min-height:100%;height:100%">
						<img src="data:image/png;base64, ${data}" id="graph">
					</div>
				</body>

				<script>
					/** vscode ref **/
					const vscode = acquireVsCodeApi();

					panzoom(document.getElementById('graph'), {contain:'outside'});

					function save() {
						vscode.postMessage({command: "save", text: "BUTTON PRESSED!"});
					}
				</script>
			</html>`;

		return content;
	}

	const executionCommand = async () => {
		if (python3Commmand === 'VS Code Python Interpreter') {
			const path = await getVSCodePythonEnv()
			vscode.window.showInformationMessage(`default: ${path} ${targetSrcFileName}}`)
			return `${path} ${targetSrcFileName}`
		}

		if (platform == 'win32')
			return `py ${targetSrcFileName}`;
		else {
			let macCommand = `python3 ${targetSrcFileName}`
			switch (python3Commmand) {
				case 'python': {
					macCommand = `${python3Commmand} ${targetSrcFileName}`;
					break;
				}
			}


			vscode.window.showInformationMessage(`command: ${macCommand}`)
			return macCommand
		}
	}

	const generateDiagram = async (panel: vscode.WebviewPanel) => {
		const proc = require('child_process');
		const cmd = await executionCommand();

		// execute command
		proc.exec(cmd, { cwd: outDirectory }, (err: string, stdout: string, stderr: string) => {
			if (err) {
				vscode.window.showErrorMessage("Error executing the code, please make sure you have Python3 (3.6 or higher) with the relevant packages (diagrams) and Graphviz installed. You may refer to the Requirements section for more information.");

				return;
			}

			panel.webview.html = createWebViewContent();
			isPanelOpen = true;

			vscode.window.showInformationMessage("Diagram is generated successfully.");
		});
	}

	const updateTempSourceFile = (panel: vscode.WebviewPanel) => {
		const editor = vscode.window.activeTextEditor;

		let line = 0, wordLine, textRange, wholeText, finalSrc = '';
		const lineCount = editor?.document.lineCount;

		// find the with Diagram line
		do {
			wordLine = editor?.document.lineAt(line)
			textRange = new vscode.Range(wordLine?.range?.start!, wordLine?.range?.end!);
			wholeText = editor?.document.getText(textRange)

			line++;

			if (!wholeText?.includes("with Diagram"))
				finalSrc = `${finalSrc}${wholeText}\n`;
		} while (!wholeText?.includes("with Diagram"));

		// Get `withDiagram args`
		const opening = wholeText.indexOf('(');
		const closing = wholeText.indexOf(')');
		const args = wholeText.substring(opening + 1, closing).split(",");

		// Form `withDiagram` line
		let withDiagram = 'with Diagram(';
		args.forEach(x => {
			if (!x.toLowerCase().includes('filename'))
				withDiagram = `${withDiagram}${x},`
		});
		withDiagram = `${withDiagram}filename="${fileName}",`

		withDiagram = `${withDiagram}):\n`

		// Add `withDiagram` line
		finalSrc = `${finalSrc}${withDiagram}`;

		var pos1 = new vscode.Position(line, 0);
		var pos2 = new vscode.Position(lineCount!, 0);
		wholeText = editor?.document.getText(new vscode.Range(pos1, pos2));

		// Add the rest of the code
		finalSrc = `${finalSrc}${wholeText}`;

		// write to file
		fs.mkdir(outDirectory, { recursive: true }, (err) => {
			if (err) throw err;

			fs.writeFile(targetSrcFile, finalSrc, err => {
				if (err)
					console.log(err);
				else
					generateDiagram(panel);
			});
		});

	}

	const commandHandler = () => {
		const _disposables: vscode.Disposable[] = [];

		// Validation
		if (!isValidFileExtension()) {
			vscode.window.showErrorMessage('Sorry, only python files are supported.');
			return;
		}

		vscode.window.showInformationMessage('Generating diagram preview...');

		const panel = vscode.window.createWebviewPanel(
			'diagramsPreview', 'Diagrams Preview',
			vscode.ViewColumn.Two,
			{
				localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media', 'out'))],
				enableScripts: true
			}
		);

		panel.onDidDispose(() => {
			isPanelOpen = false;
		}, null, context.subscriptions);

		panel.webview.onDidReceiveMessage(msg => {
			switch (msg.command) {
				case 'save': {
					const filter = { Images: ["png"] };

					vscode.window.showInformationMessage("Opening file save dialog...")
					vscode.window.showSaveDialog({
						saveLabel: "Export",
						filters: filter,
					}).then(fileInfos => {
						const destPath = fileInfos?.fsPath as string;

						// if user selected a path
						if (destPath !== undefined) {
							fs.copyFile(targetFile, destPath, (err) => {
								if (err) vscode.window.showInformationMessage(`Sorry, facing an error while saving to desintation: ${err}`);
								else vscode.window.showInformationMessage("Saved!")
							});
						}

					});
				}
			}
		})

		vscode.workspace.onDidSaveTextDocument((e) => {
			if (isPanelOpen) {
				vscode.window.showInformationMessage('Reflecting new changes to diagram preview...');

				updateTempSourceFile(panel);
			}
		}, null, _disposables);

		updateTempSourceFile(panel);
	}

	context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));

	vscode.workspace.onDidChangeConfiguration(function () {
		initSettings();
	}, null, context.subscriptions);
}

// this method is called when your extension is deactivated
export function deactivate() { }
